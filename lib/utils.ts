import { AppliedPromotion,  BundleDealConfig,  BuyXGetYConfig,  DiscountConfig,  FixedAmountConfig,  FreeShippingConfig,  PercentageConfig,  PromotionRuleType, PromotionType, TieredDiscountConfig } from "@/utils/Types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatCurrency(amount: number, locale = 'en-IN'): string {
  if (typeof amount === 'string' || !amount) {
    return String(amount);
  }
  if (isNaN(amount)) {
    console.warn(`Invalid amount provided to formatCurrency: ${amount}`);
    return amount.toString();
  }
  return amount.toLocaleString(locale);
}

export function formatNumber(value: number, locale = 'en-IN'): string {
  if (isNaN(value)) {
    console.warn(`Invalid value provided to formatNumber: ${value}`);
    return value.toString();
  }
  return value.toLocaleString(locale);
}


export const formatStructure = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString();

export const isImageUrl = (url: string) =>
  /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url);

export const isPdfUrl = (url: string) =>
  /\.pdf(\?.*)?$/i.test(url);
// Helper — put this near calculateCouponDiscount
export function getMinOrderAmount(coupon: AppliedPromotion): number | null {
  const minRule = coupon.rule?.find(r => r.rule_type === PromotionRuleType.MIN_CART_VALUE);
  if (!minRule) return null;
  const cfg = minRule.rule_config as { amount?: number; value?: number };
  return cfg?.amount ?? cfg?.value ?? null;
}

export function calculateCouponDiscount(
  coupon: AppliedPromotion | null,
  subtotal: number
): number {
  if (!coupon) return 0;

  const config = coupon.discount_config;
  if(!config) return 0;
  // ── Helper: is it a PercentageOffConfig? ─────────────────────────────
  // All config shapes have different required keys — use them as discriminants.
  const isPercentage = (c: DiscountConfig): c is PercentageConfig =>
    'value' in c && !('buy_qty' in c) && !('tiers' in c) && !('product_variant_ids' in c);

  const isFixed = (c: DiscountConfig): c is FixedAmountConfig =>
    'value' in c && !('buy_qty' in c) && !('tiers' in c) && !('product_variant_ids' in c);

  const isBuyXGetY = (c: DiscountConfig): c is BuyXGetYConfig =>
    'buy_qty' in c && 'get_qty' in c;

  const isTiered = (c: DiscountConfig): c is TieredDiscountConfig =>
    'tiers' in c;

  const isBundle = (c: DiscountConfig): c is BundleDealConfig =>
    'product_variant_ids' in c && 'bundle_price' in c;

  const isFreeShipping = (c: DiscountConfig): c is FreeShippingConfig =>
    !('value' in c) && !('buy_qty' in c) && !('tiers' in c) && !('product_variant_ids' in c);

  // ── Route by discount_type (source of truth) ──────────────────────────
  const type = (coupon.discount_type ?? '').toLowerCase();

  switch (type) {

    case PromotionType.PERCENTAGE: {
      if (!isPercentage(config)) return 0;
      const raw = Math.floor((subtotal * config.value) / 100);
return (config.cap != null && config.cap > 0) ? Math.min(raw, config.cap) : raw;
    }

    case PromotionType.FIXED_AMOUNT: {
      if (!isFixed(config)) return 0;
      // Can't discount more than the cart itself
      return Math.min(config.value, subtotal);
    }

    case PromotionType.BUY_X_GET_Y: {
      if (!isBuyXGetY(config)) return 0;
      // Discount = price of "get" items × get_discount_percent/100
      // We don't have per-item prices here, so we return 0 and let
      // the server apply the line-item discount. Flag it clearly:
      return 0; // applied server-side per line item
    }

    case PromotionType.FREE_SHIPPING: {
      // Shipping discount is handled separately in the delivery variable.
      // Return 0 here so it doesn't double-count.
      return 0;
    }

    case PromotionType.TIERED_DISCOUNT: {
      if (!isTiered(config)) return 0;
      // Find the highest tier the subtotal qualifies for
      const activeTier = [...config.tiers]
        .sort((a, b) => b.min_cart - a.min_cart)
        .find(tier => subtotal >= tier.min_cart);
      if (!activeTier) return 0;
      return Math.floor((subtotal * activeTier.percent) / 100);
    }

    case PromotionType.BUNDLE_DEAL: {
      if (!isBundle(config)) return 0;
      // Discount = difference between full subtotal and the fixed bundle price
      return Math.max(0, subtotal - config.bundle_price);
    }

    default:
      return 0;
  }
}