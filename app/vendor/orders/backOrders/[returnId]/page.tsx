"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";
import React, { useEffect, useReducer } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import {
  fetchGetVendorReturnById,
  FetchUpdateReturnStatus,
} from "@/utils/vendorApiClient";
import { toast, Toaster } from "react-hot-toast";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import { ReturnStatus } from "@/utils/Types";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  ImageIcon,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Tag,
  Hash,
  Phone,
  Mail,
  ShoppingBag,
} from "lucide-react";
import { authToken } from "@/utils/authToken";
import { UiText } from "@/constants/ui-text";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";
import { SessionErrorCard } from "@/components/vendor/SessionErrorCard";
import { DataLoadErrorCard } from "@/components/vendor/DataLoadErrorCard";

interface Address {
  address_line_1?: string;

  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

interface ProductImage {
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
}

interface Attribute {
  name: string;
  value: string;
}

interface Variant {
  variant_name: string;
  sku: string;
  price: string;
  images: ProductImage[];
  attributes?: Attribute[];
  status?: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  order_status: string;
  price: string;
  quantity: number;
  variant: Variant;
  order: {
    id: string;
    address: Address;
  };
}

interface ReturnUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
}

interface EvidenceImage {
  url: string;
}

interface RequestData {
  id: string;
  type: string;
  status: string;
  reason: string;
  customer_note: string;
  store_owner_note: string | null;
  tracking_id: string | null;
  created_at: string;
  updated_at: string;
  evidence_images: EvidenceImage[];
  orderItem: OrderItem;
  user: ReturnUser;
}

/* ─────────────────── Helpers ─────────────────── */
const getStatusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "pending")
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-400",
      label: UiText.BACK_ORDER_DETAILS.STATUS_LABELS.PENDING,
    };
  if (s === "approved")
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-400",
      label: UiText.BACK_ORDER_DETAILS.STATUS_LABELS.APPROVED,
    };
  if (s === "rejected")
    return {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-400",
      label: UiText.BACK_ORDER_DETAILS.STATUS_LABELS.REJECTED,
    };
  if (s === "processing")
    return {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-400",
      label: UiText.BACK_ORDER_DETAILS.STATUS_LABELS.PROCESSING,
    };
  if (s === "qc_failed")
    return {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      dot: "bg-orange-400",
      label: UiText.BACK_ORDER_DETAILS.STATUS_LABELS.QC_FAILED,
    };
  return {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "bg-gray-400",
    label: status,
  };
};

const getTypeConfig = (type: string) => {
  const t = type?.toLowerCase();
  if (t === "replacement")
    return {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      icon: "↺",
      label: UiText.BACK_ORDER_DETAILS.TYPE_LABELS.REPLACEMENT,
    };
  if (t === "return")
    return {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      icon: "←",
      label: UiText.BACK_ORDER_DETAILS.TYPE_LABELS.RETURN,
    };
  return {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
    icon: "?",
    label: type,
  };
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
      {label}
    </span>
    <span className="text-[14px] font-semibold text-slate-800">
      {value || "—"}
    </span>
  </div>
);

export enum BackOrderDetailsActionType {
  SET_REQUEST_DATA = "SET_REQUEST_DATA",
  SET_LOADING = "SET_LOADING",
  SET_ERROR = "SET_ERROR",
  SET_NEW_STATUS = "SET_NEW_STATUS",
  SET_VENDOR_NOTE = "SET_VENDOR_NOTE",
  SET_UPDATING = "SET_UPDATING",
  SET_LIGHTBOX_IMG = "SET_LIGHTBOX_IMG",
  SET_TRACKING_URL = "SET_TRACKING_URL",
  SET_SESSION_ERROR = "SET_SESSION_ERROR",
  SET_FETCH_SUCCESS = "SET_FETCH_SUCCESS",
}

interface ReducerState {
  requestData: RequestData | null;
  loading: boolean;
  error: string | null;
  newStatus: ReturnStatus | "";
  vendorNote: string;
  updating: boolean;
  lightboxImg: string | null;
  trackingUrl: string;
  sessionError: boolean;
}

const initialState: ReducerState = {
  requestData: null,
  loading: true,
  error: null,
  newStatus: "",
  vendorNote: "",
  updating: false,
  lightboxImg: null,
  trackingUrl: "",
  sessionError: false,
};

type Action =
  | {
      type: BackOrderDetailsActionType.SET_REQUEST_DATA;
      payload: RequestData | null;
    }
  | { type: BackOrderDetailsActionType.SET_LOADING; payload: boolean }
  | { type: BackOrderDetailsActionType.SET_ERROR; payload: string | null }
  | {
      type: BackOrderDetailsActionType.SET_NEW_STATUS;
      payload: ReturnStatus | "";
    }
  | { type: BackOrderDetailsActionType.SET_VENDOR_NOTE; payload: string }
  | { type: BackOrderDetailsActionType.SET_UPDATING; payload: boolean }
  | {
      type: BackOrderDetailsActionType.SET_LIGHTBOX_IMG;
      payload: string | null;
    }
  | { type: BackOrderDetailsActionType.SET_TRACKING_URL; payload: string }
  | { type: BackOrderDetailsActionType.SET_SESSION_ERROR; payload: boolean }
  | {
      type: BackOrderDetailsActionType.SET_FETCH_SUCCESS;
      payload: {
        requestData: RequestData;
        newStatus: ReturnStatus;
        vendorNote: string;
      };
    };

function reducer(state: ReducerState, action: Action): ReducerState {
  switch (action.type) {
    case BackOrderDetailsActionType.SET_REQUEST_DATA:
      return { ...state, requestData: action.payload };
    case BackOrderDetailsActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case BackOrderDetailsActionType.SET_ERROR:
      return { ...state, error: action.payload };
    case BackOrderDetailsActionType.SET_NEW_STATUS:
      return { ...state, newStatus: action.payload };
    case BackOrderDetailsActionType.SET_VENDOR_NOTE:
      return { ...state, vendorNote: action.payload };
    case BackOrderDetailsActionType.SET_UPDATING:
      return { ...state, updating: action.payload };
    case BackOrderDetailsActionType.SET_LIGHTBOX_IMG:
      return { ...state, lightboxImg: action.payload };
    case BackOrderDetailsActionType.SET_TRACKING_URL:
      return { ...state, trackingUrl: action.payload };
    case BackOrderDetailsActionType.SET_SESSION_ERROR:
      return { ...state, sessionError: action.payload };
    case BackOrderDetailsActionType.SET_FETCH_SUCCESS:
      return {
        ...state,
        requestData: action.payload.requestData,
        newStatus: action.payload.newStatus,
        vendorNote: action.payload.vendorNote,
      };
    default:
      return state;
  }
}

/* ─────────────────── Component ─────────────────── */
export default function BackOrderDetailPage() {
  const companyId = getClientCompanyId();

  const router = useRouter();
  const { returnId } = useParams<{ returnId: string }>();
  const token = authToken();

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    requestData,
    loading,
    error,
    newStatus,
    vendorNote,
    updating,
    lightboxImg,
    trackingUrl,
    sessionError,
  } = state;

  useEffect(() => {
    if (!token || !companyId) {
      dispatch({
        type: BackOrderDetailsActionType.SET_SESSION_ERROR,
        payload: true,
      });
      return;
    }
    const fetchDetails = async () => {
      try {
        dispatch({
          type: BackOrderDetailsActionType.SET_LOADING,
          payload: true,
        });
        dispatch({ type: BackOrderDetailsActionType.SET_ERROR, payload: null });
        const res = await fetchGetVendorReturnById(returnId, token, companyId);
        dispatch({
          type: BackOrderDetailsActionType.SET_FETCH_SUCCESS,
          payload: {
            requestData: res.data,
            newStatus: res.data.status as ReturnStatus,
            vendorNote: res.data.store_owner_note || "",
          },
        });
      } catch (err: any) {
        dispatch({
          type: BackOrderDetailsActionType.SET_ERROR,
          payload:
            err?.response?.data?.message ||
            UiText.BACK_ORDER_DETAILS.LOAD_ERROR,
        });
        toast.error(UiText.BACK_ORDER_DETAILS.LOAD_ERROR);
      } finally {
        dispatch({
          type: BackOrderDetailsActionType.SET_LOADING,
          payload: false,
        });
      }
    };
    fetchDetails();
  }, [returnId]);

  const handleUpdateSubmit = async () => {
    if (!token || !companyId) {
      dispatch({
        type: BackOrderDetailsActionType.SET_SESSION_ERROR,
        payload: true,
      });
      return;
    }
    if (!newStatus)
      return toast.error(UiText.BACK_ORDER_DETAILS.STATUS_REQUIRED);
    if (
      (newStatus === ReturnStatus.REJECTED ||
        newStatus === ReturnStatus.QC_FAILED) &&
      !vendorNote.trim()
    ) {
      return toast.error(UiText.BACK_ORDER_DETAILS.NOTE_REQUIRED);
    }

    try {
      dispatch({
        type: BackOrderDetailsActionType.SET_UPDATING,
        payload: true,
      });
      await FetchUpdateReturnStatus(
        returnId,
        {
          status: newStatus as ReturnStatus,
          store_owner_note: vendorNote,
          tracking_id: trackingUrl,
        },
        token,
        companyId,
      );
      toast.success(UiText.BACK_ORDER_DETAILS.UPDATE_SUCCESS);
      // Reload or refresh state
      const res = await fetchGetVendorReturnById(returnId, token, companyId);
      dispatch({
        type: BackOrderDetailsActionType.SET_REQUEST_DATA,
        payload: res.data,
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || UiText.BACK_ORDER_DETAILS.UPDATE_FAILED,
      );
    } finally {
      dispatch({
        type: BackOrderDetailsActionType.SET_UPDATING,
        payload: false,
      });
    }
  };

  if (sessionError || !token || !companyId) {
    return <SessionErrorCard />;
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center min-h-[400px] items-center">
        <LoaderSpinner />
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <DataLoadErrorCard
        title={error || UiText.BACK_ORDER_DETAILS.LOAD_ERROR}
        description={UiText.BACK_ORDER_DETAILS.ERROR_DESC}
        showGoBack={true}
        goBackText={UiText.BACK_ORDER_DETAILS.GO_BACK}
        onTryAgain={() => window.location.reload()}
        tryAgainText={UiText.BACK_ORDER_DETAILS.TRY_AGAIN}
      />
    );
  }

  const { orderItem, user, evidence_images } = requestData;
  const variant = orderItem?.variant;
  const address = orderItem?.order?.address;
  const primaryImage =
    variant?.images?.find((img) => img.is_primary) ?? variant?.images?.[0];
  const statusCfg = getStatusConfig(requestData.status);
  const typeCfg = getTypeConfig(requestData.type);
  const needsNote =
    newStatus === ReturnStatus.REJECTED || newStatus === ReturnStatus.QC_FAILED;
  const isUnchanged =
    newStatus === requestData.status &&
    vendorNote === (requestData.store_owner_note || "");

  return (
    <>
      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() =>
            dispatch({
              type: BackOrderDetailsActionType.SET_LIGHTBOX_IMG,
              payload: null,
            })
          }
        >
          <img
            src={lightboxImg}
            alt="Evidence"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
          />
          <button
            onClick={() =>
              dispatch({
                type: BackOrderDetailsActionType.SET_LIGHTBOX_IMG,
                payload: null,
              })
            }
            className="absolute top-4 right-4 text-white hover:text-slate-200 transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="w-full px-2 min-h-screen max-h-screen overflow-y-scroll mx-auto pb-12">
        {/* ── Back + Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8 mt-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-500 hover:text-slate-800 transition-all group bg-white border border-slate-200 hover:border-slate-300 rounded-full px-5 py-2.5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform text-slate-400 group-hover:text-slate-600"
            />
            {UiText.BACK_ORDER_DETAILS.BACK}
          </button>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-theme-caption font-semibold border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}
            >
              {typeCfg.icon} {typeCfg.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-theme-caption font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
            <span className="font-mono text-theme-caption text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
              #{requestData.id.split("-")[0].toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ══════════ LEFT COLUMN ══════════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Product Card ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <ShoppingBag size={16} className="text-indigo-500" />
                <h2 className="text-[14px] font-semibold text-slate-700 tracking-wide uppercase">
                  {UiText.BACK_ORDER_DETAILS.PRODUCT}
                </h2>
              </div>
              <div className="p-6 flex gap-5 items-start group/item">
                {primaryImage?.image_url ? (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-50 flex-shrink-0 shadow-sm">
                    <img
                      src={primaryImage.image_url}
                      alt={
                        primaryImage.alt_text ||
                        UiText.BACK_ORDER_DETAILS.PRODUCT
                      }
                      className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-sm">
                    <Package size={28} className="text-slate-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-slate-800 leading-snug mb-2 line-clamp-2">
                    {variant?.variant_name || UiText.BACK_ORDER_DETAILS.NA}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 text-[12px] bg-slate-100/80 text-slate-600 px-2.5 py-1 rounded-lg font-mono font-medium">
                      <Tag size={12} className="text-slate-400" />
                      {variant?.sku}
                    </span>
                    {variant?.attributes?.map((attr) => (
                      <span
                        key={attr.name}
                        className="inline-flex items-center gap-1.5 text-[12px] bg-indigo-50 text-indigo-600 border border-indigo-100/50 px-2.5 py-1 rounded-lg capitalize font-medium"
                      >
                        {attr.name}: {attr.value}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-4 mt-4">
                    <InfoRow
                      label={UiText.BACK_ORDER_DETAILS.UNIT_PRICE}
                      value={`₹${Number(orderItem?.price).toLocaleString()}`}
                    />
                    <InfoRow
                      label={UiText.BACK_ORDER_DETAILS.QTY}
                      value={orderItem?.quantity ?? 1}
                    />
                    <InfoRow
                      label={UiText.BACK_ORDER_DETAILS.ORDER_STATUS}
                      value={
                        <span className="inline-flex items-center gap-1.5 text-[12px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-full capitalize font-semibold">
                          {orderItem?.order_status}
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 pb-5 flex items-center gap-2">
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                  {UiText.BACK_ORDER_DETAILS.ORDER_ID_PREFIX}
                </span>
                <span className="font-mono text-[13px] font-semibold text-slate-600 bg-slate-100/70 px-2.5 py-1 rounded-md">
                  #{orderItem?.order_id?.split("-")[0].toUpperCase()}
                </span>
              </div>
            </div>

            {/* ── Request Details ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <ClipboardList size={16} className="text-indigo-500" />
                <h2 className="text-[14px] font-semibold text-slate-700 tracking-wide uppercase">
                  {UiText.BACK_ORDER_DETAILS.REQUEST_DETAILS}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow
                    label={UiText.BACK_ORDER_DETAILS.REQUEST_TYPE}
                    value={
                      <span
                        className={`inline-flex text-theme-caption font-semibold px-2 py-0.5 rounded-md border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border} capitalize`}
                      >
                        {requestData.type}
                      </span>
                    }
                  />
                  <InfoRow
                    label={UiText.BACK_ORDER_DETAILS.SUBMITTED}
                    value={new Date(requestData.created_at).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}
                  />
                  <InfoRow
                    label={UiText.BACK_ORDER_DETAILS.LAST_UPDATED}
                    value={new Date(requestData.updated_at).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}
                  />
                  {requestData.tracking_id && (
                    <InfoRow
                      label={UiText.BACK_ORDER_DETAILS.TRACKING_ID}
                      value={
                        <span className="font-mono">
                          {requestData.tracking_id}
                        </span>
                      }
                    />
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {UiText.BACK_ORDER_DETAILS.REASON}
                  </p>
                  <div className="flex items-start gap-3 p-4 bg-amber-50/50 border border-amber-100/80 rounded-2xl">
                    <AlertCircle
                      size={18}
                      className="text-amber-500 mt-0.5 shrink-0"
                    />
                    <p className="text-[14px] text-amber-800 font-medium leading-relaxed">
                      {requestData.reason}
                    </p>
                  </div>
                </div>

                {requestData.customer_note && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {UiText.BACK_ORDER_DETAILS.CUSTOMER_NOTE}
                    </p>
                    <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-[14px] text-slate-600 italic leading-relaxed">
                      "{requestData.customer_note}"
                    </div>
                  </div>
                )}

                {requestData.store_owner_note && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {UiText.BACK_ORDER_DETAILS.STORE_OWNER_NOTE}
                    </p>
                    <div className="flex items-start gap-3 p-4 bg-indigo-50/50 border border-indigo-100/80 rounded-2xl">
                      <CheckCircle2
                        size={18}
                        className="text-indigo-500 mt-0.5 shrink-0"
                      />
                      <p className="text-[14px] text-indigo-800 font-medium leading-relaxed">
                        {requestData.store_owner_note}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Evidence Images ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <ImageIcon size={16} className="text-indigo-500" />
                <h2 className="text-[14px] font-semibold text-slate-700 tracking-wide uppercase">
                  {UiText.BACK_ORDER_DETAILS.EVIDENCE_PHOTOS}
                </h2>
                {evidence_images?.length > 0 && (
                  <span className="ml-auto text-[13px] text-slate-500 font-medium">
                    {evidence_images.length}{" "}
                    {evidence_images.length === 1
                      ? UiText.BACK_ORDER_DETAILS.IMAGE_SINGULAR
                      : UiText.BACK_ORDER_DETAILS.IMAGE_PLURAL}
                  </span>
                )}
              </div>
              <div className="p-6">
                {!evidence_images || evidence_images.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-3">
                    <ImageIcon size={32} className="opacity-40" />
                    <p className="text-[14px] font-medium text-slate-500">
                      {UiText.BACK_ORDER_DETAILS.NO_EVIDENCE}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {evidence_images.map((img, index) => (
                      <div
                        key={index}
                        className="relative group w-32 h-32 rounded-2xl border border-slate-200/60 overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
                        onClick={() =>
                          dispatch({
                            type: BackOrderDetailsActionType.SET_LIGHTBOX_IMG,
                            payload: img.url,
                          })
                        }
                      >
                        <img
                          src={img.url}
                          alt={`Evidence ${index + 1}`}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                          <ExternalLink
                            size={20}
                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100 duration-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══════════ RIGHT COLUMN ══════════ */}
          <div className="space-y-6">
            {/* ── Customer Info ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <User size={16} className="text-indigo-500" />
                <h2 className="text-[14px] font-semibold text-slate-700 tracking-wide uppercase">
                  {UiText.BACK_ORDER_DETAILS.CUSTOMER}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[15px] shrink-0 border border-indigo-100">
                    {user?.first_name?.[0]?.toUpperCase()}
                    {user?.last_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-slate-800">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-[13px] text-slate-400 font-mono mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-[14px] text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/60">
                    <Mail size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[14px] text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/60">
                    <Phone size={16} className="text-slate-400 shrink-0" />
                    <span className="font-medium">
                      {user?.phone_number || (
                        <span className="text-slate-400 italic">
                          {UiText.BACK_ORDER_DETAILS.NO_PHONE}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Delivery Address ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <MapPin size={16} className="text-indigo-500" />
                <h2 className="text-[14px] font-semibold text-slate-700 tracking-wide uppercase">
                  {UiText.BACK_ORDER_DETAILS.DELIVERY_ADDRESS}
                </h2>
              </div>
              <div className="p-6">
                {address ? (
                  <div className="text-[14px] text-slate-700 space-y-1 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60 font-medium">
                    {address.address_line_1 && <p>{address.address_line_1}</p>}

                    {(address.city || address.state) && (
                      <p>
                        {[address.city, address.state]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    {(address.country || address.postal_code) && (
                      <p className="text-slate-500">
                        {[address.country, address.postal_code]
                          .filter(Boolean)
                          .join(" – ")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[14px] text-slate-400 italic">
                    {UiText.BACK_ORDER_DETAILS.NO_ADDRESS}
                  </p>
                )}
              </div>
            </div>

            {/* ── Action Panel ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden sticky top-8">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <CheckCircle2 size={16} className="text-indigo-500" />
                <h2 className="text-[14px] font-semibold text-slate-700 tracking-wide uppercase">
                  {UiText.BACK_ORDER_DETAILS.RESOLUTION}
                </h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    {UiText.BACK_ORDER_DETAILS.UPDATE_STATUS}
                  </label>
                  <select
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all cursor-pointer hover:border-slate-300"
                    value={newStatus}
                    onChange={(e) =>
                      dispatch({
                        type: BackOrderDetailsActionType.SET_NEW_STATUS,
                        payload: e.target.value as ReturnStatus,
                      })
                    }
                  >
                    {Object.values(ReturnStatus).map((status) => (
                      <option key={status} value={status}>
                        {UiText.BACK_ORDER_DETAILS.STATUS_LABELS[
                          status.toUpperCase() as keyof typeof UiText.BACK_ORDER_DETAILS.STATUS_LABELS
                        ] || status}
                      </option>
                    ))}
                  </select>
                </div>
                {newStatus === ReturnStatus.SHIPPED && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                      {UiText.BACK_ORDER_DETAILS.TRACKING_URL}
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 bg-slate-50/50 rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all hover:border-slate-300"
                      value={trackingUrl}
                      onChange={(e) =>
                        dispatch({
                          type: BackOrderDetailsActionType.SET_TRACKING_URL,
                          payload: e.target.value,
                        })
                      }
                      placeholder={
                        UiText.BACK_ORDER_DETAILS.TRACKING_URL_PLACEHOLDER
                      }
                    />
                  </div>
                )}
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    {UiText.BACK_ORDER_DETAILS.INTERNAL_NOTE}
                    {needsNote && (
                      <span className="text-red-400 ml-1">
                        * {UiText.BACK_ORDER_DETAILS.REQUIRED}
                      </span>
                    )}
                  </label>
                  <textarea
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all resize-none placeholder:text-slate-400 hover:border-slate-300 leading-relaxed"
                    rows={4}
                    value={vendorNote}
                    onChange={(e) =>
                      dispatch({
                        type: BackOrderDetailsActionType.SET_VENDOR_NOTE,
                        payload: e.target.value,
                      })
                    }
                    placeholder={
                      needsNote
                        ? UiText.BACK_ORDER_DETAILS.NOTE_REQ_PLACEHOLDER
                        : UiText.BACK_ORDER_DETAILS.NOTE_OPT_PLACEHOLDER
                    }
                  />
                </div>

                <button
                  onClick={handleUpdateSubmit}
                  disabled={updating || isUnchanged}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-2xl px-6 py-3.5 transition-all shadow-sm hover:shadow group"
                >
                  {updating ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {UiText.BACK_ORDER_DETAILS.SAVING}
                    </>
                  ) : (
                    UiText.BACK_ORDER_DETAILS.CONFIRM_UPDATE
                  )}
                </button>

                {isUnchanged && (
                  <p className="text-center text-theme-caption text-gray-400">
                    {UiText.BACK_ORDER_DETAILS.NO_CHANGES}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
