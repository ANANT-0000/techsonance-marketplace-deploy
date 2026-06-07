import { Navbar } from "@/components/customer/Navbar";
import { Footer } from "@/components/customer/Footer";
import { CartSidebar } from "@/components/customer/CartSidebar";
import { TabNavBar } from "@/components/customer/TabNavBar";
import { ThemeProvider } from "@/components/customer/ThemeProvider";
import { getCompanyDomain } from "@/lib/get-domain";
import { BASE_API_URL } from "@/constants";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const companyDomain = await getCompanyDomain();
    
    let storeName = "Marketplace Store";
    if (companyDomain) {
        const namePart = companyDomain.split('.')[0] || "";
        if (namePart) {
            storeName = namePart.charAt(0).toUpperCase() + namePart.slice(1) + " Store";
        }
    }

    return {
        title: {
            template: `%s | ${storeName}`,
            default: storeName,
        },
        description: `Welcome to ${storeName}. Discover a curated selection of premium products, handcrafted items, and exclusive deals.`,
        openGraph: {
            title: storeName,
            description: `Welcome to ${storeName}. Discover a curated selection of premium products, handcrafted items, and exclusive deals.`,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: storeName,
            description: `Welcome to ${storeName}. Discover a curated selection of premium products, handcrafted items, and exclusive deals.`,
        }
    };
}
 
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
    const companyDomain = await getCompanyDomain();
    console.log("company domain in shop layout", companyDomain);

    let themeData: any = {};
    try {
        const res = await fetch(`${BASE_API_URL}/v1/cms/theme?lang=en`, {
            headers: {
                'company-domain': companyDomain || '',
            },
            next: { revalidate: 60 }
        });
        if (res.ok) {
            const result = await res.json();
            const cmsRow = result?.data ?? result;
            const rawContent = cmsRow?.content;
            if (rawContent) {
                themeData = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
            }
        }
    } catch (err) {
        console.error("Failed to pre-fetch storefront theme on server:", err);
    }

    return (
        <ThemeProvider theme={themeData}>
            <Navbar styles="bg-navbar" />
            <CartSidebar />
            {children}
            <TabNavBar />
            <Footer styles="bg-footer-foreground text-primary" />
        </ThemeProvider>
    );
}
