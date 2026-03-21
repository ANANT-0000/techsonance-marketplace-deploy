"use client";
import { useEffect, useState } from "react";
import { authToken } from "@/utils/authToken";
import { BASE_API_URL } from "@/constants/constants";

interface Permission { id: string; permission_name: string; }
interface Role { id: string; role_name: string; permissions?: Permission[]; }

interface Props {
  roles: Role[];
  permissions: Permission[];
  onRefresh: () => void;
}

export default function AssignSection({ roles, permissions, onRefresh }: Props) {
  const [roleId, setRoleId] = useState("");
  const [permId, setPermId] = useState("");
  const [rolePerms, setRolePerms] = useState();
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId || !permId) return;
    await fetch(`${BASE_API_URL}roles/add-permission-to-role`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ roleId, permissionId: permId }),
    });
    setPermId("");
    onRefresh();
  };
  useEffect(() => {
    const getRolePermissions = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}roles/get-role-permissions`, {
          method: "GET",
          headers: { Authorization: `Bearer ${authToken()}` },
        });
        if (response.status !== 201) {
          console.error('Error fetching role permissions:', response.message);
        }
        const data = await response.json();
        console.log("api response role permissions", data);
        setRolePerms(data.role_permissions);

      } catch (error) {
        console.error("Error fetching role permissions:", error);
      }

    }
    getRolePermissions();
  }, [onRefresh()]);
  console.log("rolePerms", rolePerms);
  // const assignedIds = new Set(
  //   roles.find((r) => r.id === roleId)?.permissions?.map((p) => p.id) ?? []
  // );

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Assign Permission to Role</h2>

      <form onSubmit={handleAssign} className="flex gap-2">
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500"
        >
          <option value="">Select role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.role_name}</option>
          ))}
        </select>

        <select
          value={permId}
          onChange={(e) => setPermId(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500"
        >
          <option value="">Select permission</option>
          {permissions.map((p) => (
            <option key={p.id} value={p.id}  >
              {p.permission_name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!roleId || !permId}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-40"
        >
          Assign
        </button>
      </form>
      <section>
        <h3 className="text-xs font-semibold text-gray-600 mt-4 mb-2">Current Assignments</h3>
        <div className="divide-y border rounded">
          {rolePerms?.map((rp, idx) => (
            <div key={idx} className="px-3 py-2.5">
              <p className="text-sm font-mono text-gray-800">{rp.role}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {
                  rp.permissions?.map((permission, idx) => (
                    <span
                      key={idx}
                      className={permission == undefined ? "hidden" : "inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5"}
                    >
                      {permission == undefined ? '' : permission}
                    </span>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
