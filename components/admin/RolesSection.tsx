import React, { Suspense } from "react";
import {
  fetchRoles,
  handleAddRole,
  handleDeleteRole,
  handleRemovePermission,
} from "@/utils/adminApiClients";
import RoleList from "./RoleList";
import { authToken } from "@/utils/authToken";
import { redirect } from "next/navigation";
import { ROLES_TEXT } from "@/constants/adminText";

export default async function RolesSection({
  roles,
  adminId,
}: {
  roles: any[];
  adminId: string;
}) {
  const token = authToken();
  if (!token) {
    redirect("/auth/adminLogin");
  }
  const onAddRole = async (formData: FormData) => {
    await handleAddRole(adminId, formData, token).catch((error) => {});
  };

  return (
    <div>
      <h2 className="text-theme-body-sm font-semibold text-gray-700 mb-3">
        {ROLES_TEXT.ROLES_TITLE}
      </h2>

      <form action={onAddRole} className="flex gap-2 mb-4">
        <input
          // value={name}
          name="role"
          placeholder="e.g. MODERATOR"
          className="flex-1 border border-gray-300 rounded-xl px-3 py-1.5 text-theme-body-sm focus:outline-none focus:border-gray-500"
        />

        <button
          type="submit"
          className="border border-gray-300 rounded-xl px-4 py-1.5  text-theme-body-sm hover:bg-gray-50"
        >
          {ROLES_TEXT.ADD}
        </button>
      </form>
      <Suspense fallback={<p>{ROLES_TEXT.LOADING}</p>}>
        {roles.length > 0 ? (
          <RoleList roles={roles} adminId={adminId} />
        ) : (
          <p className="text-theme-body-sm text-gray-500">{ROLES_TEXT.NO_ROLES_FOUND}</p>
        )}
      </Suspense>
    </div>
  );
}
