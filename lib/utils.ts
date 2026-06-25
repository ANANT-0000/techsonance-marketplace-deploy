import {
  AppliedPromotion,
  BundleDealConfig,
  BuyXGetYConfig,
  Category,
  CategoryTreeNode,
  DiscountConfig,
  FixedAmountConfig,
  PercentageConfig,
  PromotionRuleType,
  PromotionType,
  TieredDiscountConfig,
} from "@/utils/Types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatCurrency(amount: number, locale = "en-IN"): string {
  if (typeof amount === "string" || !amount) {
    return String(amount);
  }
  if (isNaN(amount)) {
    return amount.toString();
  }
  return amount.toLocaleString(locale);
}

export function formatNumber(value: number, locale = "en-IN"): string {
  if (isNaN(value)) {
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

export const isPdfUrl = (url: string) => /\.pdf(\?.*)?$/i.test(url);
// Helper — put this near calculateCouponDiscount
export function getMinOrderAmount(coupon: AppliedPromotion): number | null {
  const minRule = coupon.rule?.find(
    (r) => r.rule_type === PromotionRuleType.MIN_CART_VALUE,
  );
  if (!minRule) return null;
  const cfg = minRule.rule_config as { amount?: number; value?: number };
  return cfg?.amount ?? cfg?.value ?? null;
}

export function calculateCouponDiscount(
  coupon: AppliedPromotion | null,
  subtotal: number,
): number {
  if (!coupon) return 0;

  const config = coupon.discount_config;
  const type = (coupon.discount_type ?? "").toLowerCase();

  // ── Helper type guards ──────────────────────────────────────────────────
  const isPercentage = (c: DiscountConfig): c is PercentageConfig =>
    "value" in c &&
    !("buy_qty" in c) &&
    !("tiers" in c) &&
    !("product_variant_ids" in c) &&
    !("max_shipping_waived" in c);

  const isFixed = (c: DiscountConfig): c is FixedAmountConfig =>
    "value" in c &&
    !("buy_qty" in c) &&
    !("tiers" in c) &&
    !("product_variant_ids" in c) &&
    !("max_shipping_waived" in c);

  const isBuyXGetY = (c: DiscountConfig): c is BuyXGetYConfig =>
    "buy_qty" in c && "get_qty" in c;

  const isTiered = (c: DiscountConfig): c is TieredDiscountConfig =>
    "tiers" in c;

  const isBundle = (c: DiscountConfig): c is BundleDealConfig =>
    "product_variant_ids" in c && "bundle_price" in c;

  // ── Route by discount_type ──────────────────────────────────────────────
  switch (type) {
    case PromotionType.PERCENTAGE: {
      // Primary: use discount_config.value
      if (config && isPercentage(config)) {
        const raw = Math.floor((subtotal * config.value) / 100);
        return config.cap != null && config.cap > 0
          ? Math.min(raw, config.cap)
          : raw;
      }
      // Fallback: use discount_value field directly (percentage)
      const fallbackPct = Number(coupon.discount_value ?? 0);
      if (fallbackPct > 0) {
        const raw = Math.floor((subtotal * fallbackPct) / 100);
        const cap = coupon.max_discount_amount
          ? Number(coupon.max_discount_amount)
          : 0;
        return cap > 0 ? Math.min(raw, cap) : raw;
      }
      return 0;
    }

    case PromotionType.FIXED_AMOUNT: {
      // Primary: use discount_config.value
      if (config && isFixed(config)) {
        return Math.min(config.value, subtotal);
      }
      // Fallback: use discount_value field directly (flat amount)
      const fallbackAmt = Number(coupon.discount_value ?? 0);
      return fallbackAmt > 0 ? Math.min(fallbackAmt, subtotal) : 0;
    }

    case PromotionType.BUY_X_GET_Y: {
      if (!config || !isBuyXGetY(config)) return 0;
      // Discount applied server-side per line item
      return 0;
    }

    case PromotionType.FREE_SHIPPING: {
      // Shipping discount is handled separately in the delivery variable.
      return 0;
    }

    case PromotionType.TIERED_DISCOUNT: {
      if (!config || !isTiered(config)) return 0;
      const activeTier = [...config.tiers]
        .sort((a, b) => b.min_cart - a.min_cart)
        .find((tier) => subtotal >= tier.min_cart);
      if (!activeTier) return 0;
      return Math.floor((subtotal * activeTier.percent) / 100);
    }

    case PromotionType.BUNDLE_DEAL: {
      if (!config || !isBundle(config)) return 0;
      return Math.max(0, subtotal - config.bundle_price);
    }

    default:
      return 0;
  }
}
export const toDatetimeLocal = (val: string) => {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  } catch {
    return "";
  }
};
// utils/categoryTree.ts (new)
export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const byParent = new Map<string | null, Category[]>();
  categories.forEach((c) => {
    const key = c.parent_id ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  });
  const build = (parentId: string | null, depth: number): CategoryTreeNode[] =>
    (byParent.get(parentId) ?? []).map((c) => ({
      ...c,
      depth,
      children: build(c.id, depth + 1),
    }));
  return build(null, 0);
}

export function countNodes(nodes: CategoryTreeNode[]): number {
  return nodes.reduce((acc, n) => acc + 1 + countNodes(n.children), 0);
}

export function getCategoryBadge(node: CategoryTreeNode) {
  const hasChildren = node.children.length > 0;
  const isRoot = !node.parent_id;
  if (isRoot && !hasChildren)
    return { label: "Standalone", tone: "amber" } as const;
  if (hasChildren) return { label: "Parent", tone: "green" } as const;
  return { label: "Subcategory", tone: "purple" } as const;
}
