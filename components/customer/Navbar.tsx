'use client';
import { useEffect, useReducer } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import { BRAND_LOGO } from "@/constants/common";
import { Bell, Heart, ShoppingBag, User, Search, Menu } from "lucide-react";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import { motion } from "motion/react";
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { useNavbarData } from "@/hooks/useNavbarData";
import { SearchBar } from './SearchBar';
import { BackButton } from '../ui/back-button';

type NavState = { isMounted: boolean; isSearchOpen: boolean; searchQuery: string };
type NavAction =
    | { type: 'MOUNT' }
    | { type: 'TOGGLE_SEARCH'; payload: boolean }
    | { type: 'SET_SEARCH_QUERY'; payload: string };

const navReducer = (state: NavState, action: NavAction): NavState => {
    switch (action.type) {
        case 'MOUNT': return { ...state, isMounted: true };
        case 'TOGGLE_SEARCH': return { ...state, isSearchOpen: action.payload };
        case 'SET_SEARCH_QUERY': return { ...state, searchQuery: action.payload };
        default: return state;
    }
};

export function Navbar({ styles, logoUrl = BRAND_LOGO, menuLinks: propMenuLinks }: { styles?: string, logoUrl?: string, menuLinks?: { [key: string]: string | null }[] }) {
    const { menuLinks: dynamicLinks } = useNavbarData();
    const menuLinks = propMenuLinks || dynamicLinks;

    const { items } = useAppSelector((state: RootState) => state.cart);
    const { wishItems } = useAppSelector((state: RootState) => state.wishlist);
    const { user } = useAppSelector((state: RootState) => state.auth);

    const dispatch = useAppDispatch();
    const wishlistCount = wishItems.length; // Simplified since array length implies count
    const path = usePathname();
    const router = useRouter();
    const isHome = path === "/"
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });

    const [state, dispatchState] = useReducer(navReducer, {
        isMounted: false,
        isSearchOpen: false,
        searchQuery: ''
    });

    useEffect(() => {
        dispatchState({ type: 'MOUNT' });
    }, []);

    if (path.startsWith('/admin') || path.startsWith('/vendor') || path.includes('checkout')) {
        return null;
    }

    if (!state.isMounted) return <nav className="h-16" />;

    if (isTabletOrMobile) {
        return (
            <nav className="flex justify-between items-center px-4 py-1 bg-white border-b border-gray-200 shadow-sm">
                {isHome ? null : <BackButton />}
                <Link href="/">
                    <img src={logoUrl} alt="brand logo" className="h-6 object-contain" />
                </Link>
                <button className="p-2 -mr-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors relative">
                    <Bell strokeWidth={1.5} size={22} />
                </button>
            </nav>
        );
    }

    return (
        <nav className={`bg-white text-gray-900 flex justify-between items-center xl:px-16 lg:px-8 md:px-4 py-3 border-b border-gray-200 shadow-sm ${styles}`}>
            <div className="flex-1">
                <Link href="/">
                    <img src={logoUrl} alt="brand logo" className="h-14 font-black object-contain" />
                </Link>
            </div>

            <ul className="flex space-x-8 md:text-sm lg:text-sm font-medium items-center justify-center flex-1">
                {menuLinks.map((item, idx) => {
                    let label: string;
                    let href: string;

                    if ('label' in item && 'href' in item) {
                        label = String(item.label || '');
                        href = String(item.href || '#');
                    } else {
                        label = Object.keys(item)[0] || '';
                        href = String(Object.values(item)[0] || '#');
                    }

                    const isActive = path === href;

                    return (
                        <li key={`nav-${label}-${idx}`} className="relative py-1">
                            <Link
                                href={href || '#'}
                                className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {label}
                            </Link>
                            {isActive && (
                                <motion.div
                                    layoutId="nav-underline"
                                    className="absolute -bottom-4 left-0 right-0 h-[2px] bg-gray-900 z-0"
                                />
                            )}
                        </li>
                    );
                })}
            </ul>

            <div className="flex-1 flex justify-end">
                {path === '/customerRegister' || path === '/customerLogin' ? null : (
                    <div className="flex gap-5 items-center">
                        <div className="relative flex items-center">
                            {state.isSearchOpen ? (
                                <div className="w-[320px] z-50">
                                    <SearchBar
                                        value={state.searchQuery}
                                        onChange={(val) => dispatchState({ type: 'SET_SEARCH_QUERY', payload: val })}
                                        onClose={() => dispatchState({ type: 'TOGGLE_SEARCH', payload: false })}
                                        onSearch={(val) => {
                                            if (val.trim()) {
                                                router.push(`/shopping?search=${encodeURIComponent(val)}`);
                                            }
                                            dispatchState({ type: 'TOGGLE_SEARCH', payload: false });
                                            dispatchState({ type: 'SET_SEARCH_QUERY', payload: '' });
                                        }}
                                        placeholder="Search products..."
                                    />
                                </div>
                            ) : (
                                <button onClick={() => dispatchState({ type: 'TOGGLE_SEARCH', payload: true })} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                                    <Search size={20} strokeWidth={1.5} />
                                </button>
                            )}
                        </div>

                        {user && (
                            <Link href={'/customer' + (`/${user?.id}`) + '/wishlist'} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                                {wishlistCount > 0 && (
                                    <span className="absolute 1 top-0 right-0 text-[10px] font-bold bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                                        {wishlistCount}
                                    </span>
                                )}
                                <Heart size={20} strokeWidth={1.5} color="currentColor" fill={wishlistCount > 0 ? "currentColor" : "none"} />
                            </Link>
                        )}

                        <button onClick={() => dispatch(toggleCartSidebar('open'))} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            {state.isMounted && items.length > 0 && (
                                <span className="absolute 1 top-0 right-0 text-[10px] font-bold bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                                    {items.length}
                                </span>
                            )}
                            <ShoppingBag size={20} strokeWidth={1.5} />
                        </button>

                        <Link href={user?.id ? '/customer' : '/auth/customerLogin'} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <User size={20} strokeWidth={1.5} />
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}