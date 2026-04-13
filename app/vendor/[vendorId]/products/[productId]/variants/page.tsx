import Link from "next/link";
import { Plus, Package, Edit, ArrowLeft, Layers, Tag, ImageOff } from "lucide-react";
import { fetchProductVariants } from "@/utils/vendorApiClient";
import { DeleteBtn } from "@/components/vendor/DeleteBtn";
import { VariantImgGrid } from "@/components/vendor/VariantImgGrid";
import { ProductImageType } from "@/utils/Types";
import { formatCurrency } from "@/lib/utils";

interface ProductVariant {
    id: string;
    sku: string;
    price: number;
    stock_quantity: number;
    status: string;
    attributes: { name: string; value: string }[];
    images: ProductImageType[] | null;
}

export default async function VariantListingPage({
    params,
}: {
    params: Promise<{ vendorId: string; productId: string }>;
}) {
    const { vendorId, productId } = await params;

    const getVariants = await fetchProductVariants(productId);
    console.log(getVariants)
    const variants: ProductVariant[] = getVariants.data;

    console.log(variants)
    return (
        <main className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="mx-auto max-w-6xl space-y-8">


                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/vendor/${vendorId}/products`}
                            className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition shadow-sm"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Variants</h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Manage stock, pricing, and details for each variation.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={`/vendor/${vendorId}/products/variantForm/${productId}`}
                        className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 px-5 rounded-xl hover:bg-blue-700 active:scale-95 transition shadow-md shadow-blue-200"
                    >
                        <Plus size={16} />
                        Add Variant
                    </Link>
                </div>


                <div className="flex items-center gap-2">
                    <Layers size={16} className="text-indigo-400" />
                    <span className="text-sm font-semibold text-slate-600">
                        {variants.length} Variant{variants.length !== 1 ? "s" : ""}
                    </span>
                </div>


                {variants.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                            <Package size={36} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">No variants yet</h3>
                        <p className="text-slate-400 text-sm mt-1 mb-6">
                            This product has no variations. Create one to get started.
                        </p>
                        <Link
                            href={`/vendor/${vendorId}/products/variantForm/${productId}`}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 px-5 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200"
                        >
                            <Plus size={15} /> Create First Variant
                        </Link>
                    </div>
                ) : (

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {variants.map((variant) => (
                            <div
                                key={variant.id}
                                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                            >
                                {
                                    variant.images && variant.images.length > 0 &&
                                    < VariantImgGrid variantImages={variant?.images} />
                                }

                                {/* ── CARD BODY ── */}
                                <div className="p-4 flex flex-col gap-3 flex-1">

                                    {/* SKU + Status row */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">SKU</p>
                                            <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                                                {variant.sku || "—"}
                                            </p>
                                        </div>
                                        <span
                                            className={`mt-0.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${variant.status === "active"
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                                : "bg-slate-100 text-slate-500 border border-slate-200"
                                                }`}
                                        >
                                            {variant.status.charAt(0).toUpperCase() + variant.status.slice(1)}
                                        </span>
                                    </div>


                                    {variant.attributes.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                <Tag size={10} /> Attributes
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {variant.attributes.map((attr, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-medium px-2 py-1 rounded-lg"
                                                    >
                                                        <span className="text-indigo-400 font-semibold">{attr.name}:</span>
                                                        <span>{attr.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t border-slate-100" />


                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Price</p>
                                            <p className="text-lg font-bold text-slate-900 mt-0.5">
                                                ₹{formatCurrency(variant.price)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Stock</p>
                                            {variant.stock_quantity > 0 ? (
                                                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                                                    {variant.stock_quantity}{" "}
                                                    <span className="text-slate-400 font-normal">units</span>
                                                </p>
                                            ) : (
                                                <span className="inline-block mt-0.5 text-[11px] font-semibold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-10">
                                        <DeleteBtn id={variant.id} style="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:border-red-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all" toDelete="VARIANT" vendorId={vendorId} variantId={variant.id} />
                                        <Link
                                            href={`/vendor/${vendorId}/products/variantUpdateForm/${productId}/${variant.id}`}
                                            className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
                                        >
                                            <Edit size={14} />
                                            Edit Variant
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}