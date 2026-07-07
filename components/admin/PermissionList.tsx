import { useState } from "react";
import { handleDeletePermission } from "@/utils/adminApiClients";
import { PERMISSIONS_TEXT } from "@/constants/adminText";

interface Permission {
  id: string;
  permission_name: string;
}

export const PermissionList = ({
  permissions,
  token,
  onRefresh,
}: {
  permissions: Permission[];
  token: string;
  onRefresh: () => void;
}) => {
  const [busyId, setBusyId] = useState<string | null>(null);

  const onDeletePermission = async (id: string) => {
    setBusyId(id);
    try {
      await handleDeletePermission(id, token);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      {permissions.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between px-3 py-2.5"
        >
          <span className="text-theme-body-sm font-mono text-gray-800">
            {p.permission_name}
          </span>
          <button
            onClick={() => onDeletePermission(p.id)}
            disabled={busyId === p.id}
            className="text-theme-caption text-red-400 hover:text-red-600 disabled:opacity-50"
          >
            {busyId === p.id ? "Deleting..." : PERMISSIONS_TEXT.DELETE}
          </button>
        </div>
      ))}
    </>
  );
};