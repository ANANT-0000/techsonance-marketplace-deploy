'use client';

import { Sidebar } from "@/components/common/Sidebar";
import { ADMIN_NAV_LINKS } from "@/constants/admin";
import { useIsSidebarOpen } from "@/utils/sideBarCheck";
import './index.css';
import { useParams } from "next/navigation";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const isSidebarOpen = useIsSidebarOpen();
    const { adminId } = useParams();
    return (
        <>
            <Sidebar NAV_LINKS={ADMIN_NAV_LINKS} basePath={`/admin/${adminId}`} id={adminId} />
            <main className={`mr-6 ${isSidebarOpen ? 'ml-50' : 'ml-24'}`}>
                {children}
            </main>
        </>
    );
}
