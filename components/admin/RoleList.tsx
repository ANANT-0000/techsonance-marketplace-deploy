'use client';

import { useRouter } from "next/navigation";
import { handleDeleteRole, handleRemovePermission } from "@/utils/adminApiClients";

export default function RoleList({ roles }: { roles: any[] }) {
    const router = useRouter(); 
    const onDelete = async (id: string) => {
        await handleDeleteRole(id);
        router.refresh();
    };

    const onRemovePermission = async (roleId: string, permId: string) => {
        await handleRemovePermission(roleId, permId);
        router.refresh();
    };

    return (
        <>
            {roles.map((role) => (
                <div key={role.id} className="p-3 border-b last:border-0">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-gray-800">{role.role_name}</span>
                        <button
                            onClick={() => onDelete(role.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                        >
                            Delete
                        </button>
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
                                    <button
                                        onClick={() => onRemovePermission(role.id, p.id)}
                                        className="text-gray-400 hover:text-red-500 leading-none"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </>
    );
}