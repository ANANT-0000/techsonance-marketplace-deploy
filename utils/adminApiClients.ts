"use server";
import { ADMIN_BASE_URL, BASE_API_URL } from "@/constants";
import { authToken } from "./authToken";
import { revalidatePath } from "next/cache";
import AxiosAPI from "@/lib/axios";
import { getCompanyDomain } from "@/lib/get-domain";

export const fetchRoles = async (token: string) => {
  const response = await fetch(`${BASE_API_URL}/v1/roles`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { tags: ["roles"] },
  });
  if (!response.ok) {
    return { data: [] };
  }
  return await response.json();
};
export const fetchPermissions = async (token: string) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/permissions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch permissions");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};
export const createRole = async (role: string, token: string) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/roles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) {
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createPermission = async (
  permissionName: string,
  token: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/permissions/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ permissionName }),
    });
    if (!response.ok) {
      throw new Error("Failed to create permission");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};
export const handleAddRole = async (
  adminId: string,
  formData: FormData,
  token: string,
) => {
  const newRole = formData.get("role") as string;
  if (!newRole.trim()) return;
  const createdRoleResult = await createRole(newRole.trim(), token);
  revalidatePath(`/admin/${adminId}/roles`);
  return createdRoleResult;
};
export const handleDeleteRole = async (
  adminId: string,
  id: string,
  token: string,
) => {
  await fetch(`${BASE_API_URL}/v1/roles/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  revalidatePath(`/admin/${adminId}/roles`);
};

export const handleAddPermission = async (
  adminId: string,
  formData: FormData,
  token: string,
) => {
  const name = formData.get("permission") as string;
  if (!name.trim()) return;
  revalidatePath(`/admin/${adminId}/roles`);
  return await createPermission(name.trim().toLowerCase(), token);
};

export const handleDeletePermission = async (
  adminId: string,
  id: string,
  token: string,
) => {
  const response = await fetch(`${BASE_API_URL}/v1/permissions/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Failed to delete permission");
  }
  revalidatePath(`/admin/${adminId}/roles`);
  return await response.json();
};

export const handleRemovePermission = async (
  adminId: string,
  roleId: string,
  permId: string,
  token: string,
) => {
  await fetch(`${BASE_API_URL}/v1/roles/remove-permission-from-role`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roleId, permissionId: permId }),
  });
  revalidatePath(`/admin/${adminId}/roles`);
};
export const fetchApplications = async (token: string) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/admin/vendor-applications`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch vendor applications");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};
export const fetchRolePermissions = async (token: string) => {
  const response = await fetch(
    `${BASE_API_URL}/v1/roles/get-role-permissions`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const res = await response.json();
  if (response.status !== 200) {
  }
  return res;
};
export const handleAssignPermission = async (
  adminId: string,
  roleId: string,
  permissionId: string,
  token: string,
) => {
  await fetch(`${BASE_API_URL}/v1/roles/add-permission-to-role`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roleId, permissionId }),
  });

  // This refreshes the page data for the specific admin
  revalidatePath(`/admin/${adminId}/roles`);
};
export const approveVendor = async (vendorId: string, token: string) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/admin/approve-vendor/${vendorId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to approve vendor");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const rejectVendor = async (vendorId: string, token: string) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/admin/reject-vendor/${vendorId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to reject vendor");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchTemplates = async (token: string) => {
  try {
    const domain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/template`, {
      method: "GET",
      headers: {
        "company-domain": domain,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch a single template by ID
 */
export const fetchTemplateById = async (id: string, token: string) => {
  try {
    const domain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/template/${id}`, {
      method: "GET",
      headers: {
        "company-domain": domain,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new template with a PDF file
 */
export const fetchCreateTemplate = async (
  formData: FormData,
  token: string,
) => {
  try {
    const domain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/template`, {
      method: "POST",
      headers: {
        "company-domain": domain,
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchUpdateTemplate = async (
  id: string,
  formData: FormData,
  token: string,
) => {
  try {
    const domain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/template/${id}`, {
      method: "PATCH",
      headers: {
        "company-domain": domain,
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a template
 */
export const fetchDeleteTemplate = async (id: string, token: string) => {
  try {
    const domain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/template/${id}`, {
      method: "DELETE",
      headers: {
        "company-domain": domain,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  } catch (error) {
    throw error;
  }
};
