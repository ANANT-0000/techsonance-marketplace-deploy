'use client';
import React from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useMediaQuery } from 'react-responsive'
import { BRAND_LOGO, searchImgDark, searchImgLight, userIcon } from "@/constants/common";
import { useDispatch, useSelector } from "react-redux";
import { Bell, Heart, ShoppingCart } from "lucide-react";

import { NAV_LINKS } from "@/constants/customer";
import { toggleCartSidebar } from "@/Redux store/features/CartSidebar";
import { motion } from "motion/react";
import { RootState } from "@/Redux store/store";



export function Navbar({ styles, logoUrl = BRAND_LOGO, menuLinks = NAV_LINKS }: { styles?: string, logoUrl?: string, menuLinks?: { [key: string]: string }[] }) {
    const searchImg = false ? searchImgLight : searchImgDark;
    const { items } = useSelector((state: RootState) => state.cart)
    const { wishItems } = useSelector((state: any) => state.wishlist)
    const { user } = useSelector((state: any) => state.auth)
    const dispatch = useDispatch();
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
    const wishlistCount = wishItems.length;
    const path = usePathname();
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (path.startsWith('/admin') || path.startsWith('/vendor') || path.includes('checkout') || path.includes('cart') || path.includes('wishlist') || path.includes('orders') || path.includes('changePassword') || path.includes('address') || path.includes('customerProfile')) {
        return <></>
    }
    if (isTabletOrMobile) {
        return (
            <nav className="flex justify-between items-center  align-middle  px-4 py-2 h-16   ">
                <Link href="/"><img src={logoUrl} alt="brand logo" className="h-10  " /></Link>
                <Link href='/notifications'>
                    <Bell />
                </Link>
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
                                href={href}
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
                        <Link href={'/customerProfile/' + (user?.user_id || '') + '/wishlist'} className="relative  ">
                            {isMounted && wishlistCount > 0 ? <motion.span
                                key={wishlistCount}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }} className="  absolute -top-2 -right-2 text-md bg-red-500 text-white rounded-full  w-6 h-6 flex items-center justify-center" >{wishlistCount}</motion.span> : null}
                            <Heart size={38} color={isMounted && wishlistCount > 0 ? "pink" : "black"} fill={isMounted && wishlistCount > 0 ? "pink" : "none"} />
                        </Link>
                        <button onClick={() => dispatch(toggleCartSidebar('open'))} className=" relative" >
                            {isMounted && items.length > 0 && <motion.span key={items.length}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }} className=" absolute -top-2 -right-2 text-md bg-red-500 text-white rounded-full  w-6 h-6 flex items-center justify-center">{items.length}</motion.span>}
                            <ShoppingCart size={38} />
                        </button>

                        <Link href={'/customerProfile/' + (user?.user_id || '')} className=" ">
                            <img src={userIcon} alt="" className="h-8 w-8 rounded-full" />
                        </Link>
                    </div>}
            </span>
        </nav>

    )
}