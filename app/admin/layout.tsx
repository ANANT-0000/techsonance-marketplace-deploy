"use client";

import { Sidebar } from "@/components/common/Sidebar";
import { ADMIN_NAV_LINKS } from "@/constants/admin";
// @ts-ignore
import "./index.css";
import { useRouter, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { authToken } from "@/utils/authToken";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { UserRole } from "@/utils/Types";
import { isAdminDomainAllowed } from "@/lib/get-domain";

const ADMIN_LOGIN_PATH = "/auth/adminLogin";
const ADMIN_BASE_PATH = "/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [domainAllowed, setDomainAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyDomain = async () => {
      try {
        const allowed = await isAdminDomainAllowed();
        setDomainAllowed(allowed);
      } catch (error) {
        setDomainAllowed(false);
      }
    };
    verifyDomain();
  }, []);

  const token = authToken();
  const router = useRouter();
  const { isAuthenticated, role } = useAppSelector(
    (state: RootState) => state.auth,
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (
      (mounted &&
        domainAllowed === true &&
        (!isAuthenticated || role !== UserRole.ADMIN)) ||
      !token
    ) {
      router.push(ADMIN_LOGIN_PATH);
    }
  }, [mounted, isAuthenticated, role, router, domainAllowed, token]);

  if (domainAllowed === false) {
    notFound();
  }

  if (
    !mounted ||
    domainAllowed === null ||
    !isAuthenticated ||
    role !== UserRole.ADMIN
  ) {
    return null;
  }

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
