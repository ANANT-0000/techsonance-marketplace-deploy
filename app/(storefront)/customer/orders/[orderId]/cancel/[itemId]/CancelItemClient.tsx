"use client";

import { useEffect, useReducer } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, PackageSearch, Loader2 } from "lucide-react";
import {
  fetchCancelOrderItem,
  fetchOrderItemDetails,
} from "@/utils/customerApiClient";
import { formatCurrency } from "@/lib/utils";
import { useAppSelector } from "@/hooks/reduxHooks";
import { authToken } from "@/utils/authToken";

const CANCEL_REASONS = [
  "Order created by mistake",
  "Item(s) would not arrive on time",
  "Shipping cost is too high",
  "Found cheaper somewhere else",
  "Need to change shipping address",
  "Need to change payment method",
  "Other",
];

export enum CancelItemActionType {
  SET_ITEM = 'SET_ITEM',
  SET_REASON = 'SET_REASON',
  SET_COMMENTS = 'SET_COMMENTS',
  SET_SUBMITTING = 'SET_SUBMITTING',
  SET_ERROR = 'SET_ERROR',
}

export interface CancelItemPayload {
  quantity: number;
  price: string | number;
  variant: {
      variant_name: string;
      images: { image_url: string }[];
  };
  [key: string]: any;
}

interface State {
  itemToCancel: CancelItemPayload | null;
  selectedReason: string;
  additionalComments: string;
  isSubmitting: boolean;
  error: string;
}

type Action =
  | { type: CancelItemActionType.SET_ITEM; payload: CancelItemPayload | null }
  | { type: CancelItemActionType.SET_REASON; payload: string }
  | { type: CancelItemActionType.SET_COMMENTS; payload: string }
  | { type: CancelItemActionType.SET_SUBMITTING; payload: boolean }
  | { type: CancelItemActionType.SET_ERROR; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case CancelItemActionType.SET_ITEM:
      return { ...state, itemToCancel: action.payload };
    case CancelItemActionType.SET_REASON:
      return { ...state, selectedReason: action.payload, error: "" };
    case CancelItemActionType.SET_COMMENTS:
      return { ...state, additionalComments: action.payload };
    case CancelItemActionType.SET_SUBMITTING:
      return { ...state, isSubmitting: action.payload };
    case CancelItemActionType.SET_ERROR:
      return { ...state, error: action.payload, isSubmitting: false };
    default:
      return state;
  }
}

export default function CancelItemClient() {
  const { orderId, itemId } = useParams<{ orderId: string; itemId: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id;
  const router = useRouter();

  const [state, dispatch] = useReducer(reducer, {
    itemToCancel: null,
    selectedReason: "",
    additionalComments: "",
    isSubmitting: false,
    error: "",
  });

  const token = authToken();

  useEffect(() => {
    if (!orderId || !itemId || !token) return;
    const getOrder = async () => {
      const res = await fetchOrderItemDetails(itemId, token);
      if (res?.data) {
        dispatch({ type: CancelItemActionType.SET_ITEM, payload: res.data });
      }
    };
    getOrder();
  }, [orderId, itemId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.selectedReason) {
      dispatch({
        type: CancelItemActionType.SET_ERROR,
        payload: "Please select a cancellation reason.",
      });
      return;
    }
    dispatch({ type: CancelItemActionType.SET_SUBMITTING, payload: true });

    try {
      const fullReason = `${state.selectedReason} - ${state.additionalComments}`;
      if (!userId || !itemId || !token) {
        dispatch({ type: CancelItemActionType.SET_ERROR, payload: "User not found." });
        return;
      }

      const response = await fetchCancelOrderItem(
        userId,
        itemId,
        fullReason,
        token,
      );
      if (response) {
        router.back();
      } else {
        dispatch({
          type: CancelItemActionType.SET_ERROR,
          payload: "Failed to cancel item. Please try again.",
        });
      }
    } catch (err) {
      dispatch({
        type: CancelItemActionType.SET_ERROR,
        payload: "An error occurred. Please contact support.",
      });
    }
  };

  if (!state.itemToCancel)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f8fafc]">
        <PackageSearch className="w-10 h-10 text-indigo-400 animate-pulse mb-4" />
        <p className="text-gray-500 font-medium tracking-wide">
          Loading item details...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen   py-4 md:py-0 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="md:text-theme-h5 sm:text-theme-h6 font-extrabold text-gray-900 tracking-tight">
              Cancel Item
            </h1>
            <p className="text-theme-body-sm font-medium text-gray-500 mt-1">
              Order #{orderId}
            </p>
          </div>
        </div>

        {/* Target Item Details */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 flex items-start sm:items-center gap-4 sm:gap-5 transition-all">
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
            <img
              src={
                state.itemToCancel.variant.images[0]?.image_url ??
                "https://placehold.co/400x400/f8fafc/94a3b8?text=Product"
              }
              alt={state.itemToCancel.variant.variant_name}
              className="w-full h-full object-cover mix-blend-multiply"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="font-bold text-gray-900 text-theme-body-sm sm:text-theme-h6 line-clamp-2 leading-snug">
              {state.itemToCancel.variant.variant_name}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 mt-2">
              <p className="text-gray-500 text-theme-caption sm:text-theme-body-sm font-medium">
                Qty: {state.itemToCancel.quantity}
              </p>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden sm:block"></span>
              <p className="font-bold text-gray-900 text-theme-body-sm sm:text-theme-h6">
                ₹{formatCurrency(Number(state.itemToCancel.price))}
              </p>
            </div>
          </div>
        </div>

        {/* Form Wrapper */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8 sm:space-y-10"
        >
          {state.error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3 text-theme-body-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{state.error}</p>
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-4">
            <div>
              <h2 className="text-theme-body sm:text-theme-h5 font-bold text-gray-900">
                Why are you cancelling?
              </h2>
              <p className="text-theme-caption sm:text-theme-body-sm text-gray-500 mt-1">
                Please select the main reason for this cancellation.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {CANCEL_REASONS.map((reason) => {
                const isSelected = state.selectedReason === reason;
                return (
                  <label
                    key={reason}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40 shadow-sm"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center h-5 mt-0.5">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-gray-300 group-hover:border-indigo-400"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="cancel_reason"
                        value={reason}
                        checked={isSelected}
                        onChange={(e) =>
                          dispatch({
                            type: CancelItemActionType.SET_REASON,
                            payload: e.target.value,
                          })
                        }
                        className="sr-only"
                      />
                    </div>
                    <span
                      className={`font-medium text-theme-body-sm sm:text-theme-body transition-colors ${isSelected ? "text-indigo-900" : "text-gray-900"}`}
                    >
                      {reason}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Comments */}
          <div className="space-y-4">
            <div>
              <h2 className="text-theme-body sm:text-theme-h5 font-bold text-gray-900">
                Additional Comments
              </h2>
              <p className="text-theme-caption sm:text-theme-body-sm text-gray-500 mt-1">
                Provide any other details that might help us (Optional).
              </p>
            </div>
            <textarea
              rows={3}
              value={state.additionalComments}
              onChange={(e) =>
                dispatch({ type: CancelItemActionType.SET_COMMENTS, payload: e.target.value })
              }
              placeholder="Tell us more about why you are cancelling..."
              className="w-full p-4 text-theme-body-sm sm:text-theme-body bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none resize-none transition-all placeholder:text-gray-400 font-medium"
            ></textarea>
          </div>

          {/* Submit Area */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              Keep Item
            </button>
            <button
              type="submit"
              disabled={state.isSubmitting}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
                state.isSubmitting
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-red-600/20"
              }`}
            >
              {state.isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Processing...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
