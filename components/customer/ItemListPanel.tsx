'use client';
import { CartItemDisplay, VariantDetails } from "@/utils/Types";
import { ShoppingBag } from "lucide-react";
import { QuickBuyItemRow } from "./QuickBuyItemRow";
import { AnimatePresence } from "motion/react";
import { CartItemRow } from "./CartItemRow";

export function ItemListPanel({
  isQuickBuy,
  cartItems,
  quickBuyVariant,
  quickBuyQty,
  onQuickBuyQtyChange,
}: {
  isQuickBuy: boolean;
  cartItems: CartItemDisplay[];
  quickBuyVariant: VariantDetails | null;
  quickBuyQty: number;
  onQuickBuyQtyChange: (n: number) => void;
}) {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-4 lg:p-5 space-y-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 mb-1">
        <ShoppingBag size={16} className="text-gray-500" />
        {isQuickBuy ? 'Your Item' : `Cart Items (${cartItems.length})`}
      </h2>

      {isQuickBuy ? (
        quickBuyVariant ? (
          <QuickBuyItemRow
            variant={quickBuyVariant}
            qty={quickBuyQty}
            onQtyChange={onQuickBuyQtyChange}
          />
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Loading item…</p>
        )
      ) : (
        <AnimatePresence>
          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Your cart is empty.</p>
          ) : (
            cartItems.map(item => (
              <CartItemRow key={item.id} item={item} />
            ))
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
