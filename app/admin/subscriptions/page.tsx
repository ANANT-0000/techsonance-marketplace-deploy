"use client";

import React, { useEffect, useMemo, useReducer, useCallback } from "react";
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
  Search,
  Edit2,
  Calendar,
  Building,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import {
  CmsPlanFeature,
  CmsPlanPrice,
  CmsPlanRow,
  formatMinorUnits,
  majorToMinorUnits,
  useCmsSubscriptionPlans,
  validatePlanDraft,
  ValidationErrors,
} from "@/hooks/useCmsSubscriptionPlans";
import {
  FeatureType,
  PriceInterval,
  SubscriptionStatus,
  PlanStatus,
  Company,
  SubscriptionPlan,
} from "@/utils/Types";
import { SubscriptionText } from "@/constants/subscriptionText";
import { authToken } from "@/utils/authToken";
import {
  fetchAdminSubscriptions,
  updateVendorSubscription,
  fetchLiveSubscriptionPlans,
} from "@/utils/adminApiClients";
import { Switch } from "@/components/ui/switch";

// ─── Constants: no inline literals in JSX/logic ──────────────────────────────
const DEFAULT_CURRENCY = "INR";
const DEFAULT_CURRENCY_EXPONENT = 2;
const DEFAULT_AMOUNT_MINOR_UNITS = 0;

const BOOLEAN_VALUE = {
  TRUE: "true",
  FALSE: "false",
} as const;

const NUMBER_DEFAULT_VALUE = "0";
const TEXT_DEFAULT_VALUE = "";

const FEATURE_TYPE_DEFAULT_VALUE: Record<FeatureType, string> = {
  [FeatureType.BOOLEAN]: BOOLEAN_VALUE.FALSE,
  [FeatureType.NUMBER]: NUMBER_DEFAULT_VALUE,
  [FeatureType.TEXT]: TEXT_DEFAULT_VALUE,
};

const DEFAULT_PRICE: CmsPlanPrice = {
  currency: DEFAULT_CURRENCY,
  interval: PriceInterval.MONTHLY,
  interval_count: null,
  amount_minor_units: DEFAULT_AMOUNT_MINOR_UNITS,
  currency_exponent: DEFAULT_CURRENCY_EXPONENT,
};

const DEFAULT_FEATURE: CmsPlanFeature = {
  feature_key: "",
  type: FeatureType.BOOLEAN,
  value: FEATURE_TYPE_DEFAULT_VALUE[FeatureType.BOOLEAN],
};

const STATUS_LABEL: Record<CmsPlanRow["status"], string> = {
  archived: "Archived",
  draft: "Draft",
  live: "Live",
};

const SYNC_STATUS = {
  SYNCED: "synced",
} as const;

const REORDER_KEY_PREFIX = {
  PRICE: "price",
  FEATURE: "feature",
} as const;

const ERROR_FIELD = {
  PRICES: "prices",
  FEATURES: "features",
  CURRENCY: "currency",
  AMOUNT_MINOR_UNITS: "amount_minor_units",
  FEATURE_KEY: "feature_key",
  VALUE: "value",
} as const;

function getErrorKey(section: string, index: number, field: string) {
  return `${section}.${index}.${field}`;
}

// ─── Helpers for Drag-And-Drop array reordering ──────────────────────────────
function arrayMove<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function ReorderableList<T>({
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

function StatusBadge({ status }: { status: CmsPlanRow["status"] }) {
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

function humanizeFeature(f: CmsPlanFeature): string | null {
  const label = f.feature_key
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  if (!label) return null;
  if (f.type === FeatureType.BOOLEAN) {
    return f.value === BOOLEAN_VALUE.TRUE ? label : null;
  }
  return `${label}: ${f.value}`;
}

// Helper to format ISO dates to a clean display format
function formatDate(isoStr: string | null | undefined): string {
  if (!isoStr) return "N/A";
  try {
    return new Date(isoStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

// Convert Date string for native datetime-local input fields
function toDateTimeInputString(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
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

// ─── useReducer UI State Management ──────────────────────────────────────────
type PageState = {
  // Plan CMS State
  activeKey: string | null;
  draft: CmsPlanRow | null;
  errors: ValidationErrors;
  newPlanKey: string;
  showNewPlanInput: boolean;
  activeTab: "plans" | "vendors";

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
};

const INITIAL_PAGE_STATE: PageState = {
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
};

const PAGE_ACTION = {
  SET_ACTIVE_KEY: "SET_ACTIVE_KEY",
  RESET_DRAFT: "RESET_DRAFT",
  UPDATE_DRAFT: "UPDATE_DRAFT",
  SET_ERRORS: "SET_ERRORS",
  SET_NEW_PLAN_KEY: "SET_NEW_PLAN_KEY",
  SET_SHOW_NEW_PLAN_INPUT: "SET_SHOW_NEW_PLAN_INPUT",
  PLAN_CREATED: "PLAN_CREATED",
  SET_ACTIVE_TAB: "SET_ACTIVE_TAB",

  SET_VENDORS: "SET_VENDORS",
  SET_LOADING_VENDORS: "SET_LOADING_VENDORS",
  SET_VENDORS_ERROR: "SET_VENDORS_ERROR",
  SET_SEARCH_QUERY: "SET_SEARCH_QUERY",
  SET_FILTER_STATUS: "SET_FILTER_STATUS",
  SET_CURRENT_PAGE: "SET_CURRENT_PAGE",
  SET_LIVE_PLANS: "SET_LIVE_PLANS",

  OPEN_EDIT_MODAL: "OPEN_EDIT_MODAL",
  CLOSE_EDIT_MODAL: "CLOSE_EDIT_MODAL",
  UPDATE_EDIT_FIELD: "UPDATE_EDIT_FIELD",
  SET_SAVING_VENDOR: "SET_SAVING_VENDOR",
} as const;

type PageAction =
  | { type: typeof PAGE_ACTION.SET_ACTIVE_KEY; payload: string | null }
  | { type: typeof PAGE_ACTION.RESET_DRAFT; payload: CmsPlanRow | null }
  | { type: typeof PAGE_ACTION.UPDATE_DRAFT; payload: CmsPlanRow }
  | { type: typeof PAGE_ACTION.SET_ERRORS; payload: ValidationErrors }
  | { type: typeof PAGE_ACTION.SET_NEW_PLAN_KEY; payload: string }
  | { type: typeof PAGE_ACTION.SET_SHOW_NEW_PLAN_INPUT; payload: boolean }
  | { type: typeof PAGE_ACTION.PLAN_CREATED; payload: string }
  | { type: typeof PAGE_ACTION.SET_VENDORS; payload: VendorSubscriptionRow[] }
  | { type: typeof PAGE_ACTION.SET_LOADING_VENDORS; payload: boolean }
  | { type: typeof PAGE_ACTION.SET_VENDORS_ERROR; payload: string | null }
  | { type: typeof PAGE_ACTION.SET_SEARCH_QUERY; payload: string }
  | { type: typeof PAGE_ACTION.SET_FILTER_STATUS; payload: string }
  | { type: typeof PAGE_ACTION.SET_CURRENT_PAGE; payload: number }
  | { type: typeof PAGE_ACTION.SET_LIVE_PLANS; payload: SubscriptionPlan[] }
  | { type: typeof PAGE_ACTION.OPEN_EDIT_MODAL; payload: VendorSubscriptionRow }
  | { type: typeof PAGE_ACTION.CLOSE_EDIT_MODAL }
  | {
      type: typeof PAGE_ACTION.UPDATE_EDIT_FIELD;
      payload: { key: string; value: string | SubscriptionStatus };
    }
  | { type: typeof PAGE_ACTION.SET_SAVING_VENDOR; payload: boolean }
  | { type: typeof PAGE_ACTION.SET_ACTIVE_TAB; payload: "plans" | "vendors" };

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case PAGE_ACTION.SET_ACTIVE_KEY:
      return { ...state, activeKey: action.payload };
    case PAGE_ACTION.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    case PAGE_ACTION.RESET_DRAFT:
      return { ...state, draft: action.payload, errors: {} };
    case PAGE_ACTION.UPDATE_DRAFT:
      return { ...state, draft: action.payload };
    case PAGE_ACTION.SET_ERRORS:
      return { ...state, errors: action.payload };
    case PAGE_ACTION.SET_NEW_PLAN_KEY:
      return { ...state, newPlanKey: action.payload };
    case PAGE_ACTION.SET_SHOW_NEW_PLAN_INPUT:
      return { ...state, showNewPlanInput: action.payload, newPlanKey: "" };
    case PAGE_ACTION.PLAN_CREATED:
      return {
        ...state,
        activeKey: action.payload,
        newPlanKey: "",
        showNewPlanInput: false,
      };

    case PAGE_ACTION.SET_VENDORS:
      return { ...state, vendors: action.payload, currentPage: 1 };
    case PAGE_ACTION.SET_LOADING_VENDORS:
      return { ...state, isLoadingVendors: action.payload };
    case PAGE_ACTION.SET_VENDORS_ERROR:
      return { ...state, vendorsError: action.payload };
    case PAGE_ACTION.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case PAGE_ACTION.SET_FILTER_STATUS:
      return { ...state, filterStatus: action.payload, currentPage: 1 };
    case PAGE_ACTION.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    case PAGE_ACTION.SET_LIVE_PLANS:
      return { ...state, livePlans: action.payload };

    case PAGE_ACTION.OPEN_EDIT_MODAL: {
      const v = action.payload;
      return {
        ...state,
        selectedVendor: v,
        editPlanId: v.plan_id || "",
        editStatus: v.status || "",
        editTrialStartsAt: toDateTimeInputString(v.trial_starts_at),
        editTrialEndsAt: toDateTimeInputString(v.trial_ends_at),
        editCurrentPeriodStart: toDateTimeInputString(v.current_period_start),
        editCurrentPeriodEnd: toDateTimeInputString(v.current_period_end),
        editGracePeriodEndsAt: toDateTimeInputString(v.grace_period_ends_at),
        editCancelledAt: toDateTimeInputString(v.cancelled_at),
      };
    }
    case PAGE_ACTION.CLOSE_EDIT_MODAL:
      return {
        ...state,
        selectedVendor: null,
      };
    case PAGE_ACTION.UPDATE_EDIT_FIELD:
      return {
        ...state,
        [action.payload.key]: action.payload.value,
      };
    case PAGE_ACTION.SET_SAVING_VENDOR:
      return { ...state, isSavingVendor: action.payload };

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
    createPlan,
  } = useCmsSubscriptionPlans();

  const [state, dispatch] = useReducer(pageReducer, INITIAL_PAGE_STATE);
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
  } = state;

  const activePlan = plans.find((p) => p.plan_key === activeKey) ?? null;

  // Reset local draft whenever plan selection changes
  useEffect(() => {
    dispatch({ type: PAGE_ACTION.RESET_DRAFT, payload: activePlan });
  }, [activePlan?.plan_key, activePlan?.version]);

  // Load vendor subscriptions
  const loadVendors = useCallback(async () => {
    if (!token) return;
    dispatch({ type: PAGE_ACTION.SET_LOADING_VENDORS, payload: true });
    dispatch({ type: PAGE_ACTION.SET_VENDORS_ERROR, payload: null });
    try {
      const data = await fetchAdminSubscriptions(token);
      dispatch({
        type: PAGE_ACTION.SET_VENDORS,
        payload: Array.isArray(data?.data) ? data.data : [],
      });
    } catch (err) {
      dispatch({
        type: PAGE_ACTION.SET_VENDORS_ERROR,
        payload: SubscriptionText.ACTIONS.FETCH_ERROR,
      });
    } finally {
      dispatch({ type: PAGE_ACTION.SET_LOADING_VENDORS, payload: false });
    }
  }, [token]);

  const loadLivePlans = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchLiveSubscriptionPlans(token);

      dispatch({
        type: PAGE_ACTION.SET_LIVE_PLANS,
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
    dispatch({ type: PAGE_ACTION.SET_ERRORS, payload: validationErrors });
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

  const handleCreatePlan = async () => {
    const result = await createPlan(newPlanKey);
    if (result.ok) {
      dispatch({
        type: PAGE_ACTION.PLAN_CREATED,
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
        filterStatus === "__all__" || filterStatus === "" ? true : v.status === filterStatus;

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
    dispatch({ type: PAGE_ACTION.SET_SAVING_VENDOR, payload: true });

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
      toast.success(SubscriptionText.ACTIONS.SUCCESS_UPDATE);
      dispatch({ type: PAGE_ACTION.CLOSE_EDIT_MODAL });
      loadVendors();
    } catch (err) {
      toast.error(SubscriptionText.ACTIONS.FAILED_UPDATE);
    } finally {
      dispatch({ type: PAGE_ACTION.SET_SAVING_VENDOR, payload: false });
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen max-h-screen bg-slate-50 overflow-y-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {SubscriptionText.PAGE_TITLE}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {SubscriptionText.PAGE_DESCRIPTION}
          </p>
        </div>
      </div>

      {/* Modern Pill Switcher */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-1.5 shadow-xs flex gap-1 max-w-md">
        <button
          type="button"
          onClick={() =>
            dispatch({ type: PAGE_ACTION.SET_ACTIVE_TAB, payload: "plans" })
          }
          className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-semibold transition-all ${
            activeTab === "plans"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          {SubscriptionText.SECTION_CMS_TITLE}
        </button>
        <button
          type="button"
          onClick={() =>
            dispatch({ type: PAGE_ACTION.SET_ACTIVE_TAB, payload: "vendors" })
          }
          className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-2 text-xs font-semibold transition-all ${
            activeTab === "vendors"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          {SubscriptionText.SECTION_LIFECYCLE_TITLE}
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 1: SUBSCRIPTION PLANS CMS SECTION */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === "plans" && (
        <div className="mb-10 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                {SubscriptionText.SECTION_CMS_TITLE}
              </h2>
              <p className="text-xs text-slate-500">
                {SubscriptionText.SECTION_CMS_SUBTITLE}
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
                    placeholder={SubscriptionText.NEW_PLAN_PLACEHOLDER}
                    value={newPlanKey}
                    onChange={(e) =>
                      dispatch({
                        type: PAGE_ACTION.SET_NEW_PLAN_KEY,
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
                        type: PAGE_ACTION.SET_SHOW_NEW_PLAN_INPUT,
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
                      type: PAGE_ACTION.SET_SHOW_NEW_PLAN_INPUT,
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
                    (p) =>
                      p.sync_status && p.sync_status !== SYNC_STATUS.SYNCED,
                  );
                  const isActive = plan.plan_key === activeKey;

                  return (
                    <button
                      key={plan.plan_key}
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: PAGE_ACTION.SET_ACTIVE_KEY,
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
                          Unsaved changes
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
                        Save Draft
                      </Button>
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
                        Publish Live
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    {/* Prices and Features section */}
                    <div className="space-y-6">
                      {/* Prices Section */}
                      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900">
                            Pricing Tier Intervals
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
                                type: PAGE_ACTION.UPDATE_DRAFT,
                                payload: { ...draft, prices: next },
                              });
                            }}
                            className="h-8 px-2 text-xs"
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Price
                          </Button>
                        </div>
                        <FieldError message={errors[ERROR_FIELD.PRICES]} />

                        <ReorderableList
                          items={draft.prices}
                          getKey={(_, i) => `${REORDER_KEY_PREFIX.PRICE}-${i}`}
                          onReorder={(prices) =>
                            dispatch({
                              type: PAGE_ACTION.UPDATE_DRAFT,
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
                                  Currency
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
                                      type: PAGE_ACTION.UPDATE_DRAFT,
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
                                  Interval
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
                                      type: PAGE_ACTION.UPDATE_DRAFT,
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
                                  Amount ({price.currency})
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
                                      type: PAGE_ACTION.UPDATE_DRAFT,
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
                                    type: PAGE_ACTION.UPDATE_DRAFT,
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
                            No prices yet — add at least one before saving.
                          </p>
                        )}
                      </div>

                      {/* Features Section */}
                      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">
                              Feature Flags & Limits
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Order here is the order they appear on cards.
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
                                type: PAGE_ACTION.UPDATE_DRAFT,
                                payload: { ...draft, features: next },
                              });
                            }}
                            className="h-8 px-2 text-xs"
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Feature
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
                                type: PAGE_ACTION.UPDATE_DRAFT,
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
                                    {SubscriptionText.ACTIONS.FEATURE_KEY_LABEL}
                                  </Label>
                                  <Input
                                    value={feature.feature_key.replace(
                                      /_/g,
                                      " ",
                                    )}
                                    placeholder={
                                      SubscriptionText.ACTIONS
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
                                        type: PAGE_ACTION.UPDATE_DRAFT,
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
                                    Behavior
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
                                        type: PAGE_ACTION.UPDATE_DRAFT,
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
                                        Toggle Switch (Yes/No)
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
                                    Value
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
                                            type: PAGE_ACTION.UPDATE_DRAFT,
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
                                          ? "Yes (Enabled)"
                                          : "No (Disabled)"}
                                      </span>
                                    </div>
                                  ) : (
                                    <Input
                                      type="text"
                                      value={feature.value}
                                      placeholder="e.g., 50, Unlimited, Premium..."
                                      onChange={(e) => {
                                        const val = e.target.value;
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
                                          type: PAGE_ACTION.UPDATE_DRAFT,
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
                                      type: PAGE_ACTION.UPDATE_DRAFT,
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
                            No feature flags on this plan yet.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Real-time storefront preview card */}
                    <div className="lg:sticky lg:top-6 lg:self-start">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <Eye className="h-3.5 w-3.5" />
                          {SubscriptionText.ACTIONS.PREVIEW_TITLE}
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
                            <span className="text-xs text-slate-400">/mo</span>
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
                                billed annually (≈ {yearly.currency} {monthlyEq}
                                /mo)
                              </p>
                            );
                          })()}

                          <div className="my-4 h-px w-full bg-slate-100" />

                          {(() => {
                            const features = draft.features
                              .map(humanizeFeature)
                              .filter(Boolean);
                            if (features.length === 0) {
                              return (
                                <p className="text-xs text-slate-400 italic">
                                  No visible feature flags yet.
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
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 2: VENDOR SUBSCRIPTIONS LIFECYCLE MANAGEMENT */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === "vendors" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-500" />
                {SubscriptionText.SECTION_LIFECYCLE_TITLE}
              </h2>
              <p className="text-xs text-slate-500">
                {SubscriptionText.SECTION_LIFECYCLE_SUBTITLE}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadVendors}
              className="text-xs h-9"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              {SubscriptionText.ACTIONS.REFRESH}
            </Button>
          </div>

          {vendorsError && (
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-6">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {vendorsError}
            </div>
          )}

          {/* Filter Bar - styled consistent with the Orders page filter bar */}
          <div className="flex flex-wrap justify-between items-center bg-slate-50 border border-slate-250/60 rounded-xl p-3 gap-3 mb-5">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) =>
                  dispatch({
                    type: PAGE_ACTION.SET_SEARCH_QUERY,
                    payload: e.target.value,
                  })
                }
                placeholder={SubscriptionText.SEARCH_PLACEHOLDER}
                className="pl-9 text-xs h-9 bg-white border-slate-200"
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={filterStatus}
                onValueChange={(val) =>
                  dispatch({
                    type: PAGE_ACTION.SET_FILTER_STATUS,
                    payload: val,
                  })
                }
              >
                <SelectTrigger className="text-xs h-9 w-[150px] bg-white border-slate-200">
                  <SelectValue
                    placeholder={SubscriptionText.FILTER_STATUS_LABEL}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__" className="text-xs">
                    {SubscriptionText.FILTER_ALL_STATUS}
                  </SelectItem>
                  {Object.entries(SubscriptionText.STATUS_LABELS).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vendor Subscriptions Data Table */}
          <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full table-auto min-w-[800px] border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="p-4">
                    {SubscriptionText.TABLE_HEADERS.COMPANY_NAME}
                  </th>
                  <th className="p-4">
                    {SubscriptionText.TABLE_HEADERS.DOMAIN}
                  </th>
                  <th className="p-4">
                    {SubscriptionText.TABLE_HEADERS.CURRENT_PLAN}
                  </th>
                  <th className="p-4">
                    {SubscriptionText.TABLE_HEADERS.STATUS}
                  </th>
                  <th className="p-4">
                    {SubscriptionText.TABLE_HEADERS.TRIAL_ENDS}
                  </th>
                  <th className="p-4">
                    {SubscriptionText.TABLE_HEADERS.PERIOD_ENDS}
                  </th>
                  <th className="p-4">
                    {SubscriptionText.TABLE_HEADERS.DATE_CREATED}
                  </th>
                  <th className="p-4 text-center">
                    {SubscriptionText.TABLE_HEADERS.ACTIONS}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoadingVendors ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="p-4">
                          <div className="h-4 bg-slate-100 rounded-sm w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginatedVendors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-slate-400 italic"
                    >
                      {SubscriptionText.ACTIONS.NO_DATA}
                    </td>
                  </tr>
                ) : (
                  paginatedVendors.map((item: VendorSubscriptionRow) => {
                    const planName = item.plan?.plan_name || "N/A";
                    const companyName = item.company?.company_name || "N/A";
                    const domain = item.company?.company_domain || "N/A";

                    // Define badge styles consistent with project orders panel
                    let statusStyle =
                      "bg-slate-100 text-slate-700 border-slate-200";
                    if (item.status === SubscriptionStatus.ACTIVE) {
                      statusStyle =
                        "bg-emerald-50 text-emerald-700 border-emerald-200";
                    } else if (item.status === SubscriptionStatus.TRIAL) {
                      statusStyle = "bg-blue-50 text-blue-700 border-blue-200";
                    } else if (
                      item.status === SubscriptionStatus.GRACE_PERIOD
                    ) {
                      statusStyle =
                        "bg-amber-50 text-amber-700 border-amber-200";
                    } else if (
                      item.status === SubscriptionStatus.EXPIRED ||
                      item.status === SubscriptionStatus.CANCELLED
                    ) {
                      statusStyle = "bg-red-50 text-red-700 border-red-200";
                    }

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 font-semibold text-slate-900">
                          {companyName}
                        </td>
                        <td className="p-4 text-slate-500 font-mono">
                          {domain}
                        </td>
                        <td className="p-4 font-medium capitalize text-slate-800">
                          {planName}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyle}`}
                          >
                            ●{" "}
                            {SubscriptionText.STATUS_LABELS[
                              item.status as SubscriptionStatus
                            ] || item.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">
                          {formatDate(item.trial_ends_at)}
                        </td>
                        <td className="p-4 text-slate-500">
                          {formatDate(item.current_period_end)}
                        </td>
                        <td className="p-4 text-slate-500">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() =>
                              dispatch({
                                type: PAGE_ACTION.OPEN_EDIT_MODAL,
                                payload: item,
                              })
                            }
                            className="h-7 px-2.5 text-xs text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 rounded-lg transition-colors font-semibold"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            {SubscriptionText.ACTIONS.MANAGE}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar - styled like orders list pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() =>
                    dispatch({
                      type: PAGE_ACTION.SET_CURRENT_PAGE,
                      payload: currentPage - 1,
                    })
                  }
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    dispatch({
                      type: PAGE_ACTION.SET_CURRENT_PAGE,
                      payload: currentPage + 1,
                    })
                  }
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* EDIT VENDOR DIALOG DIALOG MODAL */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <Dialog
        open={selectedVendor !== null}
        onOpenChange={(open) => {
          if (!open) {
            dispatch({ type: PAGE_ACTION.CLOSE_EDIT_MODAL });
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md border-slate-200">
          <form onSubmit={handleUpdateVendor}>
            <DialogHeader className="border-b border-slate-100 pb-3 mb-4">
              <DialogTitle className="text-base font-bold text-slate-900">
                {SubscriptionText.ACTIONS.EDIT_TITLE}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {SubscriptionText.ACTIONS.EDIT_DESC}
              </DialogDescription>
            </DialogHeader>

            {selectedVendor && (
              <div className="space-y-4">
                {/* Details display */}
                <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                  <div>
                    <span className="block font-semibold text-slate-400 uppercase tracking-wide text-[9px]">
                      {SubscriptionText.ACTIONS.COMPANY_LABEL}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedVendor.company?.company_name}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-400 uppercase tracking-wide text-[9px]">
                      {SubscriptionText.ACTIONS.DOMAIN_LABEL}
                    </span>
                    <span className="font-mono text-slate-650">
                      {selectedVendor.company?.company_domain}
                    </span>
                  </div>
                </div>

                {/* Update Plan Select */}
                <div className="grid gap-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    {SubscriptionText.ACTIONS.PLAN_LABEL}
                  </Label>
                  <Select
                    value={editPlanId}
                    onValueChange={(val) =>
                      dispatch({
                        type: PAGE_ACTION.UPDATE_EDIT_FIELD,
                        payload: { key: "editPlanId", value: val },
                      })
                    }
                  >
                    <SelectTrigger className="text-xs h-9 border-slate-200">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {livePlans.map((p: SubscriptionPlan) => (
                        <SelectItem
                          key={p.id}
                          value={p.id || ""}
                          className="text-xs capitalize"
                        >
                          {p.display_name || p.plan_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Update Status Select */}
                <div className="grid gap-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    {SubscriptionText.ACTIONS.STATUS_LABEL}
                  </Label>
                  <Select
                    value={editStatus}
                    onValueChange={(val) =>
                      dispatch({
                        type: PAGE_ACTION.UPDATE_EDIT_FIELD,
                        payload: {
                          key: "editStatus",
                          value: val as SubscriptionStatus,
                        },
                      })
                    }
                  >
                    <SelectTrigger className="text-xs h-9 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SubscriptionStatus).map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="text-xs"
                        >
                          {SubscriptionText.STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-px bg-slate-100 my-2" />

                {/* Sub dates form fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <Label className="text-xs text-slate-500 font-medium">
                      {SubscriptionText.ACTIONS.TRIAL_START}
                    </Label>
                    <Input
                      type="datetime-local"
                      value={editTrialStartsAt}
                      onChange={(e) =>
                        dispatch({
                          type: PAGE_ACTION.UPDATE_EDIT_FIELD,
                          payload: {
                            key: "editTrialStartsAt",
                            value: e.target.value,
                          },
                        })
                      }
                      className="text-xs h-9 border-slate-200"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-slate-500 font-medium">
                      {SubscriptionText.ACTIONS.TRIAL_END}
                    </Label>
                    <Input
                      type="datetime-local"
                      value={editTrialEndsAt}
                      onChange={(e) =>
                        dispatch({
                          type: PAGE_ACTION.UPDATE_EDIT_FIELD,
                          payload: {
                            key: "editTrialEndsAt",
                            value: e.target.value,
                          },
                        })
                      }
                      className="text-xs h-9 border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <Label className="text-xs text-slate-500 font-medium">
                      {SubscriptionText.ACTIONS.PERIOD_START}
                    </Label>
                    <Input
                      type="datetime-local"
                      value={editCurrentPeriodStart}
                      onChange={(e) =>
                        dispatch({
                          type: PAGE_ACTION.UPDATE_EDIT_FIELD,
                          payload: {
                            key: "editCurrentPeriodStart",
                            value: e.target.value,
                          },
                        })
                      }
                      className="text-xs h-9 border-slate-200"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-slate-500 font-medium">
                      {SubscriptionText.ACTIONS.PERIOD_END}
                    </Label>
                    <Input
                      type="datetime-local"
                      value={editCurrentPeriodEnd}
                      onChange={(e) =>
                        dispatch({
                          type: PAGE_ACTION.UPDATE_EDIT_FIELD,
                          payload: {
                            key: "editCurrentPeriodEnd",
                            value: e.target.value,
                          },
                        })
                      }
                      className="text-xs h-9 border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <Label className="text-xs text-slate-500 font-medium">
                      {SubscriptionText.ACTIONS.GRACE_END}
                    </Label>
                    <Input
                      type="datetime-local"
                      value={editGracePeriodEndsAt}
                      onChange={(e) =>
                        dispatch({
                          type: PAGE_ACTION.UPDATE_EDIT_FIELD,
                          payload: {
                            key: "editGracePeriodEndsAt",
                            value: e.target.value,
                          },
                        })
                      }
                      className="text-xs h-9 border-slate-200"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-slate-500 font-medium">
                      {SubscriptionText.ACTIONS.CANCELLED_AT}
                    </Label>
                    <Input
                      type="datetime-local"
                      value={editCancelledAt}
                      onChange={(e) =>
                        dispatch({
                          type: PAGE_ACTION.UPDATE_EDIT_FIELD,
                          payload: {
                            key: "editCancelledAt",
                            value: e.target.value,
                          },
                        })
                      }
                      className="text-xs h-9 border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6 border-t border-slate-100 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => dispatch({ type: PAGE_ACTION.CLOSE_EDIT_MODAL })}
                className="text-xs font-semibold"
              >
                {SubscriptionText.ACTIONS.CANCEL_BTN}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingVendor}
                className="text-xs font-semibold"
              >
                {isSavingVendor ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : null}
                {SubscriptionText.ACTIONS.SAVE_BTN}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
