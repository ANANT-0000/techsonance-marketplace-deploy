'use client';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useMediaQuery } from 'react-responsive'
import { BRAND_LOGO, searchImgDark, searchImgLight, userIcon } from "@/constants/common";
import { Bell, Heart, ShoppingCart } from "lucide-react";

import { NAV_LINKS } from "@/constants/customer";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import { motion } from "motion/react";
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';



export function Navbar({ styles, logoUrl = BRAND_LOGO, menuLinks = NAV_LINKS }: { styles?: string, logoUrl?: string, menuLinks?: { [key: string]: string | null }[] }) {
    const searchImg = false ? searchImgLight : searchImgDark;
    const { items } = useAppSelector((state: RootState) => state.cart);
    const { wishItems } = useAppSelector((state: RootState) => state.wishlist);
    const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
    console.log('user', user, 'isAuthenticated', isAuthenticated)
 
    const dispatch = useAppDispatch();
    const wishlistCount = wishItems.length;
    const cartCount = items.length;
    console.log("wishItems", wishItems)
    console.log("items", items);
    const path = usePathname();
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
    const [isMounted, setIsMounted] = useState(false);
    console.log("nav user", user?.id)
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
            <nav className="flex justify-between items-center align-middle px-4 py-2 h-16">
                <Link href="/"><img src={logoUrl} alt="brand logo" className="h-10" /></Link>
                <Bell />
            </nav>
        )
    }

    return (
        <nav className={`bg-navbar text-navbar-foreground flex justify-between items-center  align-middle  xl:px-32 xl:py-2 lg:px-8 md:px-4 sm:px-2 py-1 h-16   `}>
            <Link href="/"><img src={logoUrl} alt="brand logo" className="h-10" /></Link>
            <ul className={` ${path.includes('/checkout') ? 'hidden' : ''} flex space-x-2 md:text-[12px] lg:text-[0.8rem] font-medium items-center`}>
                {menuLinks.map((item) => {
                    const label = Object.keys(item)[0];
                    const href = Object.values(item)[0];
                    const isActive = path === href;

                    return (
                        <li key={label} className="relative py-1 px-4">
                            <Link
                                href={href || '#'}
                                className={`relative z-10 transition-colors duration-300 font-bold ${isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {label}
                            </Link>

                            {/* Animated Background Pill */}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                    className="absolute   inset-0 bg-[#04b0ffc1] rounded-full z-0"
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
            <span className="flex gap-4">
                <div className="border-2    border-black/40 rounded-full flex items-center px-5   gap-2   ">
                    <input type="text" name="search" id="" placeholder="Search..." className="focus:outline-none text-lg  w-30 py-1" /> <button className="focus:outline-none">
                        <img src={searchImg} alt="" className="h-4 w-4" />
                    </button>
                </div>
                {path === '/customerRegister' || path === '/customerLogin' || path.includes('/customerProfile') ? null :
                    <div className="  flex gap-6 items-center ">
                        {showUserContent ?
                            <Link href={'/customerProfile' + (`/${user?.id}`) + '/wishlist'} className="relative">
                                {wishlistCount > 0 ? <motion.span
                                    key={wishlistCount}
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }} className="  absolute -top-2 -right-2 text-md bg-red-500 text-white rounded-full  w-6 h-6 flex items-center justify-center" >{wishlistCount}</motion.span> : null}
                                <Heart size={38} color={isMounted && wishlistCount > 0 ? "pink" : "black"} fill={isMounted && wishlistCount > 0 ? "pink" : "none"} />
                            </Link>
                            : ''
                        }
                        <button onClick={() => dispatch(toggleCartSidebar('open'))} className=" relative" >
                            {isMounted && items.length > 0 && <motion.span key={items.length}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }} className=" absolute -top-2 -right-2 text-md bg-red-500 text-white rounded-full  w-6 h-6 flex items-center justify-center">{items.length}</motion.span>}
                            <ShoppingCart size={38} />
                        </button>

                        <Link href={user?.id ? '/customerProfile' + `/${user?.id}` : '/auth/customerLogin'} className=" ">
                            <img src={userIcon} alt="" className="h-8 w-8 rounded-full" />
                        </Link>
                    </div>}
            </span>
        </nav>

    )
}