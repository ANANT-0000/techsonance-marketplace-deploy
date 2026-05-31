'use client';
import { useAppSelector } from "@/hooks/reduxHooks";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { AddToCart } from "./AddToCart";
import { CartItemDisplay } from "@/utils/Types";

export function CartItemRow({ item }: { item: CartItemDisplay}) {
  const { items } = useAppSelector((s) => s.cart);
  const liveQty = items.find(i => i.productVariantId === item.product_variant_id)?.quantity ?? item.quantity;
  const subtotal = Number(item.productVariant.price) * liveQty;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm"
    >
      <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-50">
        <img
          src={item.productVariant.images[0]?.image_url ?? "/placeholder.png"}
          alt={item.productVariant.variant_name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
          {item.productVariant.variant_name}
        </p>
        <p className="text-xs text-brand-primary font-bold mt-0.5">
          ₹{formatCurrency(Number(item.productVariant.price))} each
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {/* Live qty control — syncs with cart Redux state */}
        <AddToCart
          productVariantId={item.product_variant_id}
          styles="small w-20"
        />
        <p className="text-[10px] text-gray-400">
          ₹{formatCurrency(subtotal)}
        </p>
      </div>
    </motion.div>
  );
}
