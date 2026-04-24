"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, AlertCircle } from "lucide-react";
import { fetchOrderDetails } from "@/utils/customerApiClient";
import { formatCurrency } from "@/lib/utils";

export default function WriteReviewPage() {
    const { orderId, itemId } = useParams<{ orderId: string; itemId: string }>();
    const router = useRouter();
    
    const [targetItem, setTargetItem] = useState<any>(null);
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [reviewText, setReviewText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Fetch the product details to display at the top
    useEffect(() => {
        const getOrder = async () => {
            const res = await fetchOrderDetails(orderId);
            if (res?.data) {
                const specificItem = res.data.items.find(
                    (i: any) => i.productVariant.id === itemId
                );
                setTargetItem(specificItem);
            }
        };
        getOrder();
    }, [orderId, itemId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic Validation
        if (rating === 0) {
            setError("Please select a star rating.");
            return;
        }
        if (reviewText.trim().length < 10) {
            setError("Please write at least 10 characters describing your experience.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            // NOTE: You will need to add fetchSubmitReview to your customerApiClient.ts
            // await fetchSubmitReview({
            //     variantId: itemId,
            //     rating: rating,
            //     review: reviewText
            // });

            console.log("Submitting review:", { itemId, rating, reviewText });
            
            // Simulating API network delay
            await new Promise((resolve) => setTimeout(resolve, 1200));

            alert("Thank you! Your review has been submitted successfully.");
            router.back();
            
        } catch (err) {
            setError("Failed to submit review. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!targetItem) return <div className="p-8 text-center text-gray-500">Loading item details...</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Write a Review</h1>
            </div>

            {/* Product Summary Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
                <div className="flex gap-4 items-center">
                    <img 
                        src={targetItem.productVariant.images[0]?.image_url} 
                        alt={targetItem.productVariant.variant_name}
                        className="w-20 h-20 object-contain bg-[#f7f7f7] rounded-lg mix-blend-multiply"
                    />
                    <div>
                        <p className="font-semibold text-gray-900 text-lg">{targetItem.productVariant.variant_name}</p>
                        <p className="text-gray-500 text-sm mt-1">Purchased in this order</p>
                    </div>
                </div>
            </div>

            {/* Review Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
                
                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* 1. Star Rating */}
                <div className="mb-8 flex flex-col items-center sm:items-start">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Overall Rating</h2>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((starIndex) => (
                            <button
                                key={starIndex}
                                type="button"
                                onMouseEnter={() => setHoverRating(starIndex)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(starIndex)}
                                className="p-1 hover:scale-110 transition-transform focus:outline-none"
                            >
                                <Star 
                                    size={36} 
                                    className={`${
                                        (hoverRating || rating) >= starIndex 
                                            ? "text-yellow-400 fill-yellow-400" 
                                            : "text-gray-300"
                                    } transition-colors`} 
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                        {rating === 1 && "Terrible"}
                        {rating === 2 && "Poor"}
                        {rating === 3 && "Fair"}
                        {rating === 4 && "Good"}
                        {rating === 5 && "Excellent!"}
                        {rating === 0 && "Tap a star to rate"}
                    </p>
                </div>

                <hr className="border-gray-100 mb-8" />

                {/* 2. Written Review */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Add a written review</h2>
                    <p className="text-sm text-gray-500 mb-4">Share your experience to help other buyers make better choices.</p>
                    <textarea
                        rows={5}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="What did you like or dislike? What should other shoppers know?"
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-gray-50/50"
                    ></textarea>
                    <p className="text-xs text-gray-400 mt-2 text-right">
                        {reviewText.length} characters
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
                    <button 
                        type="button" 
                        onClick={() => router.back()}
                        className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 font-bold hover:bg-gray-50 transition-colors order-2 sm:order-1"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-colors order-1 sm:order-2 flex justify-center"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                </div>
            </form>
        </div>
    );
}