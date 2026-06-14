import { UiText } from "@/constants/ui-text";
import { OrderStatus, OrderStatusEnum } from "@/utils/Types";
import React from "react";
import { STATUS_CONFIG } from "@/constants/ui-labels";

// ─── Status Badge ─────────────────────────────────────────────────────────────

export function StatusBadge({
  status,
  uiText,
}: {
  status: OrderStatus;
  uiText?: Record<string, string>;
}) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[OrderStatusEnum.PENDING];
  const displayLabel =
    (uiText ?? UiText.ORDER_DETAILS.STATUS_LABELS)[
      status.toUpperCase() as keyof typeof UiText.ORDER_DETAILS.STATUS_LABELS
    ] ?? cfg?.label;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-theme-caption font-medium px-2.5 py-1 rounded-full ${cfg?.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot}`} />
      {displayLabel}
    </span>
  );
}
