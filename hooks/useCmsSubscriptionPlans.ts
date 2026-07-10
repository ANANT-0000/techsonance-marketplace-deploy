"use client";

import { useCallback, useEffect, useState } from "react";
import AxiosAPI from "@/lib/axios";
import { toast } from "sonner";
import { z } from "zod";
import { FeatureType, PlanStatus, PriceInterval } from "@/utils/Types";

// ─── Types (mirrors cms_plans / cms_plan_prices / cms_plan_features) ────────
// NOTE: the old SubscriptionPlanManager.tsx read `p.amount_cents` and divided
// by a hardcoded 100. The actual schema field is `amount_minor_units`, and the
// schema explicitly warns not every currency has 2 decimal places (JPY = 0,
// BHD = 3). This hook fixes that — see formatMinorUnits/majorToMinorUnits.

export interface CmsPlanPrice {
  id?: string;
  currency: string;
  interval: PriceInterval;
  interval_count: number | null;
  amount_minor_units: number;
  currency_exponent: number;
  gateway_price_id?: string | null;
  sync_status?: string;
}

export interface CmsPlanFeature {
  id?: string;
  feature_key: string;
  type: FeatureType;
  value: string;
}

export interface CmsPlanRow {
  id?: string;
  plan_key: string;
  status: PlanStatus;
  version: number;
  prices: CmsPlanPrice[];
  features: CmsPlanFeature[];
  description?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ─── Validation ──────────────────────────────────────────────────────────
const priceSchema = z.object({
  currency: z
    .string()
    .length(3, "Use a 3-letter ISO code, e.g. INR")
    .toUpperCase(),
  interval: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
  interval_count: z.number().int().positive().nullable(),
  amount_minor_units: z.number().int().min(0, "Amount can't be negative"),
  currency_exponent: z.number().int().min(0).max(4),
});

const featureSchema = z
  .object({
    feature_key: z.string().min(1, "Feature key is required"),
    type: z.enum(["boolean", "number", "text"]),
    value: z.string(),
  })
  .superRefine((f, ctx) => {
    if (
      f.type === "number" &&
      (f.value.trim() === "" || Number.isNaN(Number(f.value)))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must be a number",
        path: ["value"],
      });
    }
    if (f.type === "boolean" && !["true", "false"].includes(f.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must be true or false",
        path: ["value"],
      });
    }
    if (f.type === "text" && f.value.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Value can't be empty",
        path: ["value"],
      });
    }
  });

export const planDraftSchema = z.object({
  plan_key: z.string().min(1),
  description: z.string().optional().nullable(),
  prices: z.array(priceSchema).min(1, "Add at least one price"),
  features: z.array(featureSchema),
});

export type ValidationErrors = Record<string, string>;

export function validatePlanDraft(plan: CmsPlanRow): ValidationErrors {
  const result = planDraftSchema.safeParse(plan);
  const errors: ValidationErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors[issue.path.join(".")] = issue.message;
    }
  }
  return errors;
}

// ─── Money helpers — respect currency_exponent, never assume "cents" ────────
export function formatMinorUnits(
  amount: number,
  exponent: number,
  currency: string,
) {
  const major = amount / 10 ** exponent;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(major);
  } catch {
    return major.toFixed(exponent);
  }
}

export function majorToMinorUnits(major: number, exponent: number) {
  return Math.round(major * 10 ** exponent);
}

export function emptyPlanDraft(planKey: string): CmsPlanRow {
  return {
    plan_key: planKey,
    status: PlanStatus.DRAFT,
    version: 1,
    prices: [
      {
        currency: "INR",
        interval: PriceInterval.MONTHLY,
        interval_count: null,
        amount_minor_units: 0,
        currency_exponent: 2,
      },
      {
        currency: "INR",
        interval: PriceInterval.YEARLY,
        interval_count: null,
        amount_minor_units: 0,
        currency_exponent: 2,
      },
    ],
    features: [],
  };
}

// ─── Data fetching / mutations ───────────────────────────────────────────

// IMPORTANT: GET /v1/admin/subscription-plans has no page/limit/sort query
// params today, so there is no server-side pagination or sorting to hook
// into — this fetches the full list once and the grid sorts/paginates it
// client-side (fine at plan-catalog scale — tens of rows, not thousands).
// If the catalog grows large enough to need real server-side paging, the
// endpoint needs `?page=&limit=&sortBy=` support added first; swapping this
// hook to use it is a small change (pass those params through and stop
// slicing client-side).
type AsyncStatus = "idle" | "loading" | "success" | "error";

export function useCmsSubscriptionPlans() {
  const [plans, setPlans] = useState<CmsPlanRow[]>([]);
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());

  const fetchPlans = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const res = await AxiosAPI.get("/v1/admin/subscription-plans");
      const rows: CmsPlanRow[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setPlans(rows);
      setStatus("success");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Couldn't load subscription plans.";
      setError(message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const setSaving = (key: string, on: boolean) =>
    setSavingKeys((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });

  const saveDraft = useCallback(
    async (plan: CmsPlanRow) => {
      const errors = validatePlanDraft(plan);
      if (Object.keys(errors).length > 0) {
        toast.error("Fix the highlighted fields before saving.");
        return { ok: false, errors };
      }
      setSaving(plan.plan_key, true);
      try {
        await AxiosAPI.put(
          `/v1/admin/subscription-plans/${plan.plan_key}/draft`,
          {
            planKey: plan.plan_key,
            description: plan.description ?? null,
            version: plan.version,
            prices: plan.prices.map((p) => ({
              currency: p.currency,
              interval: p.interval,
              interval_count: p.interval_count,
              amount_minor_units: p.amount_minor_units,
              currency_exponent: p.currency_exponent,
            })),
            features: plan.features.map((f) => ({
              feature_key: f.feature_key,
              type: f.type,
              value: f.value,
            })),
          },
          {
            headers: {
              "x-suppress-redirect": "true",
            },
          }
        );
        toast.success(`Draft saved for "${plan.plan_key}".`);
        await fetchPlans();
        return { ok: true, errors: {} as ValidationErrors };
      } catch (err: any) {
        // 409 = optimistic-concurrency conflict on `version` — someone else
        // saved first. Reload rather than silently overwrite their change.
        if (err?.response?.status === 409) {
          toast.error(
            `"${plan.plan_key}" was changed elsewhere — reloading the latest version.`,
          );
          await fetchPlans();
        } else {
          toast.error(err?.response?.data?.message || "Failed to save draft.");
        }
        return { ok: false, errors: {} as ValidationErrors };
      } finally {
        setSaving(plan.plan_key, false);
      }
    },
    [fetchPlans],
  );

  const publish = useCallback(
    async (planKey: string) => {
      setSaving(planKey, true);
      try {
        await AxiosAPI.post(`/v1/admin/subscription-plans/${planKey}/publish`);
        toast.success(`"${planKey}" published live.`);
        await fetchPlans();
        return true;
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to publish plan.");
        return false;
      } finally {
        setSaving(planKey, false);
      }
    },
    [fetchPlans],
  );

  const unpublish = useCallback(
    async (planKey: string) => {
      setSaving(planKey, true);
      try {
        await AxiosAPI.post(`/v1/admin/subscription-plans/${planKey}/unpublish`);
        toast.success(`"${planKey}" unpublished successfully.`);
        await fetchPlans();
        return true;
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to unpublish plan.");
        return false;
      } finally {
        setSaving(planKey, false);
      }
    },
    [fetchPlans],
  );

  const createPlan = useCallback(
    async (planKey: string) => {
      const key = planKey.trim().toLowerCase().replace(/\s+/g, "-");
      if (!key) {
        toast.error("Enter a plan key first.");
        return { ok: false, errors: {} as ValidationErrors };
      }
      if (plans.some((p) => p.plan_key === key)) {
        toast.error(`"${key}" already exists.`);
        return { ok: false, errors: {} as ValidationErrors };
      }
      setSaving(key, true);
      try {
        await AxiosAPI.post("/v1/admin/subscription-plans", { planKey: key });
        toast.success(`Plan template "${key}" created successfully.`);
        await fetchPlans();
        return { ok: true, errors: {} as ValidationErrors };
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to create plan template.");
        return { ok: false, errors: {} as ValidationErrors };
      } finally {
        setSaving(key, false);
      }
    },
    [plans, fetchPlans],
  );

  return {
    plans,
    status,
    error,
    isLoading: status === "loading",
    isSaving: (key: string) => savingKeys.has(key),
    refetch: fetchPlans,
    saveDraft,
    publish,
    unpublish,
    createPlan,
  };
}
