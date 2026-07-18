"use client";
// @ts-ignore
import "./index.css";
import { Sidebar } from "@/components/common/Sidebar";
import { VENDOR_NAV_LINKS } from "@/constants/vendor";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useEffect } from "react";
import { RootState } from "@/lib/store";
import { UserRole } from "@/constants";
import AxiosAPI from "@/lib/axios";
import { TrialBanner } from "@/components/vendor/TrialBanner";
import VendorTourProvider from "@/components/vendor/VendorTourProvider";
const STATUS_PAYMENT_REQUIRED = 402;
const BILLING_REDIRECT_URL = "/vendor/settings/billing?reason=expired";
const VENDOR_BASE_PATH = "/vendor";
const VENDOR_LOGIN_PATH = "/auth/vendorLogin";
const ROOT_PATH = "/";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSidebarOpen = useAppSelector((state) => state.sidebar.isSidebarOpen);
  const { isAuthenticated, role, user } = useAppSelector(
    (state: RootState) => state.auth,
  );
  const vendorId = user && "vendor_id" in user ? user?.vendor_id : "";
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!isAuthenticated || role !== UserRole.VENDOR) {
      router.replace(VENDOR_LOGIN_PATH);
      return;
    }

    // Redirect PENDING vendors to verify-email
    if (user && "vendor_status" in user && user.vendor_status === "PENDING") {
      if (pathname !== "/vendor/verify-email") {
        router.replace("/vendor/verify-email");
      }
    } else if (
      user &&
      "vendor_status" in user &&
      user.vendor_status === "ACTIVE"
    ) {
      if (pathname === "/vendor/verify-email") {
        router.replace("/vendor/dashboard"); // or default active path
      }
    }
  }, [isAuthenticated, role, user, pathname, router]);
  useEffect(() => {
    // Axios interceptor in lib/axios.ts
    const interceptor = AxiosAPI.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === STATUS_PAYMENT_REQUIRED) {
          // Subscription expired — redirect to upgrade
          window.location.href = BILLING_REDIRECT_URL;
        }
        return Promise.reject(err);
      },
    );
    return () => {
      AxiosAPI.interceptors.response.eject(interceptor);
    };
  }, []);

  if (!isAuthenticated || role !== UserRole.VENDOR) {
    return null;
  }

  return (
    <VendorTourProvider>
      <main className={`flex w-full`}>
        <Sidebar NAV_LINKS={VENDOR_NAV_LINKS} basePath={VENDOR_BASE_PATH} />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen ">
          {user &&
            "vendor_status" in user &&
            user.vendor_status !== "PENDING" && (
              <TrialBanner vendorId={vendorId as string} />
            )}
          {children}
        </div>
      </main>
    </VendorTourProvider>
  );
}
