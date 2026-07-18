import React from "react";
import { BarChart2, Loader2, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlanFeatureLimit, StatusBadge } from "./SharedUI";

interface QuotasTabProps {
  plans: any[]; // CmsPlanRow[]
  selectedQuotaPlanKey: string | null;
  isLoadingQuotas: boolean;
  quotaLimits: PlanFeatureLimit[];
  isSavingQuota: boolean;
  dispatch: React.Dispatch<any>;
  loadQuotaLimits: (planKey: string) => void;
  handleSaveQuotaLimit: (limit: PlanFeatureLimit, index: number) => void;
  ACTION: any;
}

export default function QuotasTab({
  plans,
  selectedQuotaPlanKey,
  isLoadingQuotas,
  quotaLimits,
  isSavingQuota,
  dispatch,
  loadQuotaLimits,
  handleSaveQuotaLimit,
  ACTION,
}: QuotasTabProps) {
  return (
    <div className="mb-10 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
            Quota Rules
          </h2>
          <p className="text-xs text-slate-500">
            Configure per-plan feature limits enforced by the backend access-check
            system. Select a live plan to edit its quotas.
          </p>
        </div>
      </div>

      {/* Plan selector — same card-grid style as CMS plan catalog */}
      {plans.filter((p) => p.status === "live").length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 mb-6">
          No live plans yet — publish a plan first to configure its quotas.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {plans
            .filter((p) => p.status === "live")
            .map((plan) => (
              <button
                key={plan.plan_key}
                type="button"
                onClick={() => {
                  dispatch({
                    type: ACTION.SET_SELECTED_QUOTA_PLAN,
                    payload: plan.plan_key,
                  });
                  loadQuotaLimits(plan.plan_key);
                }}
                className={`flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left shadow-xs transition-all ${
                  selectedQuotaPlanKey === plan.plan_key
                    ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="font-semibold text-sm capitalize text-slate-900">
                  {plan.plan_key}
                </span>
                <StatusBadge status={plan.status} />
              </button>
            ))}
        </div>
      )}

      {/* Limits editor table — shown when a plan is selected */}
      {selectedQuotaPlanKey && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 capitalize flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-blue-500" />
                {selectedQuotaPlanKey} — Feature Limits
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Each row is a <code className="font-mono">plan_feature_limits</code>{" "}
                record. Changes are saved per-row.
              </p>
            </div>
          </div>

          {isLoadingQuotas ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : quotaLimits.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
              No quota limits configured for this plan yet.
            </p>
          ) : (
            <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full table-auto min-w-[700px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <th className="p-3">Feature Key</th>
                    <th className="p-3 text-center">Enabled</th>
                    <th className="p-3 text-center">Unlimited</th>
                    <th className="p-3">Limit Value</th>
                    <th className="p-3">Reset Interval</th>
                    <th className="p-3 text-center">Save</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {quotaLimits.map((limit, idx) => (
                    <tr
                      key={limit.feature_id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-3">
                        <span className="font-mono text-xs text-slate-700">
                          {limit.feature_key}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Switch
                          checked={limit.is_enabled}
                          onCheckedChange={(checked) =>
                            dispatch({
                              type: ACTION.UPDATE_QUOTA_LIMIT,
                              payload: {
                                index: idx,
                                limit: { ...limit, is_enabled: checked },
                              },
                            })
                          }
                          className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Switch
                          checked={limit.is_unlimited}
                          onCheckedChange={(checked) =>
                            dispatch({
                              type: ACTION.UPDATE_QUOTA_LIMIT,
                              payload: {
                                index: idx,
                                limit: {
                                  ...limit,
                                  is_unlimited: checked,
                                  limit_value: checked ? null : limit.limit_value,
                                },
                              },
                            })
                          }
                          className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-200"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min={0}
                          disabled={limit.is_unlimited}
                          value={limit.limit_value ?? ""}
                          onChange={(e) =>
                            dispatch({
                              type: ACTION.UPDATE_QUOTA_LIMIT,
                              payload: {
                                index: idx,
                                limit: {
                                  ...limit,
                                  limit_value:
                                    e.target.value === ""
                                      ? null
                                      : parseInt(e.target.value, 10),
                                },
                              },
                            })
                          }
                          className="text-xs h-8 w-24 disabled:opacity-40"
                          placeholder="e.g. 50"
                        />
                      </td>
                      <td className="p-3">
                        <Select
                          value={limit.reset_interval ?? "none"}
                          onValueChange={(v) =>
                            dispatch({
                              type: ACTION.UPDATE_QUOTA_LIMIT,
                              payload: {
                                index: idx,
                                limit: {
                                  ...limit,
                                  reset_interval:
                                    v === "none"
                                      ? null
                                      : (v as PlanFeatureLimit["reset_interval"]),
                                },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="text-xs h-8 w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="text-xs">
                              — No reset
                            </SelectItem>
                            <SelectItem value="hourly" className="text-xs">
                              Hourly
                            </SelectItem>
                            <SelectItem value="daily" className="text-xs">
                              Daily
                            </SelectItem>
                            <SelectItem value="monthly" className="text-xs">
                              Monthly
                            </SelectItem>
                            <SelectItem
                              value="billing_cycle"
                              className="text-xs"
                            >
                              Billing Cycle
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          disabled={isSavingQuota}
                          onClick={() => handleSaveQuotaLimit(limit, idx)}
                          className="h-7 px-2.5 text-xs text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 rounded-lg transition-colors font-semibold"
                        >
                          {isSavingQuota ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
