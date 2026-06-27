"use client";

import { useMemo } from "react";
import {
  checkAllEligibility,
  GuardOrderItem,
  EligibilityResult,
} from "@/utils/orderEligibilityGuard";

/**
 * useOrderEligibilityGuard
 *
 * React hook that computes all four operation eligibilities for a single
 * order item.  Results are memoized — they only recompute when the item
 * reference changes (e.g. after a status refresh).
 *
 * Usage:
 *   const { canReturn, canCancel } = useOrderEligibilityGuard(item);
 *   <Button disabled={!canReturn.eligible} title={canReturn.reason ?? ""}>
 *     Request Return
 *   </Button>
 *
 * @param item  The order item to evaluate. Pass null/undefined while loading.
 */
export function useOrderEligibilityGuard(item: GuardOrderItem | null | undefined): {
  canReturn: EligibilityResult;
  canReplace: EligibilityResult;
  canExchange: EligibilityResult;
  canCancel: EligibilityResult;
  /** True when any of the four operations is currently eligible */
  hasAnyAction: boolean;
} {
  const result = useMemo(() => {
    if (!item) {
      // Neutral defaults while loading — nothing shown, nothing blocked
      const notEligible: EligibilityResult = {
        eligible: false,
        reason: null,
        code: "ELIGIBLE" as never,
      };
      return {
        canReturn: notEligible,
        canReplace: notEligible,
        canExchange: notEligible,
        canCancel: notEligible,
        hasAnyAction: false,
      };
    }

    const { canReturn, canReplace, canExchange, canCancel } =
      checkAllEligibility(item);

    return {
      canReturn,
      canReplace,
      canExchange,
      canCancel,
      hasAnyAction:
        canReturn.eligible ||
        canReplace.eligible ||
        canExchange.eligible ||
        canCancel.eligible,
    };
  }, [item]);

  return result;
}
