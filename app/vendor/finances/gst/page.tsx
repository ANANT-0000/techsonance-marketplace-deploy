"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import React, { useEffect, useReducer } from "react";
import { searchImgDark } from "@/constants/common";
import {
  ReceiptText,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TableRowSkeleton } from "@/components/common/skeletons";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authToken } from "@/utils/authToken";
import { fetchGstRecords } from "@/utils/vendorApiClient";
import { Pagination } from "@/components/common/Pagination";
import { GST_TEXT } from "@/constants/vendorText";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";

interface GstRecordType {
  id: string;
  gst_number: string;
  legal_name: string;
  trade_name: string;
  state_code: string;
  registration_type: string;
  effective_from: string;
  is_default: boolean;
  created_at: string;
}

export const gstTableHeader = [
  GST_TEXT.TABLE_HEADERS.GSTIN,
  GST_TEXT.TABLE_HEADERS.LEGAL_NAME,
  GST_TEXT.TABLE_HEADERS.STATE_CODE,
  GST_TEXT.TABLE_HEADERS.TYPE,
  GST_TEXT.TABLE_HEADERS.STATUS,
  GST_TEXT.TABLE_HEADERS.EFFECTIVE_DATE,
  GST_TEXT.TABLE_HEADERS.ACTIONS,
];

export enum GstActionType {
  SET_DATE = "SET_DATE",
  SET_IS_OPEN = "SET_IS_OPEN",
  SET_STATUS_FILTER = "SET_STATUS_FILTER",
  SET_SORT_BY = "SET_SORT_BY",
  SET_GST_RECORDS = "SET_GST_RECORDS",
  SET_TOTAL_PAGES = "SET_TOTAL_PAGES",
  SET_CURRENT_PAGE = "SET_CURRENT_PAGE",
  SET_LOADING = "SET_LOADING",
  SET_SEARCH = "SET_SEARCH",
  SET_DEBOUNCED_SEARCH = "SET_DEBOUNCED_SEARCH",
}

interface GstState {
  date: Date | undefined;
  isOpen: boolean;
  statusFilter: string;
  sortBy: string;
  gstRecords: GstRecordType[];
  totalPages: number;
  itemsPerPage: number;
  currentPage: number;
  loading: boolean;
  search: string;
  debouncedSearch: string;
}

type GstAction =
  | { type: GstActionType.SET_DATE; payload: Date | undefined }
  | { type: GstActionType.SET_IS_OPEN; payload: boolean }
  | { type: GstActionType.SET_STATUS_FILTER; payload: string }
  | { type: GstActionType.SET_SORT_BY; payload: string }
  | { type: GstActionType.SET_GST_RECORDS; payload: GstRecordType[] }
  | { type: GstActionType.SET_TOTAL_PAGES; payload: number }
  | { type: GstActionType.SET_CURRENT_PAGE; payload: number }
  | { type: GstActionType.SET_LOADING; payload: boolean }
  | { type: GstActionType.SET_SEARCH; payload: string }
  | { type: GstActionType.SET_DEBOUNCED_SEARCH; payload: string };

const initialGstState: GstState = {
  date: new Date(),
  isOpen: false,
  statusFilter: "",
  sortBy: "desc",
  gstRecords: [],
  totalPages: 1,
  itemsPerPage: 10,
  currentPage: 1,
  loading: true,
  search: "",
  debouncedSearch: "",
};

function gstReducer(state: GstState, action: GstAction): GstState {
  switch (action.type) {
    case GstActionType.SET_DATE:
      return { ...state, date: action.payload };
    case GstActionType.SET_IS_OPEN:
      return { ...state, isOpen: action.payload };
    case GstActionType.SET_STATUS_FILTER:
      return { ...state, statusFilter: action.payload };
    case GstActionType.SET_SORT_BY:
      return { ...state, sortBy: action.payload };
    case GstActionType.SET_GST_RECORDS:
      return { ...state, gstRecords: action.payload };
    case GstActionType.SET_TOTAL_PAGES:
      return { ...state, totalPages: action.payload };
    case GstActionType.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    case GstActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case GstActionType.SET_SEARCH:
      return { ...state, search: action.payload };
    case GstActionType.SET_DEBOUNCED_SEARCH:
      return { ...state, debouncedSearch: action.payload };
    default:
      return state;
  }
}

export default function GstListingPage() {
  const companyId = getClientCompanyId();

  const [state, dispatch] = useReducer(gstReducer, initialGstState);
  const {
    date,
    isOpen,
    statusFilter,
    sortBy,
    gstRecords,
    totalPages,
    itemsPerPage,
    currentPage,
    loading,
    search,
    debouncedSearch,
  } = state;

  const offset = (currentPage - 1) * itemsPerPage;

  const handleDateChange = (selectedDate: Date | undefined) => {
    dispatch({ type: GstActionType.SET_DATE, payload: selectedDate });
    dispatch({ type: GstActionType.SET_IS_OPEN, payload: false });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: GstActionType.SET_SEARCH, payload: e.target.value });
  };

  const token = authToken();

  // Debounce effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      dispatch({ type: GstActionType.SET_DEBOUNCED_SEARCH, payload: search });
      dispatch({ type: GstActionType.SET_CURRENT_PAGE, payload: 1 });
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [search]);

  useEffect(() => {
    if (!token) {
      redirect(VEDNOR_LOGIN_PATH);
    }

    const getGstRecords = async () => {
      if (!companyId) return;
      dispatch({ type: GstActionType.SET_LOADING, payload: true });
      try {
        const res = await fetchGstRecords(
          offset,
          itemsPerPage,
          debouncedSearch,
          statusFilter,
          sortBy,
          token!,
          companyId,
        );
        dispatch({
          type: GstActionType.SET_GST_RECORDS,
          payload: res.data?.data || [],
        });
        if (res.data) {
          dispatch({
            type: GstActionType.SET_TOTAL_PAGES,
            payload: Math.ceil(res.data.totalCount / itemsPerPage) || 1,
          });
        }
      } catch (err) {
      } finally {
        dispatch({ type: GstActionType.SET_LOADING, payload: false });
      }
    };
    getGstRecords();
  }, [statusFilter, sortBy, token, debouncedSearch, offset, itemsPerPage]);

  return (
    <main className="w-full px-1">
      {/* Header */}
      <header className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 text-gray-700">
          <ReceiptText size={22} className="text-emerald-500" />
          <h1 className="text-theme-h4 font-bold text-gray-800">
            {GST_TEXT.TITLE}
          </h1>
          {gstRecords && gstRecords.length > 0 && (
            <span className="ml-2 bg-emerald-100 text-emerald-700 text-theme-caption font-semibold px-2.5 py-1 rounded-full">
              {gstRecords.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* <button className="flex items-center gap-2 font-semibold text-theme-body-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                        <Download size={16} />
                        Export CSV
                    </button> */}
          <Link
            href={`/vendor/finances/gst/new`}
            className="flex items-center gap-2 font-semibold text-theme-body-sm bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm"
          >
            <Plus size={16} />
            {GST_TEXT.ADD_GST}
          </Link>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
        {/* Search */}
        <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-emerald-400 focus-within:bg-white transition-colors">
          <img
            className="w-5 h-5 opacity-50 shrink-0"
            src={searchImgDark}
            alt="search icon"
          />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            className="text-theme-body-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
            placeholder={GST_TEXT.SEARCH_PLACEHOLDER}
          />
        </span>

        {/* Filters */}
        <span className="flex flex-wrap gap-3 items-center">
          <select
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-emerald-400 cursor-pointer transition-colors"
            onChange={(e) =>
              dispatch({
                type: GstActionType.SET_STATUS_FILTER,
                payload: e.target.value,
              })
            }
            value={statusFilter}
          >
            <option value="">{GST_TEXT.ALL_TYPES}</option>
            <option value="Regular">{GST_TEXT.REGULAR}</option>
            <option value="Composition">{GST_TEXT.COMPOSITION}</option>
          </select>

          <select
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-emerald-400 cursor-pointer transition-colors"
            value={sortBy}
            onChange={(e) =>
              dispatch({
                type: GstActionType.SET_SORT_BY,
                payload: e.target.value,
              })
            }
            name="sort_by"
          >
            <option value="desc">{GST_TEXT.NEWEST_FIRST}</option>
            <option value="asc">{GST_TEXT.OLDEST_FIRST}</option>
          </select>

          {isOpen ? (
            <button
              onClick={() =>
                dispatch({ type: GstActionType.SET_IS_OPEN, payload: false })
              }
              className="flex items-center gap-2 text-theme-body-sm border border-emerald-300 bg-emerald-50 text-emerald-600 rounded-xl px-3 py-2 font-medium transition-colors"
            >
              {date ? date.toDateString() : GST_TEXT.SELECT_DATE}
              <ChevronUp size={16} />
            </button>
          ) : (
            <button
              onClick={() =>
                dispatch({ type: GstActionType.SET_IS_OPEN, payload: true })
              }
              className="flex items-center gap-2 text-theme-body-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
            >
              {date ? date.toDateString() : GST_TEXT.SELECT_DATE}
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
                <input type="checkbox" className="rounded" />
              </th>
              {gstTableHeader.map((header) => (
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
            ) : gstRecords && gstRecords?.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-16 text-center text-gray-400 text-theme-body-sm"
                >
                  <ReceiptText size={36} className="mx-auto mb-3 opacity-30" />
                  {GST_TEXT.NO_RECORDS}
                </td>
              </tr>
            ) : (
              gstRecords &&
              gstRecords?.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                  </td>

                  <td className="p-4">
                    <span className="font-mono text-theme-body-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                      {item.gst_number}
                      {item.is_default && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-theme-tiny tracking-wide">
                          {GST_TEXT.DEFAULT_BADGE}
                        </span>
                      )}
                    </span>
                  </td>

                  <td className="p-4 text-theme-body-sm text-gray-700 font-medium">
                    {item.legal_name}
                  </td>

                  <td className="p-4 text-gray-600 text-theme-body-sm">
                    {item.state_code}
                  </td>

                  <td className="p-4 text-gray-600 text-theme-body-sm">
                    {item.registration_type}
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
                      ● {GST_TEXT.ACTIVE_BADGE}
                    </span>
                  </td>

                  <td className="p-4 text-theme-body-sm text-gray-500 whitespace-nowrap">
                    {new Date(item.effective_from).toLocaleDateString("en-GB")}
                  </td>

                  <td className="p-4">
                    <Link
                      href={`/vendor/finances/gst/${item.id}`}
                      className="text-theme-caption font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {GST_TEXT.EDIT_LINK}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <span className="flex justify-end mt-4">
        {/* Pagination here */}
        <div className="flex items-center gap-2 text-theme-body-sm text-gray-600">
          <span className=" flex ">
            {GST_TEXT.SHOWING.replace("{count}", String(itemsPerPage)).replace(
              "{total}",
              String(totalPages * itemsPerPage),
            )}
          </span>
          <Pagination
            setCount={(page) =>
              dispatch({
                type: GstActionType.SET_CURRENT_PAGE,
                payload: typeof page === "function" ? page(currentPage) : page,
              })
            }
            count={currentPage}
            totalPages={totalPages ?? 0}
            style="relative right-0 w-54"
          />
        </div>
      </span>
    </main>
  );
}
