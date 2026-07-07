"use client";

import React, { Suspense, useState } from "react";
import { handleAddRole } from "@/utils/adminApiClients";
import RoleList from "./RoleList";
import { ROLES_TEXT } from "@/constants/adminText";
import { Loader2, Plus } from "lucide-react";

export default function RolesSection({
  roles,
  token,
  onRefresh,
}: {
  roles: any[];
  token: string;
  onRefresh: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);

  const onAddRoleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roleName = formData.get("role") as string;
    if (!roleName || !roleName.trim()) return;

    setIsAdding(true);
    try {
      await handleAddRole(formData, token);
      onRefresh();
      e.currentTarget.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <h2 className="text-theme-body-sm font-semibold text-gray-700 mb-3">
        {ROLES_TEXT.ROLES_TITLE}
      </h2>

      <form onSubmit={onAddRoleSubmit} className="flex gap-2 mb-4">
        <input
          name="role"
          placeholder="e.g. MODERATOR"
          className="flex-1 border border-gray-300 rounded-xl px-3 py-1.5 text-theme-body-sm focus:outline-none focus:border-gray-500"
          disabled={isAdding}
        />

        <button
          type="submit"
          disabled={isAdding}
          className="border border-gray-300 rounded-xl px-4 py-1.5 text-theme-body-sm hover:bg-gray-50 flex items-center justify-center min-w-[80px]"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          ) : (
            ROLES_TEXT.ADD
          )}
        </button>
      </form>
      <Suspense fallback={<p>{ROLES_TEXT.LOADING}</p>}>
        {roles.length > 0 ? (
          <RoleList roles={roles} token={token} onRefresh={onRefresh} />
        ) : (
          <p className="text-theme-body-sm text-gray-500">{ROLES_TEXT.NO_ROLES_FOUND}</p>
        )}
      </Suspense>
    </div>
  );
}
