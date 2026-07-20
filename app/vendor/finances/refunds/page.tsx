"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import { useEffect, useState } from "react";
import { searchImgDark } from "@/constants/common";
import {
  ChevronDown,
  ChevronUp,
  Download,
  CornerDownLeft,
  AlertCircle,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TableRowSkeleton } from "@/components/common/skeletons";
import Link from "next/link";
import { fetchGetCompanyRefunds } from "@/utils/vendorApiClient";
import { authToken } from "@/utils/authToken";
import { redirect } from "next/navigation";
import { REFUNDS_TEXT } from "@/constants/vendorText";
const RefundsTableHeader = [
  REFUNDS_TEXT.TABLE.HEADERS.REFUND_ID,
  REFUNDS_TEXT.TABLE.HEADERS.ORDER_REF,
  REFUNDS_TEXT.TABLE.HEADERS.CUSTOMER,
  REFUNDS_TEXT.TABLE.HEADERS.PAYMENT_METHOD,
  REFUNDS_TEXT.TABLE.HEADERS.AMOUNT_FULFILLMENT,
  REFUNDS_TEXT.TABLE.HEADERS.REFUND_TYPE,
  REFUNDS_TEXT.TABLE.HEADERS.REASON,
  REFUNDS_TEXT.TABLE.HEADERS.DATE,
];
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";

// Mapped exactly to your backend response structure
interface RefundRecord {
  id: string;
  refund_amount: string;
  refund_reason: string;
  refund_status: string; // 'pending', 'processed', etc.
  scope: "item" | "order";
  created_at: string;
  order_id: string;
  order_items_id: string | null;
  payment_id: string;
  payment: {
    id: string;
    payment_method: string;
    payment_status: string;
    transaction_ref: string;
    amount: string;
  };
  order: {
    id: string;
    order_ref: string;
    customer: {
      id: string;
      first_name: string;
      last_name: string;
    };
  };
  orderItem: {
    cancelledRecord: {
      cancelled_by: string;
    };
    return_request: {
      reason: string;
      type: string;
      cancelled_by: string;
    };
  };
}

interface RefundDashboardData {
  total: number;
  totalPendingAmount: number;
  itemRefunds: RefundRecord[];
  orderRefunds: RefundRecord[];
  refunds: RefundRecord[];
}

export default function RefundsPage() {
  const companyId = getClientCompanyId();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [dashboardData, setDashboardData] =
    useState<RefundDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsOpen(false);
  };
  const token = authToken();
  const fetchRefunds = async () => {
    if (!token || !companyId) {
      redirect(VEDNOR_LOGIN_PATH);
    }
    setLoading(true);
    try {
      const response = await fetchGetCompanyRefunds(token, companyId);
      setDashboardData(response.data);
    } catch (err) {
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);
  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase(); // Handle backend lowercase status safely
    if (s === "PENDING")
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
          ● {REFUNDS_TEXT.FILTERS.PENDING}
        </span>
      );
    if (s === "PROCESSED")
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
          ● {REFUNDS_TEXT.FILTERS.PROCESSED}
        </span>
      );
    if (s === "REJECTED")
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
          ● {REFUNDS_TEXT.FILTERS.REJECTED}
        </span>
      );

    return (
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 py-1 px-3 rounded-full text-theme-caption font-semibold capitalize">
        ● {status}
      </span>
    );
  };

  const formatCurrency = (amount: string | number) => {
    return Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  };

  return (
    <main className="w-full px-1">
      {/* Header */}
      <header className="flex flex-wrap justify-between items-center my-6 gap-4">
        <div className="flex flex-wrap items-center gap-4 text-gray-700">
          <div className="flex items-center gap-2">
            <CornerDownLeft size={24} className="text-orange-500" />
            <h1 className="text-theme-h4 font-bold text-gray-800">
              {REFUNDS_TEXT.HEADER.TITLE}
            </h1>
          </div>
          {/* Displaying Summary Stats from Backend */}
          {dashboardData && (
            <div className="flex gap-2">
              <span className="bg-orange-100 text-orange-700 text-theme-caption font-semibold px-3 py-1.5 rounded-full">
                {dashboardData.total} {REFUNDS_TEXT.HEADER.TOTAL_REQUESTS}
              </span>
              <span className="bg-red-50 border border-red-100 text-red-600 text-theme-caption font-bold px-3 py-1.5 rounded-full">
                ₹{formatCurrency(dashboardData.totalPendingAmount)}{" "}
                {REFUNDS_TEXT.HEADER.PENDING} {REFUNDS_TEXT.HEADER.CLEARANCE}
              </span>
            </div>
          )}
        </div>
        {/* <button className="flex items-center gap-2 font-semibold text-theme-body-sm bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm">
             <Download size={16} />
             Export CSV
          </button> */}
      </header>

      {/* Filter Bar */}
      <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
        {/* Search */}
        <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-orange-400 focus-within:bg-white transition-colors">
          <img
            className="w-5 h-5 opacity-50 shrink-0"
            src={searchImgDark}
            alt="search icon"
          />
          <input
            type="text"
            className="text-theme-body-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
            placeholder={REFUNDS_TEXT.FILTERS.SEARCH_PLACEHOLDER}
          />
        </span>

        {/* Filters */}
        <span className="flex flex-wrap gap-3 items-center">
          <select
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-orange-400 cursor-pointer transition-colors"
            name="status"
          >
            <option value="all">{REFUNDS_TEXT.FILTERS.ALL_STATUS}</option>
            <option value="pending">{REFUNDS_TEXT.FILTERS.PENDING}</option>
            <option value="processed">{REFUNDS_TEXT.FILTERS.PROCESSED}</option>
            <option value="rejected">{REFUNDS_TEXT.FILTERS.REJECTED}</option>
          </select>

          <select
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-orange-400 cursor-pointer transition-colors"
            name="sort_by"
          >
            <option value="date_newest">
              {REFUNDS_TEXT.FILTERS.SORT_NEWEST}
            </option>
            <option value="date_oldest">
              {REFUNDS_TEXT.FILTERS.SORT_OLDEST}
            </option>
            <option value="amount_highest">
              {REFUNDS_TEXT.FILTERS.SORT_HIGHEST}
            </option>
          </select>

          {isOpen ? (
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-theme-body-sm border border-orange-300 bg-orange-50 text-orange-600 rounded-xl px-3 py-2 font-medium transition-colors"
            >
              {date ? date.toDateString() : REFUNDS_TEXT.FILTERS.SELECT_DATE}
              <ChevronUp size={16} />
            </button>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 text-theme-body-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
            >
              {date ? date.toDateString() : REFUNDS_TEXT.FILTERS.SELECT_DATE}
              <ChevronDown size={16} />
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
          )}
        </span>
      </div>

      {/* Data Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full table-auto min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
              </th>
              {RefundsTableHeader.map((header) => (
                <th
                  key={header}
                  className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <TableRowSkeleton columns={8} rows={5} />
            ) : !dashboardData || dashboardData.refunds.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-16 text-center text-gray-400 text-theme-body-sm"
                >
                  <CornerDownLeft
                    size={36}
                    className="mx-auto mb-3 opacity-30"
                  />
                  {REFUNDS_TEXT.TABLE.NO_DATA}
                </td>
              </tr>
            ) : (
              dashboardData.refunds.map((item) => {
                const isCancelled =
                  item.orderItem && item.orderItem.cancelledRecord !== null;
                const isReplacedAndReturnd =
                  item.orderItem && item.orderItem.return_request !== null;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                    </td>

                    {/* REFUND ID */}
                    <td className="p-4">
                      <span className="font-mono text-theme-body-sm font-semibold text-gray-800">
                        REF-{item.id.split("-")[0].toUpperCase()}
                      </span>
                    </td>

                    {/* ORDER REF - Using direct order_id from response */}
                    <td className="p-4">
                      <Link
                        href={`/vendor/orders/${item.order_id}`}
                        className="font-mono text-theme-body-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        ORD-{item.order_id.split("-")[0].toUpperCase()}
                      </Link>
                    </td>

                    {/* CUSTOMER */}
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-theme-caption font-semibold rounded-md uppercase ${item.scope === "order" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {item.order.customer &&
                          item.order.customer.first_name +
                            " " +
                            item.order.customer.last_name}
                      </span>
                    </td>
                    <td className="p-4 ">{item.payment.payment_method}</td>

                    {/* AMOUNT */}
                    <td className="p-4">
                      <span className="font-bold text-gray-900">
                        ₹{formatCurrency(item.refund_amount)}{" "}
                        <span className="text-theme-caption text-gray-500 ml-1">
                          ({item.payment.payment_status})
                        </span>
                      </span>
                    </td>

                    <td
                      className="p-4 text-theme-body-sm text-gray-600 max-w-[200px] truncate"
                      title={item.refund_reason}
                    >
                      {isCancelled
                        ? REFUNDS_TEXT.TABLE.ORDER_CANCELLED
                        : isReplacedAndReturnd
                          ? `${REFUNDS_TEXT.TABLE.ORDER_PREFIX}${item.orderItem.return_request.type}`
                          : REFUNDS_TEXT.TABLE.NA}
                    </td>
                    <td className="p-4 text-theme-body-sm text-gray-500 max-w-[200px] truncate">
                      {item.refund_reason}
                    </td>
                    {/* DATE */}
                    <td className="p-4 text-theme-body-sm text-gray-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
