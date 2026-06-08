'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Star, Shield, Truck, RotateCcw, Headphones } from 'lucide-react';
import { useHomepageData } from '@/hooks/useHomepageData';
import { useThemeData } from '@/hooks/useThemeData';
import { HeroCarousel } from '@/components/customer/HeroCarousel';
import { ProductCard } from '@/components/customer/ProductCard';
import AxiosAPI from '@/lib/axios';

function Sk({ w = 'w-full', h = 'h-4', rounded = 'rounded', className = '' }: {
  w?: string; h?: string; rounded?: string; className?: string;
}) {
  return <div className={`${w} ${h} ${rounded} bg-gray-100 animate-pulse ${className}`} />;
}

// ── Trust Badge Strip ─────────────────────────────────────────────────────────
function TrustStrip() {
  const badges = [
    { icon: Truck, label: 'Free Delivery', sub: 'On orders above ₹499' },
    { icon: RotateCcw, label: 'Easy Returns', sub: '10-day return policy' },
    { icon: Shield, label: 'Secure Payment', sub: '100% safe checkout' },
    { icon: Headphones, label: '24/7 Support', sub: 'Dedicated help desk' },
  ];
  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16 xl:px-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
          {badges.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 py-5 px-4 lg:px-6">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <Icon size={18} className="text-gray-700" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900 leading-tight">{label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({
  eyebrow, title, href, hrefLabel = 'View All', centered = false
}: {
  eyebrow?: string; title: string; href?: string; hrefLabel?: string; centered?: boolean;
}) {
  return (
    <div className={`flex items-end justify-between mb-10 ${centered ? 'flex-col items-center text-center gap-2' : ''}`}>
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">{eyebrow}</p>
        )}
        <h2 className="text-2xl lg:text-3xl font-serif tracking-tight text-gray-900 leading-tight">{title}</h2>
        {centered && <div className="w-10 h-px bg-gray-300 mx-auto mt-3" />}
      </div>
      {href && !centered && (
        <Link
          href={href}
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors border-b border-transparent hover:border-gray-900 pb-0.5"
        >
          {hrefLabel} <ChevronRight size={12} />
        </Link>
      )}
    </div>
  );
}

// ── Category Card ─────────────────────────────────────────────────────────────
function CategoryCard({ cat, idx }: { cat: { title: string; url: string }; idx: number }) {
  const sizes = ['aspect-[3/4]', 'aspect-[3/4]', 'aspect-[3/4]', 'aspect-[3/4]'];
  return (
    <Link
      href={`/store?category=${encodeURIComponent(cat.title)}`}
      className="group flex flex-col"
    >
      <div className={`relative ${sizes[idx % 4]} w-full overflow-hidden bg-gray-100 rounded-2xl`}>
        {cat.url && (
          <Image
            src={cat.url}
            alt={cat.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="pt-3 pb-1">
        <h3 className="text-sm font-semibold text-gray-800 capitalize tracking-wide">{cat.title}</h3>
        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
          Shop now <ChevronRight size={10} />
        </p>
      </div>
    </Link>
  );
}

// ── Mobile Category Pill ──────────────────────────────────────────────────────
function MobileCategoryPill({ cat }: { cat: { title: string; url: string } }) {
  return (
    <Link
      href={`/store?category=${encodeURIComponent(cat.title)}`}
      className="flex flex-col items-center gap-2 shrink-0 w-[72px]"
    >
      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-md">
        {cat.url && (
          <Image src={cat.url} alt={cat.title} fill className="object-cover" sizes="56px" />
        )}
      </div>
      <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight capitalize line-clamp-2">
        {cat.title}
      </span>
    </Link>
  );
}

// ── Promo Banner Desktop ──────────────────────────────────────────────────────
function PromoBannerDesktop({ imageUrl, subtitle, title, desc, btnText }: {
  imageUrl: string; subtitle: string; title: string; desc: string; btnText: string;
}) {
  return (
    <section className="relative w-full h-[52vh] min-h-[340px] overflow-hidden">
      <Image src={imageUrl} alt={title} fill className="object-cover" sizes="100vw" priority={false} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-16 xl:px-24 w-full">
          <div className="max-w-lg text-white">
            {subtitle && (
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-4">{subtitle}</p>
            )}
            <h2 className="text-4xl lg:text-5xl font-serif tracking-tight leading-[1.05] mb-4">{title}</h2>
            {desc && <p className="text-sm text-white/75 font-light leading-relaxed mb-8 max-w-sm">{desc}</p>}
            <Link href="/store">
              <button className="bg-white text-black hover:bg-gray-100 transition-all duration-300 px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-bold">
                {btnText || 'Shop Now'}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Promo Banner Mobile ───────────────────────────────────────────────────────
function PromoBannerMobile({ imageUrl, title, desc, btnText }: {
  imageUrl: string; title: string; desc: string; btnText: string;
}) {
  return (
    <section className="mx-4 my-6 rounded-2xl overflow-hidden relative h-44">
      <Image src={imageUrl} alt={title} fill className="object-cover" sizes="(max-width: 768px) calc(100vw - 32px)" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20" />
      <div className="absolute inset-0 flex flex-col justify-center px-5">
        <h3 className="text-[18px] font-bold text-white leading-tight mb-1">{title}</h3>
        {desc && <p className="text-[11px] text-white/70 mb-4 line-clamp-2">{desc}</p>}
        <Link href="/store">
          <button className="self-start bg-white text-black text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full">
            {btnText || 'Shop Now'}
          </button>
        </Link>
      </div>
    </section>
  );
}

// ── New Arrivals Desktop ──────────────────────────────────────────────────────
function NewArrivalsDesktop({ getField }: { getField: (k: string) => string }) {
  const leftImg = getField('new_arrivals_left_image_url');
  const rightTopImg = getField('new_arrivals_right_top_image_url');
  const rightBottomImg = getField('new_arrivals_right_bottom_image_url');

  return (
    <section className="py-20 px-6 lg:px-16 xl:px-24 bg-white">
      <SectionHeader eyebrow="Just Dropped" title="New Arrivals" href="/store" />
      <div className="grid grid-cols-5 gap-4 h-[600px]">
        {/* Left — large hero card */}
        <Link href="/store" className="col-span-3 relative overflow-hidden rounded-2xl group bg-gray-100">
          {leftImg && (
            <Image
              src={leftImg}
              alt={getField('new_arrivals_left_title')}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              sizes="60vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 block mb-2">
              {getField('new_arrivals_left_subtitle')}
            </span>
            <h3 className="text-2xl font-serif tracking-tight mb-2">{getField('new_arrivals_left_title')}</h3>
            <p className="text-sm text-white/70 font-light mb-5 max-w-xs line-clamp-2">
              {getField('new_arrivals_left_desc')}
            </p>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest border border-white/60 hover:bg-white hover:text-black transition-all px-5 py-2.5">
              {getField('new_arrivals_left_btn_text') || 'Explore'}
            </span>
          </div>
        </Link>

        {/* Right — two stacked cards */}
        <div className="col-span-2 flex flex-col gap-4">
          {[
            { img: rightTopImg, title: getField('new_arrivals_right_top_title') },
            { img: rightBottomImg, title: getField('new_arrivals_right_bottom_title') },
          ].map(({ img, title }) => (
            <Link key={title} href="/store" className="relative flex-1 overflow-hidden rounded-2xl group bg-gray-100">
              {img && (
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="40vw"
                />
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute bottom-5 left-5 text-white">
                <h4 className="text-base font-serif tracking-wide">{title}</h4>
                <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1">
                  Explore <ChevronRight size={10} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Newsletter Desktop ────────────────────────────────────────────────────────
function NewsletterDesktop({ getField }: { getField: (k: string) => string }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setDone(true); setEmail(''); setTimeout(() => setDone(false), 4000); }
  };

  return (
    <section className="bg-[#0a0b0f] text-white py-24 px-6 lg:px-16 xl:px-24">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-4">Stay Connected</p>
            <h2 className="text-4xl font-serif tracking-tight leading-tight mb-4">
              {getField('newsletter_title')}
            </h2>
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-md">
              {getField('newsletter_desc')}
            </p>
          </div>
          <div>
            {done ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Star size={20} className="text-emerald-400" />
                </div>
                <p className="font-semibold text-white">You're in. Welcome to the inner circle.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-white text-black hover:bg-gray-100 transition-colors px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-xl whitespace-nowrap"
                  >
                    {getField('newsletter_btn_text') || 'Subscribe'}
                  </button>
                </div>
                <p className="text-[11px] text-white/25">
                  By subscribing you agree to our Terms of Use and Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Priya S.', location: 'Mumbai', rating: 5, text: 'Absolutely premium quality. The packaging was immaculate and delivery was faster than expected.' },
  { name: 'Arjun M.', location: 'Bangalore', rating: 5, text: 'Best audio gear I have ever bought. Sound quality is extraordinary for the price point.' },
  { name: 'Meera K.', location: 'Delhi', rating: 5, text: 'Seamless checkout, GST invoice generated instantly. Will definitely be a repeat customer.' },
];

function TestimonialsDesktop() {
  return (
    <section className="py-20 px-6 lg:px-16 xl:px-24 bg-[#faf9f6]">
      <div className="max-w-screen-xl mx-auto">
        <SectionHeader eyebrow="Customer Stories" title="What Our Customers Say" centered />
        <div className="grid grid-cols-3 gap-6 mt-12">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={13} fill="#F59E0B" className="text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed font-light italic mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ background: `hsl(${i * 80 + 200}, 55%, 55%)` }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">{t.name}</p>
                  <p className="text-[11px] text-gray-400">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsMobile() {
  return (
    <section className="py-8 px-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-5">What Customers Say</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="min-w-[280px] snap-center bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} size={12} fill="#F59E0B" className="text-amber-400" />
              ))}
            </div>
            <p className="text-[12px] text-gray-600 leading-relaxed italic mb-4">"{t.text}"</p>
            <p className="text-[12px] font-bold text-gray-900">{t.name} · <span className="font-normal text-gray-400">{t.location}</span></p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Featured Brand Highlight ──────────────────────────────────────────────────
function BrandHighlight({ getField }: { getField: (k: string) => string }) {
  const img = getField('new_arrivals_left_image_url');
  if (!img) return null;
  return (
    <section className="py-20 px-6 lg:px-16 xl:px-24 bg-white">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[420px] rounded-2xl overflow-hidden bg-gray-100">
            <Image src={img} alt="Brand" fill className="object-cover" sizes="50vw" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Our Promise</p>
            <h2 className="text-3xl lg:text-4xl font-serif tracking-tight text-gray-900 mb-5 leading-tight">
              Precision Engineered for Pure Sound
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Every product on our platform is hand-selected for build quality, acoustic performance, and long-term reliability. We partner only with brands that share our obsession with detail.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[['500+', 'Products'], ['50K+', 'Happy Customers'], ['4.9★', 'Avg. Rating']].map(([val, lab]) => (
                <div key={lab} className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-xl font-black text-gray-900">{val}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">{lab}</p>
                </div>
              ))}
            </div>
            <Link href="/store">
              <button className="bg-gray-900 text-white hover:bg-black transition-colors px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-xl">
                Shop the Collection
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { getField, banners, categories, heroSlides, isLoading } = useHomepageData();
  const { themeData } = useThemeData();
  const layout: string[] = themeData?.homepage_layout || ['hero', 'categories', 'products', 'promo', 'new_arrivals', 'newsletter'];

  const [products, setProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    AxiosAPI.get('/v1/products/homepage?limit=8')
      .then(res => {
        setProducts(res.data.data.slice(0, 4));
        setNewArrivals(res.data.data.slice(4, 7));
      })
      .catch(() => { setProducts([]); setNewArrivals([]); })
      .finally(() => setProductsLoading(false));
  }, []);

  // ── Desktop Renderer ────────────────────────────────────────────────────────
  const renderDesktop = (key: string) => {
    switch (key) {
      case 'hero':
        return (
          <div key="hero">
            {isLoading
              ? <div className="w-full h-[85vh] bg-gray-100 animate-pulse" />
              : <HeroCarousel slides={heroSlides} />
            }
          </div>
        );

      case 'categories':
        if (!isLoading && categories.length === 0) return null;
        return (
          <section key="categories" className="py-20 px-6 lg:px-16 xl:px-24 bg-white">
            <div className="max-w-screen-xl mx-auto">
              <SectionHeader eyebrow="Browse by Category" title="Categories" href="/store" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <div className="aspect-[3/4] w-full bg-gray-100 rounded-2xl animate-pulse" />
                      <Sk w="w-2/3" h="h-3" />
                    </div>
                  ))
                  : categories.slice(0, 8).map((cat, idx) => (
                    <CategoryCard key={idx} cat={cat} idx={idx} />
                  ))
                }
              </div>
            </div>
          </section>
        );

      case 'products':
        if (!productsLoading && products.length === 0) return null;
        return (
          <section key="products" className="py-20 px-6 lg:px-16 xl:px-24 bg-[#faf9f6]">
            <div className="max-w-screen-xl mx-auto">
              <SectionHeader eyebrow="Hand-picked for You" title="Featured Masterpieces" href="/store" centered />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                {productsLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col bg-white rounded-2xl p-4 gap-3">
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
                  ))
                }
              </div>
            </div>
          </section>
        );

      case 'promo': {
        const imageUrl = getField('middle_banner_image_url');
        if (!imageUrl && !isLoading) return null;
        return isLoading
          ? <div key="promo" className="w-full h-[52vh] bg-gray-100 animate-pulse" />
          : (
            <PromoBannerDesktop
              key="promo"
              imageUrl={imageUrl}
              subtitle={getField('middle_banner_subtitle')}
              title={getField('middle_banner_title')}
              desc={getField('middle_banner_desc')}
              btnText={getField('middle_banner_btn_text')}
            />
          );
      }

      case 'new_arrivals':
        return isLoading
          ? <div key="new_arrivals" className="w-full h-[600px] bg-gray-100 animate-pulse mx-6 lg:mx-16 xl:mx-24 rounded-2xl my-20" />
          : <NewArrivalsDesktop key="new_arrivals" getField={getField} />;

      case 'newsletter':
        return <NewsletterDesktop key="newsletter" getField={getField} />;

      default:
        return null;
    }
  };

  // ── Mobile Renderer ─────────────────────────────────────────────────────────
  const renderMobile = (key: string) => {
    switch (key) {
      case 'hero':
        return (
          <div key="m-hero" className="h-[52vh]">
            {isLoading
              ? <div className="w-full h-full bg-gray-100 animate-pulse" />
              : <HeroCarousel slides={heroSlides} isLoading={isLoading} />
            }
          </div>
        );

      case 'categories':
        if (!isLoading && categories.length === 0) return null;
        return (
          <section key="m-categories" className="mt-[12vh] pb-4 px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">Explore</h2>
              <Link href="/store" className="text-[11px] font-semibold text-theme-primary flex items-center gap-0.5">
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

      case 'products':
        if (!productsLoading && products.length === 0) return null;
        return (
          <section key="m-products" className="py-6 px-4 bg-[#faf9f6]">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">Featured</h2>
              <Link href="/store" className="text-[11px] font-semibold text-theme-primary flex items-center gap-0.5">
                See All <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {productsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col bg-white rounded-2xl p-3 gap-2">
                    <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
                    <Sk w="w-3/4" h="h-3" />
                    <Sk w="w-1/3" h="h-4" />
                  </div>
                ))
                : products.slice(0, 4).map((p, idx) => (
                  <ul key={p.id} className="h-full list-none p-0 m-0">
                    <ProductCard product={p} idx={idx} />
                  </ul>
                ))
              }
            </div>
          </section>
        );

      case 'promo': {
        const imageUrl = getField('middle_banner_image_url');
        if (!imageUrl && !isLoading) return null;
        return isLoading
          ? <div key="m-promo" className="mx-4 my-6 h-44 bg-gray-100 rounded-2xl animate-pulse" />
          : (
            <PromoBannerMobile
              key="m-promo"
              imageUrl={imageUrl}
              title={getField('middle_banner_title')}
              desc={getField('middle_banner_desc')}
              btnText={getField('middle_banner_btn_text')}
            />
          );
      }

      case 'new_arrivals':
        if (!productsLoading && newArrivals.length === 0) return null;
        return (
          <section key="m-new_arrivals" className="py-6 px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">New Arrivals</h2>
              <Link href="/store" className="text-[11px] font-semibold text-theme-primary flex items-center gap-0.5">
                Discover <ChevronRight size={12} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 snap-x">
              {productsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="min-w-[148px] flex flex-col bg-white rounded-2xl p-2.5 gap-2 border border-gray-100">
                    <div className="h-32 w-full bg-gray-100 rounded-xl animate-pulse" />
                    <Sk w="w-full" h="h-3" />
                    <Sk w="w-1/2" h="h-4" />
                  </div>
                ))
                : newArrivals.map((arr) => (
                  <Link
                    key={arr.id}
                    href={`/store/${arr.id}`}
                    className="min-w-[148px] snap-center flex flex-col bg-white border border-gray-100 rounded-2xl p-2.5 shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <div className="relative h-32 w-full overflow-hidden rounded-xl mb-2.5 bg-gray-50">
                      <Image
                        src={arr.variants?.[0]?.images?.[0]?.image_url || 'https://placehold.net/400x500.png'}
                        alt={arr.name}
                        fill
                        className="object-contain"
                        sizes="148px"
                      />
                    </div>
                    <h3 className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-snug mb-1">{arr.name}</h3>
                    <span className="text-[12px] font-black text-gray-900">₹{Number(arr.base_price).toLocaleString('en-IN')}</span>
                  </Link>
                ))
              }
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

        {/* Always-rendered supplementary sections */}
        <TrustStrip />
        <TestimonialsDesktop />
        <BrandHighlight getField={getField} />
      </div>

      {/* ── MOBILE ──────────────────────────────────────────────────────────── */}
      <div className="block lg:hidden min-h-screen bg-background">
        {layout.map((key) => renderMobile(key))}
        <TrustStrip />
        <TestimonialsMobile />
        <div className="h-20" />
      </div>

    </div>
  );
}