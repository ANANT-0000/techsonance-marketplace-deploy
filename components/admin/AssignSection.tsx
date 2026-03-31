"use client";
import { useState } from "react";
import { handleAssignPermission } from "@/utils/adminApiClients";

interface Permission { id: string; permission_name: string; }
interface Role { id: string; role_name: string; permissions?: Permission[]; }

// Define a type for the assignments we fetch
interface RoleAssignment {
  role: string;
  permissions: string[];
}

interface Props {
  roles: Role[];
  permissions: Permission[];
  rolePermissions: RoleAssignment[];
  adminId: string;
}

export default function AssignSection({ roles, permissions, adminId, rolePermissions }: Props) {
  const [roleId, setRoleId] = useState("");
  const [permId, setPermId] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId || !permId) return;

    setIsPending(true);
    try {
      await handleAssignPermission(adminId, roleId, permId);
      setPermId("");
    } catch (error) {
      console.error("Assignment failed", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Assign Permission to Role</h2>
        <form onSubmit={handleAssign} className="flex gap-2">
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500 bg-white"
          >
            <option value="">Select role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.role_name}</option>
            ))}
          </select>

          <select
            value={permId}
            onChange={(e) => setPermId(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500 bg-white"
          >
            <option value="">Select permission</option>
            {permissions.map((p) => (
              <option key={p.id} value={p.id}>{p.permission_name}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!roleId || !permId || isPending}
            className="bg-gray-900 text-white rounded-xl px-4 py-1.5 text-sm hover:bg-black disabled:opacity-40 transition-opacity"
          >
            {isPending ? "Assigning..." : "Assign"}
          </button>
        </form>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Current Assignments</h3>
        <div className="divide-y border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {rolePermissions?.length > 0 ? (
            rolePermissions.map((rp, idx) => (
              <div key={idx} className="px-4 py-3 bg-white">
                <p className="text-xs font-bold text-gray-500 mb-2">{rp.role}</p>
                <div className="flex flex-wrap gap-1.5">
                  {rp.permissions?.filter(p => p !== undefined).map((permission, pIdx) => (
                    <span
                      key={pIdx}
                      className="inline-flex items-center text-[11px] bg-blue-50 text-blue-700 border border-blue-100 rounded-md px-2 py-0.5"
                    >
                      {permission}
                    </span>
                  ))}
                  {(!rp.permissions || rp.permissions.length === 0) && (
                    <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-400">No assignments found</div>
          )}
        </div>
      </section>
    </div>
  );
}