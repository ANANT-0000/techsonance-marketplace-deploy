"use client";

import { Sidebar } from "@/components/common/Sidebar";
import { ADMIN_NAV_LINKS } from "@/constants/admin";
// @ts-ignore
import "./index.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authToken } from "@/utils/authToken";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { UserRole } from "@/constants";

const ADMIN_LOGIN_PATH = "/auth/adminLogin";
const ADMIN_BASE_PATH = "/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = authToken();
  const router = useRouter();
  const { isAuthenticated, role } = useAppSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (!isAuthenticated || role !== UserRole.ADMIN) {
      router.push(ADMIN_LOGIN_PATH);
    }
  }, [isAuthenticated, role, router]);
  return (
    <>
      <main className={`flex w-full mr-6`}>
        <SonnerToaster />
        <Sidebar NAV_LINKS={ADMIN_NAV_LINKS} basePath={`${ADMIN_BASE_PATH}`} />
        {children}
      </main>
    </>
  );
}
