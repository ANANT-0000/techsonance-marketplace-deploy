"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useHomepageData } from "@/hooks/useHomepageData";
import { useThemeData } from "@/hooks/useThemeData";
import { ProductCard } from "@/components/customer/ProductCard";
import { ShoppableLookbook } from "@/components/customer/homepage/ShoppableLookbook";
import { ScarcityBlock } from "@/components/customer/homepage/ScarcityBlock";
import { TestimonialSlider } from "@/components/customer/homepage/TestimonialSlider";
import { CuratedDiscovery } from "@/components/customer/homepage/CuratedDiscovery";
import AxiosAPI from "@/lib/axios";

import { CmsDataKey, LayoutSection } from "@/constants/cms";

import {
  InteractiveHero,
  HeroLayout,
  HeroBgStyle,
  SectionHeader,
  NewArrivalsDesktop,
  MobileNewArrivalCard,
  CategoryCard,
  MobileCategoryPill,
  TrustStrip,
  PromoBannerDesktop,
  NewsletterDesktop,
  PromoBannerMobile,
  TestimonialsDesktop,
  BrandHighlight,
  TestimonialsMobile,
} from "@/components/customer/homepage";
import { PageLoader } from "@/components/customer/PageLoader";

function Sk({
  w = "w-full",
  h = "h-4",
  rounded = "rounded",
  className = "",
}: {
  w?: string;
  h?: string;
  rounded?: string;
  className?: string;
}) {
  return (
    <div
      className={`${w} ${h} ${rounded} bg-gray-100 animate-pulse ${className}`}
    />
  );
}

function DraggableScrollContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onDragStart={(e) => e.preventDefault()}
      className={`flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
        isDragging
          ? "cursor-grabbing snap-none select-none"
          : "cursor-grab snap-x snap-mandatory select-none"
      } ${className || ""}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { getField, banners, categories, heroSlides, isLoading, cmsContent } =
    useHomepageData();
  const { themeData } = useThemeData();

  const layout: string[] = themeData?.homepage_layout || [
    LayoutSection.HERO,
    LayoutSection.CATEGORIES,
    LayoutSection.PRODUCTS,
    LayoutSection.PROMO,
    LayoutSection.NEW_ARRIVALS,
    LayoutSection.NEWSLETTER,
  ];

  const [products, setProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  useEffect(() => {
    AxiosAPI.get("/v1/products/homepage?limit=8", { headers: { "x-suppress-toast": true } })
      .then((res) => {
        setProducts(res.data.data.slice(0, 4));
        setNewArrivals(res.data.data.slice(4, 7));
      })
      .catch(() => {
        setProducts([]);
        setNewArrivals([]);
      })
      .finally(() => setProductsLoading(false));
  }, []);

  if (!isLoading && !cmsContent) {
    return (
      <div className="fixed inset-0 z-[99999] min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Store Not Available</h1>
          <p className="text-gray-500 mb-8">This store is currently being set up and has no content published yet. Please check back later.</p>
        </div>
      </div>
    );
  }

  // ── Desktop Renderer ────────────────────────────────────────────────────────
  const renderDesktop = (key: string) => {
    switch (key) {
      case LayoutSection.HERO:
        if (
          !isLoading &&
          heroSlides.length === 0 &&
          !getField(CmsDataKey.HERO_VIDEO_URL)
        )
          return null;
        return (
          <div key={LayoutSection.HERO}>
            {isLoading ? (
              <div className="w-full h-[60vh] bg-gray-100 animate-pulse" />
            ) : (
              <InteractiveHero
                banner_type={
                  getField(CmsDataKey.HERO_BANNER_TYPE) || "carousel"
                }
                video_url={getField(CmsDataKey.HERO_VIDEO_URL)}
                video_eyebrow={getField(CmsDataKey.HERO_VIDEO_EYEBROW)}
                video_title={getField(CmsDataKey.HERO_VIDEO_TITLE)}
                video_desc={getField(CmsDataKey.HERO_VIDEO_DESC)}
                video_btn_text={getField(CmsDataKey.HERO_VIDEO_BTN_TEXT)}
                video_btn_link={getField(CmsDataKey.HERO_VIDEO_BTN_LINK)}
                slides={heroSlides.map((slide: any) => ({
                  image_url: slide.image_url,
                  title: slide.title,
                  subtitle: slide.subtitle,
                  btn_text: slide.btn_text,
                  btn_link:
                    slide.btn_link ||
                    (slide.search_query
                      ? `/store?search=${encodeURIComponent(slide.search_query)}`
                      : "/store"),
                  layout: slide.layout || HeroLayout.CENTER_OVERLAY,
                  bg_style: slide.bg_style || HeroBgStyle.GRADIENT,
                  bg_color: slide.bg_color || "",
                }))}
              />
            )}
          </div>
        );

      case LayoutSection.TRUST_BADGES:
        if (isLoading) {
          return (
            <div key={LayoutSection.TRUST_BADGES} className="w-full h-24 bg-gray-100 animate-pulse border-y border-gray-100" />
          );
        }
        
        const badges = getField(CmsDataKey.SOCIAL_PROOF_BADGES);
        const hasValidCmsBadges =
          Array.isArray(badges) &&
          badges.length > 0 &&
          badges.some((badge: any) => (badge.title || badge.label || "").trim() !== "");
          
        if (!hasValidCmsBadges) return null;

        return <TrustStrip key={LayoutSection.TRUST_BADGES} getField={getField} />;

      case LayoutSection.LOOKBOOK:
        if (!isLoading && !getField(CmsDataKey.LOOKBOOK_IMAGE_URL)) return null;
        return (
          <ShoppableLookbook
            key={LayoutSection.LOOKBOOK}
            title={getField(CmsDataKey.LOOKBOOK_TITLE)}
            subtitle={getField(CmsDataKey.LOOKBOOK_SUBTITLE)}
            image_url={getField(CmsDataKey.LOOKBOOK_IMAGE_URL)}
            hotspots={getField(CmsDataKey.LOOKBOOK_HOTSPOTS)}
            bg_color={getField(CmsDataKey.LOOKBOOK_BG_COLOR)}
          />
        );

      case LayoutSection.SCARCITY:
        if (
          !isLoading &&
          !getField(CmsDataKey.SCARCITY_TIMER_TITLE) &&
          !getField(CmsDataKey.SCARCITY_EXPIRES_AT)
        )
          return null;
        return (
          <ScarcityBlock
            key={LayoutSection.SCARCITY}
            timer_title={getField(CmsDataKey.SCARCITY_TIMER_TITLE)}
            expires_at={getField(CmsDataKey.SCARCITY_EXPIRES_AT)}
            alert_text={getField(CmsDataKey.SCARCITY_ALERT_TEXT)}
            alert_bg={getField(CmsDataKey.SCARCITY_ALERT_BG)}
            alert_text_color={getField(CmsDataKey.SCARCITY_ALERT_TEXT_COLOR)}
            btn_text={getField(CmsDataKey.SCARCITY_BTN_TEXT)}
            btn_link={getField(CmsDataKey.SCARCITY_BTN_LINK)}
          />
        );

      case LayoutSection.SOCIAL_PROOF:
        if (!isLoading) {
          const testimonials = getField(CmsDataKey.SOCIAL_PROOF_TESTIMONIALS);
          if (!testimonials || testimonials.length === 0) return null;
        }
        return (
          <TestimonialSlider
            key={LayoutSection.SOCIAL_PROOF}
            title={getField(CmsDataKey.SOCIAL_PROOF_TITLE)}
            eyebrow={getField(CmsDataKey.SOCIAL_PROOF_EYEBROW)}
            testimonials={getField(CmsDataKey.SOCIAL_PROOF_TESTIMONIALS)}
            badges={getField(CmsDataKey.SOCIAL_PROOF_BADGES)}
          />
        );

      case LayoutSection.CURATED:
        return (
          <CuratedDiscovery
            key={LayoutSection.CURATED}
            title={getField(CmsDataKey.CURATED_TITLE)}
            subtitle={getField(CmsDataKey.CURATED_SUBTITLE)}
            type={getField(CmsDataKey.CURATED_TYPE)}
            product_ids={getField(CmsDataKey.CURATED_PRODUCT_IDS)}
            bg_color={getField(CmsDataKey.CURATED_BG_COLOR)}
          />
        );

      case LayoutSection.CATEGORIES:
        if (!isLoading && categories.length === 0) return null;
        return (
          <section
            key={LayoutSection.CATEGORIES}
            className="py-20 px-6 lg:px-16 xl:px-24 bg-white"
          >
            <div className="max-w-screen-xl mx-auto select-none">
              <SectionHeader
                eyebrow="Browse by Category"
                title="Categories"
                href="/store"
              />
              <DraggableScrollContainer className="gap-5 pb-4">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start flex flex-col gap-3"
                      >
                        <div className="aspect-[3/4] w-full bg-gray-100 rounded-2xl animate-pulse pointer-events-none" />
                        <Sk w="w-2/3" h="h-3 pointer-events-none" />
                      </div>
                    ))
                  : categories.slice(0, 8).map((cat, idx) => (
                      <div
                        key={idx}
                        className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start pointer-events-none *:pointer-events-auto"
                      >
                        <CategoryCard cat={cat} idx={idx} />
                      </div>
                    ))}
              </DraggableScrollContainer>
            </div>
          </section>
        );

      case LayoutSection.PRODUCTS:
        if (!productsLoading && products.length === 0) return null;
        return (
          <section
            key={LayoutSection.PRODUCTS}
            className="py-20 px-6 lg:px-16 xl:px-24 bg-[#faf9f6]"
          >
            <div className="max-w-screen-xl mx-auto">
              <SectionHeader
                eyebrow="Hand-picked for You"
                title="Featured Masterpieces"
                href="/store"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                {productsLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col bg-white rounded-2xl p-4 gap-3"
                      >
                        <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
                        <Sk w="w-1/3" h="h-2.5" />
                        <Sk w="w-3/4" h="h-4" />
                        <Sk w="w-1/4" h="h-5" />
                      </div>
                    ))
                  : products.map((p, idx) => (
                      <ul key={p.id} className="list-none p-0 m-0 h-full">
                        <ProductCard product={p} idx={idx} />
                      </ul>
                    ))}
              </div>
            </div>
          </section>
        );

      case LayoutSection.PROMO: {
        const imageUrl = getField(CmsDataKey.MIDDLE_BANNER_IMAGE_URL);
        if (!imageUrl && !isLoading) return null;
        return isLoading ? (
          <div
            key={LayoutSection.PROMO}
            className="w-full h-[52vh] bg-gray-100 animate-pulse"
          />
        ) : (
          <PromoBannerDesktop
            key={LayoutSection.PROMO}
            imageUrl={imageUrl}
            subtitle={getField(CmsDataKey.MIDDLE_BANNER_SUBTITLE)}
            title={getField(CmsDataKey.MIDDLE_BANNER_TITLE)}
            desc={getField(CmsDataKey.MIDDLE_BANNER_DESC)}
            btnText={getField(CmsDataKey.MIDDLE_BANNER_BTN_TEXT)}
          />
        );
      }

      case LayoutSection.NEW_ARRIVALS:
        return isLoading ? (
          <div
            key={LayoutSection.NEW_ARRIVALS}
            className="w-full h-[600px] bg-gray-100 animate-pulse mx-6 lg:mx-16 xl:mx-24 rounded-2xl my-20"
          />
        ) : (
          <NewArrivalsDesktop
            key={LayoutSection.NEW_ARRIVALS}
            getField={getField}
          />
        );

      case LayoutSection.NEWSLETTER:
        if (!isLoading && !getField("newsletter_title")) return null;
        return (
          <NewsletterDesktop
            key={LayoutSection.NEWSLETTER}
            getField={getField}
          />
        );

      default:
        return null;
    }
  };

  // ── Mobile Renderer ─────────────────────────────────────────────────────────
  const renderMobile = (key: string) => {
    switch (key) {
      case LayoutSection.HERO:
        if (
          !isLoading &&
          heroSlides.length === 0 &&
          !getField(CmsDataKey.HERO_VIDEO_URL)
        )
          return null;
        return (
          <div key={`m-${LayoutSection.HERO}`}>
            {isLoading ? (
              <div className="w-full h-[65vh] bg-gray-100 animate-pulse" />
            ) : (
              <InteractiveHero
                banner_type={
                  getField(CmsDataKey.HERO_BANNER_TYPE) || "carousel"
                }
                video_url={getField(CmsDataKey.HERO_VIDEO_URL)}
                video_eyebrow={getField(CmsDataKey.HERO_VIDEO_EYEBROW)}
                video_title={getField(CmsDataKey.HERO_VIDEO_TITLE)}
                video_desc={getField(CmsDataKey.HERO_VIDEO_DESC)}
                video_btn_text={getField(CmsDataKey.HERO_VIDEO_BTN_TEXT)}
                video_btn_link={getField(CmsDataKey.HERO_VIDEO_BTN_LINK)}
                slides={heroSlides.map((slide: any) => ({
                  image_url: slide.image_url,
                  title: slide.title,
                  subtitle: slide.subtitle,
                  btn_text: slide.btn_text,
                  btn_link:
                    slide.btn_link ||
                    (slide.search_query
                      ? `/store?search=${encodeURIComponent(slide.search_query)}`
                      : "/store"),
                  layout: slide.layout || HeroLayout.CENTER_OVERLAY,
                  bg_style: slide.bg_style || HeroBgStyle.GRADIENT,
                  bg_color: slide.bg_color || "",
                }))}
              />
            )}
            <TrustStrip getField={getField} />
          </div>
        );

      case LayoutSection.LOOKBOOK:
        if (!isLoading && !getField(CmsDataKey.LOOKBOOK_IMAGE_URL)) return null;
        return (
          <ShoppableLookbook
            key={`m-${LayoutSection.LOOKBOOK}`}
            title={getField(CmsDataKey.LOOKBOOK_TITLE)}
            subtitle={getField(CmsDataKey.LOOKBOOK_SUBTITLE)}
            image_url={getField(CmsDataKey.LOOKBOOK_IMAGE_URL)}
            hotspots={getField(CmsDataKey.LOOKBOOK_HOTSPOTS)}
            bg_color={getField(CmsDataKey.LOOKBOOK_BG_COLOR)}
          />
        );

      case LayoutSection.SCARCITY:
        if (
          !isLoading &&
          !getField(CmsDataKey.SCARCITY_TIMER_TITLE) &&
          !getField(CmsDataKey.SCARCITY_EXPIRES_AT)
        )
          return null;
        return (
          <ScarcityBlock
            key={`m-${LayoutSection.SCARCITY}`}
            timer_title={getField(CmsDataKey.SCARCITY_TIMER_TITLE)}
            expires_at={getField(CmsDataKey.SCARCITY_EXPIRES_AT)}
            alert_text={getField(CmsDataKey.SCARCITY_ALERT_TEXT)}
            alert_bg={getField(CmsDataKey.SCARCITY_ALERT_BG)}
            alert_text_color={getField(CmsDataKey.SCARCITY_ALERT_TEXT_COLOR)}
            btn_text={getField(CmsDataKey.SCARCITY_BTN_TEXT)}
            btn_link={getField(CmsDataKey.SCARCITY_BTN_LINK)}
          />
        );

      case LayoutSection.SOCIAL_PROOF:
        if (!isLoading) {
          const testimonials = getField(CmsDataKey.SOCIAL_PROOF_TESTIMONIALS);
          if (!testimonials || testimonials.length === 0) return null;
        }
        return (
          <TestimonialSlider
            key={`m-${LayoutSection.SOCIAL_PROOF}`}
            title={getField(CmsDataKey.SOCIAL_PROOF_TITLE)}
            eyebrow={getField(CmsDataKey.SOCIAL_PROOF_EYEBROW)}
            testimonials={getField(CmsDataKey.SOCIAL_PROOF_TESTIMONIALS)}
            badges={getField(CmsDataKey.SOCIAL_PROOF_BADGES)}
          />
        );

      case LayoutSection.CURATED:
        return (
          <CuratedDiscovery
            key={`m-${LayoutSection.CURATED}`}
            title={getField(CmsDataKey.CURATED_TITLE)}
            subtitle={getField(CmsDataKey.CURATED_SUBTITLE)}
            type={getField(CmsDataKey.CURATED_TYPE)}
            product_ids={getField(CmsDataKey.CURATED_PRODUCT_IDS)}
            bg_color={getField(CmsDataKey.CURATED_BG_COLOR)}
          />
        );

      case LayoutSection.CATEGORIES:
        if (!isLoading && categories.length === 0) return null;
        return (
          <section
            key={`m-${LayoutSection.CATEGORIES}`}
            className="pt-5 pb-4 px-4 bg-background"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-theme-caption-lg font-bold text-gray-900 uppercase tracking-widest">
                Explore
              </h2>
              <Link
                href="/store"
                className="text-theme-xxs font-semibold text-theme-primary flex items-center gap-0.5"
              >
                View All <ChevronRight size={12} />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2 shrink-0 snap-start"
                    >
                      <div className="w-14 h-14 rounded-full bg-gray-100 animate-pulse" />
                      <div className="w-12 h-2.5 rounded bg-gray-100 animate-pulse" />
                    </div>
                  ))
                : categories.slice(0, 8).map((cat, idx) => (
                    <div key={idx} className="snap-start">
                      <MobileCategoryPill cat={cat} />
                    </div>
                  ))}
            </div>
          </section>
        );

      case LayoutSection.PRODUCTS:
        if (!productsLoading && products.length === 0) return null;
        return (
          <section
            key={`m-${LayoutSection.PRODUCTS}`}
            className="py-6 px-4 bg-[#faf9f6]"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-theme-caption-lg font-bold text-gray-900 uppercase tracking-widest">
                Featured
              </h2>
              <Link
                href="/store"
                className="text-theme-xxs font-semibold text-theme-primary flex items-center gap-0.5"
              >
                See All <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {productsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col bg-white rounded-2xl p-3 gap-2"
                    >
                      <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
                      <Sk w="w-3/4" h="h-3" />
                      <Sk w="w-1/3" h="h-4" />
                    </div>
                  ))
                : products.slice(0, 4).map((p, idx) => (
                    <ul key={p.id} className="h-full list-none p-0 m-0">
                      <ProductCard product={p} idx={idx} />
                    </ul>
                  ))}
            </div>
          </section>
        );

      case LayoutSection.PROMO: {
        const imageUrl = getField(CmsDataKey.MIDDLE_BANNER_IMAGE_URL);
        if (!imageUrl && !isLoading) return null;
        return isLoading ? (
          <div
            key={`m-${LayoutSection.PROMO}`}
            className="mx-4 my-6 h-44 bg-gray-100 rounded-2xl animate-pulse"
          />
        ) : (
          <PromoBannerMobile
            key={`m-${LayoutSection.PROMO}`}
            imageUrl={imageUrl}
            title={getField(CmsDataKey.MIDDLE_BANNER_TITLE)}
            desc={getField(CmsDataKey.MIDDLE_BANNER_DESC)}
            btnText={getField(CmsDataKey.MIDDLE_BANNER_BTN_TEXT)}
          />
        );
      }

      case LayoutSection.NEW_ARRIVALS:
        return isLoading ? (
          <div
            key={`m-${LayoutSection.NEW_ARRIVALS}`}
            className="w-full h-44 bg-gray-100 animate-pulse rounded-2xl mx-4 my-6"
          />
        ) : (
          <NewArrivalsDesktop
            key={`m-${LayoutSection.NEW_ARRIVALS}`}
            getField={getField}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden">
      {/* Full-page loader */}
      {/* {isPageLoading && <PageLoader />} */}

      {/* ── DESKTOP ─────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        {layout.map((key) => renderDesktop(key))}

        {/* Always-rendered supplementary sections (only if not already placed via layout key) */}
        {!layout.includes("social_proof") && (
          <>
            {(isLoading ||
              (getField(CmsDataKey.SOCIAL_PROOF_TESTIMONIALS) &&
                getField(CmsDataKey.SOCIAL_PROOF_TESTIMONIALS).length > 0)) && (
              <TestimonialsDesktop getField={getField} />
            )}
          </>
        )}
        {(isLoading ||
          getField("brand_highlight_title") ||
          getField("brand_highlight_image_url")) && (
          <BrandHighlight getField={getField} />
        )}
      </div>

      {/* ── MOBILE ──────────────────────────────────────────────────────────── */}
      <div className="block lg:hidden min-h-screen bg-background">
        {layout.map((key) => renderMobile(key))}
        {!layout.includes("social_proof") && (
          <>
            {(isLoading ||
              (getField(CmsDataKey.SOCIAL_PROOF_TESTIMONIALS) &&
                getField(CmsDataKey.SOCIAL_PROOF_TESTIMONIALS).length > 0)) && (
              <TestimonialsMobile getField={getField} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
