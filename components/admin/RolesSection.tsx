import React, { Suspense } from "react";
import { fetchRoles, handleAddRole, handleDeleteRole, handleRemovePermission } from "@/utils/adminApiClients";
import RoleList from "./RoleList";

export default async function RolesSection({ roles, adminId }: { roles: any[], adminId: string }) {

  const onAddRole=handleAddRole.bind(null,adminId);

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Roles</h2>

      <form action={onAddRole} className="flex gap-2 mb-4">
        <input
          // value={name}
          name="role"
          placeholder="e.g. MODERATOR"
          className="flex-1 border border-gray-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500"
        />
        <button type="submit" className="border border-gray-300 rounded-xl px-4 py-1.5  text-sm hover:bg-gray-50">
          Add
        </button>
      </form>
      <Suspense fallback={<p>Loading roles...</p>}>

        {roles.length > 0 ?
          <RoleList roles={roles} adminId={adminId} />
          : <p className="text-sm text-gray-500">No roles found. Start by adding one!</p>}
      </Suspense >
    </div>
  );
}
