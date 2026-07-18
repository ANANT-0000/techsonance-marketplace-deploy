"use client";

import React from "react";
import { Lock, TrendingUp, AlertTriangle } from "lucide-react";
import { useEntitlements, FeatureUsageItem } from "@/hooks/useEntitlements";

// ─── QuotaBadge ───────────────────────────────────────────────────────────────

interface QuotaBadgeProps {
  /** The feature_key to display usage for (e.g. "product_listings"). */
  featureKey: string;
  /**
   * When true, renders an inline compact badge suitable for table cells or
   * card headers.  When false (default) renders a full-width progress row.
   */
  compact?: boolean;
  className?: string;
}

/**
 * QuotaBadge
 *
 * Displays live quota consumption for a single feature.
 * Reads from the same useEntitlements cache as QuotaGate — no extra fetch.
 *
 * @example
 * ```tsx
 * // Full-width usage bar under a section header
 * <QuotaBadge featureKey="product_listings" />
 *
 * // Inline compact badge in a table row
 * <QuotaBadge featureKey="api_calls" compact />
 * ```
 */
export function QuotaBadge({ featureKey, compact = false, className = "" }: QuotaBadgeProps) {
  const { getUsage, getPercent, isReady } = useEntitlements();

  if (!isReady) return null;

  const item: FeatureUsageItem | null = getUsage(featureKey);
  if (!item || !item.is_enabled) return null;

  const pct = getPercent(featureKey);
  const exhausted = !item.is_unlimited && item.limit !== null && item.used >= item.limit;
  const nearLimit = !exhausted && pct >= 80;

  const barColor = exhausted
    ? "bg-red-500"
    : nearLimit
      ? "bg-amber-400"
      : "bg-blue-500";

  const label = item.feature_key.replace(/_/g, " ");
  const usageText = item.is_unlimited
    ? "Unlimited"
    : `${item.used} / ${item.limit}`;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
          exhausted
            ? "bg-red-50 text-red-700 border-red-200"
            : nearLimit
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-slate-50 text-slate-600 border-slate-200"
        } ${className}`}
        title={`${label}: ${usageText}`}
      >
        {exhausted && <Lock className="h-2.5 w-2.5" />}
        {nearLimit && !exhausted && <AlertTriangle className="h-2.5 w-2.5" />}
        {usageText}
      </span>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-slate-600 capitalize">{label}</span>
        <span className="text-xs text-slate-400">{usageText}</span>
      </div>
      {!item.is_unlimited && (
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── QuotaGate ────────────────────────────────────────────────────────────────

interface QuotaGateProps {
  /**
   * The feature_key to guard (e.g. "product_listings").
   * Must match a row in feature_definitions.feature_key.
   */
  featureKey: string;
  /** Content shown when the vendor IS allowed to use this feature. */
  children: React.ReactNode | ((isAllowed: boolean) => React.ReactNode);
  /**
   * Optional custom fallback rendered when the quota is exhausted.
   * Defaults to the built-in UpgradePrompt banner.
   */
  fallback?: React.ReactNode;
  /**
   * When true, always renders children but passes isAllowed as a prop
   * via render-prop pattern.  Use this when you want to disable a button
   * rather than hide content entirely.
   *
   * Ignored when a custom fallback is provided.
   */
  renderDisabled?: boolean;
}

/**
 * QuotaGate
 *
 * Wraps any vendor UI element and conditionally renders it based on whether
 * the vendor's quota for featureKey is not exhausted.
 *
 * Behavior:
 * - While quota data is loading → renders children (optimistic, avoids flash)
 * - Feature not configured in backend → renders children (fail-open)
 * - Quota exhausted OR feature disabled by admin → renders fallback
 * - Quota available → renders children
 *
 * @example
 * ```tsx
 * // Hide the entire "Add Product" section when the quota is full
 * <QuotaGate featureKey="product_listings">
 *   <AddProductButton />
 * </QuotaGate>
 *
 * // Show a custom upgrade CTA instead of the default banner
 * <QuotaGate
 *   featureKey="product_listings"
 *   fallback={<Link href="/vendor/billing">Upgrade to add more</Link>}
 * >
 *   <AddProductButton />
 * </QuotaGate>
 * ```
 */
export function QuotaGate({
  featureKey,
  children,
  fallback,
  renderDisabled = false,
}: QuotaGateProps) {
  const { isAllowed, isReady, getUsage } = useEntitlements();

  const renderChildren = (allowed: boolean) => 
    typeof children === "function" ? children(allowed) : children;

  // Optimistic while loading — never flash-block the vendor
  if (!isReady) return <>{renderChildren(true)}</>;

  const allowed = isAllowed(featureKey);

  if (allowed) return <>{renderChildren(true)}</>;

  if (renderDisabled) {
    // Pass isAllowed=false via render prop and enforce non-interactive wrapper
    return (
      <div 
        data-quota-gate="blocked" 
        data-feature={featureKey}
        className="pointer-events-none opacity-50 cursor-not-allowed inline-block"
        onClickCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {renderChildren(false)}
      </div>
    );
  }

  // Show custom fallback or the default upgrade prompt
  return <>{fallback ?? <QuotaExhaustedBanner featureKey={featureKey} usage={getUsage(featureKey)} />}</>;
}

// ─── QuotaExhaustedBanner ─────────────────────────────────────────────────────

interface BannerProps {
  featureKey: string;
  usage: FeatureUsageItem | null;
}

/**
 * Default fallback banner shown by QuotaGate when a quota is exhausted.
 * Styled consistently with the TrialBanner (amber/red palette, border-b strip).
 */
function QuotaExhaustedBanner({ featureKey, usage }: BannerProps) {
  const featureLabel = featureKey.replace(/_/g, " ");
  const isDisabled = usage && !usage.is_enabled;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
      <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100">
        {isDisabled ? (
          <Lock className="h-4 w-4 text-amber-700" />
        ) : (
          <TrendingUp className="h-4 w-4 text-amber-700" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-900 text-sm capitalize">
          {isDisabled ? `${featureLabel} is unavailable on your plan` : `${featureLabel} quota reached`}
        </p>
        <p className="text-amber-700 text-xs mt-0.5">
          {isDisabled
            ? "This feature is not included in your current subscription."
            : usage
              ? `You have used ${usage.used} of ${usage.limit} allowed. Upgrade to get more.`
              : "You have reached the limit for this feature. Upgrade to continue."}
        </p>
      </div>
      <a
        href="/vendor/settings/billing"
        className="shrink-0 rounded-xl bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900 transition-colors"
      >
        Upgrade
      </a>
    </div>
  );
}

// ─── QuotaUsagePanel ──────────────────────────────────────────────────────────

interface UsagePanelProps {
  /** Optional list of feature keys to show. Shows all if omitted. */
  featureKeys?: string[];
  className?: string;
}

/**
 * QuotaUsagePanel
 *
 * Renders a compact list of all (or selected) feature usage bars.
 * Useful in vendor dashboard overviews or settings pages.
 *
 * @example
 * ```tsx
 * // Show only listing and API call quotas
 * <QuotaUsagePanel featureKeys={["product_listings", "api_calls"]} />
 * ```
 */
export function QuotaUsagePanel({ featureKeys, className = "" }: UsagePanelProps) {
  const { items, isReady, isLoading } = useEntitlements();

  if (isLoading && !isReady) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-3 bg-slate-100 rounded-sm w-1/3 mb-1.5" />
            <div className="h-1.5 bg-slate-100 rounded-full w-full" />
          </div>
        ))}
      </div>
    );
  }

  const visible = featureKeys
    ? items.filter((i) => featureKeys.includes(i.feature_key) && i.is_enabled)
    : items.filter((i) => i.is_enabled);

  if (visible.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {visible.map((item) => (
        <QuotaBadge key={item.feature_key} featureKey={item.feature_key} />
      ))}
    </div>
  );
}
