import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquareQuote, ThumbsUp, ChevronDown, User } from 'lucide-react';
import { fetchReviews } from '@/utils/customerApiClient';
import { PRODUCT_REVIEW_TEXT } from '@/constants/customerText';

// ─── Helpers ────────────────────────────────────────────────────────────────

const StarRow = ({
    rating,
    size = 13,
    interactive = false,
    onChange,
}: {
    rating: number;
    size?: number;
    interactive?: boolean;
    onChange?: (r: number) => void;
}) => (
    <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={size}
                fill={i < rating ? '#F59E0B' : 'none'}
                strokeWidth={i < rating ? 0 : 1.5}
                className={`transition-colors ${interactive ? 'cursor-pointer' : ''} ${
                    i < rating ? 'text-amber-400' : 'text-gray-300'
                }`}
                onClick={() => interactive && onChange?.(i + 1)}
            />
        ))}
    </span>
);

// Distribution bar (e.g. 5★ ████████░░ 82%)
const RatingBar = ({ label, count, total }: { label: string; count: number; total: number }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2.5 group">
            <span className="text-theme-caption font-semibold text-gray-500 w-4 shrink-0 text-right">{label}</span>
            <Star size={10} fill="#F59E0B" className="text-amber-400 shrink-0" />
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-amber-400 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: Number(label) * 0.04 }}
                />
            </div>
            <span className="text-theme-xxs text-gray-400 w-6 shrink-0">{count}</span>
        </div>
    );
};

// Avatar initials circle
const Avatar = ({ name }: { name: string }) => {
    const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');
    // Deterministic pastel hue from name
    const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
    return (
        <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-theme-caption select-none"
            style={{ background: `hsl(${hue},55%,55%)` }}
        >
            {initials || <User size={14} />}
        </div>
    );
};

// Skeleton loader
const ReviewSkeleton = () => (
    <div className="animate-pulse space-y-3">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-28" />
                <div className="h-2.5 bg-gray-100 rounded w-20" />
            </div>
        </div>
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

export const ProductReview = ({ productId }: { productId: string }) => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    useEffect(() => {
        const getReviews = async () => {
            setIsLoading(true);
            try {
                const res = await fetchReviews(productId);
                if (res?.data) setReviews(res.data);
            } finally {
                setIsLoading(false);
            }
        };
        getReviews();
    }, [productId]);

    // ── Derived stats ────────────────────────────────────────────────────────
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const avgDisplay = avg.toFixed(1);

    const distribution = [5, 4, 3, 2, 1].map(star => ({
        label: String(star),
        count: reviews.filter(r => r.rating === star).length,
    }));

    const visibleReviews = reviews.slice(0, visibleCount);
    const hasMore = visibleCount < total;

    // ── Empty state ──────────────────────────────────────────────────────────
    if (!isLoading && total === 0) {
        return (
            <div className="py-16 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <MessageSquareQuote size={36} className="text-gray-300 mb-3" strokeWidth={1.5} />
                <p className="text-gray-700 font-semibold text-theme-body">{PRODUCT_REVIEW_TEXT.NO_REVIEWS_TITLE}</p>
                <p className="text-gray-400 text-theme-body-sm mt-1">{PRODUCT_REVIEW_TEXT.NO_REVIEWS_DESC}</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* ── Rating Hero ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-14 items-start sm:items-center">
                {/* Big score */}
                <div className="flex flex-col items-center sm:items-start gap-1 shrink-0">
                    {isLoading ? (
                        <div className="animate-pulse w-24 h-16 bg-gray-200 rounded-2xl" />
                    ) : (
                        <>
                            <span className="text-6xl font-black text-gray-900 leading-none tracking-tight">
                                {avgDisplay}
                            </span>
                            <StarRow rating={Math.round(avg)} size={18} />
                            <span className="text-theme-caption text-gray-400 font-medium mt-1">
                                {PRODUCT_REVIEW_TEXT.BASED_ON} {total} {total === 1 ? PRODUCT_REVIEW_TEXT.REVIEW : PRODUCT_REVIEW_TEXT.REVIEWS}
                            </span>
                        </>
                    )}
                </div>

                {/* Distribution bars */}
                <div className="flex-1 w-full max-w-xs space-y-2">
                    {isLoading
                        ? [5,4,3,2,1].map(i => (
                            <div key={i} className="animate-pulse flex items-center gap-2.5">
                                <div className="w-4 h-2.5 bg-gray-200 rounded" />
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full" />
                            </div>
                          ))
                        : distribution.map(d => (
                            <RatingBar key={d.label} label={d.label} count={d.count} total={total} />
                          ))
                    }
                </div>
            </div>

            {/* ── Divider ─────────────────────────────────────────────────── */}
            <div className="h-px bg-gray-100" />

            {/* ── Review Cards Grid ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {isLoading
                    ? [...Array(4)].map((_, i) => (
                        <div key={i} className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
                            <ReviewSkeleton />
                        </div>
                      ))
                    : visibleReviews.map((review, idx) => {
                        const fullName = [review.user?.first_name, review.user?.last_name]
                            .filter(Boolean).join(' ') || PRODUCT_REVIEW_TEXT.ANONYMOUS;
                        const date = new Date(review.created_at).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric',
                        });

                        return (
                            <motion.div
                                key={review.id || idx}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.35, delay: (idx % PAGE_SIZE) * 0.04 }}
                                className="group relative flex flex-col gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300"
                            >
                                {/* Top row: avatar, name/date, stars */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar name={fullName} />
                                        <div className="min-w-0">
                                            <p className="text-theme-body-sm font-bold text-gray-900 capitalize truncate leading-tight">
                                                {fullName}
                                            </p>
                                            <time className="text-theme-xxs text-gray-400 font-medium">
                                                {date}
                                            </time>
                                        </div>
                                    </div>
                                    <div className="shrink-0 mt-0.5">
                                        <StarRow rating={review.rating} size={13} />
                                    </div>
                                </div>

                                {/* Review text */}
                                <p className="text-theme-body-sm text-gray-600 leading-relaxed italic border-l-2 border-gray-100 pl-3">
                                    "{review.review}"
                                </p>

                                {/* Verified badge */}
                                <div className="flex items-center gap-1.5 pt-1 border-t border-gray-50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span className="text-theme-tiny font-semibold text-emerald-600 uppercase tracking-wider">
                                        {PRODUCT_REVIEW_TEXT.VERIFIED_PURCHASE}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })
                }
            </div>

            {/* ── Load More ────────────────────────────────────────────────── */}
            <AnimatePresence>
                {hasMore && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-center pt-2"
                    >
                        <button
                            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 hover:border-gray-900 text-theme-body-sm font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 group"
                        >
                            {PRODUCT_REVIEW_TEXT.LOAD_MORE}
                            <ChevronDown
                                size={15}
                                className="text-gray-400 group-hover:text-gray-900 group-hover:translate-y-0.5 transition-all"
                            />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};