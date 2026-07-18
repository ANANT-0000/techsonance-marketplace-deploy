"use client";

import React, { useCallback, useEffect, useReducer, useState, useMemo } from "react";
import { useCmsSubscriptionPlans } from "@/hooks/useCmsSubscriptionPlans";
import {
  ShieldOff,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Building,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AxiosAPI from "@/lib/axios";
import { formatDateReadable } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single row from the feature_access_denials table joined with
 * feature_definitions and company.
 * Shape produced by the backend DenialsController.
 */
interface DenialRow {
  id: string;
  /** UUID of the company that was denied. */
  company_id: string;
  /** Display name of the company (joined). */
  company_name: string | null;
  /** The feature key that was blocked (e.g. "product_listings"). */
  feature_key: string;
  /** Usage at time of denial. */
  used: number;
  /** Plan limit at time of denial. */
  limit: number | null;
  /** Whether the denial was due to feature being disabled vs quota exceeded. */
  denial_reason: "quota_exceeded" | "feature_disabled" | "subscription_inactive";
  /** ISO timestamp of the denial event. */
  denied_at: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface PageState {
  rows: DenialRow[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filterFeature: string;
  filterReason: string;
  currentPage: number;
  meta: PaginationMeta;
}

const INITIAL_STATE: PageState = {
  rows: [],
  isLoading: false,
  error: null,
  searchQuery: "",
  filterFeature: "all",
  filterReason: "all",
  currentPage: 1,
  meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
};

enum ACTION {
  SET_LOADING = "SET_LOADING",
  SET_RESULT = "SET_RESULT",
  SET_ERROR = "SET_ERROR",
  SET_SEARCH = "SET_SEARCH",
  SET_FILTER_FEATURE = "SET_FILTER_FEATURE",
  SET_FILTER_REASON = "SET_FILTER_REASON",
  SET_PAGE = "SET_PAGE",
}

type PageAction =
  | { type: ACTION.SET_LOADING; payload: boolean }
  | { type: ACTION.SET_RESULT; payload: { rows: DenialRow[]; meta: PaginationMeta } }
  | { type: ACTION.SET_ERROR; payload: string }
  | { type: ACTION.SET_SEARCH; payload: string }
  | { type: ACTION.SET_FILTER_FEATURE; payload: string }
  | { type: ACTION.SET_FILTER_REASON; payload: string }
  | { type: ACTION.SET_PAGE; payload: number };

function reducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case ACTION.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTION.SET_RESULT:
      return {
        ...state,
        isLoading: false,
        error: null,
        rows: action.payload.rows,
        meta: action.payload.meta,
      };
    case ACTION.SET_ERROR:
      return { ...state, isLoading: false, error: action.payload };
    case ACTION.SET_SEARCH:
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case ACTION.SET_FILTER_FEATURE:
      return { ...state, filterFeature: action.payload, currentPage: 1 };
    case ACTION.SET_FILTER_REASON:
      return { ...state, filterReason: action.payload, currentPage: 1 };
    case ACTION.SET_PAGE:
      return { ...state, currentPage: action.payload };
    default:
      return state;
  }
}

// ─── Reason badge ─────────────────────────────────────────────────────────────

const REASON_META: Record<
  DenialRow["denial_reason"],
  { label: string; classes: string }
> = {
  quota_exceeded: {
    label: "Quota Exceeded",
    classes: "bg-red-50 text-red-700 border-red-200",
  },
  feature_disabled: {
    label: "Feature Disabled",
    classes: "bg-slate-50 text-slate-600 border-slate-200",
  },
  subscription_inactive: {
    label: "Subscription Inactive",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

function DenialReasonBadge({ reason }: { reason: DenialRow["denial_reason"] }) {
  const { label, classes } = REASON_META[reason] ?? {
    label: reason,
    classes: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${classes}`}
    >
      {label}
    </Badge>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

/**
 * AccessDenialsPage
 *
 * Admin read-only view of the feature_access_denials table.
 * Shows which vendors hit quota limits and when, allowing the admin to
 * proactively reach out or adjust plan limits.
 *
 * Route: /admin/subscriptions/denials
 */
export default function AccessDenialsPage() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const {
    rows,
    isLoading,
    error,
    searchQuery,
    filterFeature,
    filterReason,
    currentPage,
    meta,
  } = state;

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch from backend with server-side filter params
  const load = useCallback(async () => {
    dispatch({ type: ACTION.SET_LOADING, payload: true });
    try {
      const res = await AxiosAPI.get("/v1/admin/entitlements/denials", {
        params: {
          page: currentPage,
          limit: PAGE_SIZE,
          ...(debouncedSearchQuery.trim() ? { search: debouncedSearchQuery.trim() } : {}),
          ...(filterFeature !== "all" ? { feature_key: filterFeature } : {}),
          ...(filterReason !== "all" ? { reason: filterReason } : {}),
        },
        headers: {
          "x-suppress-toast": "true",
          "x-suppress-redirect": "true",
        },
      });

      const data = res.data?.data ?? [];
      const paginationMeta: PaginationMeta = res.data?.meta ?? {
        total: Array.isArray(data) ? data.length : 0,
        page: currentPage,
        limit: PAGE_SIZE,
        totalPages: 1,
      };

      dispatch({
        type: ACTION.SET_RESULT,
        payload: { rows: Array.isArray(data) ? data : [], meta: paginationMeta },
      });
    } catch (err: any) {
      dispatch({
        type: ACTION.SET_ERROR,
        payload: err?.response?.data?.message ?? "Failed to load access denials.",
      });
    }
  }, [currentPage, debouncedSearchQuery, filterFeature, filterReason]);

  useEffect(() => {
    load();
  }, [load]);

  // Derive unique feature keys from a dedicated unfiltered feature source
  const { plans } = useCmsSubscriptionPlans();
  const uniqueFeatureKeys = useMemo(() => {
    const planFeatures = plans.flatMap((p) => p.features.map((f) => f.feature_key));
    const rowFeatures = rows.map((r) => r.feature_key);
    return Array.from(new Set([...planFeatures, ...rowFeatures])).sort();
  }, [plans, rows]);

  return (
    <div className="flex-1 min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldOff className="h-6 w-6 text-red-500" />
              Access Denials
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time log of quota blocks and feature denials recorded by the
              entitlement system. Use this to identify vendors hitting plan limits.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search by company or feature..."
              value={searchQuery}
              onChange={(e) =>
                dispatch({ type: ACTION.SET_SEARCH, payload: e.target.value })
              }
              className="pl-8 h-8 text-xs rounded-xl border-slate-200"
            />
          </div>

          {/* Feature filter */}
          <Select
            value={filterFeature}
            onValueChange={(v) =>
              dispatch({ type: ACTION.SET_FILTER_FEATURE, payload: v })
            }
          >
            <SelectTrigger className="h-8 text-xs w-44 rounded-xl border-slate-200">
              <SelectValue placeholder="All features" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All features</SelectItem>
              {uniqueFeatureKeys.map((k) => (
                <SelectItem key={k} value={k} className="text-xs font-mono">
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reason filter */}
          <Select
            value={filterReason}
            onValueChange={(v) =>
              dispatch({ type: ACTION.SET_FILTER_REASON, payload: v })
            }
          >
            <SelectTrigger className="h-8 text-xs w-48 rounded-xl border-slate-200">
              <SelectValue placeholder="All reasons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All reasons</SelectItem>
              <SelectItem value="quota_exceeded" className="text-xs">Quota Exceeded</SelectItem>
              <SelectItem value="feature_disabled" className="text-xs">Feature Disabled</SelectItem>
              <SelectItem value="subscription_inactive" className="text-xs">Subscription Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Row count */}
          {meta.total > 0 && (
            <span className="text-xs text-slate-400 ml-auto">
              {meta.total.toLocaleString()} total events
            </span>
          )}
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {isLoading && rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              <p className="text-sm text-slate-400">Loading denial events…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <p className="text-sm text-red-500">{error}</p>
              <Button variant="outline" size="sm" onClick={load} className="text-xs">
                Retry
              </Button>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <ShieldOff className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No denial events</p>
              <p className="text-xs text-slate-400">
                {searchQuery || filterFeature !== "all" || filterReason !== "all"
                  ? "No results match your current filters."
                  : "All vendors are operating within their quota limits."}
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto min-w-[800px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wide">
                    <th className="p-4">Company</th>
                    <th className="p-4">Feature</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4 text-center">Used</th>
                    <th className="p-4 text-center">Limit</th>
                    <th className="p-4">Denied At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rows.map((row) => {
                    const pct =
                      row.limit && row.limit > 0
                        ? Math.round((row.used / row.limit) * 100)
                        : null;
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* Company */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Building className="h-3.5 w-3.5 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate">
                                {row.company_name ?? "—"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">
                                {row.company_id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Feature */}
                        <td className="p-4">
                          <span className="font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5">
                            {row.feature_key}
                          </span>
                        </td>

                        {/* Reason */}
                        <td className="p-4">
                          <DenialReasonBadge reason={row.denial_reason} />
                        </td>

                        {/* Used */}
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-red-600">{row.used.toLocaleString()}</span>
                            {pct !== null && (
                              <div className="w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-red-400"
                                  style={{ width: `${Math.min(100, pct)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Limit */}
                        <td className="p-4 text-center">
                          {row.limit === null ? (
                            <span className="text-emerald-600 font-semibold">∞</span>
                          ) : (
                            <span className="text-slate-500">{row.limit.toLocaleString()}</span>
                          )}
                        </td>

                        {/* Denied At */}
                        <td className="p-4 text-slate-400">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 shrink-0" />
                            {formatDateReadable(row.denied_at)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ─────────────────────────────────────────────────── */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <span className="text-xs text-slate-400">
                Page {meta.page} of {meta.totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="xs"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() =>
                    dispatch({ type: ACTION.SET_PAGE, payload: currentPage - 1 })
                  }
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={currentPage >= meta.totalPages || isLoading}
                  onClick={() =>
                    dispatch({ type: ACTION.SET_PAGE, payload: currentPage + 1 })
                  }
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
