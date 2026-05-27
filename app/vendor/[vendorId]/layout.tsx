'use client';
// @ts-ignore
import './index.css';
import { Sidebar } from "@/components/common/Sidebar";
import { VENDOR_NAV_LINKS } from "@/constants/vendor";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useEffect } from "react";
import { RootState } from "@/lib/store";
import { UserRole } from "@/constants";
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import Navbar from '@/components/vendor/Navbar';
import AxiosAPI from '@/lib/axios';
export default function VendorLayout({ children }: { children: React.ReactNode }) {
    const { vendorId } = useParams();
    const isSidebarOpen = useAppSelector((state) => state.sidebar.isSidebarOpen);
    const { isAuthenticated, role } = useAppSelector((state: RootState) => state.auth)
    const router = useRouter()
    useEffect(() => {
        console.log("isAuthenticated", isAuthenticated)
        console.log("role", role)
        console.log(!isAuthenticated && role !== UserRole.Vendor);
        if (!isAuthenticated || role !== UserRole.Vendor) {
            router.replace(`/`);
        }
    }, [])
    // Axios interceptor in lib/axios.ts
AxiosAPI.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 402) {
      // Subscription expired — redirect to upgrade
      window.location.href = `/vendor/${vendorId}/settings/billing?reason=expired`;
    }
    return Promise.reject(err);
  }
);
    return (
        <>
            <Sidebar NAV_LINKS={VENDOR_NAV_LINKS} basePath={`/vendor/${vendorId}`} />
            <main className={`vendor_dashboard mr-6 ${isSidebarOpen ? 'ml-50' : 'ml-24'}`}>
                <ProtectedRoute allowedRoles={[UserRole.Vendor, UserRole.Admin]} loginPath="/auth/vendorLogin">
                <Navbar />
                    {children}
                </ProtectedRoute>
            </main>
        </>
    );
}
