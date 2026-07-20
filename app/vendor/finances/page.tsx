"use client";

import { useEffect, useReducer, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Wallet,
  IndianRupee,
  TrendingUp,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TableRowSkeleton } from "@/components/common/skeletons";
import Link from "next/link";
import AxiosAPI from "@/lib/axios";
import { Pagination } from "@/components/common/Pagination";
import { FINANCES_TEXT } from "@/constants/vendorText";
import { toast } from "sonner";
import { DataLoadErrorCard } from "@/components/vendor/DataLoadErrorCard";
import { authToken } from "@/utils/authToken";
import { getClientCompanyId } from "@/utils/getCompanyId";
import { getVendorEarnings } from "@/utils/vendorApiClient";

// ─── Types ───────────────────────────────────────────────────────────────────
// Mirrors the shape returned by FinancesService.getVendorFinancial()
interface EarningRecord {
  id: string; // payment.id or "calc-{order.id}"
  order_id: string; // orders.id
  net_earning: string; // gross - fee
  status: "PENDING" | "CLEARED" | "REVERSED";
  created_at: string | Date;
  transaction_ref: string; // payments.transaction_ref or "N/A"
}

// ─── Table header columns ─────────────────────────────────────────────────────
const TABLE_HEADERS = [
  FINANCES_TEXT.TABLE_HEADERS.TRANSACTION_ID,
  FINANCES_TEXT.TABLE_HEADERS.ORDER_REF,
  FINANCES_TEXT.TABLE_HEADERS.TRANSACTION_REF,
  FINANCES_TEXT.TABLE_HEADERS.NET_EARNING,
  FINANCES_TEXT.TABLE_HEADERS.STATUS,
  FINANCES_TEXT.TABLE_HEADERS.DATE,
  FINANCES_TEXT.TABLE_HEADERS.ACTIONS,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(amount: string | number) {
  return Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function shortId(uuid: string) {
  return uuid
    .replace(/^calc-/, "")
    .split("-")[0]
    .toUpperCase();
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  if (s === "CLEARED")
    return (
      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        {FINANCES_TEXT.CLEARED}
      </span>
    );

  if (s === "REVERSED")
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        {FINANCES_TEXT.REVERSED}
      </span>
    );

  // PENDING
  return (
    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
      {FINANCES_TEXT.PENDING}
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
    <div
      className={`flex items-center gap-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm px-5 py-4 min-w-[200px] flex-1 transition-all duration-300 hover:shadow-md hover:border-slate-300/80`}
    >
      <span
        className={`p-2.5 rounded-xl shadow-sm ring-1 ring-black/5 ${color}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-theme-caption text-gray-500 font-medium uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-theme-h5 font-bold text-gray-900 flex items-center gap-0.5">
          <IndianRupee size={16} className="text-gray-600" />
          {value}
        </p>
        {sub && (
          <p className="text-theme-caption text-gray-400 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ─── useReducer Action Types & State ─────────────────────────────────────────
enum FinancesActionType {
  SET_LOADING = "SET_LOADING",
  SET_ERROR = "SET_ERROR",
  SET_EARNINGS_DATA = "SET_EARNINGS_DATA",
  SET_SEARCH = "SET_SEARCH",
  SET_DEBOUNCED_SEARCH = "SET_DEBOUNCED_SEARCH",
  SET_STATUS_FILTER = "SET_STATUS_FILTER",
  SET_SORT_BY = "SET_SORT_BY",
  SET_DATE = "SET_DATE",
  SET_CALENDAR_OPEN = "SET_CALENDAR_OPEN",
  SET_CURRENT_PAGE = "SET_CURRENT_PAGE",
}

interface FinancesState {
  earnings: EarningRecord[] | null;
  loading: boolean;
  error: string | null;
  clearedEarnings: string;
  pendingEarnings: string;
  totalTransactions: number;
  search: string;
  debouncedSearch: string;
  statusFilter: string;
  sortBy: string;
  date: Date | undefined;
  calendarOpen: boolean;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

const initialState: FinancesState = {
  earnings: null,
  loading: true,
  error: null,
  clearedEarnings: "0.00",
  pendingEarnings: "0.00",
  totalTransactions: 0,
  search: "",
  debouncedSearch: "",
  statusFilter: "all",
  sortBy: "desc",
  date: undefined,
  calendarOpen: false,
  totalPages: 1,
  currentPage: 1,
  itemsPerPage: 10,
};

type FinancesAction =
  | { type: FinancesActionType.SET_LOADING; payload: boolean }
  | { type: FinancesActionType.SET_ERROR; payload: string | null }
  | {
      type: FinancesActionType.SET_EARNINGS_DATA;
      payload: {
        earnings: EarningRecord[] | null;
        clearedEarnings: string;
        pendingEarnings: string;
        totalTransactions: number;
        totalPages: number;
      };
    }
  | { type: FinancesActionType.SET_SEARCH; payload: string }
  | { type: FinancesActionType.SET_DEBOUNCED_SEARCH; payload: string }
  | { type: FinancesActionType.SET_STATUS_FILTER; payload: string }
  | { type: FinancesActionType.SET_SORT_BY; payload: string }
  | { type: FinancesActionType.SET_DATE; payload: Date | undefined }
  | { type: FinancesActionType.SET_CALENDAR_OPEN; payload: boolean }
  | { type: FinancesActionType.SET_CURRENT_PAGE; payload: number };

function financesReducer(
  state: FinancesState,
  action: FinancesAction,
): FinancesState {
  switch (action.type) {
    case FinancesActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case FinancesActionType.SET_ERROR:
      return { ...state, error: action.payload };
    case FinancesActionType.SET_EARNINGS_DATA:
      return {
        ...state,
        earnings: action.payload.earnings,
        clearedEarnings: action.payload.clearedEarnings,
        pendingEarnings: action.payload.pendingEarnings,
        totalTransactions: action.payload.totalTransactions,
        totalPages: action.payload.totalPages,
      };
    case FinancesActionType.SET_SEARCH:
      return { ...state, search: action.payload };
    case FinancesActionType.SET_DEBOUNCED_SEARCH:
      return { ...state, debouncedSearch: action.payload };
    case FinancesActionType.SET_STATUS_FILTER:
      return { ...state, statusFilter: action.payload };
    case FinancesActionType.SET_SORT_BY:
      return { ...state, sortBy: action.payload };
    case FinancesActionType.SET_DATE:
      return { ...state, date: action.payload };
    case FinancesActionType.SET_CALENDAR_OPEN:
      return { ...state, calendarOpen: action.payload };
    case FinancesActionType.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    default:
      return state;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EarningsPage() {
  const [state, dispatch] = useReducer(financesReducer, initialState);
  const {
    earnings,
    loading,
    error,
    clearedEarnings,
    pendingEarnings,
    totalTransactions,
    search,
    debouncedSearch,
    statusFilter,
    sortBy,
    date,
    calendarOpen,
    totalPages,
    currentPage,
    itemsPerPage,
  } = state;

  const offset = (currentPage - 1) * itemsPerPage;
  const token = authToken();
  const companyId = getClientCompanyId();
  if (!token || !companyId) {
    return (
      <div className="py-10">
        <DataLoadErrorCard
          title={FINANCES_TEXT.EMPTY_STATES.SESSION_EXPIRED_TITLE}
          description={FINANCES_TEXT.EMPTY_STATES.SESSION_EXPIRED_DESC}
          tryAgainText={FINANCES_TEXT.EMPTY_STATES.SESSION_EXPIRED_BTN}
          onTryAgain={() => window.location.reload()}
        />
      </div>
    );
  }

  // ── fetch ──
  const fetchEarnings = async (
    currentSearch: string,
    currentOffset: number,
    currentStatusFilter: string,
    currentDate: Date | undefined,
    currentSortBy: string,
    currentToken: string,
    companyId: string,
  ) => {
    dispatch({ type: FinancesActionType.SET_LOADING, payload: true });
    dispatch({ type: FinancesActionType.SET_ERROR, payload: null });
    try {
      const response = await getVendorEarnings(
        currentSearch,
        currentOffset,
        itemsPerPage,
        currentStatusFilter,
        currentDate?.toISOString() ?? "",
        currentSortBy,
        currentToken,
        companyId
      );

      const data = response?.data;
      const earningsList = data?.earnings ?? [];
      const cleared = data?.total_cleared_earnings ?? "0.00";
      const pending = data?.total_pending_earnings ?? "0.00";
      const total = data?.total_transactions ?? 0;
      const calculatedTotalPages = Math.ceil(total / itemsPerPage) || 1;

      dispatch({
        type: FinancesActionType.SET_EARNINGS_DATA,
        payload: {
          earnings: earningsList,
          clearedEarnings: cleared,
          pendingEarnings: pending,
          totalTransactions: total,
          totalPages: calculatedTotalPages,
        },
      });
    } catch (err: any) {
      dispatch({
        type: FinancesActionType.SET_ERROR,
        payload: FINANCES_TEXT.LOAD_ERROR,
      });
      dispatch({
        type: FinancesActionType.SET_EARNINGS_DATA,
        payload: {
          earnings: null,
          clearedEarnings: "0.00",
          pendingEarnings: "0.00",
          totalTransactions: 0,
          totalPages: 1,
        },
      });
    } finally {
      dispatch({ type: FinancesActionType.SET_LOADING, payload: false });
    }
  };

  useEffect(() => {
    if (token) {
      fetchEarnings(
        debouncedSearch,
        offset,
        statusFilter,
        date,
        sortBy,
        token,
        companyId,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, offset, statusFilter, date, sortBy, debouncedSearch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      dispatch({
        type: FinancesActionType.SET_DEBOUNCED_SEARCH,
        payload: search,
      });
      dispatch({ type: FinancesActionType.SET_CURRENT_PAGE, payload: 1 }); // Reset to first page on new search
    }, 500); // 500ms delay

    return () => clearTimeout(debounceTimer);
  }, [search]);

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
            <h1 className="text-theme-h4 font-bold text-gray-800 leading-tight">
              {FINANCES_TEXT.TITLE}
            </h1>
            <p className="text-theme-caption text-gray-400 mt-0.5">
              {FINANCES_TEXT.SUBTITLE}
            </p>
          </div>
          {!loading && earnings && (
            <span className="ml-1 bg-emerald-100 text-emerald-700 text-theme-caption font-bold px-2.5 py-1 rounded-full">
              {totalTransactions}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            if (!token) {
              toast.error(FINANCES_TEXT.EMPTY_STATES.EXPORT_NO_TOKEN);
              return;
            }
            fetchEarnings(
              debouncedSearch,
              offset,
              statusFilter,
              date,
              sortBy,
              token,
              companyId,
            );
          }}
          className="flex items-center gap-2 text-theme-body-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 rounded-xl px-4 py-2 transition-colors font-medium shadow-sm"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          {FINANCES_TEXT.REFRESH}
        </button>
      </header>

      {/* ── Summary cards ── */}
      {!loading && earnings && (
        <div className="flex flex-wrap gap-3 mb-5">
          <SummaryCard
            icon={<TrendingUp size={18} className="text-emerald-600" />}
            label={FINANCES_TEXT.CLEARED_EARNINGS}
            color="bg-emerald-50"
            value={formatINR(clearedEarnings)}
            sub={clearedEarnings}
          />

          <SummaryCard
            icon={<Clock size={18} className="text-amber-500" />}
            label={FINANCES_TEXT.PENDING_EARNINGS}
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
            onChange={(e) =>
              dispatch({
                type: FinancesActionType.SET_SEARCH,
                payload: e.target.value,
              })
            }
            className="text-theme-body-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
            placeholder={FINANCES_TEXT.SEARCH_PLACEHOLDER}
          />
        </span>

        {/* Filters */}
        <span className="flex flex-wrap gap-3 items-center">
          <select
            value={statusFilter}
            onChange={(e) =>
              dispatch({
                type: FinancesActionType.SET_STATUS_FILTER,
                payload: e.target.value,
              })
            }
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-emerald-400 cursor-pointer transition-colors"
          >
            <option value="all">{FINANCES_TEXT.ALL_STATUS}</option>
            <option value="cleared">{FINANCES_TEXT.CLEARED}</option>
            <option value="pending">{FINANCES_TEXT.PENDING}</option>
            <option value="reversed">{FINANCES_TEXT.REVERSED}</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              dispatch({
                type: FinancesActionType.SET_SORT_BY,
                payload: e.target.value,
              })
            }
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-emerald-400 cursor-pointer transition-colors"
          >
            <option value="desc">{FINANCES_TEXT.NEWEST_FIRST}</option>
            <option value="asc">{FINANCES_TEXT.OLDEST_FIRST}</option>
            <option value="amount_highest">
              {FINANCES_TEXT.HIGHEST_AMOUNT}
            </option>
          </select>

          {/* Date picker toggle */}
          {calendarOpen ? (
            <button
              onClick={() =>
                dispatch({
                  type: FinancesActionType.SET_CALENDAR_OPEN,
                  payload: false,
                })
              }
              className="flex items-center gap-2 text-theme-body-sm border border-emerald-300 bg-emerald-50 text-emerald-600 rounded-xl px-3 py-2 font-medium transition-colors"
            >
              {date ? date.toDateString() : FINANCES_TEXT.SELECT_DATE}
              <ChevronUp size={16} />
            </button>
          ) : (
            <button
              onClick={() =>
                dispatch({
                  type: FinancesActionType.SET_CALENDAR_OPEN,
                  payload: true,
                })
              }
              className="flex items-center gap-2 text-theme-body-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
            >
              {date ? date.toDateString() : FINANCES_TEXT.FILTER_DATE}
              <ChevronDown size={16} />
            </button>
          )}
        </span>

        {/* Calendar dropdown */}
        {calendarOpen && (
          <div className="absolute right-4 top-full mt-2 z-20 shadow-lg rounded-xl overflow-hidden border border-gray-200">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                dispatch({ type: FinancesActionType.SET_DATE, payload: d });
                dispatch({
                  type: FinancesActionType.SET_CALENDAR_OPEN,
                  payload: false,
                });
              }}
              className="rounded-xl bg-white"
              captionLayout="dropdown"
            />
          </div>
        )}
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-theme-body-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full table-auto min-w-[1000px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
              </th>
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h}
                  className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
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
                <td
                  colSpan={TABLE_HEADERS.length + 1}
                  className="py-16 text-center text-gray-400 text-theme-body-sm"
                >
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <div className="w-12 h-12 bg-white shadow-sm ring-1 ring-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Wallet size={24} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                      {search || statusFilter !== "all" || date
                        ? FINANCES_TEXT.EMPTY_STATES.NO_RECORDS_FILTER_TITLE
                        : FINANCES_TEXT.EMPTY_STATES.NO_TRANSACTIONS_TITLE}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {search || statusFilter !== "all" || date
                        ? FINANCES_TEXT.EMPTY_STATES.NO_RECORDS_FILTER_DESC
                        : FINANCES_TEXT.EMPTY_STATES.NO_TRANSACTIONS_DESC}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              earnings &&
              Array.isArray(earnings) &&
              earnings.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                  </td>

                  {/* TRANSACTION ID */}
                  <td className="p-4">
                    <span className="font-mono text-theme-caption font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                      TRX-{shortId(item.id)}
                    </span>
                  </td>

                  {/* ORDER REF */}
                  <td className="p-4">
                    <Link
                      href={`/vendor/orders/${item.order_id}`}
                      className="font-mono text-theme-body-sm font-semibold text-emerald-600 hover:underline"
                    >
                      ORD-{shortId(item.order_id)}
                    </Link>
                  </td>

                  {/* TRANSACTION REF (from payments.transaction_ref) */}
                  <td className="p-4">
                    <span className="font-mono text-theme-caption text-gray-500">
                      {item.transaction_ref === "N/A" ? (
                        <span className="text-gray-300 italic">N/A</span>
                      ) : (
                        item.transaction_ref
                      )}
                    </span>
                  </td>

                  <td className="p-4 text-theme-body-sm text-gray-600">
                    ₹{formatINR(item.net_earning)}
                  </td>

                  {/* STATUS (derived from payments.payment_status) */}
                  <td className="p-4">
                    <StatusBadge status={item.status} />
                  </td>

                  {/* DATE (orders.created_at) */}
                  <td className="p-4 text-theme-body-sm text-gray-500 whitespace-nowrap">
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
                      className="text-theme-caption font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {FINANCES_TEXT.VIEW_ORDER}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        count={currentPage}
        setCount={(page) =>
          dispatch({
            type: FinancesActionType.SET_CURRENT_PAGE,
            payload: typeof page === "function" ? page(currentPage) : page,
          })
        }
        totalPages={totalPages}
      />
    </section>
  );
}
