import RolesSection from "@/components/admin/RolesSection";
import PermissionsSection from "@/components/admin/PermissionsSection";
import AssignSection from "@/components/admin/AssignSection";
import { fetchPermissions, fetchRolePermissions, fetchRoles } from "@/utils/adminApiClients";
export default async function RolesPage({ params }: { params: Promise<{ adminId: string }> }) {
    const { adminId } = await params;
    const getRoles = await fetchRoles();
    const roles = getRoles?.data || [];
    const getPermissions = await fetchPermissions();
    const permissions = getPermissions?.data || [];
    const rolePerms = await fetchRolePermissions();
    return (
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
            <h1 className="text-lg font-semibold text-gray-800">RBAC Management</h1>

            <RolesSection roles={roles} adminId={adminId} />
            <hr />
            <PermissionsSection permissions={permissions} adminId={adminId} />
            <hr />
            <AssignSection roles={roles} permissions={permissions} adminId={adminId} rolePermissions={rolePerms} />

        </div>
    );
}