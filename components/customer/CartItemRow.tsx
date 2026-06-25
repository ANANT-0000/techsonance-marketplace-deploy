'use client';
import { useAppSelector } from "@/hooks/reduxHooks";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { AddToCart } from "./AddToCart";
import { CartItemDisplay } from "@/utils/Types";
import { CART_ITEM_ROW_TEXT } from "@/constants/customerText";

export function CartItemRow({ item }: { item: CartItemDisplay }) {
  const { items } = useAppSelector((s) => s.cart);

  // If the item has been removed from Redux (qty hit 0 and was spliced out),
  // find() returns undefined. We treat that as qty=0 — NOT the server-loaded
  // quantity — so the row correctly disappears.
  const reduxEntry = items.find(i => i.productVariantId === item.product_variant_id);
  const liveQty = reduxEntry?.quantity ?? 0;
  const subtotal = Number(item.productVariant.price) * liveQty;

  // When quantity reaches 0 (or item removed from Redux), hide the row
  if (liveQty === 0) return null;

  return (
    <motion.div
      layout
      key={item.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 bg-gray-50/60 border border-gray-100 rounded-xl p-3"
    >
      {/* Product image */}
      <div className="shrink-0 w-[52px] h-[52px] rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
        <Image
          src={item.productVariant.images[0]?.image_url ?? "/placeholder.png"}
          alt={item.productVariant.variant_name}
          width={52}
          height={52}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name & price */}
      <div className="flex-1 min-w-0">
        <p className="text-theme-caption font-semibold text-gray-800 line-clamp-2 leading-snug">
          {item.productVariant.variant_name}
        </p>
        <p className="text-theme-caption text-blue-600 font-bold mt-0.5">
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
        <p className="text-theme-tiny text-gray-500 font-medium tabular-nums">
          ₹{formatCurrency(subtotal)}
        </p>
      </div>
    </motion.div>
  );
}