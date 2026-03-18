'use client';
import { Navbar } from "@/components/customer/Navbar";
import { Footer } from "@/components/customer/Footer";
import { CartSidebar } from "@/components/customer/CartSidebar";
import { TabNavBar } from "@/components/customer/TabNavBar";
import { useMediaQuery } from "react-responsive";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
 

    return (
        <>
            <Navbar styles="bg-navbar" />
            <CartSidebar />
            {children}
            <TabNavBar />
            <Footer styles="bg-footer-foreground text-primary" />
        </>
    );
}
