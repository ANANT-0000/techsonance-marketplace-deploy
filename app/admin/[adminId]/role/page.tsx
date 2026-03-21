"use client";
import { useEffect, useState } from "react";
import { fetchRoles, fetchPermissions } from "@/utils/apiClient";
import RolesSection from "@/components/admin/RolesSection";
import PermissionsSection from "@/components/admin/PermissionsSection";
import AssignSection from "@/components/admin/AssignSection";


interface Permission { id: string; permission_name: string; }
interface Role { id: string; role_name: string; permissions?: Permission[]; }

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    const refresh = async () => {
        const [r, p] = await Promise.all([fetchRoles(), fetchPermissions()]);
        setRoles(r);
        setPermissions(p.permissions);
    };

    useEffect(() => { refresh(); }, []);

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
            <h1 className="text-lg font-semibold text-gray-800">RBAC Management</h1>

            <RolesSection roles={roles} onRefresh={refresh} />
            <hr />
            <PermissionsSection permissions={permissions} onRefresh={refresh} />
            <hr />
            <AssignSection roles={roles} permissions={permissions} onRefresh={refresh} />
        </div>
    );
}