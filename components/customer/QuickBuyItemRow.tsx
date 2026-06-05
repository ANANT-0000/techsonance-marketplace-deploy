'use client';
import { motion } from "motion/react";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { VariantDetails } from "@/utils/Types";

export function QuickBuyItemRow({
  variant,
  qty,
  onQtyChange,
}: {
  variant: VariantDetails;
  qty: number;
  onQtyChange: (n: number) => void;
}) {
  const subtotal = Number(variant.price) * qty;
  const maxStock = variant.stock_quantity ?? 99;

  console.log("  variant details in quick buy row", variant);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 bg-gray-50/60 border border-gray-100 rounded-xl p-3"
    >
      {/* Product image */}
      <div className="shrink-0 w-[52px] h-[52px] rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
        <img
          src={
            typeof variant.images === 'string' && variant.images
              ? variant.images
              : 'https://imgs.search.brave.com/pnBIeHCYZeyfGKnruwbCQdsNxNOBpZP893nGmlSNntk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9wbGFj/ZWhvbGQubmV0L3By/b2R1Y3QtZGlhbG9n/LnBuZw'
          }
          alt={variant.variant_name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name & price */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
          {variant.variant_name}
        </p>
        <p className="text-xs text-blue-600 font-bold mt-0.5">
          ₹{formatCurrency(Number(variant.price))} each
        </p>
      </div>

      {/* Quantity control + line total */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center bg-blue-600 rounded-lg overflow-hidden h-7">
          <button
            onClick={() => onQtyChange(Math.max(1, qty - 1))}
            className="px-2 h-full text-white hover:bg-black/10 transition-colors flex items-center active:bg-black/20"
            aria-label="Decrease quantity"
          >
            <Minus size={11} strokeWidth={2.5} />
          </button>
          <motion.span
            key={qty}
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="px-2 text-[11px] font-bold text-white min-w-[20px] text-center tabular-nums"
          >
            {qty}
          </motion.span>
          <button
            onClick={() => onQtyChange(Math.min(maxStock, qty + 1))}
            className="px-2 h-full text-white hover:bg-black/10 transition-colors flex items-center active:bg-black/20"
            aria-label="Increase quantity"
          >
            <Plus size={11} strokeWidth={2.5} />
          </button>
        </div>

        <p className="text-[10px] text-gray-500 font-medium tabular-nums">
          ₹{formatCurrency(subtotal)}
        </p>

        {qty >= maxStock && (
          <p className="text-[9px] text-amber-500 font-medium">Max stock</p>
        )}
      </div>
    </motion.div>
  );
}