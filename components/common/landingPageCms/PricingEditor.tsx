"use client";

import { useEffect, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Lock,
  LockOpen,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import AxiosAPI from "@/lib/axios";
import type {
  LandingPricingContent,
  LandingPricingPlanOverride,
  SubscriptionPlan,
} from "@/utils/Types";
import { useUndoableRemoval, UndoBanner } from "@/hooks/useUndoableRemoval";
import { SubscriptionPlanManager } from "./SubscriptionPlanManager";

interface PricingEditorProps {
  value: LandingPricingContent;
  onChange: (value: LandingPricingContent) => void;
}

const CONSTANTS = {
  ERROR_MSG_FETCH_PLANS:
    "Couldn't load subscription plans right now. Check the connection and retry.",
  DEFAULT_CTA_LABEL: "Get Started",
  ENTERPRISE_CTA_LABEL: "Contact Sales",
  DEFAULT_CTA_HREF: "/auth/vendorRegister",
  ENTERPRISE_DESC:
    "For larger teams that need dedicated support, advanced controls, and automation.",
};

const OVERRIDE_DEFAULTS: LandingPricingPlanOverride = {
  description: "",
  features: [],
  ctaLabel: CONSTANTS.DEFAULT_CTA_LABEL,
  ctaHref: CONSTANTS.DEFAULT_CTA_HREF,
  isFeatured: false,
};

type FieldId =
  | "badge"
  | "ctaLabel"
  | "ctaHref"
  | "description"
  | "featured"
  | `feature:${number}`;

function buildPlanFallbackOverride(
  plan: SubscriptionPlan,
): LandingPricingPlanOverride {
  const capabilities = plan.capabilities ?? {};
  const features: string[] = [];

  const addFeature = (value: string | null | undefined) => {
    if (value && !features.includes(value)) {
      features.push(value);
    }
  };

  const addCapacity = (
    value: unknown,
    singular: string,
    plural: string,
    unlimited: string,
  ) => {
    if (typeof value !== "number") return;
    if (value === -1) {
      addFeature(unlimited);
      return;
    }
    addFeature(
      `Up to ${value.toLocaleString()} ${value === 1 ? singular : plural}`,
    );
  };

  addCapacity(
    capabilities.max_products,
    "product",
    "products",
    "Unlimited products",
  );
  addCapacity(
    capabilities.max_orders_per_month,
    "order/month",
    "orders/month",
    "Unlimited orders/month",
  );
  addCapacity(
    capabilities.max_team_members,
    "team member",
    "team members",
    "Unlimited team members",
  );

  if (capabilities.can_use_custom_domain === true) addFeature("Custom domain");
  if (capabilities.can_manage_inventory === true)
    addFeature("Inventory management");
  if (capabilities.can_access_basic_analytics === true)
    addFeature("Basic analytics");
  if (capabilities.can_access_advanced_analytics === true)
    addFeature("Advanced analytics");
  if (capabilities.can_use_promotions === true)
    addFeature("Promotions & coupons");
  if (capabilities.can_use_proxy_accounts === true)
    addFeature("Proxy accounts");
  if (capabilities.can_use_api_access === true) addFeature("API access");
  if (capabilities.can_export_pdf_reports === true) addFeature("PDF reports");
  if (capabilities.can_use_courier_fallback === true)
    addFeature("Courier fallback");
  if (capabilities.can_view_margin_analysis === true)
    addFeature("Margin analysis");
  if (capabilities.can_set_shipping_priority === true)
    addFeature("Shipping priority controls");
  if (capabilities.can_manage_legal_documents === true)
    addFeature("Legal documents management");
  if (capabilities.granular_role_permissions === true)
    addFeature("Granular role permissions");
  if (capabilities.can_manage_warehouses === "multi_location")
    addFeature("Multi-location warehouses");

  if (typeof capabilities.cms_control === "string") {
    if (capabilities.cms_control === "basic") addFeature("Basic CMS control");
    if (capabilities.cms_control === "advanced")
      addFeature("Advanced CMS control");
    if (capabilities.cms_control === "full_custom")
      addFeature("Full custom CMS");
  }

  if (typeof capabilities.support_level === "string") {
    if (capabilities.support_level === "email") addFeature("Email support");
    if (capabilities.support_level === "priority")
      addFeature("Priority support");
    if (capabilities.support_level === "dedicated_manager") {
      addFeature("Dedicated account manager");
    }
  }

  return {
    description:
      plan.plan_name === "enterprise"
        ? CONSTANTS.ENTERPRISE_DESC
        : plan.display_name,
    features,
    ctaLabel:
      plan.plan_name === "enterprise"
        ? CONSTANTS.ENTERPRISE_CTA_LABEL
        : CONSTANTS.DEFAULT_CTA_LABEL,
    ctaHref: CONSTANTS.DEFAULT_CTA_HREF,
    isFeatured: plan.plan_name === "pro",
  };
}

function FieldLockToggle({
  editable,
  onToggle,
  fieldLabel,
}: {
  editable: boolean;
  onToggle: () => void;
  fieldLabel: string;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-8 w-8 shrink-0"
      onClick={onToggle}
      aria-pressed={editable}
      aria-label={
        editable ? `Lock ${fieldLabel}` : `Unlock ${fieldLabel} to edit`
      }
    >
      {editable ? (
        <LockOpen className="h-4 w-4 text-primary" />
      ) : (
        <Lock className="h-4 w-4" />
      )}
    </Button>
  );
}

function PlanListSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-36 rounded bg-muted" />
              <div className="h-3 w-52 rounded bg-muted/80" />
            </div>
            <div className="h-9 w-24 rounded-full bg-muted" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="h-20 rounded-xl bg-muted/60" />
            <div className="h-20 rounded-xl bg-muted/60" />
            <div className="h-20 rounded-xl bg-muted/60" />
          </div>
          <div className="mt-4 h-28 rounded-xl bg-muted/60" />
        </div>
      ))}
    </div>
  );
}

export enum PricingActionType {
  FETCH_PLANS_START = "FETCH_PLANS_START",
  FETCH_PLANS_SUCCESS = "FETCH_PLANS_SUCCESS",
  FETCH_PLANS_ERROR = "FETCH_PLANS_ERROR",
  TOGGLE_EXPAND = "TOGGLE_EXPAND",
  TOGGLE_FIELD_EDIT = "TOGGLE_FIELD_EDIT",
  SET_CONFIRMING_RESET = "SET_CONFIRMING_RESET",
  CLEAR_CONFIRMING_RESET = "CLEAR_CONFIRMING_RESET",
}

export type PricingAction =
  | { type: PricingActionType.FETCH_PLANS_START }
  | { type: PricingActionType.FETCH_PLANS_SUCCESS; payload: SubscriptionPlan[] }
  | { type: PricingActionType.FETCH_PLANS_ERROR; payload: string }
  | { type: PricingActionType.TOGGLE_EXPAND; payload: string }
  | { type: PricingActionType.TOGGLE_FIELD_EDIT; payload: string }
  | { type: PricingActionType.SET_CONFIRMING_RESET; payload: string }
  | { type: PricingActionType.CLEAR_CONFIRMING_RESET };

interface PricingState {
  plans: SubscriptionPlan[];
  loadingPlans: boolean;
  fetchError: string | null;
  expanded: Record<string, boolean>;
  fieldEdits: Record<string, boolean>;
  confirmingReset: string | null;
}

const initialPricingState: PricingState = {
  plans: [],
  loadingPlans: true,
  fetchError: null,
  expanded: {},
  fieldEdits: {},
  confirmingReset: null,
};

function pricingReducer(
  state: PricingState,
  action: PricingAction,
): PricingState {
  switch (action.type) {
    case PricingActionType.FETCH_PLANS_START:
      return { ...state, loadingPlans: true, fetchError: null };
    case PricingActionType.FETCH_PLANS_SUCCESS:
      return {
        ...state,
        loadingPlans: false,
        plans: action.payload,
        expanded:
          action.payload.length > 0
            ? { [action.payload[0].plan_name]: true }
            : {},
      };
    case PricingActionType.FETCH_PLANS_ERROR:
      return {
        ...state,
        loadingPlans: false,
        plans: [],
        fetchError: action.payload,
      };
    case PricingActionType.TOGGLE_EXPAND:
      return {
        ...state,
        expanded: {
          ...state.expanded,
          [action.payload]: !state.expanded[action.payload],
        },
      };
    case PricingActionType.TOGGLE_FIELD_EDIT:
      return {
        ...state,
        fieldEdits: {
          ...state.fieldEdits,
          [action.payload]: !state.fieldEdits[action.payload],
        },
      };
    case PricingActionType.SET_CONFIRMING_RESET:
      return { ...state, confirmingReset: action.payload };
    case PricingActionType.CLEAR_CONFIRMING_RESET:
      return { ...state, confirmingReset: null };
    default:
      return state;
  }
}

export function PricingEditor({ value, onChange }: PricingEditorProps) {
  const [state, dispatch] = useReducer(pricingReducer, initialPricingState);
  const {
    plans,
    loadingPlans,
    fetchError,
    expanded,
    fieldEdits,
    confirmingReset,
  } = state;
  const { pending, schedule, runUndo } = useUndoableRemoval();

  const loadPlans = async () => {
    try {
      dispatch({ type: PricingActionType.FETCH_PLANS_START });
      const res = await AxiosAPI.get("/v1/subscription/plans");
      const fetched: SubscriptionPlan[] = Array.isArray(res.data)
        ? res.data
        : (res.data?.data ?? []);
      dispatch({
        type: PricingActionType.FETCH_PLANS_SUCCESS,
        payload: fetched,
      });
    } catch {
      dispatch({
        type: PricingActionType.FETCH_PLANS_ERROR,
        payload: CONSTANTS.ERROR_MSG_FETCH_PLANS,
      });
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const setHeader = (patch: Partial<LandingPricingContent["header"]>) =>
    onChange({ ...value, header: { ...value.header, ...patch } });

  const setToggle = (patch: Partial<LandingPricingContent["toggle"]>) =>
    onChange({ ...value, toggle: { ...value.toggle, ...patch } });

  const getPlan = (planName: string) =>
    plans.find((plan) => plan.plan_name === planName) ?? null;

  const getCurrentOverride = (planName: string): LandingPricingPlanOverride => {
    const plan = getPlan(planName);
    if (!plan) return { ...OVERRIDE_DEFAULTS };
    return value.planOverrides?.[planName] ?? buildPlanFallbackOverride(plan);
  };

  const setOverride = (
    planName: string,
    patch: Partial<LandingPricingPlanOverride>,
  ) => {
    const current = getCurrentOverride(planName);
    onChange({
      ...value,
      planOverrides: {
        ...(value.planOverrides ?? {}),
        [planName]: { ...current, ...patch },
      },
    });
  };

  const fieldKey = (planName: string, field: FieldId) => `${planName}:${field}`;

  const isFieldEditable = (planName: string, field: FieldId) =>
    !!fieldEdits[fieldKey(planName, field)];

  const toggleFieldEditable = (planName: string, field: FieldId) =>
    dispatch({
      type: PricingActionType.TOGGLE_FIELD_EDIT,
      payload: fieldKey(planName, field),
    });

  const toggleExpand = (planName: string) =>
    dispatch({ type: PricingActionType.TOGGLE_EXPAND, payload: planName });

  const addFeature = (planName: string) => {
    const current = getCurrentOverride(planName);
    const nextIndex = current.features.length;
    setOverride(planName, { features: [...current.features, "New feature"] });
    dispatch({
      type: PricingActionType.TOGGLE_FIELD_EDIT,
      payload: fieldKey(planName, `feature:${nextIndex}`),
    });
  };

  const updateFeature = (planName: string, index: number, text: string) => {
    const features = [...getCurrentOverride(planName).features];
    features[index] = text;
    setOverride(planName, { features });
  };

  const removeFeature = (planName: string, index: number) => {
    const current = getCurrentOverride(planName);
    const feature = current.features[index];
    const features = current.features.filter((_, i) => i !== index);
    setOverride(planName, { features });

    schedule({
      label: `Removed feature "${feature}"`,
      undo: () => {
        const restored = [...features];
        restored.splice(index, 0, feature);
        setOverride(planName, { features: restored });
      },
    });
  };

  // Resets a plan's override back to the server-derived default (badge,
  // description, features, CTA, featured flag all recomputed from the live
  // subscription_plans row). This discards any CMS-authored copy for the
  // plan, so it's gated behind an inline confirm — and still reversible
  // via the same undo banner used for feature removal, since the prior
  // override is fully known at the moment of reset.
  const resetOverride = (planName: string) => {
    const plan = getPlan(planName);
    if (!plan) return;
    const priorOverride = value.planOverrides?.[planName];
    const nextOverrides = { ...(value.planOverrides ?? {}) };
    delete nextOverrides[planName];
    onChange({ ...value, planOverrides: nextOverrides });
    dispatch({ type: PricingActionType.CLEAR_CONFIRMING_RESET });

    if (priorOverride) {
      schedule({
        label: `Reset "${plan.display_name}" to auto-generated copy`,
        undo: () => {
          onChange({
            ...value,
            planOverrides: {
              ...(value.planOverrides ?? {}),
              [planName]: priorOverride,
            },
          });
        },
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Subscription Plan Core Manager */}
      <SubscriptionPlanManager />

      {/* Section Header & Billing Toggle */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Pricing Section Header</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="grid gap-1.5">
            <Label>Section Label</Label>
            <Input
              value={value.header.label}
              onChange={(e) => setHeader({ label: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title Part 1</Label>
            <Input
              value={value.header.titlePart1}
              onChange={(e) => setHeader({ titlePart1: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title Highlight</Label>
            <Input
              value={value.header.titleHighlight}
              onChange={(e) => setHeader({ titleHighlight: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title Part 2</Label>
            <Input
              value={value.header.titlePart2}
              onChange={(e) => setHeader({ titlePart2: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>Subtitle</Label>
          <Textarea
            value={value.header.subtitle}
            onChange={(e) => setHeader({ subtitle: e.target.value })}
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-4">
          <div className="grid gap-1.5">
            <Label>Monthly Toggle Label</Label>
            <Input
              value={value.toggle.monthly}
              onChange={(e) => setToggle({ monthly: e.target.value })}
              placeholder="Monthly"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Annual Toggle Label</Label>
            <Input
              value={value.toggle.annual}
              onChange={(e) => setToggle({ annual: e.target.value })}
              placeholder="Annual"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Annual Savings Badge</Label>
            <Input
              value={value.toggle.badge}
              onChange={(e) => setToggle({ badge: e.target.value })}
              placeholder="Save 20%"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Currency Symbol</Label>
            <Input
              value={value.currency}
              onChange={(e) => onChange({ ...value, currency: e.target.value })}
              placeholder="$"
              maxLength={3}
            />
            <p className="text-[11px] text-muted-foreground">
              Prefixes every price shown below and on the live page.
            </p>
          </div>
        </div>
      </div>

      {loadingPlans ? (
        <PlanListSkeleton />
      ) : fetchError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive shadow-sm">
          <p className="font-medium">{fetchError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={loadPlans}
          >
            Retry
          </Button>
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
          No active subscription plans found in the database.
          <br />
          <span className="mt-2 block text-xs">
            Add plans to the <code>subscription_plans</code> table to manage
            them here.
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Tap the lock beside a field to unlock only that field.</span>
          </div>

          <UndoBanner pending={pending} onUndo={runUndo} />

          {plans.map((plan) => {
            const override = getCurrentOverride(plan.plan_name);
            const isOpen = !!expanded[plan.plan_name];
            const isSaved = !!value.planOverrides?.[plan.plan_name];
            const featurePreview = override.features.slice(0, 4);
            const remainingFeatures = Math.max(0, override.features.length - 4);
            const panelId = `pricing-panel-${plan.plan_name}`;

            return (
              <section
                key={plan.id}
                className={`overflow-hidden rounded-2xl border bg-card shadow-sm transition-all ${
                  override.isFeatured
                    ? "border-primary/30 ring-1 ring-primary/15"
                    : "border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(plan.plan_name)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {plan.display_name}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-mono text-muted-foreground">
                        {value.currency}
                        {plan.price_monthly ?? "0"}/mo
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isSaved
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isSaved ? "Saved" : "Auto-generated"}
                      </span>
                      {override.isFeatured && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          Featured
                        </span>
                      )}
                      {override.badge && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {override.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Plan name: {plan.plan_name} | Trial:{" "}
                      {plan.trial_days ?? 0} days
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        Preview
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {isOpen ? "Open" : "Collapsed"}
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    className="space-y-6 border-t border-border bg-muted/20 p-5 lg:p-6"
                  >
                    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        Live preview
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            Monthly
                          </p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {value.currency}
                            {plan.price_monthly ?? "0"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            Annual
                          </p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {plan.price_annual
                              ? `${value.currency}${plan.price_annual}/mo`
                              : "Not set"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            Display order
                          </p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {plan.display_order ?? "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-dashed border-border bg-background/70 p-4">
                        <p className="text-sm font-medium text-foreground">
                          {override.description || "No description saved yet."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {featurePreview.length > 0 ? (
                            <>
                              {featurePreview.map((feature) => (
                                <span
                                  key={feature}
                                  className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                                >
                                  {feature}
                                </span>
                              ))}
                              {remainingFeatures > 0 && (
                                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                  +{remainingFeatures} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No saved features yet.
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                        Prices and trial length come straight from the{" "}
                        <code>subscription_plans</code> table and can&apos;t be
                        edited here — update them in the subscription admin
                        flow. This panel only controls how the plan is
                        <em> described</em> on the marketing page.
                      </p>
                    </div>

                    <div className="space-y-6 rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Plan copy
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Unlock a field to edit it — locked fields fall back
                            to the auto-generated copy above.
                          </p>
                        </div>
                        {isSaved &&
                          (confirmingReset === plan.plan_name ? (
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Discard saved copy?
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => resetOverride(plan.plan_name)}
                              >
                                Reset
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => dispatch({ type: PricingActionType.CLEAR_CONFIRMING_RESET })}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 shrink-0 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => dispatch({ type: PricingActionType.SET_CONFIRMING_RESET, payload: plan.plan_name })}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reset to auto-generated
                            </Button>
                          ))}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="grid gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <Label>Badge</Label>
                            <FieldLockToggle
                              editable={isFieldEditable(
                                plan.plan_name,
                                "badge",
                              )}
                              onToggle={() =>
                                toggleFieldEditable(plan.plan_name, "badge")
                              }
                              fieldLabel="badge"
                            />
                          </div>
                          <Input
                            value={override.badge ?? ""}
                            onChange={(e) =>
                              setOverride(plan.plan_name, {
                                badge: e.target.value,
                              })
                            }
                            placeholder="Most Popular"
                            disabled={!isFieldEditable(plan.plan_name, "badge")}
                            className="disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </div>

                        <div className="grid gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <Label>CTA Label</Label>
                            <FieldLockToggle
                              editable={isFieldEditable(
                                plan.plan_name,
                                "ctaLabel",
                              )}
                              onToggle={() =>
                                toggleFieldEditable(plan.plan_name, "ctaLabel")
                              }
                              fieldLabel="cta label"
                            />
                          </div>
                          <Input
                            value={override.ctaLabel}
                            onChange={(e) =>
                              setOverride(plan.plan_name, {
                                ctaLabel: e.target.value,
                              })
                            }
                            disabled={
                              !isFieldEditable(plan.plan_name, "ctaLabel")
                            }
                            className="disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </div>

                        <div className="grid gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <Label>CTA Href</Label>
                            <FieldLockToggle
                              editable={isFieldEditable(
                                plan.plan_name,
                                "ctaHref",
                              )}
                              onToggle={() =>
                                toggleFieldEditable(plan.plan_name, "ctaHref")
                              }
                              fieldLabel="cta href"
                            />
                          </div>
                          <Input
                            value={override.ctaHref}
                            onChange={(e) =>
                              setOverride(plan.plan_name, {
                                ctaHref: e.target.value,
                              })
                            }
                            disabled={
                              !isFieldEditable(plan.plan_name, "ctaHref")
                            }
                            className="disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </div>

                        <div className="grid gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <Label>Featured</Label>
                            <FieldLockToggle
                              editable={isFieldEditable(
                                plan.plan_name,
                                "featured",
                              )}
                              onToggle={() =>
                                toggleFieldEditable(plan.plan_name, "featured")
                              }
                              fieldLabel="featured"
                            />
                          </div>
                          <div
                            className={`flex h-10 items-center gap-2 rounded-md border border-input px-3 ${
                              !isFieldEditable(plan.plan_name, "featured")
                                ? "opacity-60"
                                : ""
                            }`}
                          >
                            <Switch
                              checked={override.isFeatured}
                              disabled={
                                !isFieldEditable(plan.plan_name, "featured")
                              }
                              onCheckedChange={(v) =>
                                setOverride(plan.plan_name, { isFeatured: v })
                              }
                            />
                            <span className="text-sm text-muted-foreground">
                              {override.isFeatured ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <Label>Description</Label>
                          <FieldLockToggle
                            editable={isFieldEditable(
                              plan.plan_name,
                              "description",
                            )}
                            onToggle={() =>
                              toggleFieldEditable(plan.plan_name, "description")
                            }
                            fieldLabel="description"
                          />
                        </div>
                        <Textarea
                          value={override.description}
                          onChange={(e) =>
                            setOverride(plan.plan_name, {
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          disabled={
                            !isFieldEditable(plan.plan_name, "description")
                          }
                          className="disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <Label>Features</Label>
                            <p className="text-xs text-muted-foreground">
                              Every feature row has its own lock button.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => addFeature(plan.plan_name)}
                          >
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            Add Feature
                          </Button>
                        </div>

                        {override.features.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                            No features yet. Add one to begin editing this plan.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {override.features.map((feature, index) => {
                              const fieldName = `feature:${index}` as FieldId;
                              const editable = isFieldEditable(
                                plan.plan_name,
                                fieldName,
                              );

                              return (
                                <div
                                  key={`${plan.plan_name}-${index}`}
                                  className="grid gap-2"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      Feature {index + 1}
                                    </Label>
                                    <div className="flex items-center gap-1">
                                      <FieldLockToggle
                                        editable={editable}
                                        onToggle={() =>
                                          toggleFieldEditable(
                                            plan.plan_name,
                                            fieldName,
                                          )
                                        }
                                        fieldLabel={`feature ${index + 1}`}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        className="shrink-0 text-destructive/70 hover:text-destructive"
                                        aria-label={`Remove feature ${index + 1}`}
                                        onClick={() =>
                                          removeFeature(plan.plan_name, index)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <Input
                                    value={feature}
                                    onChange={(e) =>
                                      updateFeature(
                                        plan.plan_name,
                                        index,
                                        e.target.value,
                                      )
                                    }
                                    disabled={!editable}
                                    className="disabled:cursor-not-allowed disabled:opacity-60"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" />
                      <span>
                        Use the field lock icons to edit one value at a time.
                      </span>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
