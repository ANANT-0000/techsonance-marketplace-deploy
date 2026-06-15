import { Navbar } from "@/components/customer/Navbar";
import { Footer } from "@/components/customer/Footer";
import { CartSidebar } from "@/components/customer/CartSidebar";
import { TabNavBar } from "@/components/customer/TabNavBar";
import { ThemeProvider } from "@/components/customer/ThemeProvider";
import { CustomerLoginModal } from "@/components/customer/CustomerLoginModal";
import { getCompanyDomain } from "@/lib/get-domain";
import {
  BASE_API_URL,
  DEFAULT_FAVICON_PATH,
  DEFAULT_STORE_NAME,
  STORE_SUFFIX,
  BRANDING_ENDPOINT,
  HEADER_COMPANY_DOMAIN,
  REVALIDATE_INTERVAL,
  TWITTER_CARD,
  OG_TYPE,
  NAVBAR_STYLE,
  getWelcomeDescription,
} from "@/constants";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const companyDomain = await getCompanyDomain();

  let storeName = DEFAULT_STORE_NAME;
  let faviconUrl = DEFAULT_FAVICON_PATH;
  if (companyDomain) {
    const namePart = companyDomain.split(".")[0] || "";
    if (namePart) {
      storeName =
        namePart.charAt(0).toUpperCase() + namePart.slice(1) + STORE_SUFFIX;
    }
  }

  try {
    const res = await fetch(`${BASE_API_URL}${BRANDING_ENDPOINT}`, {
      headers: {
        [HEADER_COMPANY_DOMAIN]: companyDomain || "",
      },
      next: { revalidate: REVALIDATE_INTERVAL },
    });
    if (res.ok) {
      const result = await res.json();
      const branding = result?.data;
      if (branding && typeof branding === "object" && branding.favicon_url) {
        faviconUrl = branding.favicon_url;
      }
    }
  } catch (err) {}

  const descriptionText = getWelcomeDescription(storeName);

  return {
    title: {
      template: `%s | ${storeName}`,
      default: storeName,
    },
    description: descriptionText,
    icons: {
      icon: faviconUrl,
    },
    openGraph: {
      title: storeName,
      description: descriptionText,
      type: OG_TYPE,
    },
    twitter: {
      card: TWITTER_CARD,
      title: storeName,
      description: descriptionText,
    },
  };
}

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const companyDomain = await getCompanyDomain();
  let themeData: any = {};
  try {
    const res = await fetch(`${BASE_API_URL}${BRANDING_ENDPOINT}`, {
      headers: {
        [HEADER_COMPANY_DOMAIN]: companyDomain || "",
      },
      next: { revalidate: REVALIDATE_INTERVAL },
    });
    if (res.ok) {
      const result = await res.json();
      const branding = result?.data;
      if (branding && typeof branding === "object") {
        let homepageLayout = branding.homepage_layout;
        if (typeof homepageLayout === "string") {
          try {
            homepageLayout = JSON.parse(homepageLayout);
          } catch {
            homepageLayout = homepageLayout
              .split(",")
              .map((s: string) => s.trim());
          }
        }
        themeData = {
          ...branding,
          homepage_layout: homepageLayout || undefined,
        };
      }
    }
  } catch (err) {}

  return (
    <ThemeProvider theme={themeData}>
      <Navbar styles={NAVBAR_STYLE} />
      <CustomerLoginModal />
      <CartSidebar />
      {children}
      <TabNavBar />
      <Footer />
    </ThemeProvider>
  );
}
