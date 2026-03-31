import { handleDeletePermission } from "@/utils/adminApiClients";

interface Permission { id: string; permission_name: string; }
export const PermissionList = ({ permissions, adminId }: { permissions: Permission[]; adminId: string }) => {

    return (
        <>
            {permissions.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-sm font-mono text-gray-800">{p.permission_name}</span>
                    <button
                        onClick={() => handleDeletePermission(adminId, p.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                    >
                        Delete
                    </button>
                </div>
            ))}
        </>
    )
};