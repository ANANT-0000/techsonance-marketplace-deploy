/**
 * orderEligibilityGuard.ts
 *
 * Pure, framework-agnostic utility for computing order operation eligibility
 * on the frontend.  No API calls, no React — just deterministic computation
 * from the order item snapshot already returned by the API.
 *
 * Mirror of the backend OrderEligibilityGuardService rules.
 * When the backend rules change, keep this in sync.
 */

import { OrderStatus } from "./Types";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Machine-readable reason codes — mirror GuardErrorCode on the backend */
export enum GuardErrorCode {
  ITEM_NOT_DELIVERED = "ITEM_NOT_DELIVERED",
  ITEM_NOT_CANCELLABLE_STATUS = "ITEM_NOT_CANCELLABLE_STATUS",
  FINAL_SALE_BLOCKED = "FINAL_SALE_BLOCKED",
  RETURN_NOT_ALLOWED = "RETURN_NOT_ALLOWED",
  REPLACEMENT_NOT_ALLOWED = "REPLACEMENT_NOT_ALLOWED",
  EXCHANGE_NOT_ALLOWED = "EXCHANGE_NOT_ALLOWED",
  RETURN_WINDOW_EXPIRED = "RETURN_WINDOW_EXPIRED",
  REPLACEMENT_WINDOW_EXPIRED = "REPLACEMENT_WINDOW_EXPIRED",
  DUPLICATE_REQUEST = "DUPLICATE_REQUEST",
  ELIGIBLE = "ELIGIBLE",
}

/** Result returned by every check function */
export interface EligibilityResult {
  /** True when the operation is allowed */
  eligible: boolean;
  /**
   * Human-readable explanation shown directly in the UI.
   * Null when eligible = true.
   */
  reason: string | null;
  /** Machine-readable code for conditional rendering / analytics */
  code: GuardErrorCode;
}

/**
 * Minimal policy snapshot needed by the guard.
 * Sourced from order_item.order_item_policy.policy_snapshot (JSONB).
 */
export interface ItemPolicySnapshot {
  policy_type: string; // 'warranty' | 'no_return' | 'none' | ...
  is_returnable: boolean;
  is_replaceable: boolean;
  return_window_days: number | null;
  replacement_window_days: number | null;
  return_replace_mode: "none" | "return_only" | "replace_only" | "both";
}

/**
 * The order item shape expected by all check functions.
 * The `policy` field is the snapshot from order_item_policy — null for
 * legacy orders that pre-date the policy system.
 */
export interface GuardOrderItem {
  id: string;
  order_status: OrderStatus;
  /** ISO string — the order placement date (used as fallback reference) */
  created_at: string;
  /**
   * ISO string — the delivery date if tracked separately.
   * If null, created_at is used as the reference for time-window checks.
   */
  delivered_at?: string | null;
  /**
   * Existing return/replacement request (null = none open).
   * If set, post-delivery operations are blocked to prevent duplicates.
   */
  return_request?: { id: string; status: string } | null;
  /** Policy snapshot attached to this order item */
  policy?: ItemPolicySnapshot | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Policy types that put a product into Final Sale — SET constraint */
const FINAL_SALE_POLICY_TYPES = new Set(["no_return", "none"]);

const CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
];

const DELIVERED_STATUS: OrderStatus = OrderStatus.DELIVERED;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysSince(isoDate: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / msPerDay);
}

function isFinalSale(policy: ItemPolicySnapshot | null | undefined): boolean {
  if (!policy) return false;
  return (
    FINAL_SALE_POLICY_TYPES.has(policy.policy_type) ||
    policy.return_replace_mode === "none"
  );
}

function eligible(): EligibilityResult {
  return { eligible: true, reason: null, code: GuardErrorCode.ELIGIBLE };
}

function blocked(
  code: GuardErrorCode,
  reason: string,
): EligibilityResult {
  return { eligible: false, reason, code };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * checkReturnEligibility
 *
 * Checks whether the customer can initiate a return for this order item.
 */
export function checkReturnEligibility(
  item: GuardOrderItem,
): EligibilityResult {
  // 1. Must be delivered
  if (item.order_status !== DELIVERED_STATUS) {
    return blocked(
      GuardErrorCode.ITEM_NOT_DELIVERED,
      "Returns are only available for delivered items.",
    );
  }

  // 2. Duplicate check
  if (item.return_request) {
    return blocked(
      GuardErrorCode.DUPLICATE_REQUEST,
      "A return request already exists for this item.",
    );
  }

  const policy = item.policy;

  // 3. SET constraint — Final Sale hard block
  if (isFinalSale(policy)) {
    return blocked(
      GuardErrorCode.FINAL_SALE_BLOCKED,
      "This is a Final Sale item. Returns are not permitted.",
    );
  }

  // 4. Policy flag
  if (policy && !policy.is_returnable) {
    return blocked(
      GuardErrorCode.RETURN_NOT_ALLOWED,
      "Returns are not enabled for this product.",
    );
  }

  // 5. Time window
  if (policy?.return_window_days && policy.return_window_days > 0) {
    const ref = item.delivered_at ?? item.created_at;
    const elapsed = daysSince(ref);
    if (elapsed > policy.return_window_days) {
      return blocked(
        GuardErrorCode.RETURN_WINDOW_EXPIRED,
        `The ${policy.return_window_days}-day return window has expired (${elapsed} days since delivery).`,
      );
    }
  }

  return eligible();
}

/**
 * checkReplacementEligibility
 *
 * Checks whether the customer can request a replacement unit.
 */
export function checkReplacementEligibility(
  item: GuardOrderItem,
): EligibilityResult {
  // 1. Must be delivered
  if (item.order_status !== DELIVERED_STATUS) {
    return blocked(
      GuardErrorCode.ITEM_NOT_DELIVERED,
      "Replacements are only available for delivered items.",
    );
  }

  // 2. Duplicate check
  if (item.return_request) {
    return blocked(
      GuardErrorCode.DUPLICATE_REQUEST,
      "A replacement request already exists for this item.",
    );
  }

  const policy = item.policy;

  // 3. SET constraint
  if (isFinalSale(policy)) {
    return blocked(
      GuardErrorCode.FINAL_SALE_BLOCKED,
      "This is a Final Sale item. Replacements are not permitted.",
    );
  }

  // 4. Policy flag
  if (policy && !policy.is_replaceable) {
    return blocked(
      GuardErrorCode.REPLACEMENT_NOT_ALLOWED,
      "Replacements are not enabled for this product.",
    );
  }

  // 5. Time window
  if (
    policy?.replacement_window_days &&
    policy.replacement_window_days > 0
  ) {
    const ref = item.delivered_at ?? item.created_at;
    const elapsed = daysSince(ref);
    if (elapsed > policy.replacement_window_days) {
      return blocked(
        GuardErrorCode.REPLACEMENT_WINDOW_EXPIRED,
        `The ${policy.replacement_window_days}-day replacement window has expired (${elapsed} days since delivery).`,
      );
    }
  }

  return eligible();
}

/**
 * checkExchangeEligibility
 *
 * Exchange = Replacement at the DB level (same ReturnType).
 * Uses the same rules — differentiated only at the UI label level.
 */
export function checkExchangeEligibility(
  item: GuardOrderItem,
): EligibilityResult {
  // Delegate entirely to replacement rules
  const result = checkReplacementEligibility(item);
  // Remap the reason text to say "exchange" instead of "replacement"
  if (!result.eligible && result.reason) {
    return {
      ...result,
      reason: result.reason.replace(/replacement/gi, "exchange"),
    };
  }
  return result;
}

/**
 * checkCancellationEligibility
 *
 * Checks whether the customer can cancel this order item.
 * Purely status-driven — no policy flags required.
 */
export function checkCancellationEligibility(
  item: GuardOrderItem,
): EligibilityResult {
  if (!CANCELLABLE_STATUSES.includes(item.order_status)) {
    return blocked(
      GuardErrorCode.ITEM_NOT_CANCELLABLE_STATUS,
      `This item cannot be cancelled (status: ${item.order_status.replace(/_/g, " ")}).`,
    );
  }
  return eligible();
}

/**
 * checkAllEligibility
 *
 * Convenience — runs all four checks at once.
 * Useful for the order detail page to compute all button states in one call.
 */
export function checkAllEligibility(item: GuardOrderItem): {
  canReturn: EligibilityResult;
  canReplace: EligibilityResult;
  canExchange: EligibilityResult;
  canCancel: EligibilityResult;
} {
  return {
    canReturn: checkReturnEligibility(item),
    canReplace: checkReplacementEligibility(item),
    canExchange: checkExchangeEligibility(item),
    canCancel: checkCancellationEligibility(item),
  };
}
