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
  Mail, 
  ArrowRight, 
  ChevronRight 
} from 'lucide-react';
import { useHomepageData } from '@/hooks/useHomepageData';
import AxiosAPI from '@/lib/axios';

// Static fallbacks for products matching screenshots
const defaultFeaturedProducts = [
  {
    id: "prod-1",
    name: "Classic Tote Bag",
    category: "Leather Goods",
    price: 1200.00,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "prod-2",
    name: "Classic Minimalist",
    category: "Timepieces",
    price: 750.00,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "prod-3",
    name: "Modern Oud Perfume",
    category: "Fragrances",
    price: 250.00,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "prod-4",
    name: "Sonic HP-2",
    category: "Audio Equipment",
    price: 299.00,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop"
  }
];

const defaultNewArrivals = [
  {
    id: "arr-1",
    name: "Lunar Watch S",
    price: 245.00,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "arr-2",
    name: "Zen Tea Set",
    price: 85.00,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "arr-3",
    name: "Classic Wallet",
    price: 125.00,
    image: "https://images.unsplash.com/photo-1627124765951-86c06df9a571?q=80&w=600&auto=format&fit=crop"
  }
];

export default function Home() {
  const {
    lang,
    setLang,
    getField,
    banners,
    categories,
    isLoading
  } = useHomepageData();

  const [products, setProducts] = useState<any[]>(defaultFeaturedProducts);
  const [newArrivals, setNewArrivals] = useState<any[]>(defaultNewArrivals);
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Fetch dynamic products on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await AxiosAPI.get('/v1/products?limit=8');
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          const fetched = res.data.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category?.name || "Premium Selection",
            price: Number(p.base_price) || 299.00,
            image: p.variants?.[0]?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop"
          }));
          if (fetched.length > 0) {
            setProducts(fetched.slice(0, 4));
            setNewArrivals(fetched.slice(4, 7));
          }
        }
      } catch (err) {
        console.warn('Could not load products from API, using premium defaults');
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
        <div className="w-full bg-[#f4f2ee] border-b border-gray-200/40 py-2 px-12 flex justify-between items-center text-xs tracking-wider text-gray-500 font-medium">
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
        </div>

        {/* Hero Section */}
        <section className="relative w-full h-[85vh] bg-[#eae5db] flex items-center overflow-hidden">
          {/* Left Text Column */}
          <div className="w-1/2 px-20 flex flex-col justify-center items-start z-10">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-600 font-bold mb-4">
              {getField('hero_subtitle')}
            </span>
            <h1 className="text-5xl xl:text-6xl font-serif text-[#1e1e1e] leading-[1.1] tracking-tight mb-6">
              {getField('hero_title')}
            </h1>
            <p className="text-sm xl:text-base text-gray-600 font-light leading-relaxed max-w-md mb-8">
              {getField('hero_desc')}
            </p>
            <Link href="/shopping">
              <button className="bg-[#1e1e1e] text-white hover:bg-black transition-all duration-300 px-8 py-3 text-xs uppercase tracking-widest rounded-none shadow-md hover:shadow-lg">
                {getField('hero_btn_text')}
              </button>
            </Link>
          </div>

          {/* Right Image/Model Column */}
          <div className="absolute right-0 top-0 w-1/2 h-full">
            <Image 
              src={banners[0] || getField('hero_image_url')} 
              alt="Luxe Model"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </section>

        {/* Curated Categories */}
        <section className="py-20 px-12 xl:px-20 bg-white">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-serif tracking-tight text-gray-900">Curated Categories</h2>
              <p className="text-xs text-gray-500 tracking-wider mt-1 uppercase">Exquisite selections curated by style specialists</p>
            </div>
            <Link href="/shopping" className="text-xs font-semibold uppercase tracking-wider text-black border-b border-black pb-1 hover:opacity-70 transition-opacity">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link href={`/shopping?category=${cat.title}`} key={idx} className="group relative h-96 overflow-hidden bg-gray-100">
                <Image 
                  src={cat.url}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-85 transition-opacity" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-lg font-medium tracking-wide">{cat.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Masterpieces */}
        <section className="py-20 px-12 xl:px-20 bg-[#faf9f6]">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif tracking-tight text-gray-900 mb-2">Featured Masterpieces</h2>
            <div className="w-12 h-[1px] bg-black mx-auto" />
          </div>

          <div className="grid grid-cols-4 gap-8">
            {products.map((p) => (
              <div key={p.id} className="group flex flex-col bg-white border border-gray-100/50 p-4 transition-all duration-300 hover:shadow-xl relative">
                <div className="relative h-80 w-full overflow-hidden bg-gray-50 mb-4">
                  <Image 
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:bg-white transition-all">
                    <Heart size={16} />
                  </button>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{p.category}</span>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-black transition-colors">{p.name}</h3>
                <span className="text-sm font-bold text-gray-900 mt-2">${p.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Middle Promo Banner */}
        <section className="relative w-full h-[50vh] flex items-center justify-center text-center overflow-hidden">
          <Image 
            src={getField('middle_banner_image_url')}
            alt="Summer Promotion"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
          
          <div className="relative z-10 text-white px-6">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-white/90 mb-4 block">
              {getField('middle_banner_subtitle')}
            </span>
            <h2 className="text-4xl font-serif mb-4 tracking-tight">
              {getField('middle_banner_title')}
            </h2>
            <p className="text-sm text-white/80 font-light max-w-md mx-auto mb-6">
              {getField('middle_banner_desc')}
            </p>
            <Link href="/shopping">
              <button className="bg-white text-black hover:bg-black hover:text-white transition-all duration-300 px-6 py-2.5 text-xs uppercase tracking-widest rounded-none font-semibold">
                {getField('middle_banner_btn_text')}
              </button>
            </Link>
          </div>
        </section>

        {/* New Arrivals Grid Section */}
        <section className="py-20 px-12 xl:px-20 bg-white">
          <div className="mb-12">
            <h2 className="text-3xl font-serif tracking-tight text-gray-900">New Arrivals</h2>
            <p className="text-xs text-gray-500 tracking-wider uppercase mt-1">Our latest handcrafted designs</p>
          </div>

          <div className="grid grid-cols-5 gap-6">
            {/* Left Big Panel (60% equivalent -> 3 cols) */}
            <div className="col-span-3 relative h-[650px] overflow-hidden group bg-gray-50">
              <Image 
                src={getField('new_arrivals_left_image_url')}
                alt="Avant Garde Edit"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white right-10">
                <span className="text-xs uppercase tracking-widest font-bold text-white/85 mb-2 block">
                  {getField('new_arrivals_left_subtitle')}
                </span>
                <h3 className="text-3xl font-serif mb-3 tracking-tight">{getField('new_arrivals_left_title')}</h3>
                <p className="text-sm text-white/80 font-light max-w-sm mb-6">{getField('new_arrivals_left_desc')}</p>
                <Link href="/shopping">
                  <button className="border border-white hover:bg-white hover:text-black transition-colors px-6 py-2 text-xs uppercase tracking-wider">
                    {getField('new_arrivals_left_btn_text')}
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Stacked Panels (40% equivalent -> 2 cols) */}
            <div className="col-span-2 flex flex-col gap-6">
              {/* Top Panel */}
              <div className="relative h-[313px] bg-gray-50 overflow-hidden group">
                <Image 
                  src={getField('new_arrivals_right_top_image_url')}
                  alt="Premium Footwear"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h4 className="text-lg font-serif tracking-wide">{getField('new_arrivals_right_top_title')}</h4>
                </div>
              </div>

              {/* Bottom Panel */}
              <div className="relative h-[313px] bg-gray-50 overflow-hidden group">
                <Image 
                  src={getField('new_arrivals_right_bottom_image_url')}
                  alt="Workplace Essentials"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h4 className="text-lg font-serif tracking-wide">{getField('new_arrivals_right_bottom_title')}</h4>
                </div>
              </div>
            </div>
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
        
        {/* Kinetic Header */}
        <header className="sticky top-0 z-40 bg-[#fcfdff]/90 backdrop-blur-md border-b border-gray-100 py-4 px-4 flex justify-between items-center">
          <button className="text-gray-800 hover:text-black">
            <Menu size={20} />
          </button>
          <span className="font-extrabold tracking-widest text-lg text-gray-900">KINETIC</span>
          <button className="text-gray-800 hover:text-black relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-brand-primary rounded-full" />
          </button>
        </header>

        {/* Mobile Hero Banner */}
        <section className="relative w-full h-[60vh] bg-gray-200 overflow-hidden flex items-end">
          <Image 
            src={getField('hero_image_url')}
            alt="Kinetic Hero"
            fill
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          
          <div className="relative z-10 w-full p-6 text-white flex flex-col items-center text-center">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/80 mb-2">
              {getField('hero_subtitle')}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mb-6">
              {getField('hero_title')}
            </h1>
            <Link href="/shopping" className="w-full max-w-xs">
              <button className="w-full bg-white text-black py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform">
                Shop Modernity
              </button>
            </Link>
          </div>
        </section>

        {/* Explore Essentials */}
        <section className="py-8 px-4">
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
          
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 2).map((p) => (
              <div key={p.id} className="flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm relative p-3">
                <div className="relative h-44 w-full overflow-hidden bg-gray-100 rounded-lg mb-3">
                  <Image 
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                  <button className="absolute top-2 right-2 bg-white/95 p-1.5 rounded-full shadow-sm text-gray-400 hover:text-red-500">
                    <Heart size={14} />
                  </button>
                </div>
                <h3 className="text-xs font-bold text-gray-800 line-clamp-1">{p.name}</h3>
                <span className="text-xs font-bold text-gray-900 mt-1">${p.price.toFixed(2)}</span>
              </div>
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
                    src={arr.image}
                    alt={arr.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-[11px] font-bold text-gray-800 line-clamp-1">{arr.name}</h3>
                <span className="text-[11px] font-bold text-gray-900 mt-1">${arr.price.toFixed(2)}</span>
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
