import React from "react";
import {
  AlertTriangle,
  Building,
  ChevronLeft,
  ChevronRight,
  Edit2,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBSCRIBATION_TEXT } from "@/constants/adminText";
import { formatDateReadable } from "@/lib/utils";
import { SubscriptionStatus } from "@/utils/Types";
import { VendorSubscriptionRow } from "./SharedUI";

interface VendorsTabProps {
  vendorsError: string | null;
  searchQuery: string;
  filterStatus: string;
  isLoadingVendors: boolean;
  paginatedVendors: VendorSubscriptionRow[];
  currentPage: number;
  totalPages: number;
  dispatch: React.Dispatch<any>;
  loadVendors: () => void;
  loadVendorQuota: (id: string) => void;
  ACTION: any;
}

export default function VendorsTab({
  vendorsError,
  searchQuery,
  filterStatus,
  isLoadingVendors,
  paginatedVendors,
  currentPage,
  totalPages,
  dispatch,
  loadVendors,
  loadVendorQuota,
  ACTION,
}: VendorsTabProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-500" />
            {SUBSCRIBATION_TEXT.SECTION_LIFECYCLE_TITLE}
          </h2>
          <p className="text-xs text-slate-500">
            {SUBSCRIBATION_TEXT.SECTION_LIFECYCLE_SUBTITLE}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadVendors}
          className="text-xs h-9"
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          {SUBSCRIBATION_TEXT.ACTIONS.REFRESH}
        </Button>
      </div>

      {vendorsError && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-6">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {vendorsError}
        </div>
      )}

      {/* Filter Bar - styled consistent with the Orders page filter bar */}
      <div className="flex flex-wrap justify-between items-center bg-slate-50 border border-slate-250/60 rounded-xl p-3 gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) =>
              dispatch({
                type: ACTION.SET_SEARCH_QUERY,
                payload: e.target.value,
              })
            }
            placeholder={SUBSCRIBATION_TEXT.SEARCH_PLACEHOLDER}
            className="pl-9 text-xs h-9 bg-white border-slate-200"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filterStatus}
            onValueChange={(val) =>
              dispatch({
                type: ACTION.SET_FILTER_STATUS,
                payload: val,
              })
            }
          >
            <SelectTrigger className="text-xs h-9 w-[150px] bg-white border-slate-200">
              <SelectValue
                placeholder={SUBSCRIBATION_TEXT.FILTER_STATUS_LABEL}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__" className="text-xs">
                {SUBSCRIBATION_TEXT.FILTER_ALL_STATUS}
              </SelectItem>
              {Object.entries(SUBSCRIBATION_TEXT.STATUS_LABELS).map(
                ([key, label]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vendor Subscriptions Data Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full table-auto min-w-[800px] border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <th className="p-4">
                {SUBSCRIBATION_TEXT.TABLE_HEADERS.COMPANY_NAME}
              </th>
              <th className="p-4">
                {SUBSCRIBATION_TEXT.TABLE_HEADERS.DOMAIN}
              </th>
              <th className="p-4">
                {SUBSCRIBATION_TEXT.TABLE_HEADERS.CURRENT_PLAN}
              </th>
              <th className="p-4">
                {SUBSCRIBATION_TEXT.TABLE_HEADERS.STATUS}
              </th>
              <th className="p-4">
                {SUBSCRIBATION_TEXT.TABLE_HEADERS.TRIAL_ENDS}
              </th>
              <th className="p-4">
                {SUBSCRIBATION_TEXT.TABLE_HEADERS.PERIOD_ENDS}
              </th>
              <th className="p-4">
                {SUBSCRIBATION_TEXT.TABLE_HEADERS.DATE_CREATED}
              </th>
              <th className="p-4 text-center">
                {SUBSCRIBATION_TEXT.TABLE_HEADERS.ACTIONS}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoadingVendors ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="p-4">
                      <div className="h-4 bg-slate-100 rounded-sm w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedVendors.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="p-8 text-center text-slate-400 italic"
                >
                  {SUBSCRIBATION_TEXT.ACTIONS.NO_DATA}
                </td>
              </tr>
            ) : (
              paginatedVendors.map((item: VendorSubscriptionRow) => {
                const planName = item.plan?.plan_name || "N/A";
                const companyName = item.company?.company_name || "N/A";
                const domain = item.company?.company_domain || "N/A";

                // Define badge styles consistent with project orders panel
                let statusStyle =
                  "bg-slate-100 text-slate-700 border-slate-200";
                if (item.status === SubscriptionStatus.ACTIVE) {
                  statusStyle =
                    "bg-emerald-50 text-emerald-700 border-emerald-200";
                } else if (item.status === SubscriptionStatus.TRIAL) {
                  statusStyle = "bg-blue-50 text-blue-700 border-blue-200";
                } else if (
                  item.status === SubscriptionStatus.GRACE_PERIOD
                ) {
                  statusStyle =
                    "bg-amber-50 text-amber-700 border-amber-200";
                } else if (
                  item.status === SubscriptionStatus.EXPIRED ||
                  item.status === SubscriptionStatus.CANCELLED
                ) {
                  statusStyle = "bg-red-50 text-red-700 border-red-200";
                }

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 font-semibold text-slate-900">
                      {companyName}
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {domain}
                    </td>
                    <td className="p-4 font-medium capitalize text-slate-800">
                      {planName}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyle}`}
                      >
                        ●{" "}
                        {SUBSCRIBATION_TEXT.STATUS_LABELS[
                          item.status as SubscriptionStatus
                        ] || item.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {formatDateReadable(item.trial_ends_at)}
                    </td>
                    <td className="p-4 text-slate-500">
                      {formatDateReadable(item.current_period_end)}
                    </td>
                    <td className="p-4 text-slate-500">
                      {formatDateReadable(item.created_at)}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          dispatch({
                            type: ACTION.OPEN_EDIT_MODAL,
                            payload: item,
                          });
                          if (item.company_id)
                            loadVendorQuota(item.company_id);
                        }}
                        className="h-7 px-2.5 text-xs text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 rounded-lg transition-colors font-semibold"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        {SUBSCRIBATION_TEXT.ACTIONS.MANAGE}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar - styled like orders list pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() =>
                dispatch({
                  type: ACTION.SET_CURRENT_PAGE,
                  payload: currentPage - 1,
                })
              }
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() =>
                dispatch({
                  type: ACTION.SET_CURRENT_PAGE,
                  payload: currentPage + 1,
                })
              }
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
