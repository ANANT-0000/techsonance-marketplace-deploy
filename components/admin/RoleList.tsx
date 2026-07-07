"use client";

import { useState } from "react";
import {
  handleDeleteRole,
  handleRemovePermission,
} from "@/utils/adminApiClients";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { ROLES_TEXT } from "@/constants/adminText";
import { Loader2 } from "lucide-react";

export default function RoleList({
  roles,
  token,
  onRefresh,
}: {
  roles: any[];
  token: string;
  onRefresh: () => void;
}) {
  const { user, role } = useAppSelector((state: RootState) => state.auth);
  const isAdmin = role === "admin";
  const [busyRoleId, setBusyRoleId] = useState<string | null>(null);

  const onDelete = async (id: string) => {
    setBusyRoleId(id);
    try {
      await handleDeleteRole(id, token);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setBusyRoleId(null);
    }
  };

  const onRemovePermission = async (roleId: string, permId: string) => {
    setBusyRoleId(`${roleId}-${permId}`);
    try {
      await handleRemovePermission(roleId, permId, token);
      onRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setBusyRoleId(null);
    }
  };

  return (
    <>
      {roles.map((role) => (
        <div key={role.id} className="p-3 border-b last:border-0">
          <div className="flex items-center justify-between">
            <span className="text-theme-body-sm font-mono text-gray-800">
              {role.role_name}
            </span>
            {isAdmin && (
              <button
                onClick={() => onDelete(role.id)}
                disabled={busyRoleId === role.id}
                className="text-theme-caption text-red-400 hover:text-red-600 disabled:opacity-50"
              >
                {busyRoleId === role.id ? "Deleting..." : ROLES_TEXT.DELETE}
              </button>
            )}
          </div>

          {/* Permissions section */}
          {(role.permissions ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {role.permissions.map((p: any) => {
                const isBusy = busyRoleId === `${role.id}-${p.id}`;
                return (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 text-theme-caption bg-gray-100 text-gray-600 rounded-2xl px-2 py-0.5"
                  >
                    {p.permission_name}
                    {isAdmin && (
                      <button
                        onClick={() => onRemovePermission(role.id, p.id)}
                        disabled={isBusy}
                        className="text-gray-400 hover:text-red-500 leading-none disabled:opacity-50"
                      >
                        {isBusy ? "…" : "×"}
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
