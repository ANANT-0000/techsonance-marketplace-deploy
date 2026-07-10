"use client";

import { handleAddPermission } from "@/utils/adminApiClients";
import { Suspense, useState } from "react";
import { PermissionList } from "./PermissionList";
import { PERMISSIONS_TEXT } from "@/constants/adminText";
import { Loader2 } from "lucide-react";

interface Permission {
  id: string;
  permission_name: string;
}

interface Props {
  permissions: Permission[];
  token: string;
  onRefresh: () => void;
}

export default function PermissionsSection({
  permissions,
  token,
  onRefresh,
}: Props) {
  const [isAdding, setIsAdding] = useState(false);

  const onAddPermissionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const permName = formData.get("permission") as string;
    if (!permName || !permName.trim()) return;

    setIsAdding(true);
    try {
      await handleAddPermission(formData, token);
      onRefresh();
      e.currentTarget.reset();
    } catch (error) {
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <h2 className="text-theme-body-sm font-semibold text-gray-700 mb-3">
        {PERMISSIONS_TEXT.PERMISSIONS_TITLE}
      </h2>

      <form onSubmit={onAddPermissionSubmit} className="flex gap-2 mb-4">
        <input
          name="permission"
          placeholder="e.g. view_reports"
          className="flex-1 border border-gray-300 rounded-xl px-3 py-1.5 text-theme-body-sm focus:outline-none focus:border-gray-500"
          disabled={isAdding}
        />

        <button
          disabled={isAdding}
          className="border border-gray-300 rounded-xl px-4 py-1.5 text-theme-body-sm hover:bg-gray-50 flex items-center justify-center min-w-[80px]"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          ) : (
            PERMISSIONS_TEXT.ADD
          )}
        </button>
      </form>

      <div className="divide-y border-2 border-gray-300 rounded-2xl">
        <Suspense
          fallback={
            <p className="text-theme-caption text-gray-400 p-3">
              {PERMISSIONS_TEXT.LOADING}
            </p>
          }
        >
          {permissions.length === 0 ? (
            <p className="text-theme-caption text-gray-400 p-3">
              {PERMISSIONS_TEXT.NO_PERMISSIONS_YET}
            </p>
          ) : (
            <PermissionList
              permissions={permissions}
              token={token}
              onRefresh={onRefresh}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
