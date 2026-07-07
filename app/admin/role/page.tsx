"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RolesSection from "@/components/admin/RolesSection";
import PermissionsSection from "@/components/admin/PermissionsSection";
import AssignSection from "@/components/admin/AssignSection";
import { fetchPermissions, fetchRolePermissions, fetchRoles } from "@/utils/adminApiClients";
import { authToken } from "@/utils/authToken";

export default function RolesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [rolePerms, setRolePerms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tokenValue = authToken();

  useEffect(() => {
    if (!tokenValue) {
      router.push("/auth/adminLogin");
      return;
    }
    setToken(tokenValue);
    loadData(tokenValue);
  }, [tokenValue, router]);

  const loadData = async (activeToken: string) => {
    try {
      setIsLoading(true);
      const getRoles = await fetchRoles(activeToken);
      const getPermissions = await fetchPermissions(activeToken);
      const getRolePerms = await fetchRolePermissions(activeToken);

      setRoles(getRoles?.data || []);
      setPermissions(getPermissions?.data || []);
      setRolePerms(getRolePerms || []);
    } catch (error) {
      console.error("Failed to load RBAC data", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValue) return null;

  if (isLoading) {
    return (
      <div className="flex h-60 items-center justify-center gap-3 text-muted-foreground w-full">
        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-sm">Loading RBAC configurations…</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 w-full">
      <h1 className="text-theme-h6 font-semibold text-gray-800">RBAC Management</h1>

      <RolesSection roles={roles} token={token || ""} onRefresh={() => loadData(token || "")} />
      <hr className="border-gray-200" />
      <PermissionsSection permissions={permissions} token={token || ""} onRefresh={() => loadData(token || "")} />
      <hr className="border-gray-200" />
      <AssignSection
        roles={roles}
        permissions={permissions}
        rolePermissions={rolePerms}
        token={token || ""}
        onRefresh={() => loadData(token || "")}
      />
    </div>
  );
}