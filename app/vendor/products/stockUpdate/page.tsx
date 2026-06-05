'use client';

import { useEffect, useState } from "react";
import {
  PackageSearch,
  ArrowUpDown,
  SlidersHorizontal,
  Package,
  RefreshCw,
  X,
  Check,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { authToken } from "@/utils/authToken";
import { fetchStockManagerVariants, quickUpdateStock, updateProductVariantStatus } from "@/utils/vendorApiClient";
import { TableRowSkeleton } from "@/components/common/skeletons";
import { ConfirmationModal } from "@/components/common/ConfirmationModal"; 
import { useAppSelector } from "@/hooks/reduxHooks";

export const stockTableHeader = [
  "Product / Variant",
  "SKU",
  "Warehouse",
  "Stock",
  "Status",
  "Actions",
];

function stockClass(stock: number): "out" | "low" | "ok" {
  if (stock === 0) return "out";
  if (stock <= 5) return "low";
  return "ok";
}

function barPercent(stock: number): number {
  return Math.min(100, Math.round((stock / 60) * 100));
}

const stockNumColor: Record<"out" | "low" | "ok", string> = {
  out: "text-red-600",
  low: "text-amber-500",
  ok: "text-stone-800",
};

const stockBarColor: Record<"out" | "low" | "ok", string> = {
  out: "bg-red-500",
  low: "bg-amber-400",
  ok: "bg-emerald-500",
};

const STEP_OPTIONS = [2, 5, 10, 25, 50];

export default function StockManagerPage() {
  const { user } = useAppSelector((state) => state.auth);
  const vendorId = (user && 'vendor_id' in user ? user.vendor_id : '') ?? '';
  const token = authToken();

  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("stock_asc");

  // Stock Edit Modal state
  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [adjustmentStep, setAdjustmentStep] = useState<number>(10);
  const [isSaving, setIsSaving] = useState(false);

  // Status Confirmation Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    variantId: string;
    currentStatus: string;
    productName: string;
  } | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const loadVariants = async () => {
    setLoading(true);
    try {
      const res = await fetchStockManagerVariants(token as string);
      setVariants(res.data || []);
    } catch {
      console.error("Failed to load variants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) redirect("/auth/vendorLogin");
    loadVariants();
  }, [token]);

  // Triggers the confirmation modal instead of executing immediately
  const handleStatusToggleClick = (variantId: string, currentStatus: string, productName: string) => {
    setConfirmConfig({
      isOpen: true,
      variantId,
      currentStatus,
      productName,
    });
  };

  // Executes after confirmation
  const executeStatusToggle = async () => {
    if (!confirmConfig) return;
    const { variantId, currentStatus } = confirmConfig;
    const nextStatus = currentStatus === "active" ? "inactive" : "active";

    setIsStatusUpdating(true);

    // Optimistic UI update
    setVariants((prev) =>
      prev.map((v) => (v.variantId === variantId ? { ...v, status: nextStatus } : v))
    );

    try {
      await updateProductVariantStatus(variantId, nextStatus, token as string);
      setConfirmConfig(null);
    } catch {
      alert("Failed to update status");
      // Revert if API fails
      setVariants((prev) =>
        prev.map((v) => (v.variantId === variantId ? { ...v, status: currentStatus } : v))
      );
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleSaveStock = async () => {
    if (!activeModalItem) return;
    if (editStockValue < 0) return alert("Stock cannot be less than zero.");
    setIsSaving(true);
    try {
      await quickUpdateStock(activeModalItem.variantId, editStockValue, token as string);
      setVariants((prev) =>
        prev.map((v) =>
          v.variantId === activeModalItem.variantId ? { ...v, stock: editStockValue } : v
        )
      );
      setActiveModalItem(null);
    } catch {
      alert("Failed to update stock.");
    } finally {
      setIsSaving(false);
    }
  };

  const openModal = (item: any) => {
    setActiveModalItem(item);
    setEditStockValue(item.stock);
  };

  const adjustEdit = (delta: number) =>
    setEditStockValue((prev) => Math.max(0, prev + delta));

  const filteredAndSorted = variants
    .filter((v) => {
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

  const totalVariants = variants.length;
  const lowStockCount = variants.filter((v) => v.stock > 0 && v.stock <= 5).length;
  const outOfStockCount = variants.filter((v) => v.stock === 0).length;
  const healthyCount = variants.filter((v) => v.stock > 5).length;

  // Live diff values
  const originalStock = activeModalItem?.stock ?? 0;
  const delta = editStockValue - originalStock;

  // Config variables for the confirmation modal
  const isActivating = confirmConfig?.currentStatus !== "active";

  return (
    <main className="w-full min-h-screen px-4 sm:px-6 pb-12 relative">

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
              Manage inventory locations, quantities, and visibility
            </p>
          </div>
        </div>
        <button
          onClick={loadVariants}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-stone-200 text-sm font-semibold text-stone-600 shadow-sm hover:bg-stone-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </header>

      {/* ── Summary Cards ── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total SKUs", value: totalVariants, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
            { label: "Low Stock", value: lowStockCount, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
            { label: "Out of Stock", value: outOfStockCount, color: "text-red-600", bg: "bg-red-50 border-red-200" },
            { label: "Healthy", value: healthyCount, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
          ].map((stat) => (
            <div key={stat.label} className={`border-2 rounded-2xl px-5 py-4 flex flex-col gap-1 bg-white ${stat.bg}`}>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2.5 items-center flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-md min-w-[240px]">
            <PackageSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by product name or SKU…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border-2 border-stone-200 rounded-xl shadow-sm placeholder-stone-400 text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm bg-white border-2 border-stone-200 rounded-xl shadow-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all cursor-pointer appearance-none"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="relative">
            <ArrowUpDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm bg-white border-2 border-stone-200 rounded-xl shadow-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all cursor-pointer appearance-none"
            >
              <option value="stock_asc">Stock: Low → High</option>
              <option value="stock_desc">Stock: High → Low</option>
              <option value="name_asc">Name: A → Z</option>
            </select>
          </div>
        </div>
        {!loading && (
          <span className="text-sm font-medium text-stone-500">
            {filteredAndSorted.length} records matching
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-stone-200 shadow-sm bg-white">
        <table className="w-full table-auto min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="bg-stone-50/80 text-left border-b border-stone-200">
              {stockTableHeader.map((col) => (
                <th key={col} className="p-4 text-xs font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <TableRowSkeleton columns={6} rows={6} />
            ) : filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-16 text-center text-stone-400">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  No inventory data matching your filters.
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((item) => {
                const sc = stockClass(item.stock);
                
                return (
                  <tr
                    key={item.variantId}
                    onClick={() => openModal(item)} // Extended to entire row
                    className={`group hover:bg-stone-50/60 bg-white transition-colors cursor-pointer ${
                      sc === "out" ? "bg-red-50/30" : sc === "low" ? "bg-amber-50/20" : ""
                    }`}
                  >
                    {/* Product / Variant */}
                    <td className="p-4 max-w-[240px]">
                      {/* stopPropagation on Link prevents navigating + opening modal simultaneously if it bubbles */}
                      <span
                        className="block font-semibold text-stone-800  truncate transition-colors leading-snug "
                      >
                        {item.productName}
                      </span>
                      <span className="inline-block text-[16px] font-medium text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md mt-1.5 font-mono">
                       <span className="font-bold text-black/90"> {item.attributes?.[0]?.name ?? ''} :</span>
                       <span className="text-black/70"> {item.attributes?.[0]?.value || ""}</span> 
                      </span>
                    </td>

                    {/* SKU */}
                    <td className="py-4 pl-4 font-mono text-xs text-stone-500">
                      {item.sku || "—"}
                    </td>

                    {/* Warehouse */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0" />
                        {item.warehouseName || "Primary Facility"}
                      </div>
                    </td>

{/* Stock — framed data + tactile button */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Data Display Box */}
                        <div 
                          className={`flex items-center justify-center min-w-[44px] h-8 px-2 rounded-lg bg-white border shadow-sm ${
                            sc === "out" ? "border-red-200 text-red-600" :
                            sc === "low" ? "border-amber-200 text-amber-600" :
                            "border-stone-200 text-stone-800"
                          }`}
                        >
                          <span className="text-sm font-bold tabular-nums leading-none">
                            {item.stock}
                          </span>
                        </div>

                        {/* Proper Action Button */}
                        <button
                          type="button"
                          className="inline-flex items-center justify-center h-8 gap-1.5 px-3 rounded-lg border border-stone-200 bg-white text-xs font-bold text-stone-600 shadow-sm hover:bg-stone-50 hover:border-stone-300 hover:text-stone-900 active:bg-stone-100 transition-all group/btn"
                        >
                          <Edit size={14} strokeWidth={2.5} className="text-stone-400 group-hover/btn:text-stone-600 transition-colors" />
                          Adjust
                        </button>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          item.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-stone-100 text-stone-500 border-stone-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === "active" ? "bg-emerald-500" : "bg-stone-400"
                          }`}
                        />
                        {item.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td 
                      className="p-4" 
                      onClick={(e) => e.stopPropagation()}  
                    >
                      <div className="flex items-center gap-3">
                        {/* Toggle */}
                        <button
                          onClick={() => handleStatusToggleClick(item.variantId, item.status, item.productName)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                            item.status === "active" ? "bg-emerald-500" : "bg-stone-300"
                          }`}
                          aria-label={`Toggle ${item.productName} status`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                              item.status === "active" ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer hint ── */}
      {!loading && filteredAndSorted.length > 0 && (
        <p className="text-center text-xs text-stone-400 mt-5">
          Showing{" "}
          <span className="font-semibold text-stone-600">{filteredAndSorted.length}</span>{" "}
          of {totalVariants} items. Click any{" "}
          <span className="font-semibold text-stone-600">row</span> to edit quantity.
        </p>
      )}

      {/* ── Stock Update Modal ── */}
{/* ── Stock Update Modal ── */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18 }}
              className="bg-white border border-stone-200 rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-0.5">
                    Inventory Adjustment
                  </span>
                  <h3 className="text-base font-bold text-stone-800 line-clamp-1">
                    {activeModalItem.productName}
                  </h3>
                  {activeModalItem.sku && (
                    <p className="text-xs text-stone-400 font-mono mt-0.5">
                      SKU: {activeModalItem.sku}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Live Diff Bar */}
              <div className="flex items-center justify-between px-5 py-4 bg-stone-50/50 border-b border-stone-100">
                {/* Current */}
                <div className="flex-1 text-center">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    Current Stock
                  </p>
                  <p className="text-2xl font-bold text-stone-400 tabular-nums">
                    {originalStock}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center justify-center shrink-0 px-2">
                  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className="text-stone-300">
                    <path d="M1 7h18M13 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* New value */}
                <div className="flex-1 text-center">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    New Value
                  </p>
                  <p
                    className={`text-2xl font-bold tabular-nums ${
                      delta === 0
                        ? "text-stone-800"
                        : delta > 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {editStockValue}
                  </p>
                </div>
              </div>

              {/* Direct Input Section */}
              <div className="px-5 py-6">
                <label 
                  htmlFor="stock-input" 
                  className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2.5"
                >
                  Set Exact Quantity
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    id="stock-input"
                    type="number"
                    min={0}
                    value={editStockValue}
                    onChange={(e) =>
                      setEditStockValue(
                        e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value, 10))
                      )
                    }
                    className="w-full border-2 border-stone-200 rounded-xl pl-4 pr-16 py-3 text-xl font-bold text-stone-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all tabular-nums"
                    autoFocus
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-100 border border-stone-200/60 px-2.5 py-1.5 rounded-lg uppercase tracking-wide">
                      Units
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-stone-100 bg-stone-50/50">
                {/* Dynamic Delta Badge */}
                <div className="flex-1 min-w-0">
                  {delta === 0 ? (
                    <span className="text-xs font-medium text-stone-400 block">
                      No changes to commit
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md ${
                        delta > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {delta > 0 ? `Stocking up: +${delta}` : `Reducing by: ${delta}`}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveModalItem(null)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 bg-white hover:bg-stone-50 active:bg-stone-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={handleSaveStock}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 text-xs font-bold shadow-sm transition-colors"
                  >
                    <Check size={16} strokeWidth={2.5} />
                    {isSaving ? "Saving…" : "Commit"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Status Confirmation Modal ── */}
      <ConfirmationModal
        isOpen={!!confirmConfig?.isOpen}
        onClose={() => setConfirmConfig(null)}
        onConfirm={executeStatusToggle}
        isLoading={isStatusUpdating}
        title={isActivating ? "Publish Variant?" : "Deactivate Variant?"}
        message={
          isActivating
            ? `Are you sure you want to activate "${confirmConfig?.productName.trim().split(' ').slice(0, 2).join(' ')}"? Turning this on will publish this variant to customers and make it available for purchase.`
            : `Are you sure you want to deactivate "${confirmConfig?.productName.trim().split(' ').slice(0, 2).join(' ')}"? This will immediately hide the variant from customers.`
        }
        actionType={isActivating ? "activate" : "deactivate"}
        confirmText={isActivating ? "Publish Variant" : "Deactivate"}
      />

    </main>
  );
}