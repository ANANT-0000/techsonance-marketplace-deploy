"use client";
import { useEffect, useState } from "react";
import { Pagination } from "@/components/common/Pagination";
import { searchImgDark } from "@/constants/common";
import { AlertTriangle, Package, RefreshCw, XCircle, CheckCircle, Edit2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BASE_API_URL } from "@/constants";
import { companyDomain } from "@/config";

interface InventoryItem {
    id: string;
    stock_quantity: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
    variant: {
        id: string;
        variant_name: string;
        sku: string;
        price: string;
        stock_quantity: number;
        status: string;
        images: { image_url: string; is_primary: boolean }[];
    };
    warehouse: { id: string; warehouse_name: string };
}
interface LowStockAlert {
    inventoryId: string;
    variantId: string;
    variantName: string;
    sku: string;
    currentStock: number;
    warehouseName: string;
    isOutOfStock: boolean;
    severity: "critical" | "low";
}



async function fetchInventory(domain: string): Promise<InventoryItem[]> {
    const res = await fetch(`${BASE_API_URL}inventory`, {
        headers: { "company-domain": domain },
        cache: "no-cache",
    });
    const json = await res.json();
    console.log("inv json", json)
    return json.data ?? [];
}

async function fetchAlerts(domain: string): Promise<LowStockAlert[]> {
    const res = await fetch(`${BASE_API_URL}inventory/alerts/low-stock`, {
        headers: { "company-domain": domain },
        cache: "no-cache",
    });
    const json = await res.json();
    console.log("alet json", json)

    return json.data ?? [];
}

async function updateStock(inventoryId: string, quantity: number, domain: string) {
    const res = await fetch(`${BASE_API_URL}inventory/${inventoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "company-domain": domain },
        body: JSON.stringify({ quantity }),
    });
    return res.json();
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function InventoryPage() {
    const domain = companyDomain
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "low" | "out">("all");
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState<string | null>(null);
    const [editQty, setEditQty] = useState<number>(0);
    const [saving, setSaving] = useState(false);
    const [count, setCount] = useState(1);
    const pageSize = 8;

    const reload = async () => {
        setLoading(true);
        const [inv, alrt] = await Promise.all([fetchInventory(domain), fetchAlerts(domain)]);
        setInventory(inv);
        setAlerts(alrt);
        setLoading(false);
    };

    useEffect(() => { console.log('fetching inventory and alerts'); reload(); }, []);

    // ── Filtering ──
    const filtered = inventory.filter((item) => {
        const matchSearch =
            item.variant.variant_name.toLowerCase().includes(search.toLowerCase()) ||
            item.variant.sku.toLowerCase().includes(search.toLowerCase());
        const matchStatus =
            statusFilter === "all" ||
            (statusFilter === "out" && item.isOutOfStock) ||
            (statusFilter === "low" && item.isLowStock && !item.isOutOfStock);
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / pageSize);
    const currentData = filtered.slice((count - 1) * pageSize, count * pageSize);

    // ── Stock update ──
    const handleSave = async (inventoryId: string) => {
        setSaving(true);
        await updateStock(inventoryId, editQty, domain);
        setSaving(false);
        setEditId(null);
        await reload();
    };

    return (
        <>
            <main className="px-2 w-full">
                <AnimatePresence>
                    {alerts.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 border-2 border-orange-300 bg-orange-50 rounded-2xl p-4"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="text-orange-500" size={20} />
                                <h2 className="font-bold text-orange-700">
                                    Stock Alerts ({alerts.length} item{alerts.length !== 1 ? "s" : ""})
                                </h2>
                            </div>
                            <div className="flex flex-wrap gap-3 ">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.inventoryId}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${alert.isOutOfStock
                                            ? "bg-red-100 border-red-300 text-red-700"
                                            : "bg-yellow-100 border-yellow-300 text-yellow-700"
                                            }`}
                                    >
                                        {alert.isOutOfStock ? (
                                            <XCircle size={14} />
                                        ) : (
                                            <AlertTriangle size={14} />
                                        )}
                                        <span className="max-w-[180px] truncate">{alert.variantName}</span>
                                        <span className="font-bold">
                                            {alert.isOutOfStock ? "Out of stock" : `${alert.currentStock} left`}
                                        </span>
                                        <span className="text-xs opacity-70">· {alert.warehouseName}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
                <div className="flex gap-4 my-6 flex-wrap">
                    {[
                        { label: "Total SKUs", value: inventory.length, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
                        {
                            label: "Low Stock",
                            value: inventory.filter((i) => i.isLowStock && !i.isOutOfStock).length,
                            color: "text-yellow-600",
                            bg: "bg-yellow-50 border-yellow-200",
                        },
                        {
                            label: "Out of Stock",
                            value: inventory.filter((i) => i.isOutOfStock).length,
                            color: "text-red-600",
                            bg: "bg-red-50 border-red-200",
                        },
                        {
                            label: "Healthy",
                            value: inventory.filter((i) => !i.isLowStock).length,
                            color: "text-green-600",
                            bg: "bg-green-50 border-green-200",
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className={`border rounded-2xl px-6 py-4 flex flex-col gap-1 ${stat.bg}`}
                        >
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {stat.label}
                            </p>
                            <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Filters ─────────────────────────────────────────────── */}
                <div className="flex gap-3 mb-4 flex-wrap items-center justify-between">
                    <span className="border-2 flex items-center gap-0 border-gray-300 px-4 rounded-2xl bg-white">
                        <img className="w-5 h-5" src={searchImgDark} alt="search" />
                        <input
                            type="text"
                            className="py-2 px-3 w-64 text-sm outline-none bg-transparent"
                            placeholder="Search by name or SKU…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCount(1); }}
                        />
                    </span>

                    <div className="flex gap-2">
                        {(["all", "low", "out"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => { setStatusFilter(f); setCount(1); }}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${statusFilter === f
                                    ? f === "out"
                                        ? "bg-red-100 border-red-400 text-red-700"
                                        : f === "low"
                                            ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                                            : "bg-blue-100 border-blue-400 text-blue-700"
                                    : "bg-white border-gray-300 text-gray-600"
                                    }`}
                            >
                                {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
                            </button>
                        ))}
                        <button
                            onClick={reload}
                            className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-gray-300 bg-white text-gray-600 flex items-center gap-2 hover:bg-gray-50"
                        >
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* ── Table ───────────────────────────────────────────────── */}
                <div className="relative flex flex-col w-full overflow-auto bg-white border-2 border-gray-200 rounded-2xl">
                    <table className="w-full table-auto min-w-max text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">Product</th>
                                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">SKU</th>
                                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">Warehouse</th>
                                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">Stock</th>
                                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">Status</th>
                                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600">Price</th>
                                <th className="p-4 border-b border-gray-200 font-semibold text-gray-600 text-center">Adjust</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse border-b border-gray-100">
                                        {Array.from({ length: 7 }).map((__, j) => (
                                            <td key={j} className="p-4">
                                                <div className="h-4 bg-gray-200 rounded w-24" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : currentData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-400">
                                        <Package size={40} className="mx-auto mb-3 opacity-30" />
                                        No inventory items found.
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${item.isOutOfStock ? "bg-red-50/30" : item.isLowStock ? "bg-yellow-50/30" : ""
                                            }`}
                                    >
                                        {/* Product */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {item.variant.images[0] ? (
                                                    <img
                                                        src={item.variant.images[0].image_url}
                                                        alt={item.variant.variant_name}
                                                        className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <Package size={16} className="text-gray-400" />
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-800 max-w-[200px] truncate">
                                                    {item.variant.variant_name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* SKU */}
                                        <td className="p-4 font-mono text-gray-500 text-xs">{item.variant.sku}</td>

                                        {/* Warehouse */}
                                        <td className="p-4 text-gray-600">{item.warehouse?.warehouse_name ?? "—"}</td>

                                        {/* Stock */}
                                        <td className="p-4">
                                            {editId === item.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={editQty}
                                                        onChange={(e) => setEditQty(Number(e.target.value))}
                                                        className="w-20 border-2 border-blue-400 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                                    />
                                                    <button
                                                        onClick={() => handleSave(item.id)}
                                                        disabled={saving}
                                                        className="p-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditId(null)}
                                                        className="p-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span
                                                    className={`font-bold text-lg ${item.isOutOfStock
                                                        ? "text-red-600"
                                                        : item.isLowStock
                                                            ? "text-yellow-600"
                                                            : "text-gray-800"
                                                        }`}
                                                >
                                                    {item.stock_quantity}
                                                </span>
                                            )}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="p-4">
                                            {item.isOutOfStock ? (
                                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-300 text-xs font-bold px-2.5 py-1 rounded-full">
                                                    <XCircle size={12} /> Out of Stock
                                                </span>
                                            ) : item.isLowStock ? (
                                                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 border border-yellow-300 text-xs font-bold px-2.5 py-1 rounded-full">
                                                    <AlertTriangle size={12} /> Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-300 text-xs font-bold px-2.5 py-1 rounded-full">
                                                    <CheckCircle size={12} /> In Stock
                                                </span>
                                            )}
                                        </td>

                                        {/* Price */}
                                        <td className="p-4 font-semibold text-gray-700">
                                            ₹{Number(item.variant.price).toLocaleString()}
                                        </td>

                                        {/* Adjust */}
                                        <td className="p-4 text-center">
                                            {editId !== item.id && (
                                                <button
                                                    onClick={() => { setEditId(item.id); setEditQty(item.stock_quantity); }}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 border-2 border-blue-300 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
                                                >
                                                    <Edit2 size={12} /> Restock
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ──────────────────────────────────────────── */}
                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-500">
                        Showing {currentData.length} of {filtered.length} records
                    </p>
                    <Pagination setCount={setCount} count={count} totalPages={totalPages || 1} style="" />
                </div>
            </main>
        </>
    );
}
