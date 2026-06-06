import { Navbar } from "@/components/customer/Navbar";
import { Footer } from "@/components/customer/Footer";
import { CartSidebar } from "@/components/customer/CartSidebar";
import { TabNavBar } from "@/components/customer/TabNavBar";
import { StorefrontThemeStyles } from "@/components/customer/StorefrontThemeStyles";
import { ThemeProvider } from "@/components/customer/ThemeProvider";
import { getCompanyDomain } from "@/lib/get-domain";
import { BASE_API_URL } from "@/constants";
 
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
            <StorefrontThemeStyles />
            <Navbar styles="bg-navbar" />
            <CartSidebar />
            {children}
            <TabNavBar />
            <Footer styles="bg-footer-foreground text-primary" />
        </ThemeProvider>
    );
}
