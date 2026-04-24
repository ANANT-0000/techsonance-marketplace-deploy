"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { fetchOrderDetails, fetchCancelOrderItem, fetchOrderItemDetails } from "@/utils/customerApiClient";
import { formatCurrency } from "@/lib/utils";
import { useAppSelector } from "@/hooks/reduxHooks";

const CANCEL_REASONS = [
    "Order created by mistake",
    "Item(s) would not arrive on time",
    "Shipping cost is too high",
    "Found cheaper somewhere else",
    "Need to change shipping address",
    "Need to change payment method",
    "Other"
];

export default function CancelItemPage() {
    const { orderId, itemId } = useParams<{ orderId: string; itemId: string }>();
    const { user } = useAppSelector((state) => state.auth);
    const userId = user?.id;
    const router = useRouter();

    const [itemToCancel, setItemToCancel] = useState<any>(null);
    const [selectedReason, setSelectedReason] = useState("");
    const [additionalComments, setAdditionalComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const getOrder = async () => {
            const res = await fetchOrderItemDetails(itemId);
            if (res?.data) {
                console.log(res.data)
                setItemToCancel(res.data);
            }
        };
        getOrder();
    }, [orderId, itemId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReason) {
            setError("Please select a cancellation reason.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        try {
            const fullReason = `${selectedReason} - ${additionalComments}`;
            if (!userId) {
                setError("User not found.");
                return;
            }

            const response = await fetchCancelOrderItem(userId, itemId, fullReason);
            console.log(response)
            if (response) {
                router.back();
            } else {
                setError("Failed to cancel item. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please contact support.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!itemToCancel) return <div className="p-8 text-center">Loading item details...</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Cancel Item</h1>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
                <h2 className="text-lg font-semibold mb-4">Item to Cancel</h2>
                <div className="flex gap-4 items-center">
                    <img
                        src={itemToCancel.variant.images[0]?.image_url}
                        alt={itemToCancel.variant.variant_name}
                        className="w-20 h-20 object-contain bg-gray-50 rounded-lg"
                    />
                    <div>
                        <p className="font-medium text-gray-900">{itemToCancel.variant.variant_name}</p>
                        <p className="text-gray-500 text-sm">Qty: {itemToCancel.quantity}</p>
                        <p className="font-semibold mt-1">₹{formatCurrency(Number(itemToCancel.price))}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Why are you cancelling?</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <div className="space-y-3 mb-6">
                    {CANCEL_REASONS.map((reason) => (
                        <label key={reason} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="radio"
                                name="cancel_reason"
                                value={reason}
                                checked={selectedReason === reason}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 text-sm">{reason}</span>
                        </label>
                    ))}
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Comments (Optional)
                    </label>
                    <textarea
                        rows={3}
                        value={additionalComments}
                        onChange={(e) => setAdditionalComments(e.target.value)}
                        placeholder="Tell us more about why you are cancelling..."
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    ></textarea>
                </div>

                <div className="flex gap-4 justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50"
                    >
                        Keep Item
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 disabled:bg-red-400"
                    >
                        {isSubmitting ? "Processing..." : "Confirm Cancellation"}
                    </button>
                </div>
            </form>
        </div>
    );
}