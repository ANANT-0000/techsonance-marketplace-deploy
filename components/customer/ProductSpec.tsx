import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, Info } from 'lucide-react';
import { PRODUCT_SPEC_TEXT } from '@/constants/customerText';

interface ProductFeature {
    title: string;
    description: string | boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatValue = (val: string | boolean): string => {
    if (typeof val === 'boolean') return val ? PRODUCT_SPEC_TEXT.YES : PRODUCT_SPEC_TEXT.NO;
    return val;
};

// Determines if a value is simply Yes/No boolean-style
const isBooleanLike = (val: string | boolean) => typeof val === 'boolean';

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptySpecs = () => (
    <div className="flex flex-col items-center justify-center py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <Info size={28} className="text-gray-300 mb-3" strokeWidth={1.5} />
        <p className="text-gray-500 font-semibold text-theme-body-sm">{PRODUCT_SPEC_TEXT.EMPTY_TITLE}</p>
        <p className="text-gray-400 text-theme-caption mt-1">{PRODUCT_SPEC_TEXT.EMPTY_DESC}</p>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const COLLAPSE_THRESHOLD = 8; // show "Show all" after this many rows

export const ProductSpecifications = ({ product }: { product: ProductFeature[] }) => {
    const [expanded, setExpanded] = useState(false);

    if (!product || product.length === 0) return <EmptySpecs />;

    const visibleItems = expanded ? product : product.slice(0, COLLAPSE_THRESHOLD);
    const hasMore = product.length > COLLAPSE_THRESHOLD;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-theme-body-sm font-bold text-gray-900 uppercase tracking-widest">
                    {PRODUCT_SPEC_TEXT.HEADER}
                </h3>
                <span className="text-theme-caption text-gray-400 font-medium">
                    {product.length} {product.length === 1 ? PRODUCT_SPEC_TEXT.ATTRIBUTE : PRODUCT_SPEC_TEXT.ATTRIBUTES}
                </span>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-theme-body-sm border-collapse" role="table" aria-label="Product Specifications">
                    <tbody>
                        <AnimatePresence initial={false}>
                            {visibleItems.map((spec, idx) => {
                                const value = formatValue(spec.description);
                                const isBool = isBooleanLike(spec.description);
                                const isPositive = spec.description === true;

                                return (
                                    <motion.tr
                                        key={spec.title}
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.18, delay: idx * 0.025 }}
                                        className={`
                                            group border-b border-gray-100 last:border-0
                                            ${idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}
                                            hover:bg-blue-50/30 transition-colors duration-150
                                        `}
                                    >
                                        {/* Key column */}
                                        <td className="py-3.5 px-5 w-[42%] align-top">
                                            <span className="font-semibold text-gray-700 capitalize leading-snug text-theme-caption-lg">
                                                {spec.title}
                                            </span>
                                        </td>

                                        {/* Divider */}
                                        <td className="py-3.5 w-px align-top">
                                            <div className="w-px h-full bg-gray-100 min-h-[20px]" />
                                        </td>

                                        {/* Value column */}
                                        <td className="py-3.5 px-5 align-top">
                                            {isBool ? (
                                                <span className={`inline-flex items-center gap-1.5 text-theme-caption-lg font-semibold ${isPositive ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                    <CheckCircle2
                                                        size={13}
                                                        className={isPositive ? 'text-emerald-500' : 'text-gray-300'}
                                                    />
                                                    {value}
                                                </span>
                                            ) : (
                                                <span className="text-gray-600 leading-snug text-theme-caption-lg">
                                                    {value}
                                                </span>
                                            )}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Collapse / Expand toggle */}
            {hasMore && (
                <motion.button
                    onClick={() => setExpanded(e => !e)}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 w-full justify-center py-3 rounded-2xl border border-gray-200 hover:border-gray-400 text-theme-body-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 group"
                    aria-expanded={expanded}
                >
                    <span>{expanded ? PRODUCT_SPEC_TEXT.SHOW_LESS : `${PRODUCT_SPEC_TEXT.SHOW_ALL} ${product.length} ${PRODUCT_SPEC_TEXT.SPECIFICATIONS_LOWER}`}</span>
                    <motion.span
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex"
                    >
                        <ChevronDown
                            size={15}
                            className="text-gray-400 group-hover:text-gray-700 transition-colors"
                        />
                    </motion.span>
                </motion.button>
            )}
        </div>
    );
};