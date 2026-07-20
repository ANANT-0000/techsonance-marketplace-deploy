"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import { useEffect, useReducer } from "react";
import { searchImgDark } from "@/constants/common";
import { ChevronDown, ChevronUp, Download, Percent, Plus, Loader2, Lock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TableRowSkeleton } from "@/components/common/skeletons";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authToken } from "@/utils/authToken";
import { fetchTaxSlabs } from "@/utils/vendorApiClient";
import { TAX_RATES_TEXT } from "@/constants/vendorText";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";
import { toast } from "sonner";

export interface TaxSlab {
  id: string; // UUID
  tax_profile_id: string; // UUID reference to tax profile
  slab_name: string; // e.g., "GST 18%— Electronics"
  tax_name: string; // e.g., "GST 18%"
  tax_code: string; // e.g., "GST-IN-18"
  tax_scope: "Intra" | "Inter" | "Both"; // scope of applicability
  total_rate: string; // percentage as string, e.g., "18.00"
  is_exempt: boolean; // exemption flag
  effective_from: string; // YYYY-MM-DD
  effective_to: string; // YYYY-MM-DD
  created_at: string; // ISO timestamp
}

const taxSlabTableHeader = [
  TAX_RATES_TEXT.TABLE.HEADERS.RATE_NAME,
  TAX_RATES_TEXT.TABLE.HEADERS.STATE_REGION,
  TAX_RATES_TEXT.TABLE.HEADERS.TAX_VALUE,
  TAX_RATES_TEXT.TABLE.HEADERS.EXEMPTION_STATUS,
  TAX_RATES_TEXT.TABLE.HEADERS.EFFECTIVE_FROM,
  TAX_RATES_TEXT.TABLE.HEADERS.EFFECTIVE_TO,
];

export enum SessionState {
  CHECKING = "checking",
  INVALID = "invalid",
  VALID = "valid",
}

interface TaxRatesState {
  date: Date | undefined;
  isOpen: boolean;
  sortBy: string;
  taxSlabs: TaxSlab[];
  loading: boolean;
  sessionState: SessionState;
}

enum TaxRatesActionType {
  SET_DATE = "SET_DATE",
  SET_IS_OPEN = "SET_IS_OPEN",
  SET_SORT_BY = "SET_SORT_BY",
  SET_TAX_SLABS = "SET_TAX_SLABS",
  SET_LOADING = "SET_LOADING",
  SET_SESSION_STATE = "SET_SESSION_STATE",
}

type TaxRatesAction =
  | { type: TaxRatesActionType.SET_DATE; payload: Date | undefined }
  | { type: TaxRatesActionType.SET_IS_OPEN; payload: boolean }
  | { type: TaxRatesActionType.SET_SORT_BY; payload: string }
  | { type: TaxRatesActionType.SET_TAX_SLABS; payload: TaxSlab[] }
  | { type: TaxRatesActionType.SET_LOADING; payload: boolean }
  | { type: TaxRatesActionType.SET_SESSION_STATE; payload: SessionState };

const initialState: TaxRatesState = {
  date: new Date(),
  isOpen: false,
  sortBy: "desc",
  taxSlabs: [],
  loading: true,
  sessionState: SessionState.CHECKING,
};

function taxRatesReducer(state: TaxRatesState, action: TaxRatesAction): TaxRatesState {
  switch (action.type) {
    case TaxRatesActionType.SET_DATE:
      return { ...state, date: action.payload };
    case TaxRatesActionType.SET_IS_OPEN:
      return { ...state, isOpen: action.payload };
    case TaxRatesActionType.SET_SORT_BY:
      return { ...state, sortBy: action.payload };
    case TaxRatesActionType.SET_TAX_SLABS:
      return { ...state, taxSlabs: action.payload };
    case TaxRatesActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case TaxRatesActionType.SET_SESSION_STATE:
      return { ...state, sessionState: action.payload };
    default:
      return state;
  }
}

export default function TaxSlabsPage() {
  const companyId = getClientCompanyId();
  const token = authToken();

  const [state, dispatch] = useReducer(taxRatesReducer, initialState);
  const { date, isOpen, sortBy, taxSlabs, loading, sessionState } = state;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!token || !companyId) {
      // Short delay so it doesn't flash if storage is just slow
      timer = setTimeout(() => {
        dispatch({ type: TaxRatesActionType.SET_SESSION_STATE, payload: SessionState.INVALID });
      }, 800);
      return () => clearTimeout(timer);
    }
    dispatch({ type: TaxRatesActionType.SET_SESSION_STATE, payload: SessionState.VALID });

    const getTaxSlabs = async () => {
      dispatch({ type: TaxRatesActionType.SET_LOADING, payload: true });
      try {
        const res = await fetchTaxSlabs(sortBy, token, companyId);
        dispatch({ type: TaxRatesActionType.SET_TAX_SLABS, payload: res.data || [] });
      } catch (err: unknown) {
        toast.error(TAX_RATES_TEXT.ALERTS.FAILED_FETCH);
      } finally {
        dispatch({ type: TaxRatesActionType.SET_LOADING, payload: false });
      }
    };
    getTaxSlabs();
  }, [sortBy, date, token, companyId]);

  if (sessionState === "checking") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 text-sm font-medium">{TAX_RATES_TEXT.SESSION.CHECKING}</p>
      </div>
    );
  }

  if (sessionState === "invalid") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-red-100">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{TAX_RATES_TEXT.SESSION.AUTH_REQUIRED}</h2>
        <p className="text-gray-500 text-sm max-w-md text-center mb-6 leading-relaxed">
          {TAX_RATES_TEXT.SESSION.MISSING_LIST}
        </p>
        <Link 
          href={VEDNOR_LOGIN_PATH}
          className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm"
        >
          {TAX_RATES_TEXT.SESSION.LOGIN_BTN}
        </Link>
      </div>
    );
  }

  const handleRoute = (id: string | null) => {
    if (id) {
      redirect(`/vendor/finances/tax-rates/${id}`);
      return;
    }
    redirect(`/vendor/finances/tax-rates/new`);
  };
  return (
    <section className="w-full px-1">
      {/* Header */}
      <header className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 text-gray-700">
          <Percent size={22} className="text-blue-500" />
          <h1 className="text-theme-h4 font-bold text-gray-800">
            {TAX_RATES_TEXT.HEADER.TITLE}
          </h1>
          {taxSlabs && taxSlabs.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-700 text-theme-caption font-semibold px-2.5 py-1 rounded-full">
              {taxSlabs.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* <button className="flex items-center gap-2 font-semibold text-theme-body-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                        <Download size={16} />
                        Export CSV
                    </button>
                     */}
          <button
            onClick={() => handleRoute(null)}
            className="flex items-center gap-2 font-semibold text-theme-body-sm bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl px-5 py-2.5 transition-all shadow-sm hover:shadow"
          >
            <Plus size={16} />
            {TAX_RATES_TEXT.HEADER.NEW_RATE}
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="relative flex flex-wrap justify-between rounded-2xl items-center py-3 px-4 gap-3 bg-white border border-gray-100 shadow-sm mb-6">
        <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
          <img
            className="w-5 h-5 opacity-50 shrink-0"
            src={searchImgDark}
            alt="search icon"
          />
          <input
            type="text"
            className="text-theme-body-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
            placeholder={TAX_RATES_TEXT.FILTERS.SEARCH_PLACEHOLDER}
          />
        </span>

        <span className="flex flex-wrap gap-3 items-center">
          <select
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
            value={sortBy}
            onChange={(e) => dispatch({ type: TaxRatesActionType.SET_SORT_BY, payload: e.target.value })}
            name="sort_by"
          >
            <option value="desc">{TAX_RATES_TEXT.FILTERS.SORT_HIGHEST}</option>
            <option value="asc">{TAX_RATES_TEXT.FILTERS.SORT_LOWEST}</option>
          </select>

          {/* {isOpen ? (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 text-theme-body-sm border border-blue-300 bg-blue-50 text-blue-600 rounded-xl px-3 py-2 font-medium transition-colors"
                        >
                            {date ? date.toDateString() : "Select Date"}
                            <ChevronUp size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="flex items-center gap-2 text-theme-body-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
                        >
                            {date ? date.toDateString() : "Select Date"}
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
                    )} */}
        </span>
      </div>

      {/* Data Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
        <table className="w-full table-auto min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-left">
              {/* <th className="p-4 w-10">
                <input type="checkbox" className="rounded" />
              </th> */}
              {taxSlabTableHeader.map((header) => (
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
              <TableRowSkeleton columns={7} rows={5} />
            ) : taxSlabs && taxSlabs?.length === 0 ? (
              <tr>
                <td
                  colSpan={taxSlabTableHeader.length}
                  className="py-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center px-4">
                    <div className="w-16 h-16 bg-blue-50/50 rounded-2xl flex items-center justify-center mb-5 ring-1 ring-blue-100/50">
                      <Percent size={28} className="text-blue-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-800 mb-2">
                      {TAX_RATES_TEXT.EMPTY_STATES.NO_DATA_TITLE}
                    </p>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                      {TAX_RATES_TEXT.EMPTY_STATES.NO_DATA_DESC}
                    </p>
                    <button
                      onClick={() => handleRoute(null)}
                      className="flex items-center gap-2 font-semibold text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl px-6 py-2.5 transition-colors"
                    >
                      <Plus size={16} />
                      {TAX_RATES_TEXT.EMPTY_STATES.CREATE_BTN}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              taxSlabs &&
              taxSlabs?.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  {/* <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                  </td> */}

                  <td className="p-4">
                    <span className="font-semibold text-gray-800">
                      {item.tax_name}
                    </span>
                  </td>

                  <td className="p-4 text-gray-600 text-theme-body-sm font-medium">
                    {item.tax_scope}
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
                      {Number(item.total_rate).toFixed(2)}%
                    </span>
                  </td>

                  <td className="p-4">
                    {item.is_exempt ? (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
                        ● {TAX_RATES_TEXT.TABLE.STATUS_EXEMPT}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
                        ● {TAX_RATES_TEXT.TABLE.STATUS_TAXABLE}
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-theme-body-sm text-gray-500 whitespace-nowrap">
                    {new Date(item.effective_from).toLocaleDateString("en-GB")}
                  </td>

                  <td className="p-4 text-theme-body-sm text-gray-500 whitespace-nowrap">
                    {item.effective_to === "2099-12-31" || !item.effective_to
                      ? TAX_RATES_TEXT.TABLE.ONGOING
                      : new Date(item.effective_to).toLocaleDateString("en-GB")}
                  </td>
                  {/* 
                                    <td className="p-4">
                                        <button className="text-theme-caption font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                                            View Rules →
                                        </button>
                                    </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
