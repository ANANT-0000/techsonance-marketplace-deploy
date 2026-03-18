'use client';
import { Sidebar } from "@/components/common/Sidebar";
import { VENDOR_NAV_LINKS } from "@/constants/vendor";
import { useIsSidebarOpen } from "@/utils/sideBarCheck";
import { useParams } from "next/navigation";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
const {vendorId} = useParams();
    return (
        <>
            <Sidebar NAV_LINKS={VENDOR_NAV_LINKS} basePath={`/vendor/${vendorId}`} />
            <main className={`vendor_dashboard mr-6 ${useIsSidebarOpen() ? 'ml-50' : 'ml-24'}`}>
                {children}
            </main>
        </>
    );
}
