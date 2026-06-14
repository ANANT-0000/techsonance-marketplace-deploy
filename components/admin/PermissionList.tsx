import { handleDeletePermission } from "@/utils/adminApiClients";
import { authToken } from "@/utils/authToken";
import { redirect } from "next/navigation";
import { PERMISSIONS_TEXT } from "@/constants/adminText";

interface Permission { id: string; permission_name: string; }
export const PermissionList = ({ permissions, adminId }: { permissions: Permission[]; adminId: string }) => {
    const token = authToken();
    if (!token) {
        redirect("/auth/adminLogin");
    }
    const onDeletePermission = (id: string) => {
        handleDeletePermission(adminId, id, token);
    };
    return (
        <>
            {permissions.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-theme-body-sm font-mono text-gray-800">{p.permission_name}</span>
                    <button
                        onClick={() => onDeletePermission(p.id)}
                        className="text-theme-caption text-red-400 hover:text-red-600"
                    >
                        {PERMISSIONS_TEXT.DELETE}
                    </button>
                </div>
            ))}
        </>
    )
};