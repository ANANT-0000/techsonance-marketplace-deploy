'use server'
import { ADMIN_BASE_URL, BASE_API_URL } from "@/constants";
import { authToken } from "./authToken";
import { revalidatePath } from "next/cache";

export const fetchRoles = async () => {
    const response = await fetch(`${BASE_API_URL}roles`, {
        headers: { Authorization: `Bearer ${authToken()}` },
        next: { tags: ['roles'] }
    });
    if (!response.ok) {
        console.error('Failed to fetch roles:', response);
        return { data: [] }
    }
    return await response.json();
};
export const fetchPermissions = async () => {
    try {
        const response = await fetch(`${BASE_API_URL}permissions`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${await authToken()}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch permissions');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching permissions:', error);
        throw error;
    }
};
export const createRole = async (role: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}roles/create`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role }),
        });
        console.log(response);
        if (!response.ok) {
            throw new Error('Failed to create role');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating role:', error);
        throw error;
    }
};

export const createPermission = async (permissionName: string) => {
    try {
        const response = await fetch(`${BASE_API_URL}permissions/create`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ permissionName }),
        });
        if (!response.ok) {
            throw new Error('Failed to create permission');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating permission:', error);
        throw error;
    }
}
export const handleAddRole = async (adminId: string, formData: FormData) => {
    const newRole = formData.get("role") as string;
    console.log("role", newRole);
    if (!newRole.trim()) return;
    const createdRoleResult = await createRole(newRole.trim());
    revalidatePath(`/admin/${adminId}/roles`);
    return createdRoleResult;

};
export const handleDeleteRole = async (adminId: string, id: string) => {
    await fetch(`${BASE_API_URL}roles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken()}` },
    });
    revalidatePath(`/admin/${adminId}/roles`);
};

export const handleAddPermission = async (adminId: string, formData: FormData) => {
    const name = formData.get("permission") as string;
    if (!name.trim()) return;
    revalidatePath(`/admin/${adminId}/roles`);
    return await createPermission(name.trim().toLowerCase());
};

export const handleDeletePermission = async (adminId: string, id: string) => {
    const response = await fetch(`${BASE_API_URL}permissions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken()}` },
    });
    if (!response.ok) {
        console.error('Failed to delete permission:', response);
        throw new Error('Failed to delete permission');
    }
    revalidatePath(`/admin/${adminId}/roles`);
    return await response.json();
};

export const handleRemovePermission = async (adminId: string, roleId: string, permId: string) => {
    await fetch(`${BASE_API_URL}roles/remove-permission-from-role`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ roleId, permissionId: permId }),
    });
    revalidatePath(`/admin/${adminId}/roles`);
};
export const fetchApplications = async () => {
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/vendor-applications`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch vendor applications');
        }
        return await response.json();

    } catch (error) {
        console.error('Error fetching vendor applications:', error);
        throw error;
    }
};
export const fetchRolePermissions = async () => {

    const response = await fetch(`${BASE_API_URL}roles/get-role-permissions`, {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken()}` },
    });
    if (response.status !== 200) {
        console.error('Error fetching role permissions:', response.message);
    }
    console.log("api response role permissions", response);
    return await response.json();
};
export const handleAssignPermission = async (adminId: string, roleId: string, permissionId: string) => {
    await fetch(`${BASE_API_URL}roles/add-permission-to-role`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${authToken()}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ roleId, permissionId }),
    });

    // This refreshes the page data for the specific admin
    revalidatePath(`/admin/${adminId}/roles`);
};
export const approveVendor = async (vendorId: string) => {
    try {
        console.log(vendorId);
        const response = await fetch(`${ADMIN_BASE_URL}/approve-vendor/${vendorId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to approve vendor');
        }
        return await response.json();
    } catch (error) {
        console.error('Error approving vendor:', error);
        throw error;
    }
};

export const rejectVendor = async (vendorId: string) => {
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/reject-vendor/${vendorId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to reject vendor');
        }
        return await response.json();
    } catch (error) {
        console.error('Error rejecting vendor:', error);
        throw error;
    }
};

