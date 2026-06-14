"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, ShoppingCart } from "lucide-react";
import { AddToCart } from "@/components/customer/AddToCart";
import { Skeleton } from "../../ui/skeleton";
import { useImageColors } from "@/hooks/useImageColors";
import {
  LOOKBOOK_DEFAULTS,
  LOOKBOOK_DEFAULT_HOTSPOTS,
} from "@/constants/storefront";
import { SHOPPABLE_LOOKBOOK_TEXT } from "@/constants/customerText";

const LOOKBOOK_BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23f1f5f9'/%3E%3C/svg%3E";

const THUMBNAIL_BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23f8fafc'/%3E%3C/svg%3E";

export interface LookbookHotspot {
  id: string | number;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  product_id?: string;
  productId?: string;
  variant_id?: string; // Must match productVariantId for AddToCart
  name?: string;
  price?: string | number;
  image_url?: string;
  description?: string;
}

export interface ShoppableLookbookProps {
  title?: string;
  subtitle?: string;
  image_url?: string;
  hotspots?: LookbookHotspot[];
  bg_color?: string;
}

export function ShoppableLookbook({
  title,
  subtitle,
  image_url,
  hotspots,
  bg_color,
}: ShoppableLookbookProps) {
  const displayTitle = title ?? LOOKBOOK_DEFAULTS.title;
  const displaySubtitle = subtitle ?? LOOKBOOK_DEFAULTS.subtitle;
  const currentHotspots = (
    hotspots !== undefined && hotspots !== null
      ? hotspots
      : LOOKBOOK_DEFAULT_HOTSPOTS
  ) as LookbookHotspot[];

  // Derive bg from image if no CMS color provided
  const { solidBg: imageDerivedBg } = useImageColors(image_url, {
    fallbackColor: bg_color || undefined,
  });
  const sectionBg = bg_color || imageDerivedBg || undefined;

  const [activeHotspot, setActiveHotspot] = useState<LookbookHotspot | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [resolvedProducts, setResolvedProducts] = useState<Record<string, any>>(
    {},
  );

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setActiveHotspot(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch product details for all hotspots
  useEffect(() => {
    const productIds = currentHotspots
      .map((spot) => spot.product_id || spot.productId)
      .filter((id): id is string => !!id);

    if (productIds.length === 0) return;

    let active = true;

    const fetchAll = async () => {
      const { fetchProduct } = await import("@/utils/commonAPiClient");
      const fetched: Record<string, any> = {};

      await Promise.all(
        productIds.map(async (id) => {
          try {
            const res = await fetchProduct(id);
            const product = res?.data ?? res;
            if (product) {
              fetched[id] = product;
            }
          } catch (err) {
            // Ignore failure
          }
        }),
      );

      if (active) {
        setResolvedProducts(fetched);
      }
    };

    fetchAll();

    return () => {
      active = false;
    };
  }, [currentHotspots]);

  return (
    <section
      className="py-16 px-6 lg:px-16 xl:px-24"
      style={{ background: sectionBg }}
      ref={containerRef}
    >
      <div className="max-w-screen-xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="text-theme-tiny font-bold tracking-[0.25em] text-purple-600 uppercase">
            {SHOPPABLE_LOOKBOOK_TEXT.CURATED_INSPIRATION}
          </span>
          <h2 className="text-theme-h3 font-serif tracking-tight text-gray-900 mt-2 mb-3">
            {displayTitle}
          </h2>
          <p className="text-theme-caption text-gray-400 max-w-md mx-auto">
            {displaySubtitle}
          </p>
        </div>

        {/* Interactive Image Container */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-3xl shadow-xl border border-slate-100 bg-slate-50 overflow-visible">
          {image_url ? (
            <Image
              src={image_url}
              alt={displayTitle}
              fill
              className="object-cover rounded-3xl"
              sizes="(max-width: 1280px) 100vw, 1280px"
              quality={80}
              placeholder="blur"
              blurDataURL={LOOKBOOK_BLUR_DATA_URL}
            />
          ) : (
            <Skeleton className="w-full h-full p-4 lg:p-8 rounded-4xl" />
          )}

          {/* Render Hotspots */}
          {currentHotspots.map((spot) => {
            const isActive = activeHotspot?.id === spot.id;
            const pId = spot.product_id || spot.productId;
            const product = pId ? resolvedProducts[pId] : null;

            // Extract values with dynamic fallback support
            const name = product
              ? product.name
              : spot.name || SHOPPABLE_LOOKBOOK_TEXT.PREMIUM_ITEM;
            const description = product
              ? product.description
              : spot.description;
            const price = product
              ? (product.base_price ?? product.basePrice)
              : spot.price;
            const imageUrl = product
              ? (product.variants?.[0]?.images?.[0]?.image_url ??
                product.images?.[0]?.image_url ??
                "")
              : (spot.image_url ?? "");
            const variantId = product
              ? (product.variants?.[0]?.id ?? "")
              : (spot.variant_id ?? "");

            return (
              <div
                key={spot.id}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                {/* Pulse Glow Effect */}
                <span className="absolute -inset-2.5 rounded-full bg-white/30 animate-ping" />

                {/* Hotspot Toggle Button */}
                <button
                  onClick={() => setActiveHotspot(isActive ? null : spot)}
                  className={`relative w-8 h-8 rounded-full border border-white/20 shadow-lg flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-theme-accent text-theme-primary-foreground scale-110 rotate-45"
                      : "bg-theme-primary text-theme-primary-foreground hover:bg-theme-accent"
                  }`}
                  aria-label={`View product details for ${name}`}
                >
                  <Plus
                    size={16}
                    className="transition-transform duration-300"
                  />
                </button>

                {/* Popover Card */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute z-30 w-56 sm:w-64 bg-white/90 backdrop-blur-xl border border-white/25 rounded-2xl shadow-2xl p-3.5 flex flex-col gap-3.5 ${
                        spot.y > 60 ? "bottom-11" : "top-11"
                      } ${
                        spot.x > 60
                          ? "right-0"
                          : spot.x < 40
                            ? "left-0"
                            : "-translate-x-1/2 left-1/2"
                      }`}
                      style={{ originY: 1 }}
                    >
                      {/* Popover Arrow - points toward hotspot */}
                      <div
                        className={`absolute w-3.5 h-3.5 bg-white border-white/25 rotate-45 z-40 ${
                          spot.y > 60
                            ? "-bottom-1.5 border-r border-b"
                            : "-top-1.5 border-l border-t"
                        } ${
                          spot.x > 60
                            ? "right-[20px]"
                            : spot.x < 40
                              ? "left-[20px]"
                              : "left-1/2 -translate-x-1/2"
                        }`}
                      />

                      {!pId || product ? (
                        <>
                          <div className="flex gap-3">
                            {/* Thumbnail */}
                            {imageUrl && (
                              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                                <Image
                                  src={imageUrl}
                                  alt={name || SHOPPABLE_LOOKBOOK_TEXT.PRODUCT}
                                  fill
                                  className="object-contain p-1"
                                  sizes="56px"
                                  quality={60}
                                  placeholder="blur"
                                  blurDataURL={THUMBNAIL_BLUR_DATA_URL}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-theme-caption font-bold text-slate-800 truncate mb-0.5">
                                {name}
                              </h4>
                              {price && (
                                <p className="text-theme-caption-lg font-black text-purple-700">
                                  ₹{Number(price).toLocaleString("en-IN")}
                                </p>
                              )}
                              {description && (
                                <p className="text-theme-tiny text-slate-400 line-clamp-2 mt-1 leading-normal">
                                  {description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Add To Cart block */}
                          {variantId ? (
                            <div className="w-full">
                              <AddToCart
                                productVariantId={variantId}
                                productVariant={product?.variants?.[0]}
                                styles="w-full h-9 bg-theme-primary hover:bg-theme-accent text-white text-theme-caption font-bold rounded-lg transition-colors shadow-sm"
                              />
                            </div>
                          ) : (
                            <button className="w-full h-9 bg-slate-900 text-white hover:bg-black text-theme-caption font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                              <ShoppingCart size={13} />
                              <span>
                                {SHOPPABLE_LOOKBOOK_TEXT.OUT_OF_STOCK}
                              </span>
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col gap-2.5 py-1">
                          <div className="flex gap-3">
                            <Skeleton className="h-14 w-14 rounded-xl flex-shrink-0" />
                            <div className="flex-1 space-y-2 py-1">
                              <Skeleton className="h-3.5 w-3/4 rounded" />
                              <Skeleton className="h-3 w-1/2 rounded" />
                            </div>
                          </div>
                          <Skeleton className="h-9 w-full rounded-lg mt-1" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
