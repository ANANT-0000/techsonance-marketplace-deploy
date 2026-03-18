'use client';

import { Sidebar } from "@/components/common/Sidebar";
import { ADMIN_NAV_LINKS } from "@/constants/admin";
import { useIsSidebarOpen } from "@/utils/sideBarCheck";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const isSidebarOpen = useIsSidebarOpen();

    return (
        <>
            <Sidebar NAV_LINKS={ADMIN_NAV_LINKS} />
            <main className={`mr-6 ${isSidebarOpen ? 'ml-50' : 'ml-24'}`}>
                {children}
            </main>
        </>
    );
}
