import React from "react";
import {
  AlertTriangle,
  Eye,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UploadCloud,
  EyeOff,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CmsPlanRow,
  formatMinorUnits,
  majorToMinorUnits,
} from "@/hooks/useCmsSubscriptionPlans";
import { FeatureType, PriceInterval, PlanStatus } from "@/utils/Types";
import { SUBSCRIBATION_TEXT } from "@/constants/adminText";
import { formatFeatureDisplay } from "@/lib/utils";
import {
  DEFAULT_CURRENCY,
  DEFAULT_AMOUNT_MINOR_UNITS,
  BOOLEAN_VALUE,
  UNLIMITED_VALUE_RAW,
  UNLIMITED_VALUE_DISPLAY,
  DEFAULT_PRICE,
  DEFAULT_FEATURE,
  SYNC_STATUS,
  REORDER_KEY_PREFIX,
  ERROR_FIELD,
  getErrorKey,
  ReorderableList,
  FieldError,
  StatusBadge,
} from "./SharedUI";

interface PlansTabProps {
  plans: CmsPlanRow[];
  activeKey: string | null;
  draft: CmsPlanRow | null;
  errors: Record<string, string>;
  newPlanKey: string;
  showNewPlanInput: boolean;
  isLoadingPlans: boolean;
  plansError: string | null;
  isDirty: boolean;
  isSavingPlan: (key: string) => boolean;
  dispatch: React.Dispatch<any>;
  refetchPlans: () => void;
  handleSavePlan: () => Promise<void>;
  handlePublishPlan: () => Promise<void>;
  handleUnpublishPlan: () => Promise<void>;
  handleCreatePlan: () => Promise<void>;
  ACTION: any;
}

export default function PlansTab({
  plans,
  activeKey,
  draft,
  errors,
  newPlanKey,
  showNewPlanInput,
  isLoadingPlans,
  plansError,
  isDirty,
  isSavingPlan,
  dispatch,
  refetchPlans,
  handleSavePlan,
  handlePublishPlan,
  handleUnpublishPlan,
  handleCreatePlan,
  ACTION,
}: PlansTabProps) {
  return (
    <div className="mb-10 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-500" />
            {SUBSCRIBATION_TEXT.SECTION_CMS_TITLE}
          </h2>
          <p className="text-xs text-slate-500">
            {SUBSCRIBATION_TEXT.SECTION_CMS_SUBTITLE}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refetchPlans}
            className="text-xs h-9"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Refresh
          </Button>
          {showNewPlanInput ? (
            <div className="flex items-center gap-1.5">
              <Input
                autoFocus
                placeholder={SUBSCRIBATION_TEXT.NEW_PLAN_PLACEHOLDER}
                value={newPlanKey}
                onChange={(e) =>
                  dispatch({
                    type: ACTION.SET_NEW_PLAN_KEY,
                    payload: e.target.value,
                  })
                }
                onKeyDown={(e) => e.key === "Enter" && handleCreatePlan()}
                className="w-36 h-9 text-xs"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCreatePlan}
                className="h-9 text-xs"
              >
                Create
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  dispatch({
                    type: ACTION.SET_SHOW_NEW_PLAN_INPUT,
                    payload: false,
                  })
                }
                className="h-9 text-xs"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() =>
                dispatch({
                  type: ACTION.SET_SHOW_NEW_PLAN_INPUT,
                  payload: true,
                })
              }
              className="h-9 text-xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Plan
            </Button>
          )}
        </div>
      </div>

      {plansError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-6">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {plansError}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={refetchPlans}
          >
            Retry
          </Button>
        </div>
      )}

      {isLoadingPlans ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : plans.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No plans yet — create one to get started.
        </p>
      ) : (
        <>
          {/* Catalog Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {plans.map((plan) => {
              const monthly = plan.prices.find(
                (p) => p.interval === PriceInterval.MONTHLY,
              );
              const unsynced = plan.prices.some(
                (p: any) =>
                  p.sync_status && p.sync_status !== SYNC_STATUS.SYNCED,
              );
              const isActive = plan.plan_key === activeKey;

              return (
                <button
                  key={plan.plan_key}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: ACTION.SET_ACTIVE_KEY,
                      payload: isActive ? null : plan.plan_key,
                    })
                  }
                  className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left shadow-xs transition-all ${
                    isActive
                      ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-semibold text-sm capitalize text-slate-900">
                      {plan.plan_key}
                    </span>
                    <StatusBadge status={plan.status} />
                  </div>
                  <div className="text-xl font-bold tracking-tight text-slate-900 mt-1">
                    {monthly
                      ? formatMinorUnits(
                          monthly.amount_minor_units,
                          monthly.currency_exponent,
                          monthly.currency,
                        )
                      : "No price set"}
                    {monthly && (
                      <span className="text-xs font-normal text-slate-400">
                        {" "}
                        /mo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>v{plan.version}</span>
                    <span>·</span>
                    <span>{plan.features.length} features</span>
                    {unsynced && (
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        Pending sync
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* CMS Plan Editor Container */}
          {draft && (
            <div className="border-t border-slate-100 pt-6 mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-150 bg-slate-50/50 p-4 mb-6 shadow-xs">
                <div className="flex items-center gap-3">
                  <h3 className="text-md font-bold capitalize text-slate-900">
                    {draft.plan_key}
                  </h3>
                  <StatusBadge status={draft.status} />
                  <span className="text-xs text-slate-400">
                    v{draft.version}
                  </span>
                  {isDirty && (
                    <span className="text-xs font-semibold text-amber-600">
                      {SUBSCRIBATION_TEXT.CMS_EDITOR.UNSAVED_CHANGES}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSavePlan}
                    disabled={isSavingPlan(draft.plan_key) || !isDirty}
                    className="h-8 text-xs font-semibold"
                  >
                    {isSavingPlan(draft.plan_key) ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-3.5 w-3.5" />
                    )}
                    {SUBSCRIBATION_TEXT.CMS_EDITOR.SAVE_DRAFT_BTN}
                  </Button>
                  {draft.status === PlanStatus.LIVE ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleUnpublishPlan}
                      disabled={isSavingPlan(draft.plan_key) || isDirty}
                      className="h-8 text-xs font-semibold"
                    >
                      <EyeOff className="mr-2 h-3.5 w-3.5" />
                      {SUBSCRIBATION_TEXT.CMS_EDITOR.UNPUBLISH_BTN}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handlePublishPlan}
                      disabled={
                        isSavingPlan(draft.plan_key) ||
                        draft.status !== PlanStatus.DRAFT ||
                        isDirty
                      }
                      className="h-8 text-xs font-semibold"
                    >
                      <UploadCloud className="mr-2 h-3.5 w-3.5" />
                      {SUBSCRIBATION_TEXT.CMS_EDITOR.PUBLISH_LIVE_BTN}
                    </Button>
                  )}
                </div>
              </div>

              {/* Plan Description Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6 space-y-2">
                <Label
                  htmlFor="plan-description"
                  className="font-bold text-sm text-slate-900"
                >
                  {SUBSCRIBATION_TEXT.ACTIONS.PLAN_DESC_LABEL}
                </Label>
                <p className="text-xs text-slate-500">
                  {SUBSCRIBATION_TEXT.ACTIONS.PLAN_DESC_SUBTITLE}
                </p>
                <Input
                  id="plan-description"
                  type="text"
                  value={draft.description || ""}
                  onChange={(e) => {
                    dispatch({
                      type: ACTION.UPDATE_DRAFT,
                      payload: { ...draft, description: e.target.value },
                    });
                  }}
                  placeholder={SUBSCRIBATION_TEXT.ACTIONS.PLAN_DESC_PLACEHOLDER}
                  className="text-xs"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                {/* Prices and Features section */}
                <div className="space-y-6">
                  {/* Prices Section */}
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">
                        {SUBSCRIBATION_TEXT.CMS_EDITOR.PRICING_TITLE}
                      </h4>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          const next = [
                            ...draft.prices,
                            { ...DEFAULT_PRICE },
                          ];
                          dispatch({
                            type: ACTION.UPDATE_DRAFT,
                            payload: { ...draft, prices: next },
                          });
                        }}
                        className="h-8 px-2 text-xs"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {SUBSCRIBATION_TEXT.CMS_EDITOR.ADD_PRICE_BTN}
                      </Button>
                    </div>
                    <FieldError message={errors[ERROR_FIELD.PRICES]} />

                    <ReorderableList
                      items={draft.prices}
                      getKey={(_, i) => `${REORDER_KEY_PREFIX.PRICE}-${i}`}
                      onReorder={(prices) =>
                        dispatch({
                          type: ACTION.UPDATE_DRAFT,
                          payload: { ...draft, prices },
                        })
                      }
                      className="space-y-2"
                    >
                      {({
                        item: price,
                        index: i,
                        isDragging,
                        isDropTarget,
                        dragHandleProps,
                      }) => (
                        <div
                          className={`flex flex-wrap items-end gap-3 rounded-xl border bg-slate-50/30 p-3 transition-colors sm:flex-nowrap ${
                            isDragging ? "opacity-60" : ""
                          } ${isDropTarget ? "border-blue-500" : "border-slate-200"}`}
                        >
                          <button
                            type="button"
                            className="mb-2 cursor-grab touch-none text-slate-400 active:cursor-grabbing"
                            {...dragHandleProps}
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>

                          <div className="grid min-w-[70px] gap-1">
                            <Label className="text-xs text-slate-500">
                              {SUBSCRIBATION_TEXT.CMS_EDITOR.LABEL_CURRENCY}
                            </Label>
                            <Input
                              value={price.currency}
                              maxLength={3}
                              onChange={(e) => {
                                const next = [...draft.prices];
                                next[i] = {
                                  ...next[i],
                                  currency: e.target.value.toUpperCase(),
                                };
                                dispatch({
                                  type: ACTION.UPDATE_DRAFT,
                                  payload: { ...draft, prices: next },
                                });
                              }}
                              className="uppercase text-xs h-8"
                            />
                            <FieldError
                              message={
                                errors[
                                  getErrorKey(
                                    ERROR_FIELD.PRICES,
                                    i,
                                    ERROR_FIELD.CURRENCY,
                                  )
                                ]
                              }
                            />
                          </div>

                          <div className="grid min-w-[110px] gap-1">
                            <Label className="text-xs text-slate-500">
                              {SUBSCRIBATION_TEXT.CMS_EDITOR.LABEL_INTERVAL}
                            </Label>
                            <Select
                              value={price.interval}
                              onValueChange={(v) => {
                                const next = [...draft.prices];
                                next[i] = {
                                  ...next[i],
                                  interval: v as PriceInterval,
                                };
                                dispatch({
                                  type: ACTION.UPDATE_DRAFT,
                                  payload: { ...draft, prices: next },
                                });
                              }}
                            >
                              <SelectTrigger className="text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(PriceInterval).map(
                                  (interval) => (
                                    <SelectItem
                                      key={interval}
                                      value={interval}
                                      className="text-xs"
                                    >
                                      {interval}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid min-w-[120px] flex-1 gap-1">
                            <Label className="text-xs text-slate-500">
                              {SUBSCRIBATION_TEXT.CMS_EDITOR.LABEL_AMOUNT} (
                              {price.currency})
                            </Label>
                            <Input
                              type="number"
                              step={1 / 10 ** price.currency_exponent}
                              value={
                                price.amount_minor_units /
                                10 ** price.currency_exponent
                              }
                              onChange={(e) => {
                                const val = parseFloat(
                                  e.target.value ||
                                    String(DEFAULT_AMOUNT_MINOR_UNITS),
                                );
                                const next = [...draft.prices];
                                next[i] = {
                                  ...next[i],
                                  amount_minor_units: majorToMinorUnits(
                                    val,
                                    price.currency_exponent,
                                  ),
                                };
                                dispatch({
                                  type: ACTION.UPDATE_DRAFT,
                                  payload: { ...draft, prices: next },
                                });
                              }}
                              className="text-xs h-8"
                            />
                            <FieldError
                              message={
                                errors[
                                  getErrorKey(
                                    ERROR_FIELD.PRICES,
                                    i,
                                    ERROR_FIELD.AMOUNT_MINOR_UNITS,
                                  )
                                ]
                              }
                            />
                          </div>

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="mb-0.5 text-destructive/70 hover:text-destructive h-8 w-8"
                            onClick={() => {
                              const next = draft.prices.filter(
                                (_, idx) => idx !== i,
                              );
                              dispatch({
                                type: ACTION.UPDATE_DRAFT,
                                payload: { ...draft, prices: next },
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </ReorderableList>

                    {draft.prices.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                        {SUBSCRIBATION_TEXT.CMS_EDITOR.NO_PRICES}
                      </p>
                    )}
                  </div>

                  {/* Features Section */}
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          {SUBSCRIBATION_TEXT.CMS_EDITOR.FEATURES_TITLE}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {SUBSCRIBATION_TEXT.CMS_EDITOR.FEATURES_SUBTITLE}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          const next = [
                            ...draft.features,
                            { ...DEFAULT_FEATURE },
                          ];
                          dispatch({
                            type: ACTION.UPDATE_DRAFT,
                            payload: { ...draft, features: next },
                          });
                        }}
                        className="h-8 px-2 text-xs"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {SUBSCRIBATION_TEXT.CMS_EDITOR.ADD_FEATURE_BTN}
                      </Button>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto pr-1.5 space-y-2">
                      <ReorderableList
                        items={draft.features}
                        getKey={(_, i) =>
                          `${REORDER_KEY_PREFIX.FEATURE}-${i}`
                        }
                        onReorder={(features) =>
                          dispatch({
                            type: ACTION.UPDATE_DRAFT,
                            payload: { ...draft, features },
                          })
                        }
                        className="space-y-2"
                      >
                        {({
                          item: feature,
                          index: i,
                          isDragging,
                          isDropTarget,
                          dragHandleProps,
                        }) => (
                          <div
                            className={`flex flex-wrap items-end gap-3 rounded-xl border bg-slate-50/30 p-3 transition-colors sm:flex-nowrap ${
                              isDragging ? "opacity-60" : ""
                            } ${isDropTarget ? "border-blue-500" : "border-slate-200"}`}
                          >
                            <button
                              type="button"
                              className="mb-2 cursor-grab touch-none text-slate-400 active:cursor-grabbing"
                              {...dragHandleProps}
                            >
                              <GripVertical className="h-4 w-4" />
                            </button>

                            <div className="grid min-w-[130px] flex-1 gap-1">
                              <Label className="text-xs text-slate-500">
                                {
                                  SUBSCRIBATION_TEXT.ACTIONS
                                    .FEATURE_KEY_LABEL
                                }
                              </Label>
                              <Input
                                value={feature.feature_key.replace(
                                  /_/g,
                                  " ",
                                )}
                                placeholder={
                                  SUBSCRIBATION_TEXT.ACTIONS
                                    .FEATURE_KEY_PLACEHOLDER
                                }
                                onChange={(e) => {
                                  const next = [...draft.features];
                                  next[i] = {
                                    ...next[i],
                                    feature_key: e.target.value
                                      .toLowerCase()
                                      .replace(/\s+/g, "_"),
                                  };
                                  dispatch({
                                    type: ACTION.UPDATE_DRAFT,
                                    payload: { ...draft, features: next },
                                  });
                                }}
                                className="text-xs h-8 capitalize"
                              />
                              <FieldError
                                message={
                                  errors[
                                    getErrorKey(
                                      ERROR_FIELD.FEATURES,
                                      i,
                                      ERROR_FIELD.FEATURE_KEY,
                                    )
                                  ]
                                }
                              />
                            </div>

                            <div className="grid min-w-[120px] gap-1">
                              <Label className="text-xs text-slate-500">
                                {
                                  SUBSCRIBATION_TEXT.CMS_EDITOR
                                    .LABEL_BEHAVIOR
                                }
                              </Label>
                              <Select
                                value={
                                  feature.type === FeatureType.BOOLEAN
                                    ? "toggle"
                                    : "text"
                                }
                                onValueChange={(mode) => {
                                  const next = [...draft.features];
                                  if (mode === "toggle") {
                                    next[i] = {
                                      ...next[i],
                                      type: FeatureType.BOOLEAN,
                                      value: BOOLEAN_VALUE.FALSE,
                                    };
                                  } else {
                                    const currentVal = next[i].value;
                                    const isNum = /^-?\d+$/.test(
                                      currentVal,
                                    );
                                    next[i] = {
                                      ...next[i],
                                      type: isNum
                                        ? FeatureType.NUMBER
                                        : FeatureType.TEXT,
                                      value:
                                        currentVal === "true" ||
                                        currentVal === "false"
                                          ? ""
                                          : currentVal,
                                    };
                                  }
                                  dispatch({
                                    type: ACTION.UPDATE_DRAFT,
                                    payload: { ...draft, features: next },
                                  });
                                }}
                              >
                                <SelectTrigger className="text-xs h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem
                                    value="toggle"
                                    className="text-xs"
                                  >
                                    {
                                      SUBSCRIBATION_TEXT.CMS_EDITOR
                                        .BEHAVIOR_TOGGLE
                                    }
                                  </SelectItem>
                                  <SelectItem
                                    value="text"
                                    className="text-xs"
                                  >
                                    Text / Limit Value
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid min-w-[150px] flex-1 gap-1">
                              <Label className="text-xs text-slate-500">
                                {SUBSCRIBATION_TEXT.CMS_EDITOR.LABEL_VALUE}
                              </Label>
                              {feature.type === FeatureType.BOOLEAN ? (
                                <div className="flex items-center gap-2 h-8 mt-1.5">
                                  <Switch
                                    checked={feature.value === "true"}
                                    onCheckedChange={(checked) => {
                                      const next = [...draft.features];
                                      next[i] = {
                                        ...next[i],
                                        value: checked ? "true" : "false",
                                      };
                                      dispatch({
                                        type: ACTION.UPDATE_DRAFT,
                                        payload: {
                                          ...draft,
                                          features: next,
                                        },
                                      });
                                    }}
                                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200 transition-colors"
                                  />
                                  <span className="text-xs font-medium text-slate-600 select-none">
                                    {feature.value === "true"
                                      ? SUBSCRIBATION_TEXT.CMS_EDITOR
                                          .TOGGLE_ENABLED
                                      : SUBSCRIBATION_TEXT.CMS_EDITOR
                                          .TOGGLE_DISABLED}
                                  </span>
                                </div>
                              ) : (
                                <Input
                                  type="text"
                                  value={
                                    feature.value === UNLIMITED_VALUE_RAW
                                      ? UNLIMITED_VALUE_DISPLAY
                                      : feature.value
                                  }
                                  placeholder={
                                    SUBSCRIBATION_TEXT.CMS_EDITOR
                                      .FEATURE_VALUE_PLACEHOLDER
                                  }
                                  onChange={(e) => {
                                    let val = e.target.value;
                                    if (
                                      val.trim().toLowerCase() ===
                                      UNLIMITED_VALUE_DISPLAY.toLowerCase()
                                    ) {
                                      val = UNLIMITED_VALUE_RAW;
                                    }
                                    const isNum = /^-?\d+$/.test(val);
                                    const next = [...draft.features];
                                    next[i] = {
                                      ...next[i],
                                      type: isNum
                                        ? FeatureType.NUMBER
                                        : FeatureType.TEXT,
                                      value: val,
                                    };
                                    dispatch({
                                      type: ACTION.UPDATE_DRAFT,
                                      payload: { ...draft, features: next },
                                    });
                                  }}
                                  className="text-xs h-8"
                                />
                              )}
                              <FieldError
                                message={
                                  errors[
                                    getErrorKey(
                                      ERROR_FIELD.FEATURES,
                                      i,
                                      ERROR_FIELD.VALUE,
                                    )
                                  ]
                                }
                              />
                            </div>

                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="mb-0.5 text-destructive/70 hover:text-destructive h-8 w-8"
                              onClick={() => {
                                const next = draft.features.filter(
                                  (_, idx) => idx !== i,
                                );
                                dispatch({
                                  type: ACTION.UPDATE_DRAFT,
                                  payload: { ...draft, features: next },
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </ReorderableList>
                    </div>

                    {draft.features.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                        {SUBSCRIBATION_TEXT.CMS_EDITOR.NO_FEATURES}
                      </p>
                    )}
                  </div>
                </div>

                {/* Real-time storefront preview card */}
                <div className="lg:sticky lg:top-6 lg:self-start">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Eye className="h-3.5 w-3.5" />
                      {SUBSCRIBATION_TEXT.ACTIONS.PREVIEW_TITLE}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {draft.plan_key}
                      </div>
                      <div className="mt-2.5 flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-500">
                          {draft.prices.find(
                            (p) => p.interval === PriceInterval.MONTHLY,
                          )?.currency || DEFAULT_CURRENCY}
                        </span>
                        <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                          {(() => {
                            const monthly = draft.prices.find(
                              (p) => p.interval === PriceInterval.MONTHLY,
                            );
                            return monthly
                              ? monthly.amount_minor_units /
                                  10 ** monthly.currency_exponent
                              : DEFAULT_AMOUNT_MINOR_UNITS;
                          })()}
                        </span>
                        <span className="text-xs text-slate-400">
                          {SUBSCRIBATION_TEXT.CMS_EDITOR.MONTHLY_LABEL}
                        </span>
                      </div>

                      {(() => {
                        const yearly = draft.prices.find(
                          (p) => p.interval === PriceInterval.YEARLY,
                        );
                        if (!yearly || yearly.amount_minor_units === 0)
                          return null;
                        const monthlyEq = Math.round(
                          yearly.amount_minor_units /
                            10 ** yearly.currency_exponent /
                            12,
                        );
                        return (
                          <p className="mt-1 text-[11px] text-slate-400">
                            {formatMinorUnits(
                              yearly.amount_minor_units,
                              yearly.currency_exponent,
                              yearly.currency,
                            )}{" "}
                            {
                              SUBSCRIBATION_TEXT.CMS_EDITOR
                                .BILLED_ANNUALLY_LABEL
                            }{" "}
                            (≈ {yearly.currency} {monthlyEq}
                            {SUBSCRIBATION_TEXT.CMS_EDITOR.MONTHLY_LABEL})
                          </p>
                        );
                      })()}

                      <p className="mt-3 text-xs text-slate-500 leading-relaxed font-normal">
                        {draft.description ||
                          SUBSCRIBATION_TEXT.CMS_EDITOR
                            .PREVIEW_DEFAULT_DESC}
                      </p>

                      <div className="my-4 h-px w-full bg-slate-100" />

                      {(() => {
                        const features = draft.features
                          .map(formatFeatureDisplay)
                          .filter(Boolean);
                        if (features.length === 0) {
                          return (
                            <p className="text-xs text-slate-400 italic">
                              {
                                SUBSCRIBATION_TEXT.CMS_EDITOR
                                  .PREVIEW_NO_FEATURES
                              }
                            </p>
                          );
                        }
                        return (
                          <div className="max-h-[250px] overflow-y-auto pr-1">
                            <ul className="space-y-1.5">
                              {features.map((f) => (
                                <li
                                  key={f}
                                  className="flex items-start gap-2 text-xs text-slate-600"
                                >
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
