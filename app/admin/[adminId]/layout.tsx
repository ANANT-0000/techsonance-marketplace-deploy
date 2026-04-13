'use client';

import { Sidebar } from "@/components/common/Sidebar";
import { ADMIN_NAV_LINKS } from "@/constants/admin";
// @ts-ignore
import './index.css';
import { useParams } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHooks";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const isSidebarOpen = useAppSelector((state) => state.sidebar.isSidebarOpen);
    const { adminId } = useParams();
    return (
        <>
            <Sidebar NAV_LINKS={ADMIN_NAV_LINKS} basePath={`/admin/${adminId}`}/>
            <main className={`mr-6 mb-[5px] ${isSidebarOpen ? 'ml-50' : 'ml-24'}`}>
                {children}
            </main>
        </>
    );
}
