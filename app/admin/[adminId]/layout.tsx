'use client';

import { Sidebar } from "@/components/common/Sidebar";
import { ADMIN_NAV_LINKS } from "@/constants/admin";
// @ts-ignore
import './index.css';
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useEffect } from "react";
import { authToken } from "@/utils/authToken";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const isSidebarOpen = useAppSelector((state) => state.sidebar.isSidebarOpen);
    const { adminId } = useParams();
    const token = authToken();
    const router = useRouter();
    useEffect(() => {
        if (!token) {
            router.push('/auth/adminLogin');
        }
    }, [token, router]);
    return (
        <>
            <Sidebar NAV_LINKS={ADMIN_NAV_LINKS} basePath={`/admin/${adminId}`} />
            <main className={`mr-6 mb-[5px] ${isSidebarOpen ? 'ml-50' : 'ml-24'}`}>
                {children}
            </main>
        </>
    );
}
