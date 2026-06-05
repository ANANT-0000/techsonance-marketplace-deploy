'use client';

import { useEffect, useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Wallet, IndianRupee, TrendingUp, Clock, ArrowDownToLine, Search, RefreshCw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TableRowSkeleton } from "@/components/common/skeletons";
import Link from "next/link";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { Pagination } from "@/components/common/Pagination";
 

// ─── Types ───────────────────────────────────────────────────────────────────
// Mirrors the shape returned by FinancesService.getVendorFinancial()
// data.earnings[]
interface EarningRecord {
  id: string;              // payment.id or "calc-{order.id}"
  order_id: string;        // orders.id
  //   gross_amount: string;    // orders.total_amount  (string decimal)

  net_earning: string;     // gross - fee
  status: 'PENDING' | 'CLEARED' | 'REVERSED';
  created_at: string | Date;
  transaction_ref: string; // payments.transaction_ref or "N/A"
}

// Full API response shape from getVendorFinancial()
interface EarningsResponse {
  total_transactions: number;
  total_cleared_earnings: string;
  total_pending_earnings: string;
  earnings: EarningRecord[];
}

// ─── Table header columns ─────────────────────────────────────────────────────
const TABLE_HEADERS = [
  "Transaction ID",
  "Order Ref",
  "Transaction Ref",
  //   "Gross Amount",
  //   "Platform Fee",
  "Net Earning",
  "Status",
  "Date",
  "Actions",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(amount: string | number) {
  return Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function shortId(uuid: string) {
  return uuid.replace(/^calc-/, "").split("-")[0].toUpperCase();
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  if (s === "CLEARED")
    return (
      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Cleared
      </span>
    );
  if (s === "REVERSED")
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 py-1 px-3 rounded-full text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Reversed
      </span>
    );
  // PENDING
  return (
    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
      Pending
    </span>
  );
}

// ─── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 min-w-[200px] flex-1`}>
      <span className={`p-2.5 rounded-xl ${color}`}>{icon}</span>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-900 flex items-center gap-0.5">
          <IndianRupee size={16} className="text-gray-600" />
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EarningsPage() {


  // ── state ──
  const [earnings, setEarnings] = useState<EarningRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearedEarnings, setClearedEarnings] = useState<string>("0.00");
  const [pendingEarnings, setPendingEarnings] = useState<string>("0.00");
  const [totalTransactions, setTotalTransactions] = useState<number>(0);

  // filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"asc" | "desc">("desc");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * itemsPerPage;
  const token = authToken()
  // ── fetch ──
  const fetchEarnings = async (search: string, offset: number, statusFilter: string, date: Date | undefined, sortby: "asc" | "desc", token: string) => {
    setLoading(true);
    setError(null);
    try {

      const response = await AxiosAPI.get(`/v1/finances/earnings?search=${debouncedSearch ?? ""}&offset=${offset ?? 0}&limit=${itemsPerPage}&status=${statusFilter ?? ""}&date=${date?.toISOString() ?? ""}&sortby=${sortby ?? ""}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data)
      if (response.status !== 200) throw new Error(`HTTP ${response.status}: ${response.data.message}`);


      setEarnings(response.data?.data.
        earnings
        ?? []);
      setClearedEarnings(response.data?.data.total_cleared_earnings ?? "0.00");
      setPendingEarnings(response.data?.data.total_pending_earnings ?? "0.00");
      setTotalTransactions(response.data?.data.total_transactions ?? 0);
      const totalTransactions = response.data?.data.total_transactions;
      setTotalPages(Math.ceil(totalTransactions / itemsPerPage) || 1);
    } catch (err: any) {
      console.error("Error fetching earnings:", err);
      setError("Failed to load earnings. Please try again.");
      setEarnings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchEarnings(search, offset, statusFilter, date, sortBy, token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, offset, statusFilter, date, sortBy, search]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page on new search
    }, 500); // 500ms delay

    return () => clearTimeout(debounceTimer);
  }, [search])
  const clearDate = () => {
    setDate(undefined);
    setCalendarOpen(false);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <section className="w-full px-1">
      {/* ── Header ── */}
      <header className="flex flex-wrap justify-between items-center my-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <Wallet size={22} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">Earnings & Settlements</h1>
            <p className="text-xs text-gray-400 mt-0.5">Vendor financial ledger — orders × payments</p>
          </div>
          {!loading && earnings && (
            <span className="ml-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {totalTransactions}
            </span>
          )}
        </div>

        <button
          onClick={() => token && fetchEarnings(search, offset, statusFilter, date, sortBy, token)}
          className="flex items-center gap-2 text-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 rounded-xl px-4 py-2 transition-colors font-medium shadow-sm"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {/* ── Summary cards ── */}
      {!loading && earnings && (
        <div className="flex flex-wrap gap-3 mb-5">
          <SummaryCard
            icon={<TrendingUp size={18} className="text-emerald-600" />}
            label="Cleared Earnings"
            color="bg-emerald-50"
            value={formatINR(clearedEarnings)}
            sub={clearedEarnings}
          />
          <SummaryCard
            icon={<Clock size={18} className="text-amber-500" />}
            label="Pending Earnings"
            color="bg-amber-50"
            value={formatINR(pendingEarnings)}
            sub={pendingEarnings}
          />

        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
        {/* Search */}
        <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-emerald-400 focus-within:bg-white transition-colors">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
            placeholder="Search by Transaction ID, Order Ref, or Txn Ref"
          />
        </span>

        {/* Filters */}
        <span className="flex flex-wrap gap-3 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-emerald-400 cursor-pointer transition-colors"
          >
            <option value="all">All Status</option>
            <option value="cleared">Cleared</option>
            <option value="pending">Pending</option>
            <option value="reversed">Reversed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "asc" | "desc")}
            className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-emerald-400 cursor-pointer transition-colors"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
            <option value="amount_highest">Highest Amount</option>
          </select>

          {/* Date picker toggle */}
          {calendarOpen ? (
            <button
              onClick={() => setCalendarOpen(false)}
              className="flex items-center gap-2 text-sm border border-emerald-300 bg-emerald-50 text-emerald-600 rounded-xl px-3 py-2 font-medium transition-colors"
            >
              {date ? date.toDateString() : "Select Date"}
              <ChevronUp size={16} />
            </button>
          ) : (
            <button
              onClick={() => setCalendarOpen(true)}
              className="flex items-center gap-2 text-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
            >
              {date ? date.toDateString() : "Filter by Date"}
              <ChevronDown size={16} />
            </button>
          )}

          {/* {date && (
            <button
              onClick={clearDate}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
            >
              Clear date
            </button>
          )} */}
        </span>

        {/* Calendar dropdown */}
        {calendarOpen && (
          <div className="absolute right-4 top-full mt-2 z-20 shadow-lg rounded-xl overflow-hidden border border-gray-200">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => { setDate(d); setCalendarOpen(false); }}
              className="rounded-xl bg-white"
              captionLayout="dropdown"
            />
          </div>
        )}
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full table-auto min-w-[1000px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="p-4 w-10">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
              </th>
              {TABLE_HEADERS.map((h) => (
                <th key={h} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <TableRowSkeleton columns={TABLE_HEADERS.length + 1} rows={10} />
            ) : earnings?.length === 0 ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length + 1} className="py-16 text-center text-gray-400 text-sm">
                  <Wallet size={36} className="mx-auto mb-3 opacity-25" />
                  {earnings?.length === 0
                    ? "No earning records found for this vendor."
                    : "No records match your current filters."}
                </td>
              </tr>
            ) : (
              earnings && Array.isArray(earnings) && earnings.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                  </td>

                  {/* TRANSACTION ID */}
                  <td className="p-4">
                    <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                      TRX-{shortId(item.id)}
                    </span>
                  </td>

                  {/* ORDER REF */}
                  <td className="p-4">
                    <Link
                      href={`/vendor/orders/${item.order_id}`}
                      className="font-mono text-sm font-semibold text-emerald-600 hover:underline"
                    >
                      ORD-{shortId(item.order_id)}
                    </Link>
                  </td>

                  {/* TRANSACTION REF (from payments.transaction_ref) */}
                  <td className="p-4">
                    <span className="font-mono text-xs text-gray-500">
                      {item.transaction_ref === "N/A" ? (
                        <span className="text-gray-300 italic">N/A</span>
                      ) : (
                        item.transaction_ref
                      )}
                    </span>
                  </td>


                  <td className="p-4 text-sm text-gray-600">
                    ₹{formatINR(item.net_earning)}
                  </td>






                  {/* STATUS (derived from payments.payment_status) */}
                  <td className="p-4">
                    <StatusBadge status={item.status} />
                  </td>

                  {/* DATE (orders.created_at) */}
                  <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4">
                    <Link
                      href={`/vendor/orders/${item.order_id}`}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      View Order →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination count={currentPage} setCount={setCurrentPage} totalPages={totalPages} />
    </section>
  );
}