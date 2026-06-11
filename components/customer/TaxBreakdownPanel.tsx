import { formatCurrency } from "@/lib/utils";
import { ChevronDown, ChevronUp, Info, Loader2 } from "lucide-react";
import { useReducer } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TAX_BREAKDOWN_TEXT } from "@/constants/customerText";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Reducer ──────────────────────────────────────────────────────────────────

interface TaxPanelState {
  isExpanded: boolean;
}

function taxPanelReducer(state: TaxPanelState, action: 'toggle'): TaxPanelState {
  if (action === 'toggle') return { isExpanded: !state.isExpanded };
  return state;
}

// ─── TaxBreakdownPanel ────────────────────────────────────────────────────────

export function TaxBreakdownPanel({
  tax,
  deliveryFee,
  discount,
}: {
  tax: TaxBreakdown | null;
  deliveryFee: number;
  discount: number;
}) {
  const [panelState, panelDispatch] = useReducer(taxPanelReducer, { isExpanded: false });

  if (!tax) {
    return (
      <div className="flex items-center gap-2 py-2.5 px-3 rounded-xl bg-amber-50/70 border border-amber-100 text-[11px] text-amber-700">
        <Info size={12} className="shrink-0" />
        <span>{TAX_BREAKDOWN_TEXT.SELECT_ADDRESS}</span>
      </div>
    );
  }

  const hasIgst = tax.totalIgst > 0;
  const hasCgstSgst = tax.totalCgst > 0 || tax.totalSgst > 0;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Summary row — toggle button */}
      <button
        onClick={() => panelDispatch('toggle')}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-gray-700">{TAX_BREAKDOWN_TEXT.TAX_GST}</span>
          {tax.isIntraState ? (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              {TAX_BREAKDOWN_TEXT.INTRA_STATE}
            </span>
          ) : (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {TAX_BREAKDOWN_TEXT.INTER_STATE}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-gray-800 tabular-nums">
            ₹{formatCurrency(tax.totalTax)}
          </span>
          {panelState.isExpanded
            ? <ChevronUp size={12} className="text-gray-400" />
            : <ChevronDown size={12} className="text-gray-400" />
          }
        </div>
      </button>

      {/* Expanded breakdown */}
      <AnimatePresence>
        {panelState.isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3.5 py-3 bg-white space-y-2 border-t border-gray-100">
              {/* State context */}
              {(tax.vendorState || tax.customerState) && (
                <div className="flex gap-4 text-[10px] text-gray-400 pb-2 border-b border-dashed border-gray-100">
                  {tax.vendorState && (
                    <span>
                      {TAX_BREAKDOWN_TEXT.SELLER}{' '}
                      <span className="font-semibold text-gray-600 capitalize">{tax.vendorState}</span>
                    </span>
                  )}
                  {tax.customerState && (
                    <span>
                      {TAX_BREAKDOWN_TEXT.DELIVERY}{' '}
                      <span className="font-semibold text-gray-600 capitalize">{tax.customerState}</span>
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-gray-500">{TAX_BREAKDOWN_TEXT.TAXABLE_AMOUNT}</span>
                  <span className="font-medium text-gray-700 tabular-nums">₹{formatCurrency(tax.subtotal)}</span>
                </div>

                {hasCgstSgst && (
                  <>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-gray-500">{TAX_BREAKDOWN_TEXT.CGST}</span>
                      <span className="font-medium text-gray-700 tabular-nums">₹{formatCurrency(tax.totalCgst)}</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-gray-500">{TAX_BREAKDOWN_TEXT.SGST}</span>
                      <span className="font-medium text-gray-700 tabular-nums">₹{formatCurrency(tax.totalSgst)}</span>
                    </div>
                  </>
                )}

                {hasIgst && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">{TAX_BREAKDOWN_TEXT.IGST}</span>
                    <span className="font-medium text-gray-700 tabular-nums">₹{formatCurrency(tax.totalIgst)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[12px] pt-1.5 border-t border-gray-100">
                  <span className="font-semibold text-gray-700">{TAX_BREAKDOWN_TEXT.TOTAL_TAX}</span>
                  <span className="font-bold text-gray-900 tabular-nums">₹{formatCurrency(tax.totalTax)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TaxLoadingSkeleton ───────────────────────────────────────────────────────

export function TaxLoadingSkeleton() {
  return (
    <div className="flex items-center gap-2 py-2.5 px-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-600">
      <Loader2 size={12} className="shrink-0 animate-spin" />
      <span>{TAX_BREAKDOWN_TEXT.CALCULATING}</span>
    </div>
  );
}