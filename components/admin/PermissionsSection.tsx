import { handleAddPermission, handleDeletePermission } from "@/utils/adminApiClients";
import { Suspense } from "react";
import { PermissionList } from "./PermissionList";

interface Permission { id: string; permission_name: string; }

interface Props {
  adminId: string;
  permissions: Permission[];
}

export default async function PermissionsSection({ permissions, adminId }: Props) {
  const onAddPermission = handleAddPermission.bind(null, adminId);
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Permissions</h2>

      <form action={onAddPermission} className="flex gap-2 mb-4">
        <input
          name="permission"
          placeholder="e.g. view_reports"
          className="flex-1 border  border-gray-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500"
        />
        <button className="border border-gray-300 rounded-xl px-4 py-1.5  text-sm hover:bg-gray-50">
          Add
        </button>
      </form>

      <div className="divide-y border-2 border-gray-300 rounded-2xl">
        <Suspense fallback={<p className="text-xs text-gray-400 p-3">Loading permissions...</p>}>
          {permissions.length === 0 ? (
            <p className="text-xs text-gray-400 p-3">No permissions yet.</p>
          ) : (
            <PermissionList permissions={permissions}  adminId={adminId} />
          )}

        </Suspense>
      </div>
    </div>
  );
}
