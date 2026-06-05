'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Globe,
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  Bell,
  Mail, ChevronRight
} from 'lucide-react';
import { useHomepageData } from '@/hooks/useHomepageData';
import { HeroCarousel } from '@/components/customer/HeroCarousel';
import { ProductCard } from '@/components/customer/ProductCard';
import AxiosAPI from '@/lib/axios';

// ── Skeleton primitives ───────────────────────────────────────────────────────
function Sk({ w = 'w-full', h = 'h-4', rounded = 'rounded', className = '' }: {
  w?: string; h?: string; rounded?: string; className?: string;
}) {
  return (
    <div className={`${w} ${h} ${rounded} bg-gray-200 animate-pulse ${className}`} />
  );
}
export default function Home() {
  const {
    lang,
    setLang,
    getField,
    banners,
    categories,
    heroSlides,
    isLoading
  } = useHomepageData();

  const [products, setProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await AxiosAPI.get('/v1/products/homepage?limit=8');

        setProducts(res.data.data.slice(0, 4));
        setNewArrivals(res.data.data.slice(4, 7));
      } catch {
        setProducts([]);
        setNewArrivals([]);
      } finally {
        setProductsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] font-sans antialiased overflow-x-hidden">

      {/* ========================================================================= */}
      {/* 1. LARGE SCREEN / DESKTOP VIEWPORT (Luxe Market Style)                   */}
      {/* ========================================================================= */}
      <div className="hidden lg:block">

        {/* Sub-Header / Floating Language Panel */}
        {/* <div className="w-full bg-[#f4f2ee] border-b border-gray-200/40 py-2 px-12 flex justify-between items-center text-xs tracking-wider text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <Globe size={13} className="text-gray-400" />
            <span>GLOBAL LUXURY STANDARD</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="opacity-75">SELECT LANGUAGE:</span>
            <button
              onClick={() => setLang('en')}
              className={`hover:text-black transition-colors ${lang === 'en' ? 'font-bold text-black border-b border-black' : ''}`}
            >
              ENGLISH
            </button>
            <button
              onClick={() => setLang('es')}
              className={`hover:text-black transition-colors ${lang === 'es' ? 'font-bold text-black border-b border-black' : ''}`}
            >
              ESPAÑOL
            </button>
          </div>
        </div> */}

        {/* Hero Section */}
        {isLoading ? (
          <div className="w-full h-[85vh] bg-gray-200 animate-pulse" />
        ) : (
          <HeroCarousel slides={heroSlides} />
        )}

        {/* Curated Categories */}
        <section className="py-20 px-12 xl:px-20 bg-white">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-serif tracking-tight text-gray-900">Categories</h2>
              {/* <p className="text-xs text-gray-500 tracking-wider mt-1 uppercase">Exquisite selections curated by style specialists</p> */}
            </div>
            <Link href="/shopping" className="text-xs font-semibold uppercase tracking-wider text-black border-b border-black pb-1 hover:opacity-70 transition-opacity">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="relative h-96 bg-gray-200 animate-pulse" />
              ))
              : categories.map((cat, idx) => (
                <div key={idx} className="flex flex-col">
                  <Link href={`/shopping?search=${encodeURIComponent(cat.title)}`} className="group relative h-96 overflow-hidden bg-gray-100 rounded-md ">
                    {cat.url ? <Image src={cat.url} alt={cat.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : null}
                  </Link>
                  <div className=" text-black bg-white py-2">
                    <h3 className="text-lg font-medium tracking-wide capitalize">{cat.title}</h3>
                  </div>
                </div>
              ))
            }
          </div>
        </section>

        {/* Featured Masterpieces */}
        <section className="py-20 px-12 xl:px-20 bg-[#faf9f6]">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif tracking-tight text-gray-900 mb-2">Featured Masterpieces</h2>
            <div className="w-12 h-[1px] bg-black mx-auto" />
          </div>

          <div className="grid grid-cols-4 gap-8">
            {productsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col bg-white border border-gray-100 p-4 rounded-[20px]">
                  <div className="h-80 w-full bg-gray-200 animate-pulse mb-4 rounded-[12px]" />
                  <Sk w="w-1/3" h="h-3" className="mb-2" />
                  <Sk w="w-2/3" h="h-4" className="mb-2" />
                  <Sk w="w-1/4" h="h-4" />
                </div>
              ))
              : products.map((p, idx) => (
                <ul key={p.id} className="list-none p-0 m-0">
                  <ProductCard product={p} idx={idx} />
                </ul>
              ))
            }
          </div>
        </section>

        {/* Middle Promo Banner */}
        <section className="relative w-full h-[50vh] flex items-center justify-center text-center overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          ) : (
            <Image src={getField('middle_banner_image_url')} alt="Promo" fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
          <div className="relative z-10 text-white px-6">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Sk w="w-24" h="h-3" rounded="rounded-full" />
                <Sk w="w-64" h="h-8" rounded="rounded" />
                <Sk w="w-48" h="h-4" rounded="rounded" />
                <Sk w="w-28" h="h-9" rounded="rounded" />
              </div>
            ) : (
              <>
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-white/90 mb-4 block">{getField('middle_banner_subtitle')}</span>
                <h2 className="text-4xl font-serif mb-4 tracking-tight">{getField('middle_banner_title')}</h2>
                <p className="text-sm text-white/80 font-light max-w-md mx-auto mb-6">{getField('middle_banner_desc')}</p>
                <Link href="/shopping">
                  <button className="bg-white text-black hover:bg-black hover:text-white transition-all duration-300 px-6 py-2.5 text-xs uppercase tracking-widest rounded-none font-semibold">
                    {getField('middle_banner_btn_text')}
                  </button>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* New Arrivals Grid Section */}
        <section className="py-20 px-12 xl:px-20 bg-white">
          <div className="mb-12">
            <h2 className="text-3xl font-serif tracking-tight text-gray-900">New Arrivals</h2>
            <p className="text-xs text-gray-500 tracking-wider uppercase mt-1">Our latest handcrafted designs</p>
          </div>

          <div className="grid grid-cols-5 gap-6">
            {isLoading ? (
              <>
                <div className="col-span-3 h-[650px] bg-gray-200 animate-pulse" />
                <div className="col-span-2 flex flex-col gap-6">
                  <div className="h-[313px] bg-gray-200 animate-pulse" />
                  <div className="h-[313px] bg-gray-200 animate-pulse" />
                </div>
              </>
            ) : (
              <>
                <div className="col-span-3 relative h-[650px] overflow-hidden group bg-gray-50">
                  <Image src={getField('new_arrivals_left_image_url')} alt="New Arrivals" fill className="object-cover transition-transform duration-700 group-hover:scale-102" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-10 left-10 text-white right-10">
                    <span className="text-xs uppercase tracking-widest font-bold text-white/85 mb-2 block">{getField('new_arrivals_left_subtitle')}</span>
                    <h3 className="text-3xl font-serif mb-3 tracking-tight">{getField('new_arrivals_left_title')}</h3>
                    <p className="text-sm text-white/80 font-light max-w-sm mb-6">{getField('new_arrivals_left_desc')}</p>
                    <Link href="/shopping">
                      <button className="border border-white hover:bg-white hover:text-black transition-colors px-6 py-2 text-xs uppercase tracking-wider">{getField('new_arrivals_left_btn_text')}</button>
                    </Link>
                  </div>
                </div>
                <div className="col-span-2 flex flex-col gap-6">
                  <div className="relative h-[313px] bg-gray-50 overflow-hidden group">
                    <Image src={getField('new_arrivals_right_top_image_url')} alt="New Arrivals" fill className="object-cover transition-transform duration-500 group-hover:scale-103" />
                    <div className="absolute inset-0 bg-black/15" />
                    <div className="absolute bottom-6 left-6 text-white"><h4 className="text-lg font-serif tracking-wide">{getField('new_arrivals_right_top_title')}</h4></div>
                  </div>
                  <div className="relative h-[313px] bg-gray-50 overflow-hidden group">
                    <Image src={getField('new_arrivals_right_bottom_image_url')} alt="New Arrivals" fill className="object-cover transition-transform duration-500 group-hover:scale-103" />
                    <div className="absolute inset-0 bg-black/15" />
                    <div className="absolute bottom-6 left-6 text-white"><h4 className="text-lg font-serif tracking-wide">{getField('new_arrivals_right_bottom_title')}</h4></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>


        {/* Newsletter Section */}
        <section className="bg-[#0b0c10] text-white py-24 px-12 xl:px-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-radial-gradient from-white/20 to-transparent" />
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-4xl font-serif tracking-tight mb-4">{getField('newsletter_title')}</h2>
            <p className="text-sm text-gray-400 font-light mb-8 max-w-md mx-auto">
              {getField('newsletter_desc')}
            </p>
            {subscribed ? (
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-md text-sm font-semibold tracking-wide text-brand-primary">
                Thank you! You are now subscribed to the Inner Circle.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex border-b border-gray-600 py-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-transparent border-none text-white text-sm focus:outline-none w-full placeholder-gray-500 font-light"
                />
                <button type="submit" className="text-xs uppercase tracking-widest font-bold ml-4 text-white hover:text-gray-300 transition-colors">
                  {getField('newsletter_btn_text')}
                </button>
              </form>
            )}
            <p className="text-[10px] text-gray-500 mt-6 font-light">
              By subscribing you agree to our Terms of Use and Privacy Policy.
            </p>
          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE VIEWPORT (Kinetic Style)                                       */}
      {/* ========================================================================= */}
      <div className="block lg:hidden min-h-screen bg-[#fcfdff]">

        {/* Mobile Hero Banner */}
        {isLoading ? (
          <div className="relative w-full h-[60vh] bg-gray-100 flex items-center justify-center animate-pulse">
            <div className="absolute inset-0 bg-gray-200" />
            <div className="z-10 text-center flex flex-col items-center gap-4">
              <Sk w="w-32" h="h-4" />
              <Sk w="w-64" h="h-10" />
              <Sk w="w-40" h="h-10" rounded="rounded-full" />
            </div>
          </div>
        ) : (
          <div className="h-[45vh]">
            <HeroCarousel slides={heroSlides} isLoading={isLoading} />
          </div>
        )}

        {/* Explore Essentials */}
        <section className="lg:py-8 py-6 px-4 lg:mt-0  mt-24">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">Explore Essentials</h2>
            <Link href="/shopping" className="text-xs text-brand-primary font-semibold">
              View All
            </Link>
          </div>

          {/* Horizontal category circles scroll */}
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-none">
            {categories.map((cat, idx) => (
              <Link href={`/shopping?category=${cat.title}`} key={idx} className="flex flex-col items-center min-w-[76px] snap-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
                  <Image
                    src={cat.url}
                    alt={cat.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-[11px] font-medium text-gray-600 mt-2 tracking-wide text-center">
                  {cat.title.split(' ')[0]}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Masterpieces */}
        <section className="py-6 px-4 bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-6">Featured Masterpieces</h2>

          <div className="grid grid-cols-2 gap-4 items-stretch">
            {products.slice(0, 2).map((p, idx) => (
              <ul key={p.id} className="h-full list-none p-0 m-0">
                <ProductCard product={p} idx={idx} />
              </ul>
            ))}
          </div>
        </section>

        {/* Promo Banner */}
        <section className="my-6 mx-4">
          <div className="relative h-48 rounded-2xl overflow-hidden bg-black flex items-center">
            <Image
              src={getField('middle_banner_image_url')}
              alt="Promo Banner"
              fill
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
            <div className="relative z-10 p-6 text-white flex flex-col justify-center items-start">
              <span className="text-[9px] font-bold tracking-widest text-[#9ca3af] uppercase mb-1">
                {getField('middle_banner_subtitle')}
              </span>
              <h3 className="text-xl font-bold tracking-tight mb-1">Summer Sale</h3>
              <p className="text-xs text-gray-300 font-light mb-4">Up to 40% Off Select Lines</p>
              <Link href="/shopping">
                <button className="bg-brand-primary text-white hover:bg-brand-secondary transition-colors px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Shop Now
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-6 px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">New Arrivals</h2>
            <Link href="/shopping" className="text-xs text-brand-primary font-semibold flex items-center gap-0.5">
              Discover <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-none">
            {newArrivals.map((arr) => (
              <div key={arr.id} className="min-w-[150px] snap-center flex flex-col bg-white border border-gray-100 p-2.5 rounded-xl">
                <div className="relative h-36 w-full overflow-hidden bg-gray-100 rounded-lg mb-2">
                  <Image
                    src={arr.variants?.[0]?.images?.[0]?.image_url || 'https://placehold.net/400x500.png'}
                    alt={arr.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-[11px] font-bold text-gray-800 line-clamp-1">{arr.name}</h3>
                <span className="text-[11px] font-bold text-gray-900 mt-1">₹{Number(arr.base_price)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile Navigation bar spacer */}
        <div className="h-16" />

        {/* Mobile bottom navigation bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#fcfdff]/95 backdrop-blur-md border-t border-gray-100 h-16 flex justify-around items-center z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
          <Link href="/" className="flex flex-col items-center text-brand-primary">
            <Globe size={18} />
            <span className="text-[9px] font-bold mt-1 uppercase">Home</span>
          </Link>
          <Link href="/shopping" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
            <Search size={18} />
            <span className="text-[9px] font-medium mt-1 uppercase">Search</span>
          </Link>
          <button className="flex flex-col items-center text-gray-400 hover:text-gray-600">
            <ShoppingBag size={18} />
            <span className="text-[9px] font-medium mt-1 uppercase">Cart</span>
          </button>
          <Link href="/profile" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
            <User size={18} />
            <span className="text-[9px] font-medium mt-1 uppercase">Account</span>
          </Link>
        </nav>

      </div>
    </div>
  );
}
