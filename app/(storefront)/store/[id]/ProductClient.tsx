"use client";
import { useEffect, useReducer } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useImageColors } from "@/hooks/useImageColors";
import { WishListBtn } from "@/components/customer/WishListBtn";
import { AddToCart } from "@/components/customer/AddToCart";
import { BuyBtn } from "@/components/customer/BuyBtn";
import { ProductReview } from "@/components/customer/ProductReview";
import { ProductSpecifications } from "@/components/customer/ProductSpec";
import {
  BuyBtnMode,
  Coupon,
  Product,
  ProductImage,
  Variant,
} from "@/utils/Types";
import { formatCurrency } from "@/lib/utils";
import { fetchProduct } from "@/utils/commonAPiClient";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Star,
  Tag,
  X,
  Share2,
  Heart,
  Shield,
  Truck,
  RotateCcw,
  Banknote,
  FileSpreadsheet,
  Package,
  AlertCircle,
  Clock,
  Loader2,
  MessageSquareQuote,
  ChevronDown,
} from "lucide-react";
import { AvailableCouponsModal } from "@/components/customer/AvailableCouponsModal";
import { useMediaQuery } from "react-responsive";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import toast, { Toaster } from "react-hot-toast";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHooks";
import { openLoginModal } from "@/lib/features/auth/authSlice";
import { RootState } from "@/lib/store";
import { AxiosError, AxiosResponse } from "axios";
import { PageLoader } from "@/components/customer/PageLoader";
import { ProductClientConfig } from "@/constants";

// ─── Trust Badges ────────────────────────────────────────────────────────────
const trustBadges = [
  { icon: Truck, label: "Free Delivery" },
  { icon: RotateCcw, label: "7-Day Returns" },
  { icon: Shield, label: "1 Year Warranty" },
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: FileSpreadsheet, label: "GST Billing" },
];

// ─── Skeleton Components ──────────────────────────────────────────────────────
const SkeletonBox = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className ?? ""}`} />
);

const ProductPageSkeleton = () => (
  <main className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SkeletonBox className="h-4 w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex gap-4">
          <div className="hidden lg:flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <SkeletonBox key={i} className="w-[72px] h-[72px]" />
            ))}
          </div>
          <SkeletonBox className="flex-1 aspect-square rounded-3xl" />
        </div>
        <div className="flex flex-col gap-5">
          <SkeletonBox className="h-5 w-28" />
          <SkeletonBox className="h-8 w-3/4" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-2/3" />
          <SkeletonBox className="h-12 w-40 mt-2" />
          <div className="flex gap-3 mt-2">
            {[...Array(3)].map((_, i) => (
              <SkeletonBox key={i} className="w-9 h-9 rounded-full" />
            ))}
          </div>
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <SkeletonBox key={i} className="w-20 h-10 rounded-xl" />
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <SkeletonBox className="flex-1 h-12 rounded-2xl" />
            <SkeletonBox className="flex-1 h-12 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  </main>
);

// ─── Star Row ─────────────────────────────────────────────────────────────────
const StarRow = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <span className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        fill={i < rating ? "#F59E0B" : "none"}
        className={i < rating ? "text-amber-400" : "text-gray-300"}
      />
    ))}
  </span>
);

type Tab = "description" | "specs";

// ─── Reducer ──────────────────────────────────────────────────────────────────
interface State {
  isLoading: boolean;
  product: Product | undefined;
  activeVariant: Variant | undefined;
  productImages: ProductImage[];
  activeImage: string | undefined;
  activeIndex: number;
  isCouponModalOpen: boolean;
  selectedCoupon: Coupon | null;
  activeTab: Tab;
  quantity: number;
  isPageLoading: boolean;
}

enum ActionType {
  SET_LOADING = "SET_LOADING",
  SET_PRODUCT_DATA = "SET_PRODUCT_DATA",
  SET_ACTIVE_VARIANT = "SET_ACTIVE_VARIANT",
  SET_ACTIVE_IMAGE = "SET_ACTIVE_IMAGE",
  SET_ACTIVE_INDEX = "SET_ACTIVE_INDEX",
  SET_COUPON_MODAL_OPEN = "SET_COUPON_MODAL_OPEN",
  SET_SELECTED_COUPON = "SET_SELECTED_COUPON",
  SET_ACTIVE_TAB = "SET_ACTIVE_TAB",
  SET_QUANTITY = "SET_QUANTITY",
  SET_PAGE_LOADING = "SET_PAGE_LOADING",
}

type Action =
  | { type: ActionType.SET_LOADING; payload: boolean }
  | {
      type: ActionType.SET_PRODUCT_DATA;
      payload: {
        product: Product;
        variant?: Variant;
        images: ProductImage[];
        activeImage?: string;
      };
    }
  | {
      type: ActionType.SET_ACTIVE_VARIANT;
      payload: {
        variant: Variant;
        images: ProductImage[];
        activeImage?: string;
      };
    }
  | { type: ActionType.SET_ACTIVE_IMAGE; payload: string | undefined }
  | { type: ActionType.SET_ACTIVE_INDEX; payload: number }
  | { type: ActionType.SET_COUPON_MODAL_OPEN; payload: boolean }
  | { type: ActionType.SET_SELECTED_COUPON; payload: Coupon | null }
  | { type: ActionType.SET_ACTIVE_TAB; payload: Tab }
  | { type: ActionType.SET_QUANTITY; payload: number }
  | { type: ActionType.SET_PAGE_LOADING; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET_PAGE_LOADING:
      return { ...state, isPageLoading: action.payload };
    case ActionType.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ActionType.SET_PRODUCT_DATA:
      return {
        ...state,
        product: action.payload.product,
        activeVariant: action.payload.variant,
        productImages: action.payload.images,
        activeImage: action.payload.activeImage,
      };
    case ActionType.SET_ACTIVE_VARIANT:
      return {
        ...state,
        activeVariant: action.payload.variant,
        productImages: action.payload.images,
        activeImage: action.payload.activeImage,
        selectedCoupon: null,
      };
    case ActionType.SET_ACTIVE_IMAGE:
      return { ...state, activeImage: action.payload };
    case ActionType.SET_ACTIVE_INDEX:
      return { ...state, activeIndex: action.payload };
    case ActionType.SET_COUPON_MODAL_OPEN:
      return { ...state, isCouponModalOpen: action.payload };
    case ActionType.SET_SELECTED_COUPON:
      return { ...state, selectedCoupon: action.payload };
    case ActionType.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    case ActionType.SET_QUANTITY:
      return { ...state, quantity: action.payload };
    default: {
      const _exhaustiveCheck: never = action;
      return state;
    }
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductClient({ id }: { id: string }) {
  const router = useRouter();
  const token = authToken();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const isMobile = useMediaQuery({ maxWidth: "1024px" });
  const reduxDispatch = useAppDispatch();

  const [state, dispatch] = useReducer(reducer, {
    isPageLoading: true,
    isLoading: false,
    product: undefined,
    activeVariant: undefined,
    productImages: [],
    activeImage: undefined,
    activeIndex: 0,
    isCouponModalOpen: false,
    selectedCoupon: null,
    activeTab: "description",
    quantity: 1,
  });

  const { bg: bgColor } = useImageColors(state.activeImage);
  const { items } = useAppSelector((rootState: RootState) => rootState.cart);
  const cartItem = items?.find((item) => item.productVariantId === id);

  useEffect(() => {
    if (cartItem) {
      dispatch({ type: ActionType.SET_QUANTITY, payload: cartItem.quantity });
    }
  }, [cartItem]);

  useEffect(() => {
    const getProduct = async () => {
      dispatch({ type: ActionType.SET_LOADING, payload: true });
      try {
        const response = await fetchProduct(id);
        const productData = response.data as Product;
        let variantData = undefined;
        let imagesData: ProductImage[] = [];
        let activeImgData = undefined;

        if (productData?.variants?.length > 0) {
          variantData = productData.variants[0];
          imagesData = productData.variants[0].images;
          activeImgData = productData.variants[0].images[0]?.image_url;
        }

        dispatch({
          type: ActionType.SET_PRODUCT_DATA,
          payload: {
            product: productData,
            variant: variantData,
            images: imagesData,
            activeImage: activeImgData,
          },
        });
      } catch (error) {
        toast.error(ProductClientConfig.PRODUCT_LOAD_ERROR);

        dispatch({ type: ActionType.SET_PAGE_LOADING, payload: false });
      } finally {
        dispatch({ type: ActionType.SET_LOADING, payload: false });
        dispatch({ type: ActionType.SET_PAGE_LOADING, payload: false });
      }
    };
    getProduct();
  }, [id]);

  // useEffect(() => {
  //     const getProduct = async () => {
  //         dispatch({ type: ActionType.SET_LOADING, payload: true });
  //         try {
  //             const response = await fetchProduct(id);
  //             const productData = response.data as Product;
  //             let variantData = undefined;
  //             let imagesData: ProductImage[] = [];
  //             let activeImgData = undefined;

  //             if (productData?.variants?.length > 0) {
  //                 variantData = productData.variants[0];
  //                 imagesData = productData.variants[0].images;
  //                 activeImgData = productData.variants[0].images[0]?.image_url;
  //             }

  //             dispatch({
  //                 type: ActionType.SET_PRODUCT_DATA,
  //                 payload: { product: productData, variant: variantData, images: imagesData, activeImage: activeImgData }
  //             });
  //         } finally {
  //             dispatch({ type: ActionType.SET_LOADING, payload: false });
  //         }
  //     };
  //     getProduct();
  // }, [id]);

  useEffect(() => {
    const idx = state.productImages.findIndex(
      (img) => img.image_url === state.activeImage,
    );
    if (idx !== -1)
      dispatch({ type: ActionType.SET_ACTIVE_INDEX, payload: idx });
  }, [state.activeImage, state.productImages]);

  const handleVariantChange = (variant: Variant) => {
    dispatch({
      type: ActionType.SET_ACTIVE_VARIANT,
      payload: {
        variant,
        images: variant.images,
        activeImage: variant.images[0]?.image_url,
      },
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const basePrice = Number(state.activeVariant?.price) || 0;
  const discountPct = Number(state.product?.discount_percent) || 0;
  const originalMRP =
    discountPct > 0
      ? Math.floor(basePrice / (1 - discountPct / 100))
      : basePrice;

  let couponDiscount = 0;
  if (state.selectedCoupon) {
    if (state.selectedCoupon.discount_type === "percentage") {
      couponDiscount = Math.floor(
        basePrice * (Number(state.selectedCoupon.discount_value) / 100),
      );
      if (
        state.selectedCoupon.max_discount_amount &&
        couponDiscount > Number(state.selectedCoupon.max_discount_amount)
      ) {
        couponDiscount = Number(state.selectedCoupon.max_discount_amount);
      }
    } else {
      couponDiscount = Number(state.selectedCoupon.discount_value);
    }
  }
  const finalPrice = Math.max(0, basePrice - couponDiscount);
  const totalSavings = originalMRP - finalPrice;
  const hasDiscount = discountPct > 0 || couponDiscount > 0;

  const reviewsList = state.activeVariant?.reviews || [];
  const totalReviews = reviewsList.length;
  const avgRating =
    totalReviews > 0
      ? Math.round(reviewsList.reduce((s, r) => s + r.rating, 0) / totalReviews)
      : 0;

  const handleCouponSelect = async (coupon: Coupon) => {
    await AxiosAPI.post(
      ProductClientConfig.COUPON_VALIDATE_API,
      {
        userId: user?.id,
        code: coupon.code,
        cartTotal: basePrice,
        productIdsInCart: [state.product?.id],
      },
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then((res: AxiosResponse) => {
        if (res.data.success !== true || res.status !== 201) {
          toast.error(
            res.data.message || ProductClientConfig.COUPON_VALIDATE_ERROR,
          );
          setTimeout(
            () =>
              dispatch({
                type: ActionType.SET_COUPON_MODAL_OPEN,
                payload: false,
              }),
            1500,
          );
        } else {
          toast.success(ProductClientConfig.COUPON_SUCCESS);
          dispatch({ type: ActionType.SET_SELECTED_COUPON, payload: coupon });
          dispatch({ type: ActionType.SET_COUPON_MODAL_OPEN, payload: false });
        }
      })
      .catch((err: AxiosError) => {
        toast.error(ProductClientConfig.COUPON_VALIDATE_ERROR);
      });
  };

  const handleCouponModalOpen = () => {
    if (!token) reduxDispatch(openLoginModal(null));
    else dispatch({ type: ActionType.SET_COUPON_MODAL_OPEN, payload: true });
  };

  const inStock = (state.activeVariant?.inventory?.stock_quantity ?? 0) > 0;

  if (state.isPageLoading) return <PageLoader />;

  return (
    <main className="min-h-screen bg-white">
      <Toaster position="top-center" />

      {/* ── Breadcrumb ─────────────────────────────────────────────── */}
      <nav className="hidden lg:flex items-center gap-2 max-w-7xl mx-auto px-8 pt-6 pb-2 text-theme-caption text-gray-400 font-medium">
        <span className="hover:text-gray-700 cursor-pointer transition-colors">
          Home
        </span>
        <ChevronRight size={12} />
        <span className="hover:text-gray-700 cursor-pointer transition-colors capitalize">
          {state.product?.category?.name ||
            ProductClientConfig.FALLBACK_CATEGORY_NAME}
        </span>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-semibold">
          {state.product?.name}
        </span>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* ── Gallery ──────────────────────────────────────────── */}
          <div className="flex gap-4">
            {/* Thumbnail strip — desktop only */}
            {!isMobile && state.productImages.length > 1 && (
              <div className="flex flex-col gap-3 lg:overflow-y-auto lg:h-0 lg:min-h-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {state.productImages.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => {
                      dispatch({
                        type: ActionType.SET_ACTIVE_IMAGE,
                        payload: img.image_url,
                      });
                      dispatch({
                        type: ActionType.SET_ACTIVE_INDEX,
                        payload: idx,
                      });
                    }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      state.activeImage === img.image_url
                        ? "border-gray-900 shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div
              // style={{ background: bgColor }}
              className="relative flex-1 rounded-3xl overflow-hidden transition-colors duration-500"
            >
              {/* Top actions */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <WishListBtn
                  productVariantId={state.activeVariant?.id}
                  styles=""
                  iconSize={20}
                />
              </div>

              <div className="block lg:hidden">
                {/* Mobile carousel */}
                <>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={state.activeIndex}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.22 }}
                      src={state.productImages[state.activeIndex]?.image_url}
                      alt={state.product?.name}
                      className="w-full aspect-square object-contain"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.15}
                      onDragEnd={(_, info) => {
                        if (
                          info.offset.x < -50 &&
                          state.activeIndex < state.productImages.length - 1
                        ) {
                          const n = state.activeIndex + 1;
                          dispatch({
                            type: ActionType.SET_ACTIVE_INDEX,
                            payload: n,
                          });
                          dispatch({
                            type: ActionType.SET_ACTIVE_IMAGE,
                            payload: state.productImages[n].image_url,
                          });
                        } else if (
                          info.offset.x > 50 &&
                          state.activeIndex > 0
                        ) {
                          const p = state.activeIndex - 1;
                          dispatch({
                            type: ActionType.SET_ACTIVE_INDEX,
                            payload: p,
                          });
                          dispatch({
                            type: ActionType.SET_ACTIVE_IMAGE,
                            payload: state.productImages[p].image_url,
                          });
                        }
                      }}
                    />
                  </AnimatePresence>

                  {/* Dot indicators */}
                  {state.productImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {state.productImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            dispatch({
                              type: ActionType.SET_ACTIVE_INDEX,
                              payload: idx,
                            });
                            dispatch({
                              type: ActionType.SET_ACTIVE_IMAGE,
                              payload: state.productImages[idx].image_url,
                            });
                          }}
                          className={`rounded-full transition-all duration-300 ${idx === state.activeIndex ? "w-5 h-2 bg-gray-900" : "w-2 h-2 bg-gray-300"}`}
                        />
                      ))}
                    </div>
                  )}

                  {state.activeIndex > 0 && (
                    <button
                      onClick={() => {
                        const p = state.activeIndex - 1;
                        dispatch({
                          type: ActionType.SET_ACTIVE_INDEX,
                          payload: p,
                        });
                        dispatch({
                          type: ActionType.SET_ACTIVE_IMAGE,
                          payload: state.productImages[p].image_url,
                        });
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-sm border border-gray-100"
                    >
                      <ChevronLeft size={18} className="text-gray-700" />
                    </button>
                  )}
                  {state.activeIndex < state.productImages.length - 1 && (
                    <button
                      onClick={() => {
                        const n = state.activeIndex + 1;
                        dispatch({
                          type: ActionType.SET_ACTIVE_INDEX,
                          payload: n,
                        });
                        dispatch({
                          type: ActionType.SET_ACTIVE_IMAGE,
                          payload: state.productImages[n].image_url,
                        });
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-sm border border-gray-100"
                    >
                      <ChevronRight size={18} className="text-gray-700" />
                    </button>
                  )}
                </>
              </div>
              <div className="hidden lg:block relative flex-1 rounded-3xl overflow-hidden transition-colors duration-500">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={state.activeImage}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    src={state.activeImage}
                    alt={state.product?.name}
                    className="w-full aspect-square object-contain"
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Product Info ──────────────────────────────────────── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="flex flex-col gap-5 lg:pt-2"
          >
            {/* Category badge + Rating */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex items-center justify-between"
            >
              <span className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-theme-xxs font-semibold tracking-widest uppercase px-3 py-1 rounded-full">
                {state.product?.category?.name || "Product"}
              </span>
              {totalReviews > 0 && (
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const el = document.getElementById(
                        "customer-reviews-section",
                      );
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                      }
                    }
                  }}
                  className="flex items-center gap-1.5 text-theme-body-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <StarRow rating={avgRating} />
                  <span className="font-semibold text-gray-800">
                    {(
                      reviewsList.reduce((s, r) => s + r.rating, 0) /
                      totalReviews
                    ).toFixed(1)}
                  </span>
                  <span className="text-gray-400">({totalReviews})</span>
                </button>
              )}
            </motion.div>

            {/* Product name */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <h1 className="text-theme-h5 lg:text-theme-h4 font-bold text-gray-900 leading-tight capitalize tracking-tight">
                {state.product?.name}
              </h1>
              {state.product?.description && (
                <p className="mt-2 text-theme-body-sm text-gray-500 leading-relaxed line-clamp-2">
                  {state.product.description.split("\n")[0]}
                </p>
              )}
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Pricing */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-theme-h3 lg:text-theme-h2 font-black text-gray-900 tracking-tight">
                  ₹{formatCurrency(finalPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-theme-h6 text-gray-400 line-through font-medium">
                      ₹{formatCurrency(originalMRP)}
                    </span>
                    <span className="text-theme-body-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                      {discountPct > 0
                        ? `${discountPct}% OFF`
                        : `Save ₹${formatCurrency(totalSavings)}`}
                    </span>
                  </>
                )}
              </div>
              <p className="text-theme-caption text-gray-400 mt-1 font-medium uppercase tracking-wider">
                Inclusive of all taxes
              </p>

              {/* Stock indicator */}
              <div className="flex items-center gap-2 mt-3">
                <span
                  className={`w-2 h-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-red-400"}`}
                />
                <span
                  className={`text-theme-body-sm font-semibold ${inStock ? "text-emerald-700" : "text-red-500"}`}
                >
                  {inStock
                    ? ProductClientConfig.IN_STOCK_MESSAGE
                    : ProductClientConfig.OUT_OF_STOCK_MESSAGE}
                </span>
              </div>
            </motion.div>

            {/* Variant selector */}
            {state.product?.variants && state.product.variants.length > 0 && (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                {/* Attribute label */}
                {state.activeVariant?.attributes?.[0] && (
                  <p className="text-theme-caption font-semibold text-gray-500 uppercase tracking-widest mb-3">
                    {state.activeVariant.attributes[0].name}:{" "}
                    <span className="text-gray-900 normal-case tracking-normal font-bold capitalize">
                      {state.activeVariant.attributes[0].value}
                    </span>
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  {state.product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(variant)}
                      className={`group relative flex flex-col items-center rounded-xl border-2 overflow-hidden transition-all duration-200 px-2 pt-2 pb-1.5 min-w-[72px]
                                                ${
                                                  state.activeVariant?.id ===
                                                  variant.id
                                                    ? "border-gray-900 shadow-md"
                                                    : "border-gray-200 hover:border-gray-400"
                                                }`}
                    >
                      {variant.images?.[0] && (
                        <img
                          src={variant.images[0].image_url}
                          alt={variant.variant_name}
                          className="w-12 h-12 object-contain"
                        />
                      )}
                      <span className="text-theme-xxs font-semibold text-gray-700 mt-1">
                        ₹{formatCurrency(Number(variant.price) || 0)}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Coupon strip */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {state.selectedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-1.5 rounded-full">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-theme-body-sm font-bold text-emerald-800 uppercase tracking-wide">
                        {state.selectedCoupon.code} Applied
                      </p>
                      <p className="text-theme-caption text-emerald-600">
                        Extra ₹{formatCurrency(couponDiscount)} savings!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      dispatch({
                        type: ActionType.SET_SELECTED_COUPON,
                        payload: null,
                      })
                    }
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-emerald-500 hover:text-red-500"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCouponModalOpen}
                  className="w-full flex items-center justify-between border border-dashed border-blue-200 bg-blue-50/40 hover:bg-blue-50 rounded-2xl px-4 py-3 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-lg">
                      <Tag size={15} className="text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-theme-body-sm font-bold text-blue-800">
                        Available Offers
                      </p>
                      <p className="text-theme-caption text-blue-500">
                        Tap to view & apply coupons
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-blue-400 group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              )}
            </motion.div>

            {/* CTA — desktop */}
            {state.activeVariant && !isMobile && (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="flex gap-3 h-12"
              >
                {/* AddToCart owns its own quantity counter via Redux */}
                <AddToCart
                  productVariantId={state.activeVariant.id}
                  productVariant={state.activeVariant}
                  styles="flex-1 h-12 rounded-2xl border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-900 hover:text-white font-bold text-theme-body-sm transition-all duration-200"
                />
                {inStock ? (
                  <BuyBtn
                    id={state.activeVariant.id}
                    mode={BuyBtnMode.QUICK_BUY}
                    styles="flex-1 h-12 rounded-2xl bg-gray-900 text-white hover:bg-black font-bold text-theme-body-sm transition-all duration-200"
                    selectedCoupon={state.selectedCoupon}
                  />
                ) : (
                  <span className="flex-1 h-12 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-400 font-bold text-theme-body-sm">
                    {ProductClientConfig.OUT_OF_STOCK_MESSAGE}
                  </span>
                )}
              </motion.div>
            )}

            {/* Trust badges — desktop */}
            {!isMobile && (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="grid grid-cols-5 gap-2 pt-2 border-t border-gray-100"
              >
                {trustBadges.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 text-center"
                  >
                    <div className="p-2 bg-gray-50 rounded-xl">
                      <Icon size={16} className="text-gray-600" />
                    </div>
                    <span className="text-theme-tiny font-semibold text-gray-500 leading-tight">
                      {label}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Tabbed Details Section ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 lg:mt-10 pb-8 lg:pb-12">
        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(
            [
              { key: "description", label: "Product Description" },
              { key: "specs", label: "Technical Specifications" },
            ] as { key: Tab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() =>
                dispatch({ type: ActionType.SET_ACTIVE_TAB, payload: tab.key })
              }
              className={`shrink-0 px-5 py-3.5 text-theme-body-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap
                                ${
                                  state.activeTab === tab.key
                                    ? "border-gray-900 text-gray-900"
                                    : "border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300"
                                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="pt-8"
          >
            {state.activeTab === "description" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-theme-body-sm space-y-3">
                  {state.product?.description ? (
                    state.product.description
                      .split("\n")
                      .map((line, i) => <p key={i}>{line}</p>)
                  ) : (
                    <p className="text-gray-400 italic">
                      No description available.
                    </p>
                  )}
                </div>
                {/* Feature highlights */}
                {state.product?.features &&
                  state.product.features.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-theme-body-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
                        Key Features
                      </h3>
                      {state.product.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                          <div>
                            <p className="text-theme-body-sm font-semibold text-gray-900">
                              {f.title}
                            </p>
                            <p className="text-theme-caption text-gray-500 mt-0.5">
                              {f.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {state.activeTab === "specs" &&
              (state.product?.features ? (
                <ProductSpecifications product={state.product.features} />
              ) : (
                <p className="text-gray-400 italic text-theme-body-sm">
                  No specifications available.
                </p>
              ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── Customer Reviews Section ─────────────────────────────────── */}
      {state.product?.id && (
        <section
          id="customer-reviews-section"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 lg:mt-12 pb-24 lg:pb-16 border-t border-gray-100 pt-8 text-left"
        >
          <h2 className="text-theme-body font-bold text-gray-900 mb-6 uppercase tracking-wider">
            Customer Reviews
          </h2>
          <ProductReview productId={state.product.id} />
        </section>
      )}

      {/* ── Mobile: Sticky bottom CTA ──────────────────────────────── */}
      {state.activeVariant && (
        <div className="block lg:hidden fixed bottom-[calc(48px+env(safe-area-inset-bottom))] left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-xl px-4 py-3">
          <div className="flex gap-3 max-w-lg mx-auto h-12">
            <AddToCart
              productVariantId={state.activeVariant.id}
              productVariant={state.activeVariant}
              styles="flex-1 h-12 rounded-2xl border-2 border-theme-primary bg-theme-primary text-theme-primary-foreground font-bold text-theme-body-sm transition-all"
            />
            {inStock ? (
              <BuyBtn
                id={state.activeVariant.id}
                mode={BuyBtnMode.QUICK_BUY}
                styles="flex-1 h-12 rounded-2xl bg-gray-900 text-white font-bold text-theme-body-sm transition-all"
                selectedCoupon={state.selectedCoupon}
                quantity={state.quantity}
              />
            ) : (
              <span className="flex-1 h-12 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-400 font-bold text-theme-body-sm">
                {ProductClientConfig.OUT_OF_STOCK_MESSAGE}
              </span>
            )}
          </div>
        </div>
      )}

      <AvailableCouponsModal
        isOpen={state.isCouponModalOpen}
        onClose={() =>
          dispatch({ type: ActionType.SET_COUPON_MODAL_OPEN, payload: false })
        }
        onSelect={handleCouponSelect}
        productId={state.product?.id}
      />
    </main>
  );
}
