'use client';

import { useRouter } from "next/navigation";
import { handleDeleteRole, handleRemovePermission } from "@/utils/adminApiClients";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";

export default function RoleList({ roles, adminId }: { roles: any[]; adminId: string }) {
    const { user, role } = useAppSelector((state: RootState) => state.auth);
    const router = useRouter();
    const isAdmin = role === "admin";
    const onDelete = async (id: string) => {
        if (!adminId) return;
        await handleDeleteRole(adminId, id);
        router.refresh();
    };

    const onRemovePermission = async (roleId: string, permId: string) => {
        if (!adminId) return;
        await handleRemovePermission(adminId, roleId, permId);
        router.refresh();
    };

    return (
        <>
            {roles.map((role) => (
                <div key={role.id} className="p-3 border-b last:border-0">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-gray-800">{role.role_name}</span>
                        {isAdmin && (
                            <button
                                onClick={() => onDelete(role.id)}
                                className="text-xs text-red-400 hover:text-red-600"
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Permissions section */}
                    {(role.permissions ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {role.permissions.map((p: any) => (
                                <span
                                    key={p.id}
                                    className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 rounded-2xl px-2 py-0.5"
                                >
                                    {p.permission_name}
                                    {isAdmin && (
                                        <button
                                            onClick={() => onRemovePermission(role.id, p.id)}
                                            className="text-gray-400 hover:text-red-500 leading-none"
                                        >
                                            ×
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </>
    );
}