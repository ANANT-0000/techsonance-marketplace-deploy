import { useOrderEligibilityGuard } from "@/hooks/useOrderEligibilityGuard";
import { GuardOrderItem } from "@/utils/orderEligibilityGuard";

import { Button } from "../ui/button";
import { Ban, RefreshCw, RotateCcw } from "lucide-react";
import { normalizeStatus } from "@/lib/utils";
import { ORDER_DETAILS_TEXT } from "@/constants/customerText";

/**
 * Renders action buttons (Cancel, Return, Replace) for a specific guard order item
 * based on eligibility logic and order status.
 *
 * Displays buttons only if at least one action is available. Each button is conditionally
 * rendered and enabled based on the result from `useOrderEligibilityGuard` or the current
 * order status (e.g., allowing Return/Replace when status is "delivered").
 *
 * Visual styling changes based on eligibility:
 * - **Eligible**: Fully styled with color-coded borders/hover effects (destructive for Cancel,
 *   emerald for Return, blue for Replace).
 * - **Not Eligible**: Muted styling, `cursor-not-allowed`, and `disabled` attribute.
 * @param {GuardOrderItem} props.guardItem - The order item to evaluate and render actions for.
 * @param {() => void} props.onCancel - Callback triggered when the item is cancelled.
 * @param {() => void} props.onReturn - Callback triggered when the item is returned.
 * @param {() => void} props.onReplace - Callback triggered when the item is replaced.
 * @returns A div containing action buttons, or null if no actions are available
 */
export function ItemActionButtons({
  guardItem,
  onCancel,
  onReturn,
  onReplace,
}: {
  guardItem: GuardOrderItem;
  onCancel: () => void;
  onReturn: () => void;
  onReplace: () => void;
}) {
  const { canCancel, canReturn, canReplace, hasAnyAction } =
    useOrderEligibilityGuard(guardItem);
  const status = normalizeStatus(guardItem.order_status);

  if (
    !hasAnyAction &&
    !canCancel.eligible &&
    !canReturn.eligible &&
    !canReplace.eligible
  ) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-start gap-1.5 mt-0.5 w-full">
      {(canCancel.eligible || ["pending", "processing"].includes(status)) && (
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!canCancel.eligible}
            onClick={canCancel.eligible ? onCancel : undefined}
            className={`h-7 text-[10px] font-bold px-2.5 rounded-md transition-all ${
              canCancel.eligible
                ? "text-destructive border-destructive/30 hover:bg-destructive/10"
                : "text-muted-foreground border-border/40 cursor-not-allowed opacity-50"
            }`}
            title={canCancel.reason ?? "Cancel this item"}
          >
            <Ban size={10} className="mr-1" />
            {ORDER_DETAILS_TEXT.CANCEL}
          </Button>
        </div>
      )}

      {(canReturn.eligible || status === "delivered") && (
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!canReturn.eligible}
            onClick={canReturn.eligible ? onReturn : undefined}
            className={`h-7 text-[10px] font-bold px-2.5 rounded-md transition-all ${
              canReturn.eligible
                ? "text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                : "text-muted-foreground border-border/40 cursor-not-allowed opacity-50"
            }`}
            title={canReturn.reason ?? "Return this item"}
          >
            <RotateCcw size={10} className="mr-1" />
            {ORDER_DETAILS_TEXT.RETURN}
          </Button>
        </div>
      )}

      {(canReplace.eligible || status === "delivered") && (
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!canReplace.eligible}
            onClick={canReplace.eligible ? onReplace : undefined}
            className={`h-7 text-[10px] font-bold px-2.5 rounded-md transition-all ${
              canReplace.eligible
                ? "text-blue-600 border-blue-400/30 hover:bg-blue-500/10"
                : "text-muted-foreground border-border/40 cursor-not-allowed opacity-50"
            }`}
            title={canReplace.reason ?? "Request a replacement"}
          >
            <RefreshCw size={10} className="mr-1" />
            {ORDER_DETAILS_TEXT.REPLACE}
          </Button>
        </div>
      )}
    </div>
  );
}
