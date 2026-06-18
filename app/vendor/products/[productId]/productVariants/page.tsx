"use client";
import Link from "next/link";
import {
  Plus,
  Package,
  Edit,
  ArrowLeft,
  Layers,
  Tag,
  ImageOff,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import {
  fetchProductVariants,
  updateProductVariantStatus,
} from "@/utils/vendorApiClient";
import { DeleteBtn } from "@/components/vendor/DeleteBtn";
import { VariantImgGrid } from "@/components/vendor/VariantImgGrid";
import { ProductImage, ProductVariantStatus } from "@/utils/Types";
import { formatCurrency } from "@/lib/utils";
import { StatusConfirmationModal } from "@/components/common/StatusConfirmationModal";
import { authToken } from "@/utils/authToken";
import { useAppSelector } from "@/hooks/reduxHooks";
import { redirect, useParams } from "next/navigation";
import { useEffect, useReducer } from "react";
import toast from "react-hot-toast";
import { PRODUCT_VARIANTS_TEXT } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock_quantity: number;
  status: string;
  attributes: { name: string; value: string }[];
  images: ProductImage[] | null;
}

enum VariantListingActionType {
  SET_VARIANTS = "SET_VARIANTS",
  SET_STATUS_TOGGLE = "SET_STATUS_TOGGLE",
  SET_LOADING = "SET_LOADING",
  SET_SHOW_MODAL = "SET_SHOW_MODAL",
  CONFIRM_STATUS_UPDATE = "CONFIRM_STATUS_UPDATE",
}

interface VariantListingState {
  variants: ProductVariant[];
  status: ProductVariantStatus;
  isActive: boolean;
  loading: boolean;
  showModal: boolean;
  selectedVariantId: string | null;
}

type VariantListingAction =
  | { type: VariantListingActionType.SET_VARIANTS; payload: ProductVariant[] }
  | {
      type: VariantListingActionType.SET_STATUS_TOGGLE;
      payload: { variantId: string; currentStatus: ProductVariantStatus };
    }
  | { type: VariantListingActionType.SET_LOADING; payload: boolean }
  | { type: VariantListingActionType.SET_SHOW_MODAL; payload: boolean }
  | {
      type: VariantListingActionType.CONFIRM_STATUS_UPDATE;
      payload: ProductVariantStatus;
    };

const initialState: VariantListingState = {
  variants: [],
  status: ProductVariantStatus.INACTIVE,
  isActive: false,
  loading: false,
  showModal: false,
  selectedVariantId: null,
};

function variantListingReducer(
  state: VariantListingState,
  action: VariantListingAction,
): VariantListingState {
  switch (action.type) {
    case VariantListingActionType.SET_VARIANTS:
      return { ...state, variants: action.payload };
    case VariantListingActionType.SET_STATUS_TOGGLE:
      return {
        ...state,
        showModal: true,
        status: action.payload.currentStatus,
        isActive: action.payload.currentStatus === ProductVariantStatus.ACTIVE,
        selectedVariantId: action.payload.variantId,
      };
    case VariantListingActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case VariantListingActionType.SET_SHOW_MODAL:
      return { ...state, showModal: action.payload };
    case VariantListingActionType.CONFIRM_STATUS_UPDATE:
      return {
        ...state,
        status: action.payload,
        variants: state.variants.map((v) =>
          v.id === state.selectedVariantId
            ? { ...v, status: action.payload }
            : v,
        ),
      };
    default:
      return state;
  }
}

export default function VariantListingPage() {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const vendorId = (user && "vendor_id" in user ? user.vendor_id : "") ?? "";

  const token = authToken();
  if (!token) {
    redirect("/auth/vendorLogin");
  }

  const [state, dispatch] = useReducer(variantListingReducer, initialState);
  const { variants, status, isActive, loading, showModal, selectedVariantId } =
    state;

  useEffect(() => {
    dispatch({ type: VariantListingActionType.SET_LOADING, payload: true });
    fetchProductVariants(productId, token)
      .then((res) => {
        dispatch({
          type: VariantListingActionType.SET_VARIANTS,
          payload: res.data,
        });
      })
      .catch((error) => {
        dispatch({ type: VariantListingActionType.SET_VARIANTS, payload: [] });
      })
      .finally(() => {
        dispatch({
          type: VariantListingActionType.SET_LOADING,
          payload: false,
        });
      });
  }, [productId, token]);

  const handleStatusToggle = (
    variantId: string,
    currentStatus: ProductVariantStatus,
  ) => {
    dispatch({
      type: VariantListingActionType.SET_STATUS_TOGGLE,
      payload: { variantId, currentStatus },
    });
  };

  const handleConfirm = async () => {
    dispatch({ type: VariantListingActionType.SET_LOADING, payload: true });
    if (!token) {
      toast.error(PRODUCT_VARIANTS_TEXT.TOASTS.AUTH_ERR);
      return;
    }
    const isCurrentlyActive = status === ProductVariantStatus.ACTIVE;
    const nextStatus = isCurrentlyActive
      ? ProductVariantStatus.INACTIVE
      : ProductVariantStatus.ACTIVE;
    try {
      await updateProductVariantStatus(selectedVariantId!, nextStatus, token);
      dispatch({
        type: VariantListingActionType.CONFIRM_STATUS_UPDATE,
        payload: nextStatus,
      });
      toast.success(PRODUCT_VARIANTS_TEXT.TOASTS.UPDATE_SUCCESS);
    } catch (err) {
    } finally {
      dispatch({ type: VariantListingActionType.SET_LOADING, payload: false });
      dispatch({
        type: VariantListingActionType.SET_SHOW_MODAL,
        payload: false,
      });
    }
  };

  return (
    <main className="min-h-screen w-full px-2 pb-10 pt-2 ">
      <div className="mx-auto  space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/vendor/products`}
              className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition shadow-sm"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-theme-h4 font-bold text-slate-900 tracking-tight">
                {PRODUCT_VARIANTS_TEXT.TITLE}
              </h1>
              <p className="text-theme-body-sm text-slate-500 mt-0.5">
                {PRODUCT_VARIANTS_TEXT.SUBTITLE}
              </p>
            </div>
          </div>
          <span className="flex gap-4 justify-between">
            <Link
              href={`/vendor/products/productUpdateForm/${productId}`}
              className="flex items-center gap-2 bg-blue-600 text-white text-theme-body-sm font-semibold py-2.5 px-5 rounded-xl hover:bg-blue-700 active:scale-95 transition shadow-md shadow-blue-200"
            >
              <Edit size={16} />
              {PRODUCT_VARIANTS_TEXT.BTN_EDIT_PRODUCT}
            </Link>
            <Link
              href={`/vendor/products/variantForm/${productId}`}
              className="flex items-center gap-2 bg-blue-600 text-white text-theme-body-sm font-semibold py-2.5 px-5 rounded-xl hover:bg-blue-700 active:scale-95 transition shadow-md shadow-blue-200"
            >
              <Plus size={16} />
              {PRODUCT_VARIANTS_TEXT.BTN_ADD_VARIANT}
            </Link>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Layers size={16} className="text-indigo-400" />
          <span className="text-theme-body-sm font-semibold text-slate-600">
            {variants && variants.length}
            {variants && variants.length !== 1
              ? PRODUCT_VARIANTS_TEXT.STATS_VARIANTS
              : PRODUCT_VARIANTS_TEXT.STATS_VARIANT}
          </span>
        </div>

        {state.loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Skeleton className="w-full h-84" />
            <Skeleton className="w-full h-84" />
            <Skeleton className="w-full h-84" />
          </div>
        ) : variants && variants.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
              <Package size={36} className="text-slate-300" />
            </div>
            <h3 className="text-theme-h6 font-semibold text-slate-700">
              {PRODUCT_VARIANTS_TEXT.EMPTY.TITLE}
            </h3>
            <p className="text-slate-400 text-theme-body-sm mt-1 mb-6">
              {PRODUCT_VARIANTS_TEXT.EMPTY.DESC}
            </p>
            <Link
              href={`/vendor/products/variantForm/${productId}`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-theme-body-sm font-semibold py-2.5 px-5 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200"
            >
              <Plus size={15} /> {PRODUCT_VARIANTS_TEXT.EMPTY.BTN_CREATE}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {variants &&
              variants.length > 0 &&
              variants.map((variant) => (
                <div
                  key={variant.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                >
                  {variant.images && variant.images.length > 0 && (
                    <VariantImgGrid variantImages={variant?.images} />
                  )}

                  {/* ── CARD BODY ── */}
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    {/* SKU + Status row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-theme-tiny font-semibold text-slate-400 uppercase tracking-widest">
                          {PRODUCT_VARIANTS_TEXT.CARD.SKU}
                        </p>
                        <p className="text-theme-body-sm font-bold text-slate-800 font-mono mt-0.5">
                          {variant.sku || "—"}
                        </p>
                      </div>

                      {/* Status */}
                      <span
                        className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-theme-caption font-semibold border ${
                          variant.status === ProductVariantStatus.ACTIVE
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {variant.status}
                      </span>
                    </div>

                    {variant.attributes.length > 0 && (
                      <div>
                        <p className="text-theme-body-sm font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <Tag size={10} />{" "}
                          {PRODUCT_VARIANTS_TEXT.CARD.ATTRIBUTES}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {variant.attributes.map((attr, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-theme-body-sm  font-medium px-2 py-1 rounded-lg"
                            >
                              <span className="text-indigo-400 font-semibold">
                                {attr.name}:
                              </span>
                              <span>{attr.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-slate-100" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-theme-tiny font-semibold text-slate-400 uppercase tracking-widest">
                          {PRODUCT_VARIANTS_TEXT.CARD.PRICE}
                        </p>
                        <p className="text-theme-h6 font-bold text-slate-900 mt-0.5">
                          ₹{formatCurrency(variant.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {/* <DeleteBtn id={variant.id} style="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-theme-body-sm font-semibold hover:border-red-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all" toDelete="VARIANT" vendorId={vendorId} variantId={variant.id} /> */}
                      <Link
                        href={`/vendor/products/variantUpdateForm/${variant.id}`}
                        className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-theme-body-sm font-semibold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
                      >
                        <Edit size={14} />
                        {PRODUCT_VARIANTS_TEXT.CARD.BTN_EDIT}
                      </Link>
                      <button
                        onClick={() =>
                          handleStatusToggle(
                            variant.id,
                            variant.status as ProductVariantStatus,
                          )
                        }
                        disabled={loading}
                        className={`flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-theme-caption font-semibold border transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      variant.status === ProductVariantStatus.ACTIVE
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                        : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 hover:border-gray-300"
                    }`}
                      >
                        {variant.status === ProductVariantStatus.ACTIVE ? (
                          <ToggleRight />
                        ) : (
                          <ToggleLeft />
                        )}

                        {loading
                          ? PRODUCT_VARIANTS_TEXT.CARD.SAVING
                          : variant.status === ProductVariantStatus.ACTIVE
                            ? PRODUCT_VARIANTS_TEXT.CARD.STATUS_ACTIVE
                            : PRODUCT_VARIANTS_TEXT.CARD.STATUS_INACTIVE}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      {showModal && (
        <StatusConfirmationModal
          onConfirm={handleConfirm}
          onCancel={() =>
            dispatch({
              type: VariantListingActionType.SET_SHOW_MODAL,
              payload: false,
            })
          }
          isActive={isActive}
        />
      )}
    </main>
  );
}
