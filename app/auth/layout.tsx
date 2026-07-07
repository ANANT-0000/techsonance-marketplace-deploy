// Reads request headers via getCompanyDomain() — must never be statically prerendered.
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ThemeProvider } from "@/components/customer/ThemeProvider";
import { getCompanyDomain } from "@/lib/get-domain";
import {
  BASE_API_URL,
  BRANDING_ENDPOINT,
  HEADER_COMPANY_DOMAIN,
  REVALIDATE_INTERVAL,
} from "@/constants";
import "./index.css";

export default async function AuthLayout({
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
        themeData = branding;
      }
    }
  } catch (err) {}

  return (
    <ThemeProvider theme={themeData}>
      <div className="min-h-screen flex items-center justify-center  w-full">
        {children}
      </div>
    </ThemeProvider>
  );
}
