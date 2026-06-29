import { STATUS_UI_CONFIG } from "@/constants/customerText";
import {
  AppliedPromotion,
  BundleDealConfig,
  BuyXGetYConfig,
  Category,
  CategoryTreeNode,
  DiscountConfig,
  FixedAmountConfig,
  OrderStatus,
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
/** Formats a numeric amount into a localized currency string.
 * Handles edge cases such as invalid inputs, strings, and NaN values by returning
 * the input as a string. Defaults to Indian locale ("en-IN") if none is provided.
 * @param {number | string} amount - The numeric value to format.
 * @param {string} [locale="en-IN"] - The locale code for formatting (e.g., "en-US", "de-DE").
 * @returns {string} The formatted string representation of the amount.*/
export function formatCurrency(amount: number, locale = "en-IN"): string {
  if (typeof amount === "string" || !amount) {
    return String(amount);
  }
  if (isNaN(amount)) {
    return amount.toString();
  }
  return amount.toLocaleString(locale);
}
/** Formats a number with locale-specific separators (commas, periods, etc.).
 * Returns the value as a string if it is NaN to prevent runtime errors.
 * Defaults to Indian locale ("en-IN") if none is provided.
 * @param {number} value - The number to format.
 * @param {string} [locale="en-IN"] - The locale code for formatting.
 * @returns {string} The formatted number string.*/
export function formatNumber(value: number, locale = "en-IN"): string {
  if (isNaN(value)) {
    return value.toString();
  }
  return value.toLocaleString(locale);
}
/** Converts a snake_case or kebab-case string into Title Case.
 * Replaces underscores with spaces and capitalizes the first letter of each word.
 * Useful for displaying internal status codes or configuration keys to users.
 * @param {string} s - The raw string (e.g., "order_placed", "free_shipping").
 * @returns {string} The formatted, human-readable string (e.g., "Order Placed").*/
export const formatStructure = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Formats an ISO date string into a localized short date string.
 * @param {string} dateStr - The ISO date string (e.g., "2023-10-01T12:00:00Z").
 * @returns {string} The localized date (e.g., "10/1/2023").*/
export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString();

/** Validates if a string is a valid image URL based on file extension.
 * Checks for common image formats including jpg, jpeg, png, gif, webp, svg, and bmp.
 * Supports URLs with query parameters.
 * @param {string} url - The URL to check.
 * @returns {boolean} True if the URL points to an image, false otherwise.*/
export const isImageUrl = (url: string) =>
  /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url);

/** Validates if a string is a valid PDF URL based on file extension.
 * Checks for the .pdf extension and supports optional query parameters.
 * @param {string} url - The URL to check.
 * @returns {boolean} True if the URL points to a PDF, false otherwise.*/
export const isPdfUrl = (url: string) => /\.pdf(\?.*)?$/i.test(url);

/** Extracts the minimum cart value requirement from a coupon's rules.
 * Searches the `AppliedPromotion` rules for a `MIN_CART_VALUE` rule type and
 * retrieves the configured amount value.
 * @param {AppliedPromotion} coupon - The applied promotion object.
 * @returns {number | null} The minimum cart amount required, or null if not found.*/
export function getMinOrderAmount(coupon: AppliedPromotion): number | null {
  const minRule = coupon.rule?.find(
    (r) => r.rule_type === PromotionRuleType.MIN_CART_VALUE,
  );
  if (!minRule) return null;
  const cfg = minRule.rule_config as { amount?: number; value?: number };
  return cfg?.amount ?? cfg?.value ?? null;
}

/** Calculates the monetary discount value for a given coupon based on the subtotal.
 * Supports multiple promotion types:
 * - **Percentage**: Calculates % of subtotal, capped by `max_discount_amount` or `config.cap`.
 * - **Fixed Amount**: Returns the fixed value, capped by the subtotal.
 * - **Tiered Discount**: Finds the active tier based on subtotal and applies the tier's %.
 * - **Bundle Deal**: Returns the difference between subtotal and bundle price.
 * - **Buy X Get Y / Free Shipping**: Returns 0 (handled separately).
 * The function prioritizes `discount_config` values but falls back to `discount_value`
 * if the config object is missing or incomplete.
 * @param {AppliedPromotion | null} coupon - The coupon object containing rules and config.
 * @param {number} subtotal - The cart subtotal before discount.
 * @returns {number} The calculated discount amount.*/
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

/** Converts an ISO 8601 date string to the `datetime-local` input format (YYYY-MM-DDTHH:mm).
 * Used for populating HTML5 date/time input fields. Returns an empty string if the input
 * is invalid or null.
 * @param {string} val - The ISO date string.
 * @returns {string} The formatted datetime string or empty string.*/
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

/** Builds a hierarchical tree structure from a flat list of categories.
 * Groups categories by `parent_id` and recursively constructs child arrays.
 * Adds a `depth` property to each node to indicate its level in the hierarchy.
 * @param {Category[]} categories - The flat array of category objects.
 * @returns {CategoryTreeNode[]} The root nodes of the category tree.*/
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

/** Recursively counts the total number of nodes in a category tree.
 * Includes both parent and child nodes in the count.
 * @param {CategoryTreeNode[]} nodes - The array of root nodes to count.
 * @returns {number} The total count of nodes.*/
export function countNodes(nodes: CategoryTreeNode[]): number {
  return nodes.reduce((acc, n) => acc + 1 + countNodes(n.children), 0);
}

/** Determines the badge label and display color for a category node based on its structure.
 * Returns different labels and colors for root categories with no children,
 * parent categories with children, and leaf subcategories.
 * - Root + no children: { label: "Standalone", tone: "amber" }
 * - Has children: { label: "Parent", tone: "green" }
 * - Leaf subcategory: { label: "Subcategory", tone: "purple" }
 * @param {CategoryTreeNode} node - The category node to evaluate.
 * @returns {object} An object with `label` (string) and `tone` (string) properties.*/
export function getCategoryBadge(node: CategoryTreeNode) {
  const hasChildren = node.children.length > 0;
  const isRoot = !node.parent_id;
  if (isRoot && !hasChildren)
    return { label: "Standalone", tone: "amber" } as const;
  if (hasChildren) return { label: "Parent", tone: "green" } as const;
  return { label: "Subcategory", tone: "purple" } as const;
}
/** Normalizes an order status string to a consistent format.
 * Converts the input string to lowercase and ensures it matches one of the defined
 * OrderStatus enum values. If the input is null or empty, it defaults to
 * OrderStatus.PENDING.
 * @param {string | null | undefined} status - The status string to normalize.
 * @returns {OrderStatus} The normalized status in lowercase.*/
export const normalizeStatus = (status?: string | null): OrderStatus => {
  return (status || OrderStatus.PENDING).toLowerCase() as OrderStatus;
};
/**
 * Retrieves the UI configuration object for a given order status.
 *
 * Maps a normalized status string to a specific configuration object containing
 * the display label, description, text color, and step index for the tracking timeline.
 *
 * If the status exists in `STATUS_UI_CONFIG`, it returns the predefined configuration.
 * Otherwise, it provides a safe fallback with a human-readable label (underscores replaced by spaces),
 * a generic description, primary color, and `stepIndex` of 0.
 *
 * This function acts as the bridge between raw status data and the visual presentation layer,
 * ensuring the tracking timeline always has a valid configuration to render.
 *
 * @param {string} status - The raw order status string (e.g., "order_placed", "shipped").
 * @returns {UIConfig} An object containing `label`, `description`, `color`, and `stepIndex`.
 * @example
 * // Returns: { label: "Shipped", description: "Your order is on the way", ... }
 * getUIConfig("shipped");
 *
 * @example
 * // Returns: { label: "unknown_status", description: "Order updated.", ... } (Fallback)
 * getUIConfig("unknown_status");
 */
export const getUIConfig = (status: OrderStatus) => {
  const normStatus = normalizeStatus(status);
  return (
    STATUS_UI_CONFIG[normStatus as OrderStatus] || {
      label: normStatus.replace(/_/g, " "),
      description: "Order updated.",
      color: "text-primary",
      stepIndex: 0,
    }
  );
};
