import { formatCurrency } from "@/lib/utils";
import { ChevronDown, ChevronUp, Info, Loader2 } from "lucide-react";
import { useState } from "react";

export interface TaxBreakdown {
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  grandTotal: number;
  isIntraState: boolean;
  vendorState?: string;
  customerState?: string;
}

// ─── Tax Breakdown Component ──────────────────────────────────────────────────

export function TaxBreakdownPanel({
  tax,
  deliveryFee,
  discount,
}: {
  tax: TaxBreakdown | null;
  deliveryFee: number;
  discount: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!tax) {
    return (
      <div className="flex items-center gap-2 py-3 px-3 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700">
        <Info size={13} className="shrink-0" />
        <span>Select a delivery address to see applicable taxes (GST).</span>
      </div>
    );
  }

  const hasIgst = tax.totalIgst > 0;
  const hasCgstSgst = tax.totalCgst > 0 || tax.totalSgst > 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Summary Row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Tax (GST)</span>
          {tax.isIntraState ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              Intra-state · CGST + SGST
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              Inter-state · IGST
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">
            ₹{formatCurrency(tax.totalTax)}
          </span>
          {isExpanded ? (
            <ChevronUp size={14} className="text-gray-400" />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Breakdown */}
      {isExpanded && (
        <div className="px-4 py-3 bg-white space-y-2 border-t border-gray-100">
          {/* State context */}
          {(tax.vendorState || tax.customerState) && (
            <div className="flex gap-4 text-[11px] text-gray-500 pb-2 border-b border-dashed border-gray-100">
              {tax.vendorState && (
                <span>
                  Seller state:{" "}
                  <span className="font-medium text-gray-700 capitalize">
                    {tax.vendorState}
                  </span>
                </span>
              )}
              {tax.customerState && (
                <span>
                  Delivery state:{" "}
                  <span className="font-medium text-gray-700 capitalize">
                    {tax.customerState}
                  </span>
                </span>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxable amount</span>
              <span className="font-medium text-gray-700">
                ₹{formatCurrency(tax.subtotal)}
              </span>
            </div>

            {hasCgstSgst && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">CGST</span>
                  <span className="font-medium text-gray-700">
                    ₹{formatCurrency(tax.totalCgst)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SGST</span>
                  <span className="font-medium text-gray-700">
                    ₹{formatCurrency(tax.totalSgst)}
                  </span>
                </div>
              </>
            )}

            {hasIgst && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">IGST</span>
                <span className="font-medium text-gray-700">
                  ₹{formatCurrency(tax.totalIgst)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm pt-1.5 border-t border-gray-100">
              <span className="font-semibold text-gray-700">Total Tax</span>
              <span className="font-bold text-gray-900">
                ₹{formatCurrency(tax.totalTax)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tax Loading Skeleton ─────────────────────────────────────────────────────

export function TaxLoadingSkeleton() {
  return (
    <div className="flex items-center gap-2 py-3 px-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
      <Loader2 size={13} className="shrink-0 animate-spin" />
      <span>Calculating taxes for your delivery address…</span>
    </div>
  );
}
