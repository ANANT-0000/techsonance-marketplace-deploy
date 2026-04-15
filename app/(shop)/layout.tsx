import { Navbar } from "@/components/customer/Navbar";
import { Footer } from "@/components/customer/Footer";
import { CartSidebar } from "@/components/customer/CartSidebar";
import { TabNavBar } from "@/components/customer/TabNavBar";
import { useMediaQuery } from "react-responsive";
import { get } from "http";
import { getCompanyDomain } from "@/lib/get-domain";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {

    const companyDomain = await getCompanyDomain();
    console.log("company domain in shop layout", companyDomain);
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
