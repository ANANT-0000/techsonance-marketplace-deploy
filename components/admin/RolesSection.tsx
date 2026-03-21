"use client";
import { useState } from "react";
import { createRole } from "@/utils/apiClient";
import { authToken } from "@/utils/authToken";
import { BASE_API_URL } from "@/constants/constants";

interface Permission { id: string; permission_name: string; }
interface Role { id: string; role_name: string; permissions?: Permission[]; }

interface Props {
  roles: Role[];
  onRefresh: () => void;
}

export default function RolesSection({ roles, onRefresh }: Props) {
  const [name, setName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createRole(name.trim().toUpperCase());
    setName("");
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await fetch(`${BASE_API_URL}roles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken()}` },
    });
    onRefresh();
  };

  const handleRemovePermission = async (roleId: string, permId: string) => {
    await fetch(`${BASE_API_URL}roles/remove-permission-from-role`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ roleId, permissionId: permId }),
    });
    onRefresh();
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Roles</h2>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. MODERATOR"
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500"
        />
        <button className="border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50">
          Add
        </button>
      </form>

      <div className="divide-y border rounded">
        {roles.length === 0 && (
          <p className="text-xs text-gray-400 p-3">No roles yet.</p>
        )}
        {roles.map((role) => (
          <div key={role.id} className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-gray-800">{role.role_name}</span>
              <button
                onClick={() => handleDelete(role.id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Delete
              </button>
            </div>
            {(role.permissions ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {role.permissions!.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5"
                  >
                    {p.permission_name}
                    <button
                      onClick={() => handleRemovePermission(role.id, p.id)}
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
      </div>
    </div>
  );
}
