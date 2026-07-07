"use client";

import React, { useEffect, useState } from "react";
import AxiosAPI from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FeatureMatrix,
  Feature,
} from "@/components/common/landingPageCms/FeatureMatrix";
import { toast } from "sonner";
import { Save, UploadCloud } from "lucide-react";
import { FeatureType, PlanStatus, PriceInterval } from "@/utils/Types";

interface PlanPrice {
  currency: string;
  interval: PriceInterval;
  intervalCount?: number;
  amountCents: number;
}

interface CmsPlan {
  planKey: string;
  version: number;
  prices: PlanPrice[];
  features: Feature[];
}

export function SubscriptionPlanManager() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection & Editing
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<CmsPlan | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      // In reality, this endpoint returns the list of all plans
      const res = await AxiosAPI.get("/v1/admin/subscription-plans");
      const fetchedPlans = res.data;
      const plans =
        Array.isArray(fetchedPlans) && fetchedPlans.length > 0
          ? fetchedPlans
          : [];
      setPlans(plans);
      if (plans.length > 0 && !selectedPlanKey) {
        selectPlan(plans[0]);
      }
    } catch (err) {
      toast.error("Failed to load subscription plans.");
    } finally {
      setLoading(false);
    }
  };

  const selectPlan = (plan: any) => {
    setSelectedPlanKey(plan.plan_key);
    // Initialize draft state from fetched plan
    setDraftState({
      planKey: plan.plan_key,
      version: plan.version || 1,
      prices: plan.prices?.map((p: any) => ({
        currency: p.currency,
        interval: p.interval,
        intervalCount: p.interval_count,
        amountCents: p.amount_cents,
      })) || [
        { currency: "INR", interval: "monthly", amountCents: 0 },
        { currency: "INR", interval: "yearly", amountCents: 0 },
      ],
      features:
        plan.features?.map((f: any) => ({
          key: f.feature_key,
          type: f.type,
          value:
            f.type === FeatureType.BOOLEAN
              ? f.value === "true"
              : f.type === FeatureType.NUMBER
                ? Number(f.value)
                : f.value,
        })) || [],
    });
  };

  const handleSaveDraft = async () => {
    if (!draftState) return;
    setSaving(true);
    try {
      await AxiosAPI.put(
        `/v1/admin/subscription-plans/${draftState.planKey}/draft`,
        draftState,
      );
      toast.success("Draft saved successfully.");
      await fetchPlans(); // Re-fetch to get updated version
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!draftState) return;
    setSaving(true);
    try {
      await AxiosAPI.post(
        `/v1/admin/subscription-plans/${draftState.planKey}/publish`,
      );
      toast.success("Plan published live successfully!");
      await fetchPlans();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish plan.");
    } finally {
      setSaving(false);
    }
  };

  const activePlanData = plans.find((p) => p.plan_key === selectedPlanKey);
  const isDraft = activePlanData && activePlanData?.status === PlanStatus.DRAFT;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage pricing, features, and capabilities for all plans.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Plan List */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold">All Plans</h2>
            </div>
            <div className="p-2 space-y-1">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : plans.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No plans found.
                </div>
              ) : (
                // Group by unique plan_key (since we might have draft and live rows for same key)
                Array.from(new Set(plans.map((p) => p.plan_key))).map((key) => {
                  const pDraft = plans.find(
                    (p) => p.plan_key === key && p.status === "draft",
                  );
                  const pLive = plans.find(
                    (p) => p.plan_key === key && p.status === "live",
                  );
                  const p = pDraft || pLive;

                  return (
                    <button
                      key={key}
                      onClick={() => selectPlan(p)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedPlanKey === key
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{key}</span>
                        {pDraft && (
                          <span
                            className="w-2 h-2 rounded-full bg-amber-500"
                            title="Unpublished Draft"
                          />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <Button variant="outline" className="w-full">
            Create New Plan
          </Button>
        </div>

        {/* Right Column: Editor Split Screen */}
        {draftState ? (
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Header / Actions */}
            <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-sm">
              <div>
                <h2 className="text-lg font-bold capitalize">
                  {draftState.planKey} Plan
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${isDraft ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}
                  >
                    {isDraft ? "Draft Version" : "Live Version"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    v{draftState.version}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button size="sm" onClick={handlePublish} disabled={saving}>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Publish Live
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Prices Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <h3 className="font-semibold">Pricing Configuration</h3>
                </div>

                <div className="space-y-4 bg-card border border-border rounded-xl p-5">
                  {draftState.prices.map((price, i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-end pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      <div className="flex-1 space-y-1.5">
                        <Label>Interval</Label>
                        <Input
                          value={price.interval}
                          disabled
                          className="bg-muted capitalize"
                        />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <Label>Amount ({price.currency})</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            value={price.amountCents / 100}
                            onChange={(e) => {
                              const updated = [...draftState.prices];
                              updated[i].amountCents = Math.round(
                                parseFloat(e.target.value || "0") * 100,
                              );
                              setDraftState({ ...draftState, prices: updated });
                            }}
                            className="pl-7"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Matrix Section */}
              <div className="space-y-4 xl:col-span-2">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <h3 className="font-semibold">Feature Matrix</h3>
                </div>
                <FeatureMatrix
                  features={draftState.features}
                  onChange={(features) =>
                    setDraftState({ ...draftState, features })
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-12 lg:col-span-9 flex items-center justify-center border border-dashed border-border rounded-xl bg-card min-h-[400px]">
            <p className="text-muted-foreground">Select a plan to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}
