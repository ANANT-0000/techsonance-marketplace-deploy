"use client";
import { useEffect, useReducer } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, AlertCircle } from "lucide-react";
import {
  fetchExistingReviews,
  fetchOrderDetails,
  fetchSubmitReview,
} from "@/utils/customerApiClient";
import { authToken } from "@/utils/authToken";
import { useAppSelector } from "@/hooks/reduxHooks";

interface ProductImage {
  image_url: string;
}
interface ProductVariant {
  id: string;
  variant_name: string;
  price: string;
  images: ProductImage[];
}
interface ReviewOrderItem {
  id: string;
  quantity: number;
  order_status: "delivered" | "processing" | "pending" | "cancelled";
  price: string;
  variant: ProductVariant;
  return_request: null;
  cancelledRecord: null;
  invoice: null;
}

interface State {
  targetItem: ReviewOrderItem | null;
  rating: number;
  hoverRating: number;
  reviewText: string;
  isSubmitting: boolean;
  error: string;
}

enum ActionType {
  SET_TARGET_ITEM = "SET_TARGET_ITEM",
  SET_RATING = "SET_RATING",
  SET_HOVER_RATING = "SET_HOVER_RATING",
  SET_REVIEW_TEXT = "SET_REVIEW_TEXT",
  SET_SUBMITTING = "SET_SUBMITTING",
  SET_ERROR = "SET_ERROR",
}

type Action =
  | { type: ActionType.SET_TARGET_ITEM; payload: ReviewOrderItem | null }
  | { type: ActionType.SET_RATING; payload: number }
  | { type: ActionType.SET_HOVER_RATING; payload: number }
  | { type: ActionType.SET_REVIEW_TEXT; payload: string }
  | { type: ActionType.SET_SUBMITTING; payload: boolean }
  | { type: ActionType.SET_ERROR; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_TARGET_ITEM:
      return { ...state, targetItem: action.payload };
    case ActionType.SET_RATING:
      return { ...state, rating: action.payload, error: "" };
    case ActionType.SET_HOVER_RATING:
      return { ...state, hoverRating: action.payload };
    case ActionType.SET_REVIEW_TEXT:
      return { ...state, reviewText: action.payload };
    case ActionType.SET_SUBMITTING:
      return { ...state, isSubmitting: action.payload };
    case ActionType.SET_ERROR:
      return { ...state, error: action.payload, isSubmitting: false };
    default:
      return state;
  }
}

export default function WriteReviewPage() {
  const { orderId, itemId } = useParams<{ orderId: string; itemId: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const userId = user && "id" in user ? user.id : null;
  const router = useRouter();

  const [state, dispatch] = useReducer(reducer, {
    targetItem: null,
    rating: 0,
    hoverRating: 0,
    reviewText: "",
    isSubmitting: false,
    error: "",
  });

  const token = authToken();

  useEffect(() => {
    if (!orderId || !token || !user?.id) return;

    const fetchOrderAndReview = async () => {
      const orderRes = await fetchOrderDetails(orderId, token);
      if (orderRes?.data) {
        const specificItem = orderRes.data.items.find(
          (i: ReviewOrderItem) => i.id === itemId,
        );

        dispatch({ type: ActionType.SET_TARGET_ITEM, payload: specificItem });

        if (specificItem?.variant?.id && userId) {
          const reviewRes = await fetchExistingReviews(
            specificItem.variant.id,
            userId,
            token,
          );
          if (reviewRes?.data) {
            dispatch({
              type: ActionType.SET_RATING,
              payload: reviewRes.data.rating,
            });
            dispatch({
              type: ActionType.SET_REVIEW_TEXT,
              payload: reviewRes.data.review,
            });
          }
        }
      }
    };

    fetchOrderAndReview();
  }, [orderId, itemId, token, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    const payload = {
      product_variant_id: state.targetItem?.variant.id,
      rating: state.rating.toString(),
      review: state.reviewText,
    };
    formData.append("reviewData", JSON.stringify(payload));

    // Basic Validation
    if (state.rating === 0) {
      dispatch({
        type: ActionType.SET_ERROR,
        payload: "Please select a star rating.",
      });
      return;
    }
    if (state.reviewText.trim().length < 10) {
      dispatch({
        type: ActionType.SET_ERROR,
        payload:
          "Please write at least 10 characters describing your experience.",
      });
      return;
    }

    dispatch({ type: ActionType.SET_SUBMITTING, payload: true });

    try {
      const res = await fetchSubmitReview(formData, user?.id || "", token!);
      router.back();
    } catch (err) {
      dispatch({
        type: ActionType.SET_ERROR,
        payload: "Failed to submit review. Please try again later.",
      });
    }
  };
  if (!state.targetItem)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading item details...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Write a Review</h1>
      </div>

      {/* Product Summary Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="flex gap-4 items-center">
          {/* Mapped correctly to targetItem.variant based on the provided JSON */}
          <img
            src={state.targetItem.variant.images[0]?.image_url}
            alt={state.targetItem.variant.variant_name}
            className="w-20 h-20 object-contain bg-[#f7f7f7] rounded-lg mix-blend-multiply"
          />
          <div>
            <p className="font-semibold text-gray-900 text-lg">
              {state.targetItem.variant.variant_name}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Purchased in this order
            </p>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200"
      >
        {state.error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm border border-red-100">
            <AlertCircle size={16} /> {state.error}
          </div>
        )}

        {/* 1. Star Rating */}
        <div className="mb-8 flex flex-col items-center sm:items-start">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Overall Rating
          </h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <button
                key={starIndex}
                type="button"
                onMouseEnter={() =>
                  dispatch({
                    type: ActionType.SET_HOVER_RATING,
                    payload: starIndex,
                  })
                }
                onMouseLeave={() =>
                  dispatch({ type: ActionType.SET_HOVER_RATING, payload: 0 })
                }
                onClick={() =>
                  dispatch({ type: ActionType.SET_RATING, payload: starIndex })
                }
                className="p-1 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star
                  size={36}
                  className={`${
                    (state.hoverRating || state.rating) >= starIndex
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {state.rating === 1 && "Terrible"}
            {state.rating === 2 && "Poor"}
            {state.rating === 3 && "Fair"}
            {state.rating === 4 && "Good"}
            {state.rating === 5 && "Excellent!"}
            {state.rating === 0 && "Tap a star to rate"}
          </p>
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* 2. Written Review */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Add a written review
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Share your experience to help other buyers make better choices.
          </p>
          <textarea
            rows={5}
            value={state.reviewText}
            onChange={(e) =>
              dispatch({
                type: ActionType.SET_REVIEW_TEXT,
                payload: e.target.value,
              })
            }
            placeholder="What did you like or dislike? What should other shoppers know?"
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-gray-50/50"
          ></textarea>
          <p className="text-xs text-gray-400 mt-2 text-right">
            {state.reviewText && state.reviewText.length} characters
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 font-bold hover:bg-gray-50 transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={state.isSubmitting}
            className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-colors order-1 sm:order-2 flex justify-center"
          >
            {state.isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
