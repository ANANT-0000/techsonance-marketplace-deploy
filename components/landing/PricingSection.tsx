"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type {
  LandingPricingPlanOverride,
  SubscriptionPlan,
} from "@/utils/Types";
import { LANDING_PRICING } from "@/constants/landingText";

/** Shape used internally when rendering a merged plan card */
interface MergedPlan {
  id: string;
  displayName: string;
  priceMonthly: string;
  priceAnnual: string | null;
  annualTotal: string | null;
  displayOrder: number | null;
  override: LandingPricingPlanOverride;
}

function addCapacityFeature(
  features: string[],
  value: unknown,
  label: string,
  unlimitedLabel: string,
) {
  if (typeof value !== "number") return;
  if (value === -1) {
    features.push(unlimitedLabel);
    return;
  }
  features.push(`Up to ${value.toLocaleString()} ${label}`);
}

function buildFallbackOverride(
  plan: SubscriptionPlan,
): LandingPricingPlanOverride {
  const capabilities = plan.capabilities ?? {};
  const features: string[] = [];

  const addFeature = (value: string | null | undefined) => {
    if (value && !features.includes(value)) {
      features.push(value);
    }
  };

  addCapacityFeature(
    features,
    capabilities.max_products,
    "products",
    "Unlimited products",
  );
  addCapacityFeature(
    features,
    capabilities.max_orders_per_month,
    "orders/month",
    "Unlimited orders/month",
  );
  addCapacityFeature(
    features,
    capabilities.max_team_members,
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
        ? "For larger teams that need dedicated support, advanced controls, and automation."
        : plan.display_name,
    features,
    ctaLabel: plan.plan_name === "enterprise" ? "Contact Sales" : "Get Started",
    ctaHref: "/auth/vendorRegister",
    isFeatured: plan.plan_name === "pro",
  };
}

export interface PricingSectionProps {
  initialPlans?: SubscriptionPlan[];
  planOverrides?: Record<string, LandingPricingPlanOverride>;
  currency?: string;
}

export default function PricingSection({
  initialPlans,
  planOverrides,
  currency,
}: PricingSectionProps = {}) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>(
    {},
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans || []);
  const meta = LANDING_PRICING;

  let mergedPlans: MergedPlan[] = [];

  useEffect(() => {
    // Skip fetch if we were provided plans externally (e.g., Pavement Integration)
    if (initialPlans && initialPlans.length > 0) return;

    const loadPlans = async () => {
      try {
        const plansRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/public/subscription-plans`,
          {
            next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
          },
        );
        const data = await plansRes.json();
        if (Array.isArray(data)) {
          setPlans(data);
        } else if (data?.data && Array.isArray(data.data)) {
          setPlans(data.data);
        } else {
          setPlans(data);
        }
      } catch (e) {
        console.error("Failed to fetch live subscription plans:", e);
      }
    };
    
    loadPlans();
  }, []);

  if (plans.length > 0) {
    mergedPlans = plans
      .map((plan: any) => {
        const planName = plan.plan_key || plan.plan_name;
        
        const baseOverride: LandingPricingPlanOverride =
          planOverrides?.[planName] ??
          meta.planOverrides?.[planName] ?? {
            description: "For growing businesses.",
            features: [],
            ctaLabel: "Get Started",
            ctaHref: "/auth/vendorRegister",
            isFeatured: planName === "pro",
          };

        const monthlyPriceObj = plan.prices?.find(
          (p: any) => p.interval === "monthly",
        );
        const yearlyPriceObj = plan.prices?.find(
          (p: any) => p.interval === "yearly",
        );

        const priceMonthly = monthlyPriceObj
          ? String(monthlyPriceObj.amount_cents / 100)
          : plan.price_monthly ?? "0";
          
        const annualTotalNum = yearlyPriceObj
          ? yearlyPriceObj.amount_cents / 100
          : plan.annual_total ?? null;
          
        const priceAnnual = annualTotalNum
          ? String(Math.round(Number(annualTotalNum) / 12))
          : plan.price_annual ?? null;

        // Build features from DB or use old capabilities fallback if empty
        const dbFeatures = (plan.features || [])
          .filter((f: any) =>
            f.type === "boolean" ? f.value === "true" : true,
          )
          .map((f: any) => {
            const formattedKey = f.feature_key
              .split("_")
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");
            return f.type === "boolean"
              ? formattedKey
              : `${formattedKey}: ${f.value}`;
          });
          
        const fallbackOverride = buildFallbackOverride(plan);
        const finalFeatures = dbFeatures.length > 0 ? dbFeatures : fallbackOverride.features;

        const override: LandingPricingPlanOverride = {
          ...baseOverride,
          features: finalFeatures,
        };

        return {
          id: plan.id,
          displayName: plan.display_name || planName.charAt(0).toUpperCase() + planName.slice(1),
          priceMonthly,
          priceAnnual,
          annualTotal: annualTotalNum ? String(annualTotalNum) : null,
          displayOrder:
            plan.display_order ?? (planName === "starter" ? 1 : planName === "pro" ? 2 : 3),
          override,
        };
      })
      .sort(
        (a, b) =>
          (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.displayOrder ?? Number.MAX_SAFE_INTEGER),
      );
  }

  return (
    <section
      aria-label="Pricing"
      id="pricing"
      className="border-t border-landing-border bg-landing-surface py-24 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto mb-6 inline-flex items-center rounded-full border border-landing-border bg-landing-background px-4 py-2"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-landing-primary">
              {meta.header.label}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-semibold tracking-[-0.05em] text-landing-text sm:text-5xl"
          >
            {meta.header.titlePart1}
            <span className="text-landing-primary">
              {meta.header.titleHighlight}
            </span>
            {meta.header.titlePart2}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-landing-muted"
          >
            {meta.header.subtitle}
          </motion.p>
        </div>

        {/* Monthly / Annual toggle */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.14 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <span
            className={`text-sm font-medium ${
              isAnnual ? "text-landing-muted" : "text-landing-primary"
            }`}
          >
            {meta.toggle.monthly}
          </span>
          <button
            type="button"
            className="group inline-flex h-7 w-14 items-center rounded-full bg-landing-primary px-1 transition-colors"
            aria-checked={isAnnual}
            role="switch"
            onClick={() => setIsAnnual((v) => !v)}
          >
            <span
              className={`h-5 w-5 rounded-full bg-landing-on-primary transition-transform duration-300 ${
                isAnnual ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              isAnnual ? "text-landing-primary" : "text-landing-muted"
            }`}
          >
            {meta.toggle.annual}
          </span>
          {meta.toggle.badge && (
            <span className="rounded-full border border-landing-primary/20 bg-landing-primary-soft px-3 py-1 text-xs font-semibold text-landing-primary">
              {meta.toggle.badge}
            </span>
          )}
        </motion.div>

        {/* Plan cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {mergedPlans.map(
            (
              {
                id,
                displayName,
                priceMonthly,
                priceAnnual,
                annualTotal,
                override,
              },
              index,
            ) => {
              const displayPrice = isAnnual
                ? (priceAnnual ?? priceMonthly)
                : priceMonthly;
              const isExpanded = !!expandedPlans[id];
              const visibleFeatures = isExpanded
                ? override.features
                : override.features.slice(0, 5);
              const hasMoreFeatures = override.features.length > 5;

              return (
                <motion.article
                  key={id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.08 }}
                  className={`relative flex h-full min-h-[680px] flex-col rounded-[2rem] border p-8 shadow-sm transition-transform hover:-translate-y-1 ${
                    override.isFeatured
                      ? "border-landing-primary bg-landing-text text-landing-on-dark shadow-[0_24px_80px_rgba(37,99,235,0.18)]"
                      : "border-landing-border bg-landing-surface text-landing-text"
                  }`}
                >
                  {/* Badge */}
                  {override.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-landing-primary px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-on-primary">
                      {override.badge}
                    </div>
                  )}

                  {/* Plan name */}
                  <div
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                      override.isFeatured
                        ? "text-landing-on-dark/50"
                        : "text-landing-muted"
                    }`}
                  >
                    {displayName}
                  </div>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span
                      className={`text-xl font-semibold ${
                        override.isFeatured
                          ? "text-landing-on-dark"
                          : "text-landing-muted"
                      }`}
                    >
                      {currency || meta.currency}
                    </span>
                    <span className="text-5xl font-semibold tracking-[-0.05em] text-inherit">
                      {displayPrice}
                    </span>
                    <span
                      className={`text-sm ${
                        override.isFeatured
                          ? "text-landing-on-dark/50"
                          : "text-landing-muted"
                      }`}
                    >
                      / mo
                    </span>
                  </div>

                  {/* Annual billed-total */}
                  <div
                    className={`mt-2 min-h-6 text-sm ${
                      override.isFeatured
                        ? "text-landing-on-dark/40"
                        : "text-landing-muted"
                    }`}
                  >
                    {isAnnual && annualTotal
                      ? `${currency || meta.currency}${annualTotal} billed annually`
                      : "\u00A0"}
                  </div>

                  {/* Description */}
                  <p
                    className={`mt-4 text-sm leading-7 ${
                      override.isFeatured
                        ? "text-landing-on-dark/70"
                        : "text-landing-muted"
                    }`}
                  >
                    {override.description}
                  </p>

                  <div
                    className={`my-7 h-px w-full ${
                      override.isFeatured
                        ? "bg-landing-on-dark/10"
                        : "bg-landing-border"
                    }`}
                  />

                  {/* Features */}
                  <ul
                    className={`space-y-3 overflow-hidden transition-[max-height] duration-300 ease-out ${isExpanded ? "max-h-[36rem]" : "max-h-[14rem]"}`}
                  >
                    {visibleFeatures.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-start gap-3 text-sm ${
                          override.isFeatured
                            ? "text-landing-on-dark/80"
                            : "text-landing-muted"
                        }`}
                      >
                        <span
                          className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
                            override.isFeatured
                              ? "border-landing-on-dark/20 bg-landing-on-dark/10 text-landing-on-dark"
                              : "border-landing-primary/20 bg-landing-primary-soft text-landing-primary"
                          }`}
                        ></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {hasMoreFeatures && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedPlans((prev) => ({
                          ...prev,
                          [id]: !prev[id],
                        }))
                      }
                      aria-expanded={isExpanded}
                      className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                        override.isFeatured
                          ? "text-landing-on-dark/90 hover:text-landing-on-dark"
                          : "text-landing-primary hover:text-landing-primary-hover"
                      }`}
                    >
                      <span>
                        {isExpanded ? "Show less" : "See more features"}
                      </span>
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition-transform ${
                          override.isFeatured
                            ? "border-landing-on-dark/20 bg-landing-on-dark/10"
                            : "border-landing-primary/15 bg-landing-primary-soft"
                        } ${isExpanded ? "rotate-180" : ""}`}
                      >
                        ▾
                      </span>
                    </button>
                  )}

                  {/* CTA */}
                  <a
                    href={override.ctaHref}
                    className={`mt-8 inline-flex justify-center rounded-full px-5 py-3.5 text-sm font-semibold transition-colors ${
                      override.isFeatured
                        ? "bg-landing-primary text-landing-on-primary hover:bg-landing-primary-hover"
                        : "border border-landing-border bg-landing-surface text-landing-text hover:border-landing-primary hover:bg-landing-primary-soft hover:text-landing-primary"
                    }`}
                  >
                    {override.ctaLabel}
                  </a>
                </motion.article>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}
