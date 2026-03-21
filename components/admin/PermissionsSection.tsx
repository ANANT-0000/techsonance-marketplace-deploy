"use client";
import { useState } from "react";
import { createPermission } from "@/utils/apiClient";
import { authToken } from "@/utils/authToken";
import { BASE_API_URL } from "@/constants/constants";

interface Permission { id: string; permission_name: string; }

interface Props {
  permissions: Permission[];
  onRefresh: () => void;
}

export default function PermissionsSection({ permissions, onRefresh }: Props) {
  const [name, setName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createPermission(name.trim().toLowerCase());
    setName("");
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await fetch(`${BASE_API_URL}permissions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken()}` },
    });
    onRefresh();
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Permissions</h2>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. view_reports"
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500"
        />
        <button className="border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50">
          Add
        </button>
      </form>

      <div className="divide-y border rounded">
        {permissions.length === 0 && (
          <p className="text-xs text-gray-400 p-3">No permissions yet.</p>
        )}
        {permissions.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-3 py-2.5">
            <span className="text-sm font-mono text-gray-800">{p.permission_name}</span>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
