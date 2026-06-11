'use client';
import { useAppSelector } from "@/hooks/reduxHooks";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { AddToCart } from "./AddToCart";
import { CartItemDisplay } from "@/utils/Types";
import { CART_ITEM_ROW_TEXT } from "@/constants/customerText";

export function CartItemRow({ item }: { item: CartItemDisplay }) {
  const { items } = useAppSelector((s) => s.cart);
  const liveQty = items.find(i => i.productVariantId === item.product_variant_id)?.quantity ?? item.quantity;
  const subtotal = Number(item.productVariant.price) * liveQty;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 bg-gray-50/60 border border-gray-100 rounded-xl p-3"
    >
      {/* Product image */}
      <div className="shrink-0 w-[52px] h-[52px] rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
        <img
          src={item.productVariant.images[0]?.image_url ?? "/placeholder.png"}
          alt={item.productVariant.variant_name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name & price */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
          {item.productVariant.variant_name}
        </p>
        <p className="text-xs text-blue-600 font-bold mt-0.5">
          ₹{formatCurrency(Number(item.productVariant.price))} {CART_ITEM_ROW_TEXT.EACH}
        </p>
      </div>

      {/* AddToCart (untouched) + line total */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        {/* AddToCart component is intentionally left completely unchanged */}
        <AddToCart
          productVariantId={item.product_variant_id}
          styles="small w-20"
        />
        <p className="text-[10px] text-gray-500 font-medium tabular-nums">
          ₹{formatCurrency(subtotal)}
        </p>
      </div>
    </motion.div>
  );
}