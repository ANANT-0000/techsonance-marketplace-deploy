'use client';
import { Sidebar } from "@/components/common/Sidebar";
import { VENDOR_NAV_LINKS } from "@/constants/vendor";
import { useParams, useRouter } from "next/navigation";
import './index.css';
import { useAppSelector } from "@/hooks/reduxHooks";
import { useEffect } from "react";
import { RootState } from "@/lib/store";
import { UserRole } from "@/constants";
export default function VendorLayout({ children }: { children: React.ReactNode }) {
    const { vendorId } = useParams();
    const isSidebarOpen = useAppSelector((state) => state.sidebar.isSidebarOpen);
    const { isAuthenticated, role } = useAppSelector((state: RootState) => state.auth)
    const router = useRouter()
    useEffect(() => {
        console.log("isAuthenticated",isAuthenticated)
        console.log("role",role)
        console.log(!isAuthenticated && role !== UserRole.Vendor);
        if (!isAuthenticated || role !== UserRole.Vendor) {
            router.replace(`/`);
        }
    }, [])
    return (
        <>
            <Sidebar NAV_LINKS={VENDOR_NAV_LINKS} basePath={`/vendor/${vendorId}`} id={vendorId} />
            <main className={`vendor_dashboard mr-6 ${isSidebarOpen ? 'ml-50' : 'ml-24'}`}>
                {children}
            </main>
        </>
    );
}
