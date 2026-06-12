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
    const namePart = companyDomain.split(".")[0] || "";
    if (namePart) {
      storeName =
        namePart.charAt(0).toUpperCase() + namePart.slice(1) + " Store";
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
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: storeName,
      description: `Welcome to ${storeName}. Discover a curated selection of premium products, handcrafted items, and exclusive deals.`,
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
    const res = await fetch(`${BASE_API_URL}/v1/company-identity/branding`, {
      headers: {
        "company-domain": companyDomain || "",
      },
      next: { revalidate: 60 },
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
      <Navbar styles="bg-navbar" />
      <CartSidebar />
      {children}
      <TabNavBar />
      <Footer />
    </ThemeProvider>
  );
}
