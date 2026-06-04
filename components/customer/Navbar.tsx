'use client';
import { useEffect, useState } from 'react';
import Link from "next/link";
// Added useRouter for redirection
import { usePathname, useRouter } from 'next/navigation'; 
import { useMediaQuery } from 'react-responsive';
import { BRAND_LOGO } from "@/constants/common";
import { Bell, Heart, ShoppingBag, User, Search, Menu } from "lucide-react";

import { NAV_LINKS } from "@/constants/customer";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import { motion } from "motion/react";
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { useNavbarData } from "@/hooks/useNavbarData";

import { SearchBar } from './SearchBar'; 

export function Navbar({ styles, logoUrl = BRAND_LOGO, menuLinks: propMenuLinks }: { styles?: string, logoUrl?: string, menuLinks?: { [key: string]: string | null }[] }) {
    const { menuLinks: dynamicLinks } = useNavbarData();
    const menuLinks = propMenuLinks || dynamicLinks;
    
    const { items } = useAppSelector((state: RootState) => state.cart);
    const { wishItems } = useAppSelector((state: RootState) => state.wishlist);
    const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);

    const dispatch = useAppDispatch();
    const wishlistCount = wishItems.map((item: any) => item.product_variant_id).length;
    const path = usePathname();
    const router = useRouter(); // Initialize router
    
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });
    
    const [isMounted, setIsMounted] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const showUserContent = isMounted && user;

    if (path.startsWith('/admin') || path.startsWith('/vendor') || path.includes('checkout') || path.includes('cart') || path.includes('wishlist') || path.includes('orders') || path.includes('changePassword') || path.includes('address') || path.includes('customerProfile')) {
        return <></>
    }
    
    if (!isMounted) {
        return <nav className="h-16" />;
    }

    if (isTabletOrMobile) {
        return (
            <nav className="flex justify-between items-center px-4 py-2 h-16 bg-white border-b border-gray-100">
                <button className="text-black">
                    <Menu strokeWidth={1.5} size={26} />
                </button>
                <Link href="/">
                    <img src={logoUrl} alt="brand logo" className="h-6 object-contain" />
                </Link>
                <button className="text-black">
                    <Bell strokeWidth={1.5} size={24} />
                </button>
            </nav>
        )
    }

    return (
        <nav className={`bg-white text-black flex justify-between items-center xl:px-16 lg:px-8 md:px-4 py-1 h-20 border-b border-gray-100 ${styles}`}>
            
            <div className="flex-1">
                <Link href="/">
                    <img src={logoUrl} alt="brand logo" className="h-6 font-black object-contain" />
                </Link>
            </div>

            <ul className={`flex space-x-8 md:text-[13px] lg:text-[14px] font-medium items-center justify-center flex-1`}>
                {menuLinks.map((item, idx) => {
                    // Handle two possible shapes:
                    // 1. CMS format:    { id: 1234, label: 'Home', href: '/' }
                    // 2. Static format: { 'Home': '/' }  (NAV_LINKS from constants)
                    let label: string;
                    let href: string;

                    if ('label' in item && 'href' in item) {
                        // CMS-sourced link
                        label = String(item.label || '');
                        href  = String(item.href  || '#');
                    } else {
                        // Static NAV_LINKS: single-key objects { "Label": "/path" }
                        label = Object.keys(item)[0]   || '';
                        href  = String(Object.values(item)[0] || '#');
                    }

                    const isActive = path === href;

                    return (
                        <li key={`nav-${label}-${idx}`} className="relative py-1">
                            <Link
                                href={href || '#'}
                                className={`relative z-10 transition-colors duration-300 font-semibold pb-2 ${
                                    isActive ? 'text-blue-600' : 'text-gray-800 hover:text-gray-500'
                                }`}
                            >
                                {label}
                            </Link>

                            {isActive && (
                                <motion.div
                                    layoutId="nav-underline"
                                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-600 z-0"
                                />
                            )}
                        </li>
                    );
                })}
            </ul>

            <div className="flex-1 flex justify-end">
                {path === '/customerRegister' || path === '/customerLogin' || path.includes('/customerProfile') ? null : (
                    <div className="flex gap-6 items-center">
                        
                        <div className="relative flex items-center">
                            {isSearchOpen ? (
                                <div className="absolute right-0 top-full mt-4 w-[300px] z-50">
                                    <SearchBar 
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                        onClose={() => setIsSearchOpen(false)} // Pass the close handler
                                        onSearch={(val) => {
                                            if (val.trim()) {
                                                // Redirect to your shopping list page with the search query
                                                router.push(`/shopping-list?q=${encodeURIComponent(val)}`);
                                            }
                                            setIsSearchOpen(false); // Close bar after searching
                                            setSearchQuery(''); // Optional: clear the input after redirect
                                        }}
                                        placeholder="Search products..."
                                    />
                                </div>
                            ) : (
                                <button onClick={() => setIsSearchOpen(true)} className="hover:text-gray-500 transition-colors">
                                    <Search size={22} strokeWidth={1.5} />
                                </button>
                            )}
                        </div>

                        {showUserContent && (
                            <Link href={'/customerProfile' + (`/${user?.id}`) + '/wishlist'} className="relative hover:text-gray-500 transition-colors">
                                {wishlistCount > 0 && (
                                    <motion.span
                                        key={wishlistCount}
                                        initial={{ scale: 1.2, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }} 
                                        className="absolute -top-2 -right-2 text-[10px] bg-black text-white rounded-full w-4 h-4 flex items-center justify-center"
                                    >
                                        {wishlistCount}
                                    </motion.span>
                                )}
                                <Heart size={22} strokeWidth={1.5} color="currentColor" fill={isMounted && wishlistCount > 0 ? "black" : "none"} />
                            </Link>
                        )}

                        <button onClick={() => dispatch(toggleCartSidebar('open'))} className="relative hover:text-gray-500 transition-colors">
                            {isMounted && items.length > 0 && (
                                <motion.span 
                                    key={items.length}
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }} 
                                    className="absolute -top-2 -right-2 text-[10px] bg-black text-white rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                    {items.length}
                                </motion.span>
                            )}
                            <ShoppingBag size={22} strokeWidth={1.5} />
                        </button>

                        <Link href={user?.id ? '/customerProfile' + `/${user?.id}` : '/auth/customerLogin'} className="hover:text-gray-500 transition-colors">
                             <User size={22} strokeWidth={1.5} />
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    )
}