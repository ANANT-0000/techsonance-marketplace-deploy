'use client';
import { Sidebar } from "@/components/common/Sidebar";
import { VENDOR_NAV_LINKS } from "@/constants/vendor";
import { useParams } from "next/navigation";
import './index.css';
import { useAppSelector } from "@/hooks/reduxHooks";
export default function VendorLayout({ children }: { children: React.ReactNode }) {
    const { vendorId } = useParams();
    const isSidebarOpen = useAppSelector((state) => state.sidebar.isSidebarOpen);
    return (
        <>
            <Sidebar NAV_LINKS={VENDOR_NAV_LINKS} basePath={`/vendor/${vendorId}`} id={vendorId} />
            <main className={`vendor_dashboard mr-6 ${isSidebarOpen ? 'ml-50' : 'ml-24'}`}>
                {children}
            </main>
        </>
    );
}
