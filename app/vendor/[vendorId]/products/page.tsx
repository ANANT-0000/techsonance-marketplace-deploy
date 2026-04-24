import Link from "next/link";
import { Edit, Plus, Download, Package } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { fetchVendorProducts, fetchVendorsProductsCategory } from "@/utils/vendorApiClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteBtn } from "@/components/vendor/DeleteBtn";
import { DynamicIcon } from "lucide-react/dynamic";
import { Product } from "@/utils/Types";
import { StatusToggle } from "@/components/common/StatusToggle";

export const PRODUCT_TABLE_HEAD = ["PRODUCT", "VARIANT", "SKU", "STOCK", "PRICE", "STATUS", "ACTION"];

export default async function Products({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = await params;

    const categoryOptions: { value: string; label: string }[] = await fetchVendorsProductsCategory(vendorId)
        .then((res) => {
            const categories = res?.data || [];
            return categories.map((cat: any) => ({ value: cat.id, label: cat.name }));
        })
        .catch((error) => {
            console.error("Error fetching category options:", error);
            return [];
        });

    const getProducts = await fetchVendorProducts(vendorId)
        .then((res) => res?.data || [])
        .catch((error) => {
            console.error("Error fetching products:", error);
            return [];
        });

    const productList: Product[] = getProducts || [];

    let count = 1;
    const pageSize = 5;
    const totalPages = Math.ceil(productList.length / pageSize);
    const startIndex = (count - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData: typeof productList = productList.slice(startIndex, endIndex);

    return (
        <main className="w-full px-1">
            {/* Header */}
            <div className="flex gap-3 my-6 justify-between items-center">
                <div className="flex items-center gap-2">
                    <Package size={22} className="text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    {productList.length > 0 && (
                        <span className="ml-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {productList.length}
                        </span>
                    )}
                </div>
                <div className="flex gap-3">
                    <Link
                        className="flex items-center gap-2 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-semibold px-4 py-2.5 transition-colors shadow-sm"
                        href="products/productForm"
                    >
                        <Plus size={16} />
                        Add Product
                    </Link>
                    <button className="flex items-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors shadow-sm">
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
                {/* Search */}
                <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
                    <DynamicIcon name="search" size={18} className="text-gray-400 shrink-0" />
                    <input
                        type="text"
                        className="text-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
                        placeholder="Search by name, email or domain"
                    />
                </span>

                {/* Filters */}
                <span className="flex flex-wrap gap-3">
                    <select
                        className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
                        name="status"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <select
                        className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
                        name="category"
                    >
                        <option value="">All Categories</option>
                        {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </span>
            </div>

            {/* Table — horizontally scrollable */}
            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <Table className="w-full table-auto min-w-[800px]">
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-100 hover:bg-gray-50">
                            <TableHead className="p-4 w-10">
                                <input className="w-4 h-4" type="checkbox" />
                            </TableHead>
                            {PRODUCT_TABLE_HEAD.map((head, index) => (
                                <TableHead
                                    key={index}
                                    className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                                >
                                    {head}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100">
                        {productList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="py-16 text-center text-gray-400 text-sm">
                                    <Package size={36} className="mx-auto mb-3 opacity-30" />
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            productList.map((item: Product, index: number) => {
                                const firstVariant = item.variants?.[0];
                                const stockQty = firstVariant?.inventory?.stock_quantity;
                                const isLowStock = stockQty !== undefined && stockQty < 20;
                                const status = firstVariant?.status;

                                return (
                                    <TableRow key={item.id ?? index} className="hover:bg-gray-50 transition-colors">
                                        {/* Checkbox */}
                                        <TableCell className="p-4">
                                            <input type="checkbox" className="w-4 h-4" />
                                        </TableCell>

                                        {/* Product Image + Name */}
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-3 min-w-[220px] max-w-[320px]">
                                                <img
                                                    className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                                                    src={firstVariant?.images?.[0]?.image_url}
                                                    alt={item.name}
                                                />
                                                <span className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
                                                    {item.name.trimStart()}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Variant */}
                                        <TableCell className="px-4 py-3">
                                            {item.variants && item.variants.length > 0 ? (
                                                <Link
                                                    href={`/vendor/${vendorId}/products/${item.id}/productVariants`}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 py-1.5 px-3 rounded-full transition-colors whitespace-nowrap"
                                                    title="View Variants"
                                                >
                                                    <DynamicIcon name="tag" size={13} />
                                                    {item.variants.length} Variant{item.variants.length > 1 ? "s" : ""}
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/vendor/${vendorId}/products/variantForm/${item.id}`}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 py-1.5 px-3 rounded-full transition-colors whitespace-nowrap"
                                                    title="Add Variant"
                                                >
                                                    <Plus size={13} />
                                                    Add Variant
                                                </Link>
                                            )}
                                        </TableCell>

                                        {/* SKU */}
                                        <TableCell className="px-4 py-3 text-sm text-gray-500 font-mono whitespace-nowrap">
                                            {firstVariant?.sku || (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </TableCell>

                                        {/* Stock */}
                                        <TableCell className="px-4 py-3">
                                            {stockQty !== undefined ? (
                                                <span className={`inline-flex items-center text-xs font-semibold py-1 px-3 rounded-full border ${isLowStock
                                                    ? "bg-red-50 text-red-600 border-red-200"
                                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    }`}>
                                                    {isLowStock ? "⚠ " : ""}{stockQty}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 text-sm">—</span>
                                            )}
                                        </TableCell>

                                        {/* Price */}
                                        <TableCell className="px-4 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                                            ₹{Number(item.base_price).toLocaleString()}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell className="px-4 py-3">
                                            <StatusToggle
                                                productId={item.id}
                                                vendorId={vendorId}
                                                initialStatus={status ?? "inactive"}
                                            />
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="px-4 py-3">
                                            <div className="flex gap-2 items-center whitespace-nowrap">
                                                <Link
                                                    href={`/vendor/${vendorId}/products/productUpdateForm/${firstVariant?.id ?? item.id}`}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 py-1.5 px-3 rounded-lg transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </Link>
                                                <DeleteBtn
                                                    id={item.id}
                                                    vendorId={vendorId}
                                                    toDelete="PRODUCT"
                                                    style="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-1 px-3 rounded-lg transition-colors"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <span className="flex justify-end mt-4 mb-6">
                {/* <Pagination setCount={setCount} count={count} totalPages={totalPages} style="relative right-0 w-54" /> */}
            </span>
        </main>
    );
}