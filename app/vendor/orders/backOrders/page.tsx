"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import React, { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { fetchGetVendorReturnRequests } from "@/utils/vendorApiClient";
import { toast, Toaster } from "react-hot-toast";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import { RotateCcw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { authToken } from "@/utils/authToken";
import { redirect } from "next/navigation";
import { UiText } from "@/constants/ui-text";
import { ReturnStatus, ReturnType } from "@/utils/Types";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";
import { SessionErrorCard } from "@/components/vendor/SessionErrorCard";
import { DataLoadErrorCard } from "@/components/vendor/DataLoadErrorCard";

interface ReturnVariant {
  images: any[];
  price: string;
  sku: string;
  variant_name: string;
}

interface ReturnOrderAddress {
  country: string;
  id: string;
  postal_code: string;
  state: string;
}

interface ReturnOrder {
  address: ReturnOrderAddress;
  id: string;
}

interface ReturnOrderItem {
  company_id: string;
  created_at: string;
  id: string;
  order: ReturnOrder;
  order_id: string;
  order_status: string;
  price: string;
  product_variant_id: string;
  quantity: number;
  updated_at: string;
  variant: ReturnVariant;
}

interface ReturnUser {
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  phone_number: string | null;
}

interface EvidenceImage {
  url: string;
}

interface ReturnRequest {
  company_id: string;
  created_at: string;
  customer_note: string;
  evidence_images: EvidenceImage[];
  id: string;
  // orderItem: ReturnOrderItem;
  order_item_id: string;
  reason: string;
  status: string;

  type: string;

  orderItem?: {
    quantity?: number;
    price?: string;
    variant?: ReturnVariant;
    order?: {
      address?: {
        city?: string;
        state?: string;
        country?: string;
        postal_code?: string;
      };
    };
  };
  user?: ReturnUser;
}

export enum BackOrdersActionType {
  SET_RETURNS = "SET_RETURNS",
  SET_LOADING = "SET_LOADING",
  SET_ERROR = "SET_ERROR",
  SET_DATE = "SET_DATE",
  SET_IS_OPEN = "SET_IS_OPEN",
  SET_SEARCH_QUERY = "SET_SEARCH_QUERY",
  SET_STATUS_FILTER = "SET_STATUS_FILTER",
  SET_TYPE_FILTER = "SET_TYPE_FILTER",
  SET_SESSION_ERROR = "SET_SESSION_ERROR",
  SET_DATE_AND_CLOSE = "SET_DATE_AND_CLOSE",
}

interface ReducerState {
  returns: ReturnRequest[];
  loading: boolean;
  error: string | null;
  date: Date | undefined;
  isOpen: boolean;
  searchQuery: string;
  statusFilter: string;
  typeFilter: string;
  sessionError: boolean;
}

const initialState: ReducerState = {
  returns: [],
  loading: true,
  error: null,
  date: undefined,
  isOpen: false,
  searchQuery: "",
  statusFilter: "all",
  typeFilter: "all",
  sessionError: false,
};

type Action =
  | { type: BackOrdersActionType.SET_RETURNS; payload: ReturnRequest[] }
  | { type: BackOrdersActionType.SET_LOADING; payload: boolean }
  | { type: BackOrdersActionType.SET_ERROR; payload: string | null }
  | { type: BackOrdersActionType.SET_DATE; payload: Date | undefined }
  | { type: BackOrdersActionType.SET_IS_OPEN; payload: boolean }
  | { type: BackOrdersActionType.SET_SEARCH_QUERY; payload: string }
  | { type: BackOrdersActionType.SET_STATUS_FILTER; payload: string }
  | { type: BackOrdersActionType.SET_TYPE_FILTER; payload: string }
  | { type: BackOrdersActionType.SET_SESSION_ERROR; payload: boolean }
  | {
      type: BackOrdersActionType.SET_DATE_AND_CLOSE;
      payload: Date | undefined;
    };

function reducer(state: ReducerState, action: Action): ReducerState {
  switch (action.type) {
    case BackOrdersActionType.SET_RETURNS:
      return { ...state, returns: action.payload };
    case BackOrdersActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case BackOrdersActionType.SET_ERROR:
      return { ...state, error: action.payload };
    case BackOrdersActionType.SET_DATE:
      return { ...state, date: action.payload };
    case BackOrdersActionType.SET_IS_OPEN:
      return { ...state, isOpen: action.payload };
    case BackOrdersActionType.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    case BackOrdersActionType.SET_STATUS_FILTER:
      return { ...state, statusFilter: action.payload };
    case BackOrdersActionType.SET_TYPE_FILTER:
      return { ...state, typeFilter: action.payload };
    case BackOrdersActionType.SET_SESSION_ERROR:
      return { ...state, sessionError: action.payload };
    case BackOrdersActionType.SET_DATE_AND_CLOSE:
      return { ...state, date: action.payload, isOpen: false };
    default:
      return state;
  }
}

export const ReturnTableHeader = [
  UiText.BACK_ORDERS.TABLE_HEADERS.REQUEST_ID,
  UiText.BACK_ORDERS.TABLE_HEADERS.TYPE,
  UiText.BACK_ORDERS.TABLE_HEADERS.PRODUCT,
  UiText.BACK_ORDERS.TABLE_HEADERS.PRICE,
  UiText.BACK_ORDERS.TABLE_HEADERS.REASON,
  UiText.BACK_ORDERS.TABLE_HEADERS.STATUS,
  UiText.BACK_ORDERS.TABLE_HEADERS.LOCATION,
  UiText.BACK_ORDERS.TABLE_HEADERS.DATE,
  UiText.BACK_ORDERS.TABLE_HEADERS.ACTIONS,
];

export default function BackOrdersListPage() {
  const companyId = getClientCompanyId();
  const token = authToken();

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    returns,
    loading,
    error,
    date,
    isOpen,
    searchQuery,
    statusFilter,
    typeFilter,
    sessionError,
  } = state;

  const handleDateChange = (selectedDate: Date | undefined) => {
    dispatch({
      type: BackOrdersActionType.SET_DATE_AND_CLOSE,
      payload: selectedDate,
    });
  };

  useEffect(() => {
    if (!token || !companyId) {
      dispatch({ type: BackOrdersActionType.SET_SESSION_ERROR, payload: true });
      return;
    }
    const fetchReturns = async () => {
      try {
        dispatch({ type: BackOrdersActionType.SET_LOADING, payload: true });
        dispatch({ type: BackOrdersActionType.SET_ERROR, payload: null });
        const res = await fetchGetVendorReturnRequests(token, companyId);
        dispatch({ type: BackOrdersActionType.SET_RETURNS, payload: res.data });
      } catch (err: any) {
        dispatch({
          type: BackOrdersActionType.SET_ERROR,
          payload:
            err?.response?.data?.message || UiText.BACK_ORDERS.LOAD_ERROR,
        });
        toast.error(UiText.BACK_ORDERS.LOAD_ERROR);
      } finally {
        dispatch({ type: BackOrdersActionType.SET_LOADING, payload: false });
      }
    };
    fetchReturns();
  }, [token, companyId]);

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === ReturnStatus.PENDING)
      return (
        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/60 py-1 px-3 rounded-full text-[12px] font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>{" "}
          {UiText.BACK_ORDERS.STATUS_LABELS.PENDING}
        </span>
      );
    if (s === ReturnStatus.APPROVED)
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 py-1 px-3 rounded-full text-[12px] font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>{" "}
          {UiText.BACK_ORDERS.STATUS_LABELS.APPROVED}
        </span>
      );
    if (s === ReturnStatus.REJECTED)
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200/60 py-1 px-3 rounded-full text-[12px] font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>{" "}
          {UiText.BACK_ORDERS.STATUS_LABELS.REJECTED}
        </span>
      );
    if (s === "processing")
      return (
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/60 py-1 px-3 rounded-full text-[12px] font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>{" "}
          {UiText.BACK_ORDERS.STATUS_LABELS.PROCESSING}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 py-1 px-3 rounded-full text-[12px] font-semibold capitalize tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const t = type?.toLowerCase();
    if (t === ReturnType.REPLACEMENT)
      return (
        <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200/60 py-1 px-3 rounded-full text-[12px] font-semibold capitalize tracking-wide">
          ↺ {UiText.BACK_ORDERS.TYPE_LABELS.REPLACEMENT}
        </span>
      );
    if (t === ReturnType.RETURN)
      return (
        <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200/60 py-1 px-3 rounded-full text-[12px] font-semibold capitalize tracking-wide">
          ← {UiText.BACK_ORDERS.TYPE_LABELS.RETURN}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 py-1 px-3 rounded-full text-[12px] font-semibold capitalize tracking-wide">
        ? {type}
      </span>
    );
  };

  const filteredReturns =
    returns &&
    returns.filter((req) => {
      const fullName =
        `${req.user?.first_name ?? ""} ${req.user?.last_name ?? ""}`.toLowerCase();
      const email = req.user?.email?.toLowerCase() ?? "";
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        email.includes(query) ||
        req.reason?.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" || req.status?.toLowerCase() === statusFilter;
      const matchesType =
        typeFilter === "all" || req.type?.toLowerCase() === typeFilter;
      const matchesDate =
        !date ||
        new Date(req.created_at).toDateString() === date.toDateString();
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });

  if (sessionError || !token || !companyId) {
    return <SessionErrorCard />;
  }

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <LoaderSpinner />
      </div>
    );

  return (
    <main className="w-full px-2 min-h-screen max-h-screen overflow-y-scroll pb-12">
      <header className="flex justify-between items-center mt-8 mb-6">
        <div className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-500 border border-indigo-100/50">
            <RotateCcw size={24} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {UiText.BACK_ORDERS.TITLE}
          </h1>
          {returns.length > 0 && (
            <span className="ml-1 bg-indigo-50 text-indigo-700 text-[13px] font-semibold px-3 py-1 rounded-full border border-indigo-100">
              {returns.length}
            </span>
          )}
        </div>
      </header>

      <div className="relative flex flex-wrap justify-between rounded-2xl items-center py-3 px-5 gap-3 bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-6">
        {/* Search */}
        {/* <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
                    <img className="w-5 h-5 opacity-50 shrink-0" src={searchImgDark} alt="search icon" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => dispatch({ type: BackOrdersActionType.SET_SEARCH_QUERY, payload: e.target.value })}
                        className="text-theme-body-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
                        placeholder="Search by name, email or reason"
                    />
                </span> */}

        <span className="flex flex-wrap gap-3 items-center">
          <select
            value={statusFilter}
            onChange={(e) =>
              dispatch({
                type: BackOrdersActionType.SET_STATUS_FILTER,
                payload: e.target.value,
              })
            }
            className="text-[14px] border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer transition-all hover:border-slate-300 font-medium"
          >
            <option value="all">{UiText.BACK_ORDERS.ALL_STATUS}</option>
            <option value="pending">
              {UiText.BACK_ORDERS.STATUS_LABELS.PENDING}
            </option>
            <option value="approved">
              {UiText.BACK_ORDERS.STATUS_LABELS.APPROVED}
            </option>
            <option value="rejected">
              {UiText.BACK_ORDERS.STATUS_LABELS.REJECTED}
            </option>
            <option value="processing">
              {UiText.BACK_ORDERS.STATUS_LABELS.PROCESSING}
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) =>
              dispatch({
                type: BackOrdersActionType.SET_TYPE_FILTER,
                payload: e.target.value,
              })
            }
            className="text-[14px] border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer transition-all hover:border-slate-300 font-medium"
          >
            <option value="all">{UiText.BACK_ORDERS.ALL_TYPES}</option>
            <option value="return">
              {UiText.BACK_ORDERS.TYPE_LABELS.RETURN}
            </option>
            <option value="replacement">
              {UiText.BACK_ORDERS.TYPE_LABELS.REPLACEMENT}
            </option>
          </select>
          {/* {isOpen ? (
                        <button
                            onClick={() => dispatch({ type: BackOrdersActionType.SET_IS_OPEN, payload: false })}
                            className="flex items-center gap-2 text-theme-body-sm border border-blue-300 bg-blue-50 text-blue-600 rounded-xl px-3 py-2 font-medium transition-colors"
                        >
                            {date ? date.toDateString() : 'Select Date'}
                            <ChevronUp size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => dispatch({ type: BackOrdersActionType.SET_IS_OPEN, payload: true })}
                            className="flex items-center gap-2 text-theme-body-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
                        >
                            {date ? date.toDateString() : 'Select Date'}
                            <ChevronDown size={16} />
                        </button>
                    )}

                    {date && (
                        <button
                            onClick={() => dispatch({ type: BackOrdersActionType.SET_DATE_AND_CLOSE, payload: undefined })}
                            className="text-theme-caption text-gray-400 hover:text-red-500 transition-colors"
                        >
                            Clear
                        </button>
                    )}

                    {isOpen && (
                        <div className="absolute right-4 top-full mt-2 z-20 shadow-lg rounded-xl overflow-hidden border border-gray-200">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                className="rounded-xl bg-white"
                                captionLayout="dropdown"
                            />
                        </div>
                    )} */}

          {/* DatePicker is commented out, removed broken fragments here */}
        </span>
      </div>

      {/* Error / Table */}
      {error ? (
        <DataLoadErrorCard
          title={error}
          description={UiText.BACK_ORDERS.ERROR_DESC}
          onTryAgain={() => window.location.reload()}
          tryAgainText={UiText.BACK_ORDERS.TRY_AGAIN}
        />
      ) : (
        <div className="w-full rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white flex flex-col min-w-0 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[900px] table-auto border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-left">
                  <th className="p-5 w-12">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  {ReturnTableHeader.map((header) => (
                    <th
                      key={header}
                      className="p-5 text-[12px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="p-16 text-center bg-slate-50/50 rounded-b-3xl border-t border-slate-100"
                    >
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mb-6">
                          <RotateCcw size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3 whitespace-normal">
                          {UiText.BACK_ORDERS.NO_ORDERS}
                        </h3>
                        <p className="text-[15px] text-slate-500 leading-relaxed whitespace-normal">
                          {UiText.BACK_ORDERS.NO_ORDERS_DESC}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/80 transition-colors group whitespace-nowrap"
                    >
                      <td className="p-5">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* REQUEST ID */}
                      <td className="p-5 whitespace-nowrap">
                        <span className="font-mono text-[14px] font-semibold text-slate-800 bg-slate-100/70 px-2 py-0.5 rounded-md">
                          #{req.id.split("-")[0].toUpperCase()}
                        </span>
                      </td>

                      {/* TYPE */}
                      <td className="p-5 whitespace-nowrap">
                        {getTypeBadge(req.type)}
                      </td>

                      {/* PRODUCT */}
                      <td className="p-5 whitespace-nowrap">
                        <div className="text-[14px] font-medium text-slate-800 max-w-[200px] line-clamp-2 leading-snug">
                          {req.orderItem?.variant?.variant_name ||
                            UiText.BACK_ORDERS.NA}
                        </div>
                        {req.orderItem?.variant?.sku && (
                          <div className="text-[12px] text-slate-400 mt-1 font-mono">
                            {UiText.BACK_ORDERS.SKU_PREFIX}
                            {req.orderItem.variant.sku}
                          </div>
                        )}
                      </td>

                      {/* PRICE */}
                      <td className="p-5">
                        <div className="font-semibold text-slate-800 whitespace-nowrap text-[15px]">
                          ₹{Number(req.orderItem?.price).toLocaleString()}
                        </div>
                        <div className="text-[13px] text-slate-500 mt-0.5">
                          {UiText.BACK_ORDERS.QTY_PREFIX}
                          <span className="font-medium text-slate-700">
                            {req.orderItem?.quantity ?? 1}
                          </span>
                        </div>
                      </td>

                      {/* REASON */}
                      <td className="p-5 text-[14px] text-slate-600 max-w-[160px] whitespace-nowrap">
                        <span className="line-clamp-2">
                          {req.reason || UiText.BACK_ORDERS.NA}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="p-5 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>

                      {/* LOCATION */}
                      <td className="p-5 text-[14px] text-slate-500 whitespace-nowrap">
                        {[
                          req.orderItem?.order?.address?.state,
                          req.orderItem?.order?.address?.country,
                          req.orderItem?.order?.address?.postal_code,
                        ]
                          .filter(Boolean)
                          .join(", ") || UiText.BACK_ORDERS.NA}
                      </td>

                      {/* DATE */}
                      <td className="p-5 text-[14px] text-slate-500 whitespace-nowrap">
                        {new Date(req.created_at).toLocaleDateString("en-GB")}
                      </td>

                      {/* ACTIONS */}
                      <td className="p-5">
                        <Link
                          href={`backOrders/${req.id}`}
                          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all whitespace-nowrap"
                        >
                          {UiText.BACK_ORDERS.REVIEW}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Toaster />
    </main>
  );
}
