import React from "react";
import { Badge } from "@/components/ui/badge";
import { CmsPlanRow, CmsPlanPrice, CmsPlanFeature } from "@/hooks/useCmsSubscriptionPlans";
import { FeatureType, PriceInterval, SubscriptionStatus, Company, SubscriptionPlan } from "@/utils/Types";

// ─── Constants: no inline literals in JSX/logic ──────────────────────────────
export const DEFAULT_CURRENCY = "INR";
export const DEFAULT_CURRENCY_EXPONENT = 2;
export const DEFAULT_AMOUNT_MINOR_UNITS = 0;
export const UNLIMITED_VALUE_RAW = "-1";
export const UNLIMITED_VALUE_DISPLAY = "Unlimited";

export const BOOLEAN_VALUE = {
  TRUE: "true",
  FALSE: "false",
} as const;

export const NUMBER_DEFAULT_VALUE = "0";
export const TEXT_DEFAULT_VALUE = "";

export const FEATURE_TYPE_DEFAULT_VALUE: Record<FeatureType, string> = {
  [FeatureType.BOOLEAN]: BOOLEAN_VALUE.FALSE,
  [FeatureType.NUMBER]: NUMBER_DEFAULT_VALUE,
  [FeatureType.TEXT]: TEXT_DEFAULT_VALUE,
};

export const DEFAULT_PRICE: CmsPlanPrice = {
  currency: DEFAULT_CURRENCY,
  interval: PriceInterval.MONTHLY,
  interval_count: null,
  amount_minor_units: DEFAULT_AMOUNT_MINOR_UNITS,
  currency_exponent: DEFAULT_CURRENCY_EXPONENT,
};

export const DEFAULT_FEATURE: CmsPlanFeature = {
  feature_key: "",
  type: FeatureType.BOOLEAN,
  value: FEATURE_TYPE_DEFAULT_VALUE[FeatureType.BOOLEAN],
};

export const STATUS_LABEL: Record<CmsPlanRow["status"], string> = {
  archived: "Archived",
  draft: "Draft",
  live: "Live",
};

export enum SYNC_STATUS {
  SYNCED = "synced",
}

export enum REORDER_KEY_PREFIX {
  PRICE = "price",
  FEATURE = "feature",
}

export enum ERROR_FIELD {
  PRICES = "prices",
  FEATURES = "features",
  CURRENCY = "currency",
  AMOUNT_MINOR_UNITS = "amount_minor_units",
  FEATURE_KEY = "feature_key",
  VALUE = "value",
}

export function getErrorKey(section: string, index: number, field: string) {
  return `${section}.${index}.${field}`;
}

// ─── Helpers for Drag-And-Drop array reordering ──────────────────────────────
export function arrayMove<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function ReorderableList<T>({
  items,
  getKey,
  onReorder,
  className,
  children,
}: {
  items: T[];
  getKey: (item: T, index: number) => string;
  onReorder: (next: T[]) => void;
  className?: string;
  children: (args: {
    item: T;
    index: number;
    isDragging: boolean;
    isDropTarget: boolean;
    dragHandleProps: {
      draggable: true;
      onDragStart: (e: React.DragEvent) => void;
      onDragEnd: (e: React.DragEvent) => void;
    };
  }) => React.ReactNode;
}) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setOverIndex(null);
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (index !== overIndex) setOverIndex(index);
  };

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      handleDragEnd();
      return;
    }
    onReorder(arrayMove(items, draggedIndex, index));
    handleDragEnd();
  };

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={getKey(item, index)}
          onDragOver={handleDragOver(index)}
          onDrop={handleDrop(index)}
        >
          {children({
            item,
            index,
            isDragging: draggedIndex === index,
            isDropTarget: overIndex === index && draggedIndex !== index,
            dragHandleProps: {
              draggable: true,
              onDragStart: handleDragStart(index),
              onDragEnd: handleDragEnd,
            },
          })}
        </div>
      ))}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function StatusBadge({ status }: { status: CmsPlanRow["status"] }) {
  const styles: Record<CmsPlanRow["status"], string> = {
    draft: "border-amber-200 bg-amber-50 text-amber-700",
    live: "border-emerald-200 bg-emerald-50 text-emerald-700",
    archived: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return (
    <Badge
      variant="outline"
      className={`${styles[status]} font-semibold px-2 py-0.5 rounded-full text-xs`}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export interface VendorSubscriptionRow {
  id: string;
  company_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  trial_starts_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  grace_period_ends_at: string | null;
  created_at: string;
  updated_at: string;
  company: Company | null;
  plan: SubscriptionPlan | null;
}

export interface PlanFeatureLimit {
  id?: string;
  feature_id: string;
  feature_key: string;
  is_enabled: boolean;
  is_unlimited: boolean;
  limit_value: number | null;
  reset_interval: "hourly" | "daily" | "monthly" | "billing_cycle" | null;
}

export interface VendorQuotaItem {
  featureKey: string;
  used: number;
  limit: number | null;
  isUnlimited: boolean;
  resetInterval: string | null;
  windowResetAt?: string | null;
}
