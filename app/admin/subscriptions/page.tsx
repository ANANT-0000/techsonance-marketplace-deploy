"use client";

import React, { useEffect, useMemo, useReducer, useCallback } from "react";
import { CreditCard, Users, ShieldCheck, Layers } from "lucide-react";
import { toast } from "sonner";

import {
  CmsPlanRow,
  useCmsSubscriptionPlans,
  validatePlanDraft,
  ValidationErrors,
} from "@/hooks/useCmsSubscriptionPlans";
import { SubscriptionStatus, SubscriptionPlan } from "@/utils/Types";

import { authToken } from "@/utils/authToken";
import {
  fetchAdminSubscriptions,
  updateVendorSubscription,
  fetchLiveSubscriptionPlans,
} from "@/utils/adminApiClients";
import { SUBSCRIBATION_TEXT } from "@/constants/adminText";
import AxiosAPI from "@/lib/axios";
import { toDatetimeLocal } from "@/lib/utils";

import {
  VendorSubscriptionRow,
  PlanFeatureLimit,
  VendorQuotaItem,
} from "@/components/common/subscriptions/SharedUI";
import PlansTab from "@/components/common/subscriptions/PlansTab";
import VendorsTab from "@/components/common/subscriptions/VendorsTab";
import QuotasTab from "@/components/common/subscriptions/QuotasTab";
import CatalogTab from "@/components/common/subscriptions/CatalogTab";
import VendorEditModal from "@/components/common/subscriptions/VendorEditModal";

export enum ACTION {
  SET_ACTIVE_KEY = "SET_ACTIVE_KEY",
  RESET_DRAFT = "RESET_DRAFT",
  UPDATE_DRAFT = "UPDATE_DRAFT",
  SET_ERRORS = "SET_ERRORS",
  SET_NEW_PLAN_KEY = "SET_NEW_PLAN_KEY",
  SET_SHOW_NEW_PLAN_INPUT = "SET_SHOW_NEW_PLAN_INPUT",
  PLAN_CREATED = "PLAN_CREATED",
  SET_ACTIVE_TAB = "SET_ACTIVE_TAB",

  SET_VENDORS = "SET_VENDORS",
  SET_LOADING_VENDORS = "SET_LOADING_VENDORS",
  SET_VENDORS_ERROR = "SET_VENDORS_ERROR",
  SET_SEARCH_QUERY = "SET_SEARCH_QUERY",
  SET_FILTER_STATUS = "SET_FILTER_STATUS",
  SET_CURRENT_PAGE = "SET_CURRENT_PAGE",
  SET_LIVE_PLANS = "SET_LIVE_PLANS",

  OPEN_EDIT_MODAL = "OPEN_EDIT_MODAL",
  CLOSE_EDIT_MODAL = "CLOSE_EDIT_MODAL",
  UPDATE_EDIT_FIELD = "UPDATE_EDIT_FIELD",
  SET_SAVING_VENDOR = "SET_SAVING_VENDOR",

  // Quota Rules tab
  SET_SELECTED_QUOTA_PLAN = "SET_SELECTED_QUOTA_PLAN",
  SET_QUOTA_LIMITS = "SET_QUOTA_LIMITS",
  UPDATE_QUOTA_LIMIT = "UPDATE_QUOTA_LIMIT",
  SET_LOADING_QUOTAS = "SET_LOADING_QUOTAS",
  SET_SAVING_QUOTA = "SET_SAVING_QUOTA",

  // Vendor modal quota widget
  SET_VENDOR_QUOTA_USAGE = "SET_VENDOR_QUOTA_USAGE",
  SET_LOADING_VENDOR_QUOTA = "SET_LOADING_VENDOR_QUOTA",
}

export type ReducerState = {
  // Plan CMS State
  activeKey: string | null;
  draft: CmsPlanRow | null;
  errors: ValidationErrors;
  newPlanKey: string;
  showNewPlanInput: boolean;
  activeTab: "plans" | "vendors" | "quotas" | "catalog";

  // Vendor lifecycle State
  vendors: VendorSubscriptionRow[];
  isLoadingVendors: boolean;
  vendorsError: string | null;
  searchQuery: string;
  filterStatus: string;
  currentPage: number;
  itemsPerPage: number;
  livePlans: SubscriptionPlan[];

  // Selected vendor edit State (modal dialog inputs)
  selectedVendor: VendorSubscriptionRow | null;
  isSavingVendor: boolean;
  editPlanId: string;
  editStatus: SubscriptionStatus | "";
  editTrialStartsAt: string;
  editTrialEndsAt: string;
  editCurrentPeriodStart: string;
  editCurrentPeriodEnd: string;
  editGracePeriodEndsAt: string;
  editCancelledAt: string;

  // Quota Rules tab
  selectedQuotaPlanKey: string | null;
  quotaLimits: PlanFeatureLimit[];
  isLoadingQuotas: boolean;
  isSavingQuota: boolean;

  // Vendor modal quota usage widget
  vendorQuotaUsage: VendorQuotaItem[];
  isLoadingVendorQuota: boolean;
};

const INITIAL_STATE: ReducerState = {
  activeKey: null,
  draft: null,
  errors: {},
  newPlanKey: "",
  showNewPlanInput: false,
  activeTab: "plans",

  vendors: [],
  isLoadingVendors: false,
  vendorsError: null,
  searchQuery: "",
  filterStatus: "__all__",
  currentPage: 1,
  itemsPerPage: 10,
  livePlans: [],

  selectedVendor: null,
  isSavingVendor: false,
  editPlanId: "",
  editStatus: "",
  editTrialStartsAt: "",
  editTrialEndsAt: "",
  editCurrentPeriodStart: "",
  editCurrentPeriodEnd: "",
  editGracePeriodEndsAt: "",
  editCancelledAt: "",

  selectedQuotaPlanKey: null,
  quotaLimits: [],
  isLoadingQuotas: false,
  isSavingQuota: false,

  vendorQuotaUsage: [],
  isLoadingVendorQuota: false,
};

export type PageAction =
  | { type: ACTION.SET_ACTIVE_KEY; payload: string | null }
  | { type: ACTION.RESET_DRAFT; payload: CmsPlanRow | null }
  | { type: ACTION.UPDATE_DRAFT; payload: CmsPlanRow }
  | { type: ACTION.SET_ERRORS; payload: ValidationErrors }
  | { type: ACTION.SET_NEW_PLAN_KEY; payload: string }
  | { type: ACTION.SET_SHOW_NEW_PLAN_INPUT; payload: boolean }
  | { type: ACTION.PLAN_CREATED; payload: string }
  | { type: ACTION.SET_VENDORS; payload: VendorSubscriptionRow[] }
  | { type: ACTION.SET_LOADING_VENDORS; payload: boolean }
  | { type: ACTION.SET_VENDORS_ERROR; payload: string | null }
  | { type: ACTION.SET_SEARCH_QUERY; payload: string }
  | { type: ACTION.SET_FILTER_STATUS; payload: string }
  | { type: ACTION.SET_CURRENT_PAGE; payload: number }
  | { type: ACTION.SET_LIVE_PLANS; payload: SubscriptionPlan[] }
  | { type: ACTION.OPEN_EDIT_MODAL; payload: VendorSubscriptionRow }
  | { type: ACTION.CLOSE_EDIT_MODAL }
  | {
      type: ACTION.UPDATE_EDIT_FIELD;
      payload: { key: string; value: string | SubscriptionStatus };
    }
  | { type: ACTION.SET_SAVING_VENDOR; payload: boolean }
  | {
      type: ACTION.SET_ACTIVE_TAB;
      payload: "plans" | "vendors" | "quotas" | "catalog";
    }
  // Quota Rules tab
  | { type: ACTION.SET_SELECTED_QUOTA_PLAN; payload: string | null }
  | { type: ACTION.SET_QUOTA_LIMITS; payload: PlanFeatureLimit[] }
  | {
      type: ACTION.UPDATE_QUOTA_LIMIT;
      payload: { index: number; limit: PlanFeatureLimit };
    }
  | { type: ACTION.SET_LOADING_QUOTAS; payload: boolean }
  | { type: ACTION.SET_SAVING_QUOTA; payload: boolean }
  // Vendor modal quota widget
  | { type: ACTION.SET_VENDOR_QUOTA_USAGE; payload: VendorQuotaItem[] }
  | { type: ACTION.SET_LOADING_VENDOR_QUOTA; payload: boolean };

function Reducer(state: ReducerState, action: PageAction): ReducerState {
  switch (action.type) {
    case ACTION.SET_ACTIVE_KEY:
      return { ...state, activeKey: action.payload };
    case ACTION.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    case ACTION.RESET_DRAFT:
      return { ...state, draft: action.payload, errors: {} };
    case ACTION.UPDATE_DRAFT:
      return { ...state, draft: action.payload };
    case ACTION.SET_ERRORS:
      return { ...state, errors: action.payload };
    case ACTION.SET_NEW_PLAN_KEY:
      return { ...state, newPlanKey: action.payload };
    case ACTION.SET_SHOW_NEW_PLAN_INPUT:
      return { ...state, showNewPlanInput: action.payload, newPlanKey: "" };
    case ACTION.PLAN_CREATED:
      return {
        ...state,
        activeKey: action.payload,
        newPlanKey: "",
        showNewPlanInput: false,
      };

    case ACTION.SET_VENDORS:
      return { ...state, vendors: action.payload, currentPage: 1 };
    case ACTION.SET_LOADING_VENDORS:
      return { ...state, isLoadingVendors: action.payload };
    case ACTION.SET_VENDORS_ERROR:
      return { ...state, vendorsError: action.payload };
    case ACTION.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case ACTION.SET_FILTER_STATUS:
      return { ...state, filterStatus: action.payload, currentPage: 1 };
    case ACTION.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    case ACTION.SET_LIVE_PLANS:
      return { ...state, livePlans: action.payload };

    case ACTION.OPEN_EDIT_MODAL: {
      const v = action.payload;
      return {
        ...state,
        selectedVendor: v,
        editPlanId: v.plan_id || "",
        editStatus: v.status || "",
        editTrialStartsAt: toDatetimeLocal(v.trial_starts_at),
        editTrialEndsAt: toDatetimeLocal(v.trial_ends_at),
        editCurrentPeriodStart: toDatetimeLocal(v.current_period_start),
        editCurrentPeriodEnd: toDatetimeLocal(v.current_period_end),
        editGracePeriodEndsAt: toDatetimeLocal(v.grace_period_ends_at),
        editCancelledAt: toDatetimeLocal(v.cancelled_at),
      };
    }
    case ACTION.CLOSE_EDIT_MODAL:
      return {
        ...state,
        selectedVendor: null,
      };
    case ACTION.UPDATE_EDIT_FIELD:
      return {
        ...state,
        [action.payload.key]: action.payload.value,
      };
    case ACTION.SET_SAVING_VENDOR:
      return { ...state, isSavingVendor: action.payload };

    // Quota Rules tab
    case ACTION.SET_SELECTED_QUOTA_PLAN:
      return {
        ...state,
        selectedQuotaPlanKey: action.payload,
        quotaLimits: [],
      };
    case ACTION.SET_QUOTA_LIMITS:
      return { ...state, quotaLimits: action.payload };
    case ACTION.UPDATE_QUOTA_LIMIT: {
      const next = [...state.quotaLimits];
      next[action.payload.index] = action.payload.limit;
      return { ...state, quotaLimits: next };
    }
    case ACTION.SET_LOADING_QUOTAS:
      return { ...state, isLoadingQuotas: action.payload };
    case ACTION.SET_SAVING_QUOTA:
      return { ...state, isSavingQuota: action.payload };

    // Vendor modal quota widget
    case ACTION.SET_VENDOR_QUOTA_USAGE:
      return { ...state, vendorQuotaUsage: action.payload };
    case ACTION.SET_LOADING_VENDOR_QUOTA:
      return { ...state, isLoadingVendorQuota: action.payload };

    default:
      return state;
  }
}

// Slugify helper
function slugify(rawKey: string): string {
  return rawKey.trim().toLowerCase().replace(/\s+/g, "-");
}

// ─── Main Subscriptions Workspace Panel ──────────────────────────────────────
export default function SubscriptionsWorkspace() {
  const token = authToken();

  // Plans CMS hook cache
  const {
    plans,
    isLoading: isLoadingPlans,
    error: plansError,
    isSaving: isSavingPlan,
    refetch: refetchPlans,
    saveDraft,
    publish,
    unpublish,
    createPlan,
  } = useCmsSubscriptionPlans();

  const [state, dispatch] = useReducer(Reducer, INITIAL_STATE);
  const {
    activeKey,
    draft,
    errors,
    newPlanKey,
    showNewPlanInput,
    vendors,
    isLoadingVendors,
    vendorsError,
    searchQuery,
    filterStatus,
    currentPage,
    itemsPerPage,
    selectedVendor,
    isSavingVendor,
    editPlanId,
    editStatus,
    editTrialStartsAt,
    editTrialEndsAt,
    editCurrentPeriodStart,
    editCurrentPeriodEnd,
    editGracePeriodEndsAt,
    editCancelledAt,
    livePlans,
    activeTab,
    selectedQuotaPlanKey,
    quotaLimits,
    isLoadingQuotas,
    isSavingQuota,
    vendorQuotaUsage,
    isLoadingVendorQuota,
  } = state;

  const activePlan = plans.find((p) => p.plan_key === activeKey) ?? null;

  // Reset local draft whenever plan selection changes
  useEffect(() => {
    dispatch({ type: ACTION.RESET_DRAFT, payload: activePlan });
  }, [activePlan?.plan_key, activePlan?.version]);

  // Load vendor subscriptions
  const loadVendors = useCallback(async () => {
    if (!token) return;
    dispatch({ type: ACTION.SET_LOADING_VENDORS, payload: true });
    dispatch({ type: ACTION.SET_VENDORS_ERROR, payload: null });
    try {
      const data = await fetchAdminSubscriptions(token);
      dispatch({
        type: ACTION.SET_VENDORS,
        payload: Array.isArray(data?.data) ? data.data : [],
      });
    } catch (err) {
      dispatch({
        type: ACTION.SET_VENDORS_ERROR,
        payload: SUBSCRIBATION_TEXT.ACTIONS.FETCH_ERROR,
      });
    } finally {
      dispatch({ type: ACTION.SET_LOADING_VENDORS, payload: false });
    }
  }, [token]);

  const loadLivePlans = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchLiveSubscriptionPlans(token);

      dispatch({
        type: ACTION.SET_LIVE_PLANS,
        payload: Array.isArray(data.data) ? data.data : [],
      });
    } catch (err) {}
  }, [token]);

  useEffect(() => {
    loadVendors();
    loadLivePlans();
  }, [loadVendors, loadLivePlans]);

  // Check dirty CMS plan status
  const isDirty = useMemo(
    () =>
      !!draft &&
      !!activePlan &&
      JSON.stringify(draft) !== JSON.stringify(activePlan),
    [draft, activePlan],
  );

  const handleSavePlan = async () => {
    if (!draft) return;
    const validationErrors = validatePlanDraft(draft);
    dispatch({ type: ACTION.SET_ERRORS, payload: validationErrors });
    if (Object.keys(validationErrors).length > 0) return;
    const res = await saveDraft(draft);
    if (res?.ok) {
      loadVendors(); // Refresh vendor plans
    }
  };

  const handlePublishPlan = async () => {
    if (!draft) return;
    const ok = await publish(draft.plan_key);
    if (ok) {
      loadVendors(); // Refresh vendor plans
    }
  };

  const handleUnpublishPlan = async () => {
    if (!draft) return;
    const ok = await unpublish(draft.plan_key);
    if (ok) {
      loadVendors(); // Refresh vendor plans
    }
  };

  const handleCreatePlan = async () => {
    const result = await createPlan(newPlanKey);
    if (result.ok) {
      dispatch({
        type: ACTION.PLAN_CREATED,
        payload: slugify(newPlanKey),
      });
    }
  };

  // Vendor list logic (filtering & searching client-side)
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const query = searchQuery.trim().toLowerCase();
      const companyName = (v.company?.company_name || "").toLowerCase();
      const domain = (v.company?.company_domain || "").toLowerCase();

      const matchesSearch =
        companyName.includes(query) || domain.includes(query);
      const matchesStatus =
        filterStatus === "__all__" || filterStatus === ""
          ? true
          : v.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchQuery, filterStatus]);

  // Pagination bounds
  const totalPages = Math.max(
    1,
    Math.ceil(filteredVendors.length / itemsPerPage),
  );
  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVendors.slice(start, start + itemsPerPage);
  }, [filteredVendors, currentPage, itemsPerPage]);

  // Edit vendor subscription submit
  const handleUpdateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || !token) return;
    dispatch({ type: ACTION.SET_SAVING_VENDOR, payload: true });

    const payload = {
      plan_id: editPlanId || null,
      status: editStatus || null,
      trial_starts_at: editTrialStartsAt
        ? new Date(editTrialStartsAt).toISOString()
        : null,
      trial_ends_at: editTrialEndsAt
        ? new Date(editTrialEndsAt).toISOString()
        : null,
      current_period_start: editCurrentPeriodStart
        ? new Date(editCurrentPeriodStart).toISOString()
        : null,
      current_period_end: editCurrentPeriodEnd
        ? new Date(editCurrentPeriodEnd).toISOString()
        : null,
      grace_period_ends_at: editGracePeriodEndsAt
        ? new Date(editGracePeriodEndsAt).toISOString()
        : null,
      cancelled_at: editCancelledAt
        ? new Date(editCancelledAt).toISOString()
        : null,
    };

    try {
      await updateVendorSubscription(selectedVendor.id, payload, token);
      toast.success(SUBSCRIBATION_TEXT.ACTIONS.SUCCESS_UPDATE);
      dispatch({ type: ACTION.CLOSE_EDIT_MODAL });
      loadVendors();
    } catch (err) {
      toast.error(SUBSCRIBATION_TEXT.ACTIONS.FAILED_UPDATE);
    } finally {
      dispatch({ type: ACTION.SET_SAVING_VENDOR, payload: false });
    }
  };

  // Load plan_feature_limits for selected quota plan
  const loadQuotaLimits = useCallback(
    async (planKey: string) => {
      if (!token) return;
      dispatch({ type: ACTION.SET_LOADING_QUOTAS, payload: true });
      try {
        const res = await AxiosAPI.get(
          `/v1/admin/subscription-plans/${planKey}/feature-limits`,
          {
            headers: {
              "x-suppress-redirect": "true",
            },
          }
        );
        dispatch({
          type: ACTION.SET_QUOTA_LIMITS,
          payload: Array.isArray(res.data?.data) ? res.data.data : [],
        });
      } catch {
        toast.error("Failed to load quota limits for this plan.");
      } finally {
        dispatch({ type: ACTION.SET_LOADING_QUOTAS, payload: false });
      }
    },
    [token],
  );

  // Load vendor quota usage for the edit modal
  const loadVendorQuota = useCallback(async (companyId: string) => {
    dispatch({ type: ACTION.SET_LOADING_VENDOR_QUOTA, payload: true });
    dispatch({ type: ACTION.SET_VENDOR_QUOTA_USAGE, payload: [] });
    try {
      const res = await AxiosAPI.get(
        `/v1/admin/entitlements/${companyId}/usage`,
        {
          headers: {
            "x-suppress-redirect": "true",
          },
        }
      );
      dispatch({
        type: ACTION.SET_VENDOR_QUOTA_USAGE,
        payload: Array.isArray(res.data?.data) ? res.data.data : [],
      });
    } catch {
      // Quota widget is best-effort — fail silently, don't block modal
    } finally {
      dispatch({ type: ACTION.SET_LOADING_VENDOR_QUOTA, payload: false });
    }
  }, []);

  // Save a single plan_feature_limit row
  const handleSaveQuotaLimit = async (
    limit: PlanFeatureLimit,
    index: number,
  ) => {
    if (!selectedQuotaPlanKey || !token) return;
    dispatch({ type: ACTION.SET_SAVING_QUOTA, payload: true });
    try {
      await AxiosAPI.put(
        `/v1/admin/subscription-plans/${selectedQuotaPlanKey}/feature-limits/${limit.feature_id}`,
        {
          is_enabled: limit.is_enabled,
          is_unlimited: limit.is_unlimited,
          limit_value: limit.is_unlimited ? null : limit.limit_value,
          reset_interval: limit.reset_interval,
        },
        {
          headers: {
            "x-suppress-redirect": "true",
          },
        }
      );
      toast.success(`Quota limit saved for "${limit.feature_key}".`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to save quota limit.",
      );
    } finally {
      dispatch({ type: ACTION.SET_SAVING_QUOTA, payload: false });
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen max-h-screen bg-slate-50 overflow-y-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {SUBSCRIBATION_TEXT.PAGE_TITLE}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {SUBSCRIBATION_TEXT.PAGE_DESCRIPTION}
          </p>
        </div>
      </div>

      {/* Modern Pill Switcher */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-1.5 shadow-xs flex gap-1 max-w-2xl">
        <button
          type="button"
          onClick={() =>
            dispatch({ type: ACTION.SET_ACTIVE_TAB, payload: "plans" })
          }
          className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-semibold transition-all ${
            activeTab === "plans"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          {SUBSCRIBATION_TEXT.SECTION_CMS_TITLE}
        </button>
        <button
          type="button"
          onClick={() =>
            dispatch({ type: ACTION.SET_ACTIVE_TAB, payload: "vendors" })
          }
          className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-semibold transition-all ${
            activeTab === "vendors"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          {SUBSCRIBATION_TEXT.SECTION_LIFECYCLE_TITLE}
        </button>
        <button
          type="button"
          onClick={() =>
            dispatch({ type: ACTION.SET_ACTIVE_TAB, payload: "quotas" })
          }
          className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-semibold transition-all ${
            activeTab === "quotas"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Quota Rules
        </button>
        <button
          type="button"
          onClick={() =>
            dispatch({ type: ACTION.SET_ACTIVE_TAB, payload: "catalog" })
          }
          className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-semibold transition-all ${
            activeTab === "catalog"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <Layers className="h-4 w-4" />
          Features Catalog
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 1: SUBSCRIPTION PLANS CMS SECTION */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === "plans" && (
        <PlansTab
          plans={plans}
          activeKey={activeKey}
          draft={draft}
          errors={errors as Record<string, string>}
          newPlanKey={newPlanKey}
          showNewPlanInput={showNewPlanInput}
          isLoadingPlans={isLoadingPlans}
          plansError={plansError}
          isDirty={isDirty}
          isSavingPlan={isSavingPlan}
          dispatch={dispatch}
          refetchPlans={refetchPlans}
          handleSavePlan={handleSavePlan}
          handlePublishPlan={handlePublishPlan}
          handleUnpublishPlan={handleUnpublishPlan}
          handleCreatePlan={handleCreatePlan}
          ACTION={ACTION}
        />
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 2: VENDOR SUBSCRIPTIONS LIFECYCLE MANAGEMENT */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === "vendors" && (
        <VendorsTab
          vendorsError={vendorsError}
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          isLoadingVendors={isLoadingVendors}
          paginatedVendors={paginatedVendors}
          currentPage={currentPage}
          totalPages={totalPages}
          dispatch={dispatch}
          loadVendors={loadVendors}
          loadVendorQuota={loadVendorQuota}
          ACTION={ACTION}
        />
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 3: QUOTA RULES — plan_feature_limits editor */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === "quotas" && (
        <QuotasTab
          plans={plans}
          selectedQuotaPlanKey={selectedQuotaPlanKey}
          isLoadingQuotas={isLoadingQuotas}
          quotaLimits={quotaLimits}
          isSavingQuota={isSavingQuota}
          dispatch={dispatch}
          loadQuotaLimits={loadQuotaLimits}
          handleSaveQuotaLimit={handleSaveQuotaLimit}
          ACTION={ACTION}
        />
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 4: FEATURES CATALOG CRUD */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === "catalog" && (
        <CatalogTab token={token} />
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* EDIT VENDOR DIALOG DIALOG MODAL */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <VendorEditModal
        selectedVendor={selectedVendor}
        dispatch={dispatch}
        editPlanId={editPlanId}
        editStatus={editStatus}
        livePlans={livePlans}
        editTrialStartsAt={editTrialStartsAt}
        editTrialEndsAt={editTrialEndsAt}
        editCurrentPeriodStart={editCurrentPeriodStart}
        editCurrentPeriodEnd={editCurrentPeriodEnd}
        editGracePeriodEndsAt={editGracePeriodEndsAt}
        editCancelledAt={editCancelledAt}
        handleUpdateVendor={handleUpdateVendor}
        isSavingVendor={isSavingVendor}
        vendorQuotaUsage={vendorQuotaUsage}
        isLoadingVendorQuota={isLoadingVendorQuota}
        ACTION={ACTION}
      />
    </div>
  );
}
