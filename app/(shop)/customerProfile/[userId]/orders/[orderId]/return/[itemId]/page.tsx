"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, UploadCloud, X } from "lucide-react";
import { fetchOrderItemDetails, fetchReturnReplaceItem } from "@/utils/customerApiClient";
import { formatCurrency } from "@/lib/utils";
import { toast } from 'react-hot-toast';
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";

const RETURN_REASONS = [
    "Item is damaged or broken",
    "Item is defective or doesn't work",
    "Wrong item was sent",
    "Missing parts or accessories",
    "Product doesn't match description",
    "No longer needed",
    "Other"
];

const PROOF_REQUIRED_REASONS = [
    "Item is damaged or broken",
    "Item is defective or doesn't work"
];

export enum ReturnReplaceTypeEnum {
    RETURN = "return",
    REPLACE = "replacement"
}

export default function ReturnReplacePage() {
    const { orderId, itemId } = useParams<{ orderId: string; itemId: string }>();
    const router = useRouter();
    const { user } = useAppSelector((state: RootState) => state.auth);

    const [targetItem, setTargetItem] = useState<any>(null);
    const [requestType, setRequestType] = useState<ReturnReplaceTypeEnum>(ReturnReplaceTypeEnum.REPLACE);
    const [selectedReason, setSelectedReason] = useState("");
    const [comments, setComments] = useState("");
    const [proofFiles, setProofFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const getOrder = async () => {
            const res = await fetchOrderItemDetails(itemId);
            if (res?.data) {
                setTargetItem(res.data);
            }
        };
        getOrder();
    }, [orderId, itemId]);

    // Revoke object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const combined = [...proofFiles, ...newFiles].slice(0, 3);
            const urls = combined.map((f) => URL.createObjectURL(f));
            setProofFiles(combined);
            setPreviewUrls(urls);
        }
    };

    const removeFile = (indexToRemove: number) => {
        URL.revokeObjectURL(previewUrls[indexToRemove]);
        setProofFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== indexToRemove));
    };

    const isProofRequired = PROOF_REQUIRED_REASONS.includes(selectedReason);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!selectedReason) {
            setError("Please select a reason for the request.");
            return;
        }

        if (isProofRequired && proofFiles.length === 0) {
            setError("Please upload at least one photo showing the defect/damage.");
            return;
        }

        if (!user?.id) {
            setError("User ID is required. Please log in and try again.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            console.log("itemId", itemId)
            formData.append("order_item_id", itemId);
            formData.append("type", requestType);
            formData.append("reason", selectedReason);
            formData.append("customer_note", comments);
            proofFiles.forEach((file) => formData.append("evidence_images", file));
            console.log(formData.getAll('customer_note'))
            console.log(formData.getAll('evidence_images'))
            console.log(formData.getAll('type'))
            const response = await fetchReturnReplaceItem(user.id, formData);
            if (response.success) {
                toast.success(
                    `${requestType === ReturnReplaceTypeEnum.RETURN ? 'Return' : 'Replacement'} requested successfully!`
                );
                setTimeout(() => router.back(), 1500);
            } else {
                setError("Failed to submit request. Please try again.");
            }
        } catch (err: any) {
            const message = err?.message || "An error occurred. Please try again.";
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!targetItem) return <div className="p-8 text-center">Loading item details...</div>;

    return (
        <div className="lg:max-w-3xl max-w-sm mx-auto lg:px-4 px-0 lg:py-8 py-0">
            <div className="flex items-center gap-4 lg:mb-8 mb-2">
                <button onClick={() => router.back()} className="lg:p-2 p-1 hover:bg-gray-200 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="lg:text-2xl text-sm font-bold text-gray-900">Return or Replace Item</h1>
            </div>

            {/* Target Item Details */}
            <div className="bg-white lg:p-6 p-2 rounded-2xl shadow-sm border border-gray-200 mb-6">
                <div className="flex gap-4 items-center">
                    <img
                        src={targetItem.variant.images[0]?.image_url}
                        alt={targetItem.variant.variant_name}
                        className="lg:w-20 lg:h-20 w-10 h-10 object-contain bg-gray-50 rounded-lg"
                    />
                    <div>
                        <p className="font-medium text-gray-900 lg:text-lg text-xs line-clamp-1">{targetItem.variant.variant_name}</p>
                        <p className="text-gray-500 lg:text-sm text-xs">Qty: {targetItem.quantity}</p>
                        <p className="font-semibold mt-1 lg:text-lg text-xs">₹{formatCurrency(Number(targetItem.price))}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white lg:p-6 p-2 rounded-2xl shadow-sm border border-gray-200 space-y-8">

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Step 1: Type */}
                <div>
                    <h2 className="lg:text-lg text-sm font-semibold mb-3">
                        1. What would you like to do? <span className="text-red-500 m-1">*</span>
                    </h2>
                    <div className="grid lg:grid-cols-2 grid-rows-1 gap-2 lg:gap-4">
                        {[ReturnReplaceTypeEnum.REPLACE, ReturnReplaceTypeEnum.RETURN].map((type) => (
                            <div
                                key={type}
                                onClick={() => setRequestType(type)}
                                className={`lg:p-4 p-1 border-2 rounded-xl cursor-pointer text-center lg:text-left transition-all ${requestType === type ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <p className="font-bold text-gray-900 lg:text-lg text-sm">
                                    {type === ReturnReplaceTypeEnum.REPLACE ? 'Replace Item' : 'Return Item'}
                                </p>
                                <p className="text-xs text-gray-500 lg:mt-1 mt-0">
                                    {type === ReturnReplaceTypeEnum.REPLACE ? 'Get an exact replacement' : 'Get a refund to original payment'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 2: Reason */}
                <div>
                    <h2 className="lg:text-lg text-sm font-semibold mb-3">
                        2. Why are you returning this? <span className="text-red-500 m-1">*</span>
                    </h2>
                    <select
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-full text-sm lg:text-md lg:px-3 px-2 lg:py-3 py-1 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                        <option value="" disabled>Select a reason...</option>
                        {RETURN_REASONS.map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                        ))}
                    </select>
                </div>

                {/* Step 3: Proof */}
                <div>
                    <h2 className="lg:text-lg text-sm font-semibold mb-1">
                        3. Upload Proof {isProofRequired && <span className="text-red-500 m-1">*</span>}
                    </h2>
                    <p className="lg:text-sm text-xs text-gray-500 mb-3">
                        {isProofRequired
                            ? "Photos are required for damaged or defective items."
                            : "Optionally provide photos to support your request."}
                    </p>

                    <div className="flex gap-4 flex-wrap">
                        {proofFiles.map((_, index) => (
                            <div key={index} className="relative w-20 h-20 lg:w-24 lg:h-24 border rounded-lg overflow-hidden group">
                                <img src={previewUrls[index]} alt="proof" className="w-full h-full object-cover" />
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
                            <label className="w-20 h-20 lg:w-24 lg:h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
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
                    <h2 className="lg:text-lg text-sm font-semibold mb-3">4. Additional Comments</h2>
                    <textarea
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Please describe the issue in detail..."
                        className="w-full lg:p-3 p-1 text-xs lg:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    />
                </div>

                {/* Submit */}
                <div className="flex gap-4 justify-end pt-4 border-t text-xs lg:text-sm">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="lg:px-6 lg:py-2.5 px-3 py-1 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`lg:px-8 lg:py-2.5 px-3 py-1 ${isSubmitting ? "bg-blue-300" : "bg-blue-600"} text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer`}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </form>
        </div>
    );
}