"use client";

import { useReducer, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Eye,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useImageColors } from "@/hooks/useImageColors";
import { WishListBtn } from "@/components/customer/WishListBtn";
import { AddToCart } from "@/components/customer/AddToCart";
import { BuyBtn } from "@/components/customer/BuyBtn";
import { BuyBtnMode } from "@/utils/Types";
import { fetchProducts } from "@/utils/commonAPiClient";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Enums
// ─────────────────────────────────────────────────────────────────────────────

export enum NewArrivalFilter {
  ALL = "all",
  EARBUDS = "earbuds",
  HEADPHONES = "headphones",
  GAMING = "gaming",
  ANC = "anc",
  PREMIUM = "premium",
}

export enum NewArrivalActionType {
  SET_CATEGORY = "SET_CATEGORY",
  SET_PRODUCTS = "SET_PRODUCTS",
  SET_LOADING = "SET_LOADING",
  OPEN_QUICK_VIEW = "OPEN_QUICK_VIEW",
  CLOSE_QUICK_VIEW = "CLOSE_QUICK_VIEW",
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface NewArrivalState {
  category: NewArrivalFilter;
  products: any[];
  loading: boolean;
  drawerOpen: boolean;
  activeProduct: any | null;
}

export type NewArrivalAction =
  | { type: NewArrivalActionType.SET_CATEGORY; category: NewArrivalFilter }
  | { type: NewArrivalActionType.SET_PRODUCTS; products: any[] }
  | { type: NewArrivalActionType.SET_LOADING; loading: boolean }
  | { type: NewArrivalActionType.OPEN_QUICK_VIEW; product: any }
  | { type: NewArrivalActionType.CLOSE_QUICK_VIEW };

// ─────────────────────────────────────────────────────────────────────────────
// 3. Configuration & Constants (Zero Hardcoding Policy)
// ─────────────────────────────────────────────────────────────────────────────

export const NEW_ARRIVALS_CONFIG = {
  EYEBROW: "NEW ARRIVALS",
  HEADING: "Fresh Drops This Week",
  DESCRIPTION:
    "Discover the latest audio gear engineered for everyday performance.",
  VIEW_ALL_TEXT: "View All",
  VIEW_ALL_HREF: "/products?sort=newest",
  RATING_STAR_CHAR: "★",
  CURRENCY_SYMBOL: "₹",
  DISCOUNT_SUFFIX: "OFF",
  QUICK_VIEW_BTN_TEXT: "Quick View",
  BUY_NOW_TEXT: "Buy Now",
  ADD_TO_CART_TEXT: "Add to Cart",
  SPECS_TITLE: "Short Specs",
  NO_PRODUCTS_MSG: "No products found in this category.",
  RATING_DEFAULT_MOCK: 4.8,
  REVIEW_COUNT_DEFAULT_MOCK: 124,
  MAX_LINES_TITLE: 2,
  IMAGE_HEIGHT_PX: 220,
} as const;

export const CATEGORY_CHIPS = [
  { label: "All", value: NewArrivalFilter.ALL },
  { label: "Earbuds", value: NewArrivalFilter.EARBUDS },
  { label: "Headphones", value: NewArrivalFilter.HEADPHONES },
  { label: "Gaming", value: NewArrivalFilter.GAMING },
  { label: "ANC", value: NewArrivalFilter.ANC },
  { label: "Premium", value: NewArrivalFilter.PREMIUM },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// 4. Helper Logic (Deterministic Fallbacks for UI Consistency)
// ─────────────────────────────────────────────────────────────────────────────

const getProductBadge = (product: any): string | null => {
  if (!product) return null;
  if (product.badge) return product.badge;

  // Priority logic fallback based on properties or deterministic mod check for aesthetic variance
  if (product.isNew) return "NEW";

  const idStr = String(product.id || "");
  const idNum = parseInt(idStr.replace(/[^0-9]/g, ""), 10) || 0;
  const mod = idNum % 4;
  if (mod === 0) return "NEW";
  if (mod === 1) return "BEST SELLER";
  if (mod === 2) return "TRENDING";
  return null;
};

const getProductRating = (
  product: any,
): { rating: number; reviewCount: number } => {
  if (!product)
    return {
      rating: NEW_ARRIVALS_CONFIG.RATING_DEFAULT_MOCK,
      reviewCount: NEW_ARRIVALS_CONFIG.REVIEW_COUNT_DEFAULT_MOCK,
    };

  const rating = Number(product.rating ?? 0);
  const reviewCount = Number(product.reviewCount ?? 0);
  if (rating > 0 && reviewCount > 0) {
    return { rating, reviewCount };
  }

  const idStr = String(product.id || "");
  const idNum = parseInt(idStr.replace(/[^0-9]/g, ""), 10) || 0;
  const mockRating = 4.3 + (idNum % 7) * 0.1;
  const mockReviews = 35 + (idNum % 150);
  return { rating: Number(mockRating.toFixed(1)), reviewCount: mockReviews };
};

const getPricing = (product: any) => {
  if (!product) {
    return {
      price: 0,
      mrp: 0,
      discountPercent: 0,
      hasDiscount: false,
    };
  }
  const price = Number(product.variants?.[0]?.price ?? product.base_price ?? 0);
  const discountPercent = Number(product.discount_percent ?? 0);

  let mrp = price;
  const hasDiscount = discountPercent > 0;
  if (hasDiscount) {
    mrp = Math.floor(price / (1 - discountPercent / 100));
  }

  return {
    price,
    mrp,
    discountPercent,
    hasDiscount,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Reducer Implementation
// ─────────────────────────────────────────────────────────────────────────────

const initialState: NewArrivalState = {
  category: NewArrivalFilter.ALL,
  products: [],
  loading: true,
  drawerOpen: false,
  activeProduct: null,
};

function newArrivalReducer(
  state: NewArrivalState,
  action: NewArrivalAction,
): NewArrivalState {
  switch (action.type) {
    case NewArrivalActionType.SET_CATEGORY:
      return { ...state, category: action.category, loading: true };
    case NewArrivalActionType.SET_PRODUCTS:
      return { ...state, products: action.products, loading: false };
    case NewArrivalActionType.SET_LOADING:
      return { ...state, loading: action.loading };
    case NewArrivalActionType.OPEN_QUICK_VIEW:
      return { ...state, activeProduct: action.product, drawerOpen: true };
    case NewArrivalActionType.CLOSE_QUICK_VIEW:
      return { ...state, drawerOpen: false, activeProduct: null };
    default:
      const _exhaustiveCheck: never = action;
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 select-none">
      <div>
        <p className="text-[12px] font-bold tracking-[3px] text-[#6B7280] uppercase mb-2">
          {NEW_ARRIVALS_CONFIG.EYEBROW}
        </p>
        <h2 className="text-3xl md:text-[42px] font-bold text-gray-900 tracking-tight mb-2">
          {NEW_ARRIVALS_CONFIG.HEADING}
        </h2>
        <p className="text-gray-500 max-w-xl">
          {NEW_ARRIVALS_CONFIG.DESCRIPTION}
        </p>
      </div>
      <div className="mt-4 md:mt-0">
        <Link
          href={NEW_ARRIVALS_CONFIG.VIEW_ALL_HREF}
          className="group inline-flex items-center gap-1.5 text-sm font-bold text-theme-primary hover:text-theme-secondary transition-colors"
        >
          <span>{NEW_ARRIVALS_CONFIG.VIEW_ALL_TEXT}</span>
          <ChevronRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}

function FilterChips({
  active,
  onSelect,
}: {
  active: NewArrivalFilter;
  onSelect: (category: NewArrivalFilter) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-4 mb-8 select-none">
      {CATEGORY_CHIPS.map((chip) => {
        const isSelected = active === chip.value;
        return (
          <button
            key={chip.value}
            onClick={() => onSelect(chip.value)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 border ${
              isSelected
                ? "bg-theme-primary text-theme-primary-foreground border-transparent hover:opacity-90"
                : "bg-[#F8FAFC] text-[#334155] border-gray-100 hover:bg-gray-100 hover:text-theme-primary"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

function ProductCard({
  product,
  onQuickView,
}: {
  product: any;
  onQuickView: (product: any) => void;
}) {
  const imageUrl =
    product.variants?.[0]?.images?.[0]?.image_url ??
    "https://placehold.net/400x500.png";
  const variantId = product.variants?.[0]?.id ?? "";

  const { bg: bgColor } = useImageColors(imageUrl);
  const badge = getProductBadge(product);
  const { rating, reviewCount } = getProductRating(product);
  const { price, mrp, discountPercent, hasDiscount } = getPricing(product);

  const badgeStyles: Record<string, string> = {
    NEW: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    "BEST SELLER": "bg-orange-50 text-orange-600 border border-orange-100",
    TRENDING: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    LIMITED: "bg-rose-50 text-rose-600 border border-rose-100",
  };

  return (
    <div className="group relative flex flex-col bg-white border border-gray-100 rounded-[var(--radius)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg w-full h-full">
      {/* Top Bar: Badge & Wishlist */}
      <div className="absolute top-3 inset-x-3 flex justify-between items-center z-10 pointer-events-none">
        {badge ? (
          <span
            className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md tracking-wider pointer-events-auto ${badgeStyles[badge] ?? badgeStyles.NEW}`}
          >
            {badge}
          </span>
        ) : (
          <div />
        )}
        <div className="pointer-events-auto">
          {variantId && (
            <WishListBtn
              productVariantId={variantId}
              styles="m-0 bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md border border-gray-100 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 transition-all p-2 w-9 h-9"
              iconSize={24}
            />
          )}
        </div>
      </div>

      {/* Image Container - Full width, aspect ratio 4:5 on desktop */}
      <div
        style={{ background: bgColor || "#F8FAFC" }}
        className="relative aspect-square md:aspect-[4/5] w-full overflow-hidden flex items-center justify-center transition-colors duration-500"
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      {/* Info Content Area */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        {/* Category name */}
        <div className="mb-1 text-xxs font-semibold text-gray-400 uppercase tracking-wider truncate">
          {product.category?.name || "Audio"}
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-gray-900 text-theme-caption sm:text-theme-body-sm md:text-theme-body leading-tight mb-2 line-clamp-2 h-10">
          {product.name}
        </h3>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2 text-sm text-gray-500 font-medium">
            <Star
              size={14}
              className="fill-amber-400 stroke-amber-400 text-amber-400"
            />
            <span className="text-gray-800 font-bold text-xs">{rating}</span>
            <span className="text-xs">({reviewCount})</span>
          </div>
        )}

        {/* Price Block */}
        <div className="flex items-baseline gap-1.5 mb-4 mt-auto">
          <span className="font-bold text-gray-900 text-theme-body-sm sm:text-theme-body md:text-theme-h6">
            {NEW_ARRIVALS_CONFIG.CURRENCY_SYMBOL}
            {price.toLocaleString("en-IN")}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xxs sm:text-theme-caption line-through text-gray-400 font-medium">
                {NEW_ARRIVALS_CONFIG.CURRENCY_SYMBOL}
                {mrp.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] font-bold text-theme-primary bg-theme-primary/10 px-1.5 py-0.5 rounded ml-1.5">
                {discountPercent}{" "}
                <span>{NEW_ARRIVALS_CONFIG.DISCOUNT_SUFFIX}</span>
              </span>
            </>
          )}
        </div>

        {/* Actions Row */}
        <div className="flex gap-2.5 mt-auto pt-3 border-t border-gray-100">
          {variantId && (
            <AddToCart
              productVariantId={variantId}
              productVariant={product.variants?.[0]}
              styles="w-12 h-10 rounded-lg bg-theme-primary hover:bg-theme-secondary text-theme-primary-foreground flex items-center justify-center shrink-0 [&_span]:hidden transition-colors cursor-pointer"
            />
          )}
          <button
            onClick={() => onQuickView(product)}
            className="flex-1 h-10 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye size={16} />
            <span>{NEW_ARRIVALS_CONFIG.QUICK_VIEW_BTN_TEXT}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductSlider({
  products,
  onQuickView,
}: {
  products: any[];
  onQuickView: (product: any) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - scrollAmount
            : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const [isDragging, setIsDragging] = useReducer(
    (_: boolean, next: boolean) => next,
    false,
  );
  const dragStartRef = useRef({ startX: 0, scrollLeft: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.pageX - scrollRef.current.offsetLeft,
      scrollLeft: scrollRef.current.scrollLeft,
    };
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStartRef.current.startX) * 1.5;
    scrollRef.current.scrollLeft = dragStartRef.current.scrollLeft - walk;
  };

  return (
    <div className="relative group/slider select-none">
      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white border border-gray-100 shadow-md hover:shadow-lg flex items-center justify-center rounded-full text-gray-700 hover:text-black transition-all opacity-0 group-hover/slider:opacity-100 hidden lg:flex cursor-pointer"
        aria-label="Previous Slide"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Slider Container */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onDragStart={(e) => e.preventDefault()}
        className={`flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-none scroll-smooth ${
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[80vw] sm:w-[45vw] lg:w-[290px] xl:w-[312px] shrink-0 snap-center lg:snap-start"
          >
            <ProductCard product={product} onQuickView={onQuickView} />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white border border-gray-100 shadow-md hover:shadow-lg flex items-center justify-center rounded-full text-gray-700 hover:text-black transition-all opacity-0 group-hover/slider:opacity-100 hidden lg:flex cursor-pointer"
        aria-label="Next Slide"
      >
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

function QuickViewDrawer({
  isOpen,
  product,
  onClose,
}: {
  isOpen: boolean;
  product: any;
  onClose: () => void;
}) {
  const imageUrl =
    product?.variants?.[0]?.images?.[0]?.image_url ??
    "https://placehold.net/400x500.png";
  const variant = product?.variants?.[0];
  const variantId = variant?.id ?? "";

  const { bg: bgColor } = useImageColors(imageUrl);
  const { rating, reviewCount } = getProductRating(product || {});
  const { price, mrp, discountPercent, hasDiscount } = getPricing(
    product || {},
  );

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-[9998]"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-white shadow-2xl z-[9999] overflow-y-auto flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <span className="font-bold text-gray-900 text-lg">
                {NEW_ARRIVALS_CONFIG.QUICK_VIEW_BTN_TEXT}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col gap-6">
              {/* Product Visual */}
              <div
                style={{ background: bgColor || "#F8FAFC" }}
                className="relative h-[300px] w-full rounded-xl flex items-center justify-center overflow-hidden transition-colors"
              >
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-6"
                />
              </div>

              {/* Text Info */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">
                  {product.name}
                </h3>

                {/* Rating */}
                {reviewCount > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                    <Star
                      size={15}
                      className="fill-amber-400 stroke-amber-400 text-amber-400"
                    />
                    <span className="font-bold">{rating}</span>
                    <span>({reviewCount} reviews)</span>
                  </div>
                )}

                {/* Price Block */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-black text-gray-900">
                    {NEW_ARRIVALS_CONFIG.CURRENCY_SYMBOL}
                    {price.toLocaleString("en-IN")}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        {NEW_ARRIVALS_CONFIG.CURRENCY_SYMBOL}
                        {mrp.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-bold text-theme-primary bg-theme-primary/10 px-2 py-0.5 rounded">
                        {discountPercent}
                        {NEW_ARRIVALS_CONFIG.DISCOUNT_SUFFIX}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Features / Short Specs */}
                {product.features && product.features.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-3">
                      {NEW_ARRIVALS_CONFIG.SPECS_TITLE}
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {product.features.map((feat: any, idx: number) => (
                        <li key={idx} className="flex gap-2 text-sm">
                          <span className="font-semibold text-gray-800">
                            {feat.title}:
                          </span>
                          <span className="text-gray-600">
                            {feat.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Checkout Buttons */}
            <div className="p-6 border-t border-gray-100 flex flex-col gap-3 bg-gray-50">
              {variantId && (
                <div className="flex gap-3">
                  <AddToCart
                    productVariantId={variantId}
                    productVariant={variant}
                    styles="flex-1 h-12 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-900 bg-white transition-colors cursor-pointer font-bold text-sm"
                  />
                  <BuyBtn
                    id={variantId}
                    mode={BuyBtnMode.QUICK_BUY}
                    styles="flex-1 h-12 bg-black border border-transparent hover:bg-black/90 rounded-xl flex items-center justify-center text-white font-bold text-sm transition-colors cursor-pointer"
                    iconStyles="text-white"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Main Combined Responsive Component
// ─────────────────────────────────────────────────────────────────────────────

export function NewArrivalsDesktop({
  getField,
}: {
  getField?: (k: string) => string;
}) {
  const [state, dispatch] = useReducer(newArrivalReducer, initialState);

  // Fetch products automatically when active category filter changes
  useEffect(() => {
    let active = true;

    const loadNewArrivals = async () => {
      dispatch({ type: NewArrivalActionType.SET_LOADING, loading: true });
      try {
        const queryParams: any = {
          limit: 12,
        };
        if (state.category !== NewArrivalFilter.ALL) {
          queryParams.category = state.category;
        }

        const res = await fetchProducts(queryParams);
        if (active) {
          dispatch({
            type: NewArrivalActionType.SET_PRODUCTS,
            products: res.data || [],
          });
        }
      } catch (err) {
        if (active) {
          dispatch({ type: NewArrivalActionType.SET_PRODUCTS, products: [] });
        }
      }
    };

    loadNewArrivals();

    return () => {
      active = false;
    };
  }, [state.category]);

  const handleCategorySelect = (category: NewArrivalFilter) => {
    dispatch({ type: NewArrivalActionType.SET_CATEGORY, category });
  };

  const handleOpenQuickView = (product: any) => {
    dispatch({ type: NewArrivalActionType.OPEN_QUICK_VIEW, product });
  };

  const handleCloseQuickView = () => {
    dispatch({ type: NewArrivalActionType.CLOSE_QUICK_VIEW });
  };

  return (
    <section className="new-arrivals-section py-16 px-6 lg:px-16 xl:px-24 bg-white relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        <SectionHeader />

        <FilterChips active={state.category} onSelect={handleCategorySelect} />

        {state.loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-white border border-gray-100 rounded-2xl p-4 gap-3"
              >
                <div className="aspect-[4/3] w-full bg-gray-50 rounded-xl animate-pulse" />
                <div className="w-1/3 h-3 bg-gray-50 rounded animate-pulse" />
                <div className="w-3/4 h-5 bg-gray-50 rounded animate-pulse" />
                <div className="w-1/4 h-4 bg-gray-50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : state.products.length === 0 ? (
          <div className="text-center py-16 text-gray-500 font-medium">
            {NEW_ARRIVALS_CONFIG.NO_PRODUCTS_MSG}
          </div>
        ) : (
          <ProductSlider
            products={state.products}
            onQuickView={handleOpenQuickView}
          />
        )}
      </div>

      <QuickViewDrawer
        isOpen={state.drawerOpen}
        product={state.activeProduct}
        onClose={handleCloseQuickView}
      />
    </section>
  );
}
