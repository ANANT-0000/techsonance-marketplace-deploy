"use client";

import { useEffect, useState, useMemo } from "react";
import { LoaderSpinner } from "./LoaderSpinner";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";

export function ProtectedRoute({
  children,
  allowedRoles,
  loginPath = "/auth/customerLogin",
}: {
  children: React.ReactNode;
  allowedRoles: string[];
  loginPath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, role } = useAppSelector(
    (state: RootState) => state.auth,
  );

  const isAuthorized = useMemo(() => {
    const userRole = role?.toLowerCase() ?? null;
    return (
      userRole !== null &&
      allowedRoles.map((r) => r.toLowerCase()).includes(userRole)
    );
  }, [role, allowedRoles]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || loading) return;
    if (!isAuthenticated) {
      router.replace(loginPath);
    } else if (!isAuthorized) {
      router.replace("/unauthorized");
    }
  }, [isAuthenticated, isAuthorized, loading, router, loginPath, isMounted]);

  if (!isMounted) {
    return null; // Prevent hydration mismatch between server and client
  }

  if (loading || !isAuthenticated || !isAuthorized) {
    return <LoaderSpinner />;
  }
  return <>{children}</>;
}
