"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchGetVendorReturnRequests } from "@/utils/vendorApiClient";
import { toast, Toaster } from "react-hot-toast";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import { searchImgDark } from "@/constants/common";
import { ChevronDown, ChevronUp, Download, RotateCcw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { authToken } from "@/utils/authToken";
import { redirect } from "next/navigation";
import { UiText } from "@/constants/ui-text";
import { ReturnStatus, ReturnType } from "@/utils/Types";

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
  orderItem: ReturnOrderItem;
  order_item_id: string;
  reason: string;
  status: string;
  store_owner_note: string | null;
  tracking_id: string | null;
  type: string;
  updated_at: string;
  user: ReturnUser;
  user_id: string;
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
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsOpen(false);
  };

  const token = authToken();
  useEffect(() => {
    if (!token) {
      redirect("/auth/vendorLogin");
    }
    const fetchReturns = async () => {
      try {
        setLoading(true);
        const res = await fetchGetVendorReturnRequests(token);
        setReturns(res.data);
      } catch (error) {
        toast.error(UiText.BACK_ORDERS.LOAD_ERROR);
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, [token]);

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === ReturnStatus.PENDING)
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
          ● {UiText.BACK_ORDERS.STATUS_LABELS.PENDING}
        </span>
      );
    if (s === ReturnStatus.APPROVED)
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
          ● {UiText.BACK_ORDERS.STATUS_LABELS.APPROVED}
        </span>
      );
    if (s === ReturnStatus.REJECTED)
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
          ● {UiText.BACK_ORDERS.STATUS_LABELS.REJECTED}
        </span>
      );
    if (s === ReturnStatus.QC_FAILED)
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
          ● {status}
        </span>
      );
    if (s === "processing")
      return (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
          ● {UiText.BACK_ORDERS.STATUS_LABELS.PROCESSING}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 py-1 px-3 rounded-full text-theme-caption font-semibold capitalize">
        ● {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const t = type?.toLowerCase();
    if (t === ReturnType.REPLACEMENT)
      return (
        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 py-1 px-3 rounded-full text-theme-caption font-semibold capitalize">
          ↺ {UiText.BACK_ORDERS.TYPE_LABELS.REPLACEMENT}
        </span>
      );
    if (t === ReturnType.RETURN)
      return (
        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 py-1 px-3 rounded-full text-theme-caption font-semibold capitalize">
          ← {UiText.BACK_ORDERS.TYPE_LABELS.RETURN}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 py-1 px-3 rounded-full text-theme-caption font-semibold capitalize">
        {type}
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

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <LoaderSpinner />
      </div>
    );

  return (
    <main className="w-full px-1 min-h-screen max-h-screen overflow-y-scroll">
      {/* Header */}
      <header className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 text-gray-700">
          <RotateCcw size={22} className="text-blue-500" />
          <h1 className="text-theme-h4 font-bold text-gray-800">
            {UiText.BACK_ORDERS.TITLE}
          </h1>
          {returns.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-700 text-theme-caption font-semibold px-2.5 py-1 rounded-full">
              {returns.length}
            </span>
          )}
        </div>
        {/* <button className="flex items-center gap-2 font-semibold text-theme-body-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                    <Download size={16} />
                    Export CSV
                </button> */}
      </header>

      {/* Filter Bar */}
      <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
        {/* Search */}
        {/* <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
                    <img className="w-5 h-5 opacity-50 shrink-0" src={searchImgDark} alt="search icon" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="text-theme-body-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
                        placeholder="Search by name, email or reason"
                    />
                </span> */}

        {/* Filters */}
        <span className="flex flex-wrap gap-3 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
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
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
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
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 text-theme-body-sm border border-blue-300 bg-blue-50 text-blue-600 rounded-xl px-3 py-2 font-medium transition-colors"
                        >
                            {date ? date.toDateString() : 'Select Date'}
                            <ChevronUp size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="flex items-center gap-2 text-theme-body-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
                        >
                            {date ? date.toDateString() : 'Select Date'}
                            <ChevronDown size={16} />
                        </button>
                    )}

                    {date && (
                        <button
                            onClick={() => setDate(undefined)}
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
        </span>
      </div>

      {/* Table */}
      <div className="w-full rounded-xl border border-gray-200 shadow-sm bg-white flex flex-col min-w-0">
        <div className="overflow-x-auto w-full rounded-xl">
          <table className="w-full min-w-[900px] table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="p-4 w-10">
                  <input type="checkbox" className="rounded" />
                </th>
                {ReturnTableHeader.map((header) => (
                  <th
                    key={header}
                    className="p-4 text-theme-caption Rent-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-16 text-center text-gray-400 text-theme-body-sm whitespace-nowrap"
                  >
                    <RotateCcw size={36} className="mx-auto mb-3 opacity-30" />
                    {UiText.BACK_ORDERS.NO_ORDERS}
                  </td>
                </tr>
              ) : (
                filteredReturns.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50 transition-colors group whitespace-nowrap"
                  >
                    <td className="p-4">
                      <input type="checkbox" className="rounded" />
                    </td>

                    {/* REQUEST ID */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-mono text-theme-body-sm font-semibold text-gray-800">
                        #{req.id.split("-")[0].toUpperCase()}
                      </span>
                    </td>

                    {/* TYPE */}
                    <td className="p-4 whitespace-nowrap">
                      {getTypeBadge(req.type)}
                    </td>
                    {/* PRODUCT */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-theme-caption text-gray-700 max-w-[200px] line-clamp-2 leading-snug">
                        {req.orderItem?.variant?.variant_name ||
                          UiText.BACK_ORDERS.NA}
                      </div>
                      {req.orderItem?.variant?.sku && (
                        <div className="text-theme-caption text-gray-400 mt-0.5 font-mono">
                          {UiText.BACK_ORDERS.SKU_PREFIX}
                          {req.orderItem.variant.sku}
                        </div>
                      )}
                    </td>

                    {/* PRICE */}
                    <td className="p-4">
                      <span className="font-semibold text-gray-800 whitespace-nowrap">
                        ₹{Number(req.orderItem?.price).toLocaleString()}
                      </span>
                      <div className="text-theme-caption text-gray-400">
                        {UiText.BACK_ORDERS.QTY_PREFIX}
                        {req.orderItem?.quantity ?? 1}
                      </div>
                    </td>

                    {/* REASON */}
                    <td className="p-4 text-theme-body-sm text-gray-600 max-w-[160px] whitespace-nowrap">
                      <span className="line-clamp-2">
                        {req.reason || UiText.BACK_ORDERS.NA}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="p-4  whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>

                    {/* LOCATION */}
                    <td className="p-4 text-theme-body-sm text-gray-500 whitespace-nowrap">
                      {[
                        req.orderItem?.order?.address?.state,
                        req.orderItem?.order?.address?.country,
                        req.orderItem?.order?.address?.postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ") || UiText.BACK_ORDERS.NA}
                    </td>

                    {/* DATE */}
                    <td className="p-4 text-theme-body-sm text-gray-500 whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString("en-GB")}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4">
                      <Link
                        href={`backOrders/${req.id}`}
                        className="text-theme-caption font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
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
      <Toaster />
    </main>
  );
}
