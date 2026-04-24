"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, UploadCloud, X } from "lucide-react";
import { fetchOrderDetails, fetchOrderItemDetails, fetchReturnReplaceItem } from "@/utils/customerApiClient";
import { formatCurrency } from "@/lib/utils";
import { set } from "date-fns";

const RETURN_REASONS = [
    "Item is damaged or broken",
    "Item is defective or doesn't work",
    "Wrong item was sent",
    "Missing parts or accessories",
    "Product doesn't match description",
    "No longer needed",
    "Other"
];
export enum ReturnReplaceTypeEnum {
    RETURN = "return",
    REPLACE = "replace"
}
export default function ReturnReplacePage() {
    const { orderId, itemId } = useParams<{ orderId: string; itemId: string }>();
    const router = useRouter();

    const [targetItem, setTargetItem] = useState<any>(null);
    const [requestType, setRequestType] = useState<ReturnReplaceTypeEnum>(ReturnReplaceTypeEnum.REPLACE);
    const [selectedReason, setSelectedReason] = useState("");
    const [comments, setComments] = useState("");
    const [proofFiles, setProofFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [fetchError, setFetchError] = useState("");
    useEffect(() => {
        const getOrder = async () => {
            const res = await fetchOrderItemDetails(itemId);
            if (res?.data) {
                const specificItem = res.data;
                setTargetItem(specificItem);
            }
        };
        getOrder();
    }, [orderId, itemId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            // Limit to 3 files for example
            setProofFiles((prev) => [...prev, ...newFiles].slice(0, 3));
        }
    };

    const removeFile = (indexToRemove: number) => {
        setProofFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReason) {
            setError("Please select a reason for the request.");
            return;
        }
        if (["Item is damaged or broken", "Item is defective or doesn't work"].includes(selectedReason) && proofFiles.length === 0) {
            setError("Please upload at least one photo showing the defect/damage.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setFetchError("");
        try {


            const formData = new FormData();
            formData.append("item_id", itemId);
            formData.append("request_type", requestType);
            formData.append("reason", selectedReason);
            formData.append("comments", comments);
            proofFiles.forEach((file) => formData.append("proof_images", file));

            console.log("Submitting Return/Replace FormData...");
            const response = await fetchReturnReplaceItem(formData);
            console.log(response.data)
            alert(`${requestType === ReturnReplaceTypeEnum.RETURN ? 'Return' : 'Replacement'} requested successfully!`);
            setFetchError(response.success ? "" : "Failed to submit request. Please try again.");
            router.back();
            setTimeout(() => {
                router.back();
                setIsSubmitting(false);
                setFetchError("");
            }, 1500);
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!targetItem) return <div className="p-8 text-center">Loading item details...</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Return or Replace Item</h1>
            </div>

            {/* Target Item Details */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
                <div className="flex gap-4 items-center">
                    <img
                        src={targetItem.productVariant.images[0]?.image_url}
                        alt={targetItem.productVariant.variant_name}
                        className="w-20 h-20 object-contain bg-gray-50 rounded-lg"
                    />
                    <div>
                        <p className="font-medium text-gray-900">{targetItem.productVariant.variant_name}</p>
                        <p className="text-gray-500 text-sm">Qty: {targetItem.quantity}</p>
                        <p className="font-semibold mt-1">₹{formatCurrency(Number(targetItem.price))}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-8">

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Step 1: Type of Request */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">1. What would you like to do?</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            onClick={() => setRequestType(ReturnReplaceTypeEnum.REPLACE)}
                            className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all ${requestType === ReturnReplaceTypeEnum.REPLACE ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <p className="font-bold text-gray-900">Replace Item</p>
                            <p className="text-xs text-gray-500 mt-1">Get an exact replacement</p>
                        </div>
                        <div
                            onClick={() => setRequestType(ReturnReplaceTypeEnum.RETURN)}
                            className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all ${requestType === ReturnReplaceTypeEnum.RETURN ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <p className="font-bold text-gray-900">Return Item</p>
                            <p className="text-xs text-gray-500 mt-1">Get a refund to original payment</p>
                        </div>
                    </div>
                </div>

                {/* Step 2: Reason */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">2. Why are you returning this?</h2>
                    <select
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                        <option value="" disabled>Select a reason...</option>
                        {RETURN_REASONS.map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                        ))}
                    </select>
                </div>

                {/* Step 3: Proof / Photos */}
                <div>
                    <h2 className="text-lg font-semibold mb-1">3. Upload Proof (Optional)</h2>
                    <p className="text-sm text-gray-500 mb-3">If the item is damaged or defective, please provide photos.</p>

                    <div className="flex gap-4 flex-wrap">
                        {proofFiles.map((file, index) => (
                            <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                                <img src={URL.createObjectURL(file)} alt="proof" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        {proofFiles.length < 3 && (
                            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
                                <UploadCloud size={24} />
                                <span className="text-xs mt-1">Upload</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Step 4: Comments */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">4. Additional Comments</h2>
                    <textarea
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Please describe the issue in detail..."
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    ></textarea>
                </div>

                {/* Submit */}
                <div className="flex gap-4 justify-end pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </form>
        </div>
    );
}