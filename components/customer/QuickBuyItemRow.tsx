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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm"
    >
      {variant?.images && (
        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-50">
          <img src={typeof variant.images === 'string' && variant.images  ? variant.images : 'https://imgs.search.brave.com/pnBIeHCYZeyfGKnruwbCQdsNxNOBpZP893nGmlSNntk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9wbGFj/ZWhvbGQubmV0L3By/b2R1Y3QtZGlhbG9n/LnBuZw'} 
            alt={variant.variant_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
          {variant.variant_name}
        </p>
        <p className="text-xs text-brand-primary font-bold mt-0.5">
          ₹{formatCurrency(Number(variant.price))} each
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {/* Local qty control — isolated from cart */}
        <div className="flex items-center bg-brand-primary rounded-lg overflow-hidden h-6">
          <button
            onClick={() => onQtyChange(Math.max(1, qty - 1))}
            className="px-2 h-full text-white hover:bg-black/10 transition-colors flex items-center"
          >
            <Minus size={12} />
          </button>
          <span className="px-2 text-xs font-bold text-white min-w-[20px] text-center">
            {qty}
          </span>
          <button
            onClick={() => onQtyChange(Math.min(maxStock, qty + 1))}
            className="px-2 h-full text-white hover:bg-black/10 transition-colors flex items-center"
          >
            <Plus size={12} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400">
          ₹{formatCurrency(subtotal)}
        </p>
        {qty >= maxStock && (
          <p className="text-[9px] text-amber-500">Max stock</p>
        )}
      </div>
    </motion.div>
  );
}