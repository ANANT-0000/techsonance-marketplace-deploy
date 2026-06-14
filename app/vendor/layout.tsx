"use client";
// @ts-ignore
import "./index.css";
import { Sidebar } from "@/components/common/Sidebar";
import { VENDOR_NAV_LINKS } from "@/constants/vendor";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useEffect } from "react";
import { RootState } from "@/lib/store";
import { UserRole } from "@/constants";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import Navbar from "@/components/vendor/Navbar";
import AxiosAPI from "@/lib/axios";
import { TrialBanner } from "@/components/vendor/TrialBanner";

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
  useEffect(() => {
    if (!isAuthenticated || role !== UserRole.Vendor) {
      router.replace(ROOT_PATH);
    }
  }, []);
  // Axios interceptor in lib/axios.ts
  AxiosAPI.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === STATUS_PAYMENT_REQUIRED) {
        // Subscription expired — redirect to upgrade
        window.location.href = BILLING_REDIRECT_URL;
      }
      return Promise.reject(err);
    },
  );
  return (
    <>
      <main className={`flex w-full`}>
        <Sidebar NAV_LINKS={VENDOR_NAV_LINKS} basePath={VENDOR_BASE_PATH} />
        <ProtectedRoute
          allowedRoles={[UserRole.Vendor, UserRole.Admin]}
          loginPath={VENDOR_LOGIN_PATH}
        >
          <div className="flex-1 flex flex-col min-h-screen">
            <TrialBanner vendorId={vendorId as string} />
            {children}
          </div>
        </ProtectedRoute>
      </main>
    </>
  );
}
