'use client';
import { useEffect, useState } from "react";
import { Download, PackageSearch, Save, Edit3, X, ArrowUpDown, SlidersHorizontal, Package } from "lucide-react";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import { authToken } from "@/utils/authToken";
import { fetchStockManagerVariants, quickUpdateStock, updateProductVariantStatus } from "@/utils/vendorApiClient";
import { TableRowSkeleton } from "@/components/common/skeletons";
export const stockTableHeader = [
  "Product / Variant Name",
  "SKU",
  "Warehouse",
  "Current Stock",
  "Status",
  "Actions"
];

export default function StockManagerPage() {
  const params = useParams();
  const vendorId = params.vendorId as string;
  const token = authToken();

  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState<any[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>("stock_asc");

  // Inline Edit State
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number | string>("");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Data loads instantly in the exact format we need
  const loadVariants = async () => {
    setLoading(true);
    try {
      const res = await fetchStockManagerVariants(token as string);
      setVariants(res.data || []);
    } catch (error) {
      console.error("Failed to load variants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) redirect("/auth/vendorLogin");
    loadVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 2. Status Toggle Handler
  const handleStatusToggle = async (variantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setVariants(prev => prev.map(v => v.variantId === variantId ? { ...v, status: nextStatus } : v));
    try {
      await updateProductVariantStatus(variantId, vendorId, nextStatus, token as string);
    } catch (error) {
      alert("Failed to update status");
      setVariants(prev => prev.map(v => v.variantId === variantId ? { ...v, status: currentStatus } : v));
    }
  };

  // 3. Stock Save Handler
  const handleSaveStock = async (variantId: string) => {
    if (editStockValue === "" || Number(editStockValue) < 0) return alert("Invalid stock value");
    setIsSaving(true);
    try {
      await quickUpdateStock(variantId, Number(editStockValue), vendorId, token as string);
      setVariants(prev => prev.map(v => v.variantId === variantId ? { ...v, stock: Number(editStockValue) } : v));
      setEditingVariantId(null);
    } catch (error) {
      alert("Failed to update stock quantity.");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Clean Filtering
  const filteredAndSortedVariants = variants
    .filter(v => {
      const matchesSearch =
        v.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.sku && v.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "stock_asc") return a.stock - b.stock;
      if (sortBy === "stock_desc") return b.stock - a.stock;
      if (sortBy === "name_asc") return a.productName.localeCompare(b.productName);
      return 0;
    });

  // Derived stats
  const totalVariants = variants.length;
  const lowStockCount = variants.filter(v => v.stock <= 5).length;
  const activeCount   = variants.filter(v => v.status === 'active').length;
  const outOfStock    = variants.filter(v => v.stock === 0).length;

  return (
    <main className="w-full min-h-screen  px-4 sm:px-6 pb-12">

      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center shrink-0">
            <Package size={18} className="text-stone-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-800 tracking-tight leading-none">
              Stock Manager
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Manage inventory levels and variant visibility
            </p>
          </div>
        </div>

        {/* <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-sm font-medium text-stone-600 shadow-sm hover:bg-stone-50 hover:border-stone-300 transition-all self-start sm:self-auto">
          <Download size={15} />
          Export CSV
        </button> */}
      </header>

      {/* ── Summary Stats ── */}
      {/* {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total variants',  value: totalVariants, icon: '📦', accent: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100' },
            { label: 'Active',          value: activeCount,   icon: '✅', accent: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Low stock (≤5)',  value: lowStockCount, icon: '⚠️', accent: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100' },
            { label: 'Out of stock',    value: outOfStock,    icon: '🚫', accent: 'text-red-500',    bg: 'bg-red-50 border-red-100' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-stone-200 px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${stat.bg}`}>
                {stat.icon}
              </div>
              <p className={`text-2xl font-semibold leading-none ${stat.accent}`}>{stat.value}</p>
              <p className="text-[11px] text-stone-400">{stat.label}</p>
            </div>
          ))}
        </div>
      )} */}

      {/* ── Filter / Search Bar ── */}
      <div className="flex flex-wrap gap-2.5 items-center mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <PackageSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product or SKU…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-stone-200 rounded-xl shadow-sm placeholder-stone-400 text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm bg-white border border-stone-200 rounded-xl shadow-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all cursor-pointer appearance-none"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Hidden</option>
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm bg-white border border-stone-200 rounded-xl shadow-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all cursor-pointer appearance-none"
          >
            <option value="stock_asc">Stock: Low → High</option>
            <option value="stock_desc">Stock: High → Low</option>
            <option value="name_asc">Name: A → Z</option>
          </select>
        </div>

        {/* Result count */}
        {!loading && (
          <span className="text-xs text-stone-400 ml-1 shrink-0">
            {filteredAndSortedVariants.length} result{filteredAndSortedVariants.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <div className="w-full overflow-x-auto rounded-2xl border border-stone-200 shadow-sm bg-white">
        <table className="w-full table-auto min-w-[860px] border-collapse">

          {/* Table Head */}
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/80">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500"
                />
              </th>
              {['Product / Variant', 'SKU', 'Warehouse', 'Stock','Actions'].map(col => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-widest whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              /* ── Skeleton loading rows ── */
        <TableRowSkeleton columns={6} rows={5} />
            ) : filteredAndSortedVariants.length === 0 ? (
              /* ── Empty state ── */
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
                      <PackageSearch size={24} className="text-stone-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-600">No variants found</p>
                      <p className="text-xs text-stone-400 mt-1">Try adjusting your search or filters</p>
                    </div>
                    {(searchQuery || statusFilter) && (
                      <button
                        onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                        className="text-xs text-emerald-600 underline underline-offset-2 font-medium"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedVariants.map((item) => (
                <tr
                  key={item.variantId}
                  className="hover:bg-stone-50/70 transition-colors group"
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500"
                    />
                  </td>

                  {/* Product / Variant Name */}
                  <td className="px-4 py-3.5 max-w-[240px]">
                    <Link
                      href={`/vendor/${vendorId}/products/${item.productId}`}
                      className="block font-semibold text-sm text-stone-800 hover:text-emerald-600 truncate transition-colors leading-snug no-underline"
                    >
                      {item.productName}
                    </Link>
                    <span className="inline-block text-[11px] font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md mt-1">
                      {item.variantName || "Default"}
                    </span>
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-stone-500 bg-stone-50 border border-stone-200 px-2 py-1 rounded-lg tracking-tight">
                      {item.sku || '—'}
                    </span>
                  </td>

                  {/* Warehouse */}
                  <td className="px-4 py-3.5 text-sm text-stone-500">
                    {item.warehouseName || '—'}
                  </td>

                  {/* Inline Stock Editor */}
                  <td className="px-4 py-3.5">
                    {editingVariantId === item.variantId ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={editStockValue}
                          onChange={e => setEditStockValue(e.target.value)}
                          className="w-20 border border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 outline-none rounded-lg px-2.5 py-1.5 text-sm font-bold text-stone-800 bg-white shadow-sm"
                          autoFocus
                        />
                        <button
                          disabled={isSaving}
                          onClick={() => handleSaveStock(item.variantId)}
                          className="w-7 h-7 flex items-center justify-center bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                          aria-label="Save stock"
                        >
                          <Save size={13} />
                        </button>
                        <button
                          onClick={() => setEditingVariantId(null)}
                          className="w-7 h-7 flex items-center justify-center bg-stone-100 text-stone-500 hover:bg-stone-200 rounded-lg transition-colors shrink-0"
                          aria-label="Cancel edit"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {item.stock === 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
                            Out of stock
                          </span>
                        ) : item.stock <= 5 ? (
                          <span className="font-bold text-sm text-amber-600">
                            {item.stock}
                            <span className="ml-1.5 text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                              Low
                            </span>
                          </span>
                        ) : (
                          <span className="font-bold text-sm text-stone-800">{item.stock}</span>
                        )}
                        <button
                          onClick={() => { setEditingVariantId(item.variantId); setEditStockValue(item.stock); }}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-stone-300 hover:text-emerald-600 hover:bg-emerald-100 transition-all"
                          aria-label="Edit stock"
                        >
                          <Edit3 size={24} />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Status Toggle */}
                  {/* <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusToggle(item.variantId, item.status)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 shrink-0 ${
                          item.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-stone-200'
                        }`}
                        aria-label={`Toggle status for ${item.productName}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                            item.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-medium ${item.status === 'ACTIVE' ? 'text-emerald-600' : 'text-stone-400'}`}>
                        {item.status === 'ACTIVE' ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </td> */}

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/vendor/${vendorId}/products/variantUpdateForm/${item.variantId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap no-underline"
                    >
                      Full Edit
                      <span className="text-emerald-400">→</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer note ── */}
      {!loading && filteredAndSortedVariants.length > 0 && (
        <p className="text-center text-[11px] text-stone-400 mt-5 leading-relaxed">
          Showing <span className="font-medium text-stone-500">{filteredAndSortedVariants.length}</span> of{' '}
          <span className="font-medium text-stone-500">{totalVariants}</span> variants.
          Click the pencil icon on any row to edit stock inline.
        </p>
      )}
    </main>
  );
}