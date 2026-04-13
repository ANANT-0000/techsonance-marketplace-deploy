import React from 'react';
import { motion } from "framer-motion"; // Note: changed motion/react to framer-motion as it's the standard import
import { Star, MessageSquareQuote } from "lucide-react";
import { ProductType } from '@/utils/Types';

const StarRating = ({ rating, size = 12 }: { rating: number; size?: number }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={size}
                fill={i < rating ? "#eab308" : "transparent"}
                className={i < rating ? "text-yellow-500" : "text-gray-200"}
            />
        ))}
    </div>
);

export const ProductReview = ({ product }: { product: ProductType }) => {
    const reviews: { id?: string; userName: string; rating: number; comment: string; date: string }[] = product?.reviews || [];


    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;


    if (reviews.length === 0) {
        return (
            <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <MessageSquareQuote className="text-gray-300 mb-2" size={32} />
                <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your thoughts!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <div className="flex items-center gap-4 mb-8">
                <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
                <div>
                    <StarRating rating={Math.round(Number(averageRating))} size={16} />
                    <p className="text-sm text-gray-500 mt-1">Based on {reviews.length} reviews</p>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review, idx) => (
                    <motion.div
                        key={review.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-gray-900 capitalize">{review.userName}</h3>
                                <div className="mt-1">
                                    <StarRating rating={review.rating} />
                                </div>
                            </div>
                            <time className="text-xs text-gray-400 font-medium">
                                {new Date(review.date).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </time>
                        </div>

                        <p className="text-gray-600 leading-relaxed text-sm italic">
                            "{review.comment}"
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};