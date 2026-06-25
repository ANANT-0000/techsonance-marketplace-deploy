'use client';
import { CartItemDisplay, VariantDetails } from "@/utils/Types";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { QuickBuyItemRow } from "./QuickBuyItemRow";
import { AnimatePresence } from "motion/react";
import { CartItemRow } from "./CartItemRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ITEM_LIST_PANEL_TEXT } from "@/constants/customerText";

export function ItemListPanel({
  isQuickBuy,
  cartItems,
  quickBuyVariant,
  quickBuyQty,
  onQuickBuyQtyChange,
  reduxCartItems,
}: {
  isQuickBuy: boolean;
  cartItems: CartItemDisplay[];
  quickBuyVariant: VariantDetails | null;
  quickBuyQty: number;
  onQuickBuyQtyChange: (n: number) => void;
  reduxCartItems?: { productVariantId: string; quantity: number }[];
}) {
  const isLoading = isQuickBuy && !quickBuyVariant;

  // Live count: items that still have qty > 0 in Redux (fall back to total count)
  const liveItemCount = reduxCartItems
    ? cartItems.filter((item) => {
        const qty = reduxCartItems.find(
          (r) => r.productVariantId === item.product_variant_id
        )?.quantity ?? item.quantity;
        return qty > 0;
      }).length
    : cartItems.length;

  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4 lg:px-5">
        <CardTitle className="flex items-center gap-2 text-theme-body-plus font-semibold text-gray-900">
          <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
            {isQuickBuy
              ? <ShoppingCart className="w-3.5 h-3.5 text-gray-600" />
              : <ShoppingBag className="w-3.5 h-3.5 text-gray-600" />
            }
          </div>
          {isQuickBuy ? ITEM_LIST_PANEL_TEXT.YOUR_ITEM : (
            <span>
              {ITEM_LIST_PANEL_TEXT.CART_ITEMS}
              <span className="ml-1.5 text-theme-xxs font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {liveItemCount}
              </span>
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 lg:px-5 pb-4 space-y-2.5">
        {isLoading ? (
          // Loading skeleton for quick buy
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
            <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/3 rounded" />
            </div>
            <Skeleton className="h-6 w-16 rounded-lg shrink-0" />
          </div>
        ) : isQuickBuy ? (
          quickBuyVariant ? (
            <QuickBuyItemRow
              variant={quickBuyVariant}
              qty={quickBuyQty}
              onQtyChange={onQuickBuyQtyChange}
            />
          ) : (
            <p className="text-theme-body-sm text-gray-400 text-center py-6">{ITEM_LIST_PANEL_TEXT.LOADING}</p>
          )
        ) : (
          <AnimatePresence>
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-gray-400" />
                </div>
                <p className="text-theme-body-sm text-gray-400 font-medium">{ITEM_LIST_PANEL_TEXT.EMPTY_CART}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cartItems.map(item => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}