"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AxiosAPI from "@/lib/axios";
import { useAppSelector } from "@/hooks/reduxHooks";

// ─── Types (mirrors feature_usage joined with plan_feature_limits) ────────────

/**
 * A single feature quota snapshot returned by GET /v1/entitlements/usage.
 * Matches the shape produced by EntitlementResolver + UsageTrackerService.
 */
export interface FeatureUsageItem {
  /** Internal UUID of the feature_definitions row. */
  feature_id: string;
  /** Human-readable snake_case key, e.g. "product_listings". */
  feature_key: string;
  /** Number of quota units consumed in the current window. */
  used: number;
  /**
   * The configured cap for this plan/feature.
   * null means the feature is unlimited (is_unlimited = true).
   */
  limit: number | null;
  /** True when plan_feature_limits.is_unlimited = true. */
  is_unlimited: boolean;
  /** True when plan_feature_limits.is_enabled = true. */
  is_enabled: boolean;
  /**
   * ISO timestamp of when the current counting window resets.
   * null for features without a reset interval (lifetime counters).
   */
  window_reset_at: string | null;
  /** The reset cadence configured for this feature. */
  reset_interval: "hourly" | "daily" | "monthly" | "billing_cycle" | null;
}

/**
 * The shape returned by useEntitlements.
 *
 * Pattern mirrors useOrderEligibilityGuard — callers get typed helpers
 * rather than raw arrays, so pages stay declarative.
 */
export interface EntitlementsState {
  /**
   * Whether quota data has been fetched at least once.
   * Use this to drive skeleton states rather than isLoading alone,
   * because the hook auto-refreshes silently after the first load.
   */
  isReady: boolean;
  /** True only during the very first fetch (no data yet). */
  isLoading: boolean;
  /** Non-null when the last fetch failed. */
  error: string | null;
  /** Raw snapshot of all feature usage rows. */
  items: FeatureUsageItem[];

  /**
   * Returns true when the vendor is allowed to perform an action
   * gated by featureKey.
   *
   * Rules:
   *  - Feature not found in snapshot: true (fail-open so UI never
   *    blocks if the backend has not configured the limit yet).
   *  - is_enabled = false: false (admin disabled this feature).
   *  - is_unlimited = true: true (no cap).
   *  - used < limit: true.
   *  - used >= limit: false (quota exhausted).
   *
   * @param featureKey  e.g. "product_listings", "api_calls"
   */
  isAllowed: (featureKey: string) => boolean;

  /**
   * Returns the raw usage item for a feature, or null if not found.
   * Useful when you need more than a boolean (e.g. to render a progress bar).
   */
  getUsage: (featureKey: string) => FeatureUsageItem | null;

  /**
   * Returns consumption as a 0-100 percentage.
   * Returns 0 for unlimited features, 100 for exhausted features.
   */
  getPercent: (featureKey: string) => number;

  /**
   * Trigger an explicit refresh (e.g. after the vendor creates a product).
   * The hook also auto-refreshes every staleSecs seconds.
   */
  refresh: () => Promise<void>;
}

// ─── Module-level SWR cache ───────────────────────────────────────────────────
// Shared across all hook instances on the same page so sibling components
// do not each fire their own fetch.

interface CacheEntry {
  data: FeatureUsageItem[];
  fetchedAt: number; // Date.now()
}

// Scoped by vendor ID so account switches don't reuse the wrong snapshot
let _cache: Record<string, CacheEntry> = {};
let _inflight: Record<string, Promise<FeatureUsageItem[]>> = {};

// Subscriber mechanism to notify all mounted hooks of an invalidation
const _subscribers = new Set<() => void>();

const DEFAULT_STALE_SECS = 30;

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useEntitlements
 *
 * Fetches the signed-in vendor's live quota snapshot and exposes helpers for
 * gating UI elements.  Designed to be dropped into any vendor-facing page or
 * component without prop-drilling.
 *
 * The hook uses a module-level 30-second stale-while-revalidate cache so
 * multiple components on the same page share one HTTP request.
 *
 * @example
 * ```tsx
 * const { isAllowed, getUsage, isReady } = useEntitlements();
 *
 * // Disable the button when the listing quota is full
 * <Button disabled={!isAllowed("product_listings")}>
 *   Add Product
 * </Button>
 *
 * // Render a progress bar for API calls
 * const usage = getUsage("api_calls");
 * ```
 *
 * @param staleSecs  How long (seconds) cached data is considered fresh.
 *                   Defaults to 30. Pass 0 to always re-fetch.
 */
export function useEntitlements(
  staleSecs = DEFAULT_STALE_SECS,
): EntitlementsState {
  const user = useAppSelector((state: any) => state.auth.user);
  const vendorId = user && "vendor_id" in user ? user.vendor_id : user?.id || "anonymous";

  const [items, setItems] = useState<FeatureUsageItem[]>(_cache[vendorId]?.data ?? []);
  const [isLoading, setIsLoading] = useState(!_cache[vendorId]);
  const [isReady, setIsReady] = useState(!!_cache[vendorId]);
  const [error, setError] = useState<string | null>(null);

  // Keep a stable ref to staleSecs so the effect closure sees the latest value
  const staleSecsRef = useRef(staleSecs);
  staleSecsRef.current = staleSecs;

  const fetchUsage = useCallback(async () => {
    const now = Date.now();
    const staleMs = staleSecsRef.current * 1000;
    const activeCache = _cache[vendorId];

    // Fresh cache hit — no spinner, instant render
    if (activeCache && now - activeCache.fetchedAt < staleMs) {
      setItems(activeCache.data);
      setError(null);
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    // Deduplicate concurrent in-flight requests
    if (!_inflight[vendorId]) {
      _inflight[vendorId] = AxiosAPI.get<{ data: FeatureUsageItem[] }>(
        "/v1/entitlements/usage",
        // Suppress the global toast — quota failures are handled locally
        { headers: { "x-suppress-toast": "true" } },
      )
        .then((res) => {
          const data: FeatureUsageItem[] = Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          _cache[vendorId] = { data, fetchedAt: Date.now() };
          return data;
        })
        .finally(() => {
          delete _inflight[vendorId];
        });
    }

    try {
      const data = await _inflight[vendorId]!;
      setItems(data);
      setError(null);
    } catch (err: any) {
      // Keep stale data visible — only surface error if we have nothing yet
      if (!_cache[vendorId]) {
        setError(
          err?.response?.data?.message ?? "Failed to load entitlement data.",
        );
      }
    } finally {
      setIsLoading(false);
      setIsReady(true);
    }
  }, [vendorId]);

  // Initial load + auto-refresh interval + invalidation subscription
  useEffect(() => {
    fetchUsage();

    const onInvalidate = () => {
      // Background refresh immediately when invalidated
      fetchUsage();
    };
    _subscribers.add(onInvalidate);

    let interval: NodeJS.Timeout | undefined;
    if (staleSecs > 0) {
      interval = setInterval(() => {
        // Skip re-fetch when the tab is hidden — saves battery and bandwidth
        if (document.visibilityState === "visible") {
          fetchUsage();
        }
      }, staleSecs * 1000);
    }

    return () => {
      _subscribers.delete(onInvalidate);
      if (interval) clearInterval(interval);
    };
  }, [fetchUsage, staleSecs]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Looks up a feature by key. Returns null for unconfigured features (fail-open). */
  const find = useCallback(
    (featureKey: string): FeatureUsageItem | null =>
      items.find((i) => i.feature_key === featureKey) ?? null,
    [items],
  );

  const isAllowed = useCallback(
    (featureKey: string): boolean => {
      const item = find(featureKey);
      if (!item) return true; // Not configured: fail-open
      if (!item.is_enabled) return false; // Admin disabled this feature
      if (item.is_unlimited) return true; // Unlimited plan
      return item.limit !== null && item.used < item.limit;
    },
    [find],
  );

  const getUsage = useCallback(
    (featureKey: string): FeatureUsageItem | null => find(featureKey),
    [find],
  );

  const getPercent = useCallback(
    (featureKey: string): number => {
      const item = find(featureKey);
      if (!item || item.is_unlimited || item.limit === null) return 0;
      if (item.limit === 0) return 100;
      return Math.min(100, Math.round((item.used / item.limit) * 100));
    },
    [find],
  );

  const refresh = useCallback(async () => {
    delete _cache[vendorId]; // Bust cache before re-fetching
    setIsLoading(true);
    await fetchUsage();
  }, [fetchUsage, vendorId]);

  return {
    isReady,
    isLoading,
    error,
    items,
    isAllowed,
    getUsage,
    getPercent,
    refresh,
  };
}

/**
 * invalidateEntitlements
 *
 * Busts the module-level entitlement cache.
 *
 * Call this from any mutation handler (e.g. after creating a product) so
 * the next render of any component using useEntitlements immediately
 * fetches fresh data rather than waiting for the stale window to expire.
 * This also triggers an immediate background refresh on all mounted consumers.
 *
 * @example
 * ```ts
 * await AxiosAPI.post("/v1/products", payload);
 * invalidateEntitlements(); // triggers fresh quota fetch immediately
 * ```
 */
export function invalidateEntitlements(vendorId?: string): void {
  if (vendorId) {
    delete _cache[vendorId];
  } else {
    _cache = {};
  }
  _subscribers.forEach((notify) => notify());
}
