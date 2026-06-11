"use client";
import { useState, useEffect } from "react";
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
import { useStoreFrontCmsData } from "@/hooks/useStoreFrontCmsData";
import {
  InteractiveHero,
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

export default function Home() {
  const { getField, banners, categories, heroSlides, isLoading } =
    useHomepageData();
  const { getField: getStoreField } = useStoreFrontCmsData();
  const { themeData } = useThemeData();
  const layout: string[] = themeData?.homepage_layout || [
    "hero",
    "categories",
    "products",
    "promo",
    "new_arrivals",
    "newsletter",
  ];

  const [products, setProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    AxiosAPI.get("/v1/products/homepage?limit=8")
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

  // ── Desktop Renderer ────────────────────────────────────────────────────────
  const renderDesktop = (key: string) => {
    switch (key) {
      case "hero":
        return (
          <div key="hero">
            {isLoading ? (
              <div className="w-full h-[60vh] bg-gray-100 animate-pulse" />
            ) : (
              <InteractiveHero
                banner_type={getField("hero_banner_type") || "carousel"}
                video_url={getField("hero_video_url")}
                video_eyebrow={getField("hero_video_eyebrow")}
                video_title={getField("hero_video_title")}
                video_desc={getField("hero_video_desc")}
                video_btn_text={getField("hero_video_btn_text")}
                video_btn_link={getField("hero_video_btn_link")}
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
                  layout: slide.layout || "center-overlay",
                  bg_style: slide.bg_style || "gradient",
                }))}
              />
            )}
          </div>
        );

      case "lookbook":
        return (
          <ShoppableLookbook
            key="lookbook"
            title={getField("lookbook_title")}
            subtitle={getField("lookbook_subtitle")}
            image_url={getField("lookbook_image_url")}
            hotspots={getField("lookbook_hotspots")}
            bg_color={getField("lookbook_bg_color")}
          />
        );

      case "scarcity":
        return (
          <ScarcityBlock
            key="scarcity"
            timer_title={getStoreField("promo_timer_title")}
            expires_at={getStoreField("promo_expires_at")}
            alert_text={getStoreField("promo_alert_text")}
            alert_bg={getStoreField("promo_alert_bg")}
            alert_text_color={getStoreField("promo_alert_text_color")}
            btn_text={getStoreField("promo_btn_text")}
            btn_link={getStoreField("promo_btn_link")}
          />
        );

      case "social_proof":
        return (
          <TestimonialSlider
            key="social_proof"
            title={getField("social_proof_title")}
            eyebrow={getField("social_proof_eyebrow")}
            testimonials={getField("social_proof_testimonials")}
            badges={getField("social_proof_badges")}
          />
        );

      case "curated":
        return (
          <CuratedDiscovery
            key="curated"
            title={getField("curated_title")}
            subtitle={getField("curated_subtitle")}
            type={getField("curated_type")}
            product_ids={getField("curated_product_ids")}
            bg_color={getField("curated_bg_color")}
          />
        );

      case "categories":
        if (!isLoading && categories.length === 0) return null;
        return (
          <section
            key="categories"
            className="py-20 px-6 lg:px-16 xl:px-24 bg-white"
          >
            <div className="max-w-screen-xl mx-auto">
              <SectionHeader
                eyebrow="Browse by Category"
                title="Categories"
                href="/store"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex flex-col gap-3">
                        <div className="aspect-[3/4] w-full bg-gray-100 rounded-2xl animate-pulse" />
                        <Sk w="w-2/3" h="h-3" />
                      </div>
                    ))
                  : categories
                      .slice(0, 8)
                      .map((cat, idx) => (
                        <CategoryCard key={idx} cat={cat} idx={idx} />
                      ))}
              </div>
            </div>
          </section>
        );

      case "products":
        if (!productsLoading && products.length === 0) return null;
        return (
          <section
            key="products"
            className="py-20 px-6 lg:px-16 xl:px-24 bg-[#faf9f6]"
          >
            <div className="max-w-screen-xl mx-auto">
              <SectionHeader
                eyebrow="Hand-picked for You"
                title="Featured Masterpieces"
                href="/store"
                centered
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

      case "promo": {
        const imageUrl = getField("middle_banner_image_url");
        if (!imageUrl && !isLoading) return null;
        return isLoading ? (
          <div
            key="promo"
            className="w-full h-[52vh] bg-gray-100 animate-pulse"
          />
        ) : (
          <PromoBannerDesktop
            key="promo"
            imageUrl={imageUrl}
            subtitle={getField("middle_banner_subtitle")}
            title={getField("middle_banner_title")}
            desc={getField("middle_banner_desc")}
            btnText={getField("middle_banner_btn_text")}
          />
        );
      }

      case "new_arrivals":
        return isLoading ? (
          <div
            key="new_arrivals"
            className="w-full h-[600px] bg-gray-100 animate-pulse mx-6 lg:mx-16 xl:mx-24 rounded-2xl my-20"
          />
        ) : (
          <NewArrivalsDesktop key="new_arrivals" getField={getField} />
        );

      case "newsletter":
        return <NewsletterDesktop key="newsletter" getField={getField} />;

      default:
        return null;
    }
  };

  // ── Mobile Renderer ─────────────────────────────────────────────────────────
  const renderMobile = (key: string) => {
    switch (key) {
      case "hero":
        return (
          <div key="m-hero" className="h-[52vh]">
            {isLoading ? (
              <div className="w-full h-full bg-gray-100 animate-pulse" />
            ) : (
              <InteractiveHero
                banner_type={getField("hero_banner_type") || "carousel"}
                video_url={getField("hero_video_url")}
                video_eyebrow={getField("hero_video_eyebrow")}
                video_title={getField("hero_video_title")}
                video_desc={getField("hero_video_desc")}
                video_btn_text={getField("hero_video_btn_text")}
                video_btn_link={getField("hero_video_btn_link")}
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
                  layout: slide.layout || "center-overlay",
                  bg_style: slide.bg_style || "gradient",
                }))}
              />
            )}
          </div>
        );

      case "lookbook":
        return (
          <ShoppableLookbook
            key="m-lookbook"
            title={getField("lookbook_title")}
            subtitle={getField("lookbook_subtitle")}
            image_url={getField("lookbook_image_url")}
            hotspots={getField("lookbook_hotspots")}
            bg_color={getField("lookbook_bg_color")}
          />
        );

      case "scarcity":
        return (
          <ScarcityBlock
            key="m-scarcity"
            timer_title={getField("scarcity_timer_title")}
            expires_at={getField("scarcity_expires_at")}
            alert_text={getField("scarcity_alert_text")}
            alert_bg={getField("scarcity_alert_bg")}
            alert_text_color={getField("scarcity_alert_text_color")}
            btn_text={getField("scarcity_btn_text")}
            btn_link={getField("scarcity_btn_link")}
          />
        );

      case "social_proof":
        return (
          <TestimonialSlider
            key="m-social_proof"
            title={getField("social_proof_title")}
            eyebrow={getField("social_proof_eyebrow")}
            testimonials={getField("social_proof_testimonials")}
            badges={getField("social_proof_badges")}
          />
        );

      case "curated":
        return (
          <CuratedDiscovery
            key="m-curated"
            title={getField("curated_title")}
            subtitle={getField("curated_subtitle")}
            type={getField("curated_type")}
            product_ids={getField("curated_product_ids")}
            bg_color={getField("curated_bg_color")}
          />
        );

      case "categories":
        if (!isLoading && categories.length === 0) return null;
        return (
          <section key="m-categories" className="mt-[14vh] pb-4 px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">
                Explore
              </h2>
              <Link
                href="/store"
                className="text-[11px] font-semibold text-theme-primary flex items-center gap-0.5"
              >
                View All <ChevronRight size={12} />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1">
              {categories.slice(0, 8).map((cat, idx) => (
                <MobileCategoryPill key={idx} cat={cat} />
              ))}
            </div>
          </section>
        );

      case "products":
        if (!productsLoading && products.length === 0) return null;
        return (
          <section key="m-products" className="py-6 px-4 bg-[#faf9f6]">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">
                Featured
              </h2>
              <Link
                href="/store"
                className="text-[11px] font-semibold text-theme-primary flex items-center gap-0.5"
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

      case "promo": {
        const imageUrl = getField("middle_banner_image_url");
        if (!imageUrl && !isLoading) return null;
        return isLoading ? (
          <div
            key="m-promo"
            className="mx-4 my-6 h-44 bg-gray-100 rounded-2xl animate-pulse"
          />
        ) : (
          <PromoBannerMobile
            key="m-promo"
            imageUrl={imageUrl}
            title={getField("middle_banner_title")}
            desc={getField("middle_banner_desc")}
            btnText={getField("middle_banner_btn_text")}
          />
        );
      }

      case "new_arrivals":
        if (!productsLoading && newArrivals.length === 0) return null;
        return (
          <section key="m-new_arrivals" className="py-6 px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">
                New Arrivals
              </h2>
              <Link
                href="/store"
                className="text-[11px] font-semibold text-theme-primary flex items-center gap-0.5"
              >
                Discover <ChevronRight size={12} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 snap-x">
              {productsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="min-w-[148px] flex flex-col bg-white rounded-2xl p-2.5 gap-2 border border-gray-100"
                    >
                      <div className="h-32 w-full bg-gray-100 rounded-xl animate-pulse" />
                      <Sk w="w-full" h="h-3" />
                      <Sk w="w-1/2" h="h-4" />
                    </div>
                  ))
                : newArrivals.map((arr) => (
                    <MobileNewArrivalCard key={arr.id} arr={arr} />
                  ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden">
      {/* ── DESKTOP ─────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        {layout.map((key) => renderDesktop(key))}

        {/* Always-rendered supplementary sections (only if not already placed via layout key) */}
        {!layout.includes("social_proof") && (
          <>
            <TrustStrip getField={getField} />
            <TestimonialsDesktop getField={getField} />
          </>
        )}
        <BrandHighlight getField={getField} />
      </div>

      {/* ── MOBILE ──────────────────────────────────────────────────────────── */}
      <div className="block lg:hidden min-h-screen bg-background">
        {layout.map((key) => renderMobile(key))}
        {!layout.includes("social_proof") && (
          <>
            <TrustStrip getField={getField} />
            <TestimonialsMobile getField={getField} />
          </>
        )}
        <div className="h-20" />
      </div>
    </div>
  );
}
