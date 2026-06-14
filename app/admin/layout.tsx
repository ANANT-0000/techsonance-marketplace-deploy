"use client";

import { Sidebar } from "@/components/common/Sidebar";
import { ADMIN_NAV_LINKS } from "@/constants/admin";
// @ts-ignore
import "./index.css";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { authToken } from "@/utils/authToken";

const ADMIN_LOGIN_PATH = "/auth/adminLogin";
const ADMIN_BASE_PATH = "/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { adminId } = useParams();
  const token = authToken();
  const router = useRouter();
  useEffect(() => {
    if (!token) {
      router.push(ADMIN_LOGIN_PATH);
    }
  }, [token, router]);
  return (
    <>
      <main className={`flex w-full mr-6`}>
        <Sidebar
          NAV_LINKS={ADMIN_NAV_LINKS}
          basePath={`${ADMIN_BASE_PATH}/${adminId}`}
        />
        {children}
      </main>
    </>
  );
}
