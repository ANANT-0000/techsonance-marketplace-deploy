"use server";
import { BASE_API_URL } from "@/constants";
import { revalidatePath } from "next/cache";
import { getCacheConfig } from "./cache";
import {
  CompanyComplianceField,
  ComplianceDocument,
  ComplianceField,
  ComplianceFieldPayload,
  NavItemColType,
  NavItemDisplayType,
  NavItemType,
  NavLayoutType,
  NavMenuLogoAlignment,
  NavMenuPosition,
  OrderStatus,
  ReturnStatus,
} from "./Types";

// ==========================================
// CATEGORY API ENDPOINTS
// ==========================================

export const fetchVendorsProductsCategory = async (
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/categories`, {
      method: "GET",
      ...getCacheConfig(360, ["categories"]),
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "company-id": companyId || "",
      },
    });
    if (response.status !== 200) {
      return { data: [], message: "Failed to fetch product categories" };
    }
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching product categories" };
  }
};
export const createVendorProductCategory = async (
  categoryData: {
    name: string;
    description?: string;
    parent_id?: string | null;
    icon_url?: string | null;
    show_in_nav?: boolean;
  },
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/categories`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "company-id": companyId || "",
      },
      body: JSON.stringify({ category: categoryData }),
    });
    if (response.status !== 201) {
      const errorData = await response.json().catch(() => null);
      return {
        data: {},
        message: errorData?.message || "Failed to create product category",
      };
    }
    revalidatePath("/vendor/products/categories");
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error creating product category" };
  }
};
export const updateVendorProductCategory = async (
  categoryId: string,
  categoryData: {
    name: string;
    description?: string;
    parent_id?: string | null;
    icon_url?: string | null;
    show_in_nav?: boolean;
  },
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/categories/${categoryId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "company-id": companyId || "",
        },
        body: JSON.stringify({ category: categoryData }),
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        data: {},
        message: errorData?.message || "Failed to update product category",
      };
    }
    revalidatePath("/vendor/products/categories");
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error updating product category" };
  }
};
export const deleteVendorProductCategory = async (
  categoryId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/categories/${categoryId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "company-id": companyId || "",
        },
      },
    );
    if (response.status !== 200) {
      const errorData = await response.json().catch(() => null);
      return {
        status: response.status,
        message: errorData?.message || "Failed to delete product category",
      };
    }
    revalidatePath("/vendor/products/categories");
    return await response.json();
  } catch (error) {
    return { status: 500, message: "Error deleting product category" };
  }
};
// ==========================================
// PRODUCT API ENDPOINTS
// ==========================================

export const createProduct = async (
  productData: FormData,
  vendorId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/products/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "company-id": companyId || "",
      },
      body: productData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        status: response.status,
        statusText: response.statusText,
        message: errorData?.message,
      };
    }
    revalidatePath("/vendor/products");
    return await response.json();
  } catch (error) {
    return { status: 500, statusText: "Internal Server Error" };
  }
};
export const updateProduct = async (
  formData: FormData,
  productId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/products/${productId}`, {
      method: "PATCH",
      body: formData,
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        status: response.status,
        statusText: response.statusText,
        message: errorData?.message,
      };
    }
    revalidatePath("/vendor/products");
    return await response.json();
  } catch (error) {
    return { status: 500, statusText: "Internal Server Error" + error };
  }
};
export const updateProductVariantStatus = async (
  productVariantId: string,
  nextStatus: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/update-status/${productVariantId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        status: response.status,
        statusText: response.statusText,
        message: errorData?.message,
      };
    }

    revalidatePath("/vendor/products");
    revalidatePath(`/vendor/products/${productVariantId}/productVariants`);
    return await response.json();
  } catch (error) {
    return { status: 500, statusText: "Internal Server Error" + error };
  }
};
export const fetchVendorProducts = async (
  offset: number,
  limit: number,
  status: string | null,
  search: string | null,
  category: string | null,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/products/vendor-products?offset=${offset}&limit=${limit}&search=${search ?? null}&category=${category ?? null}&status=${status ?? null}`,
      {
        method: "GET",
        // cache: 'force-cache',
        // next: { revalidate: 3600 },
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status !== 200) {
      const errorData = await response.json().catch(() => null);
      return { status: response.status, message: errorData?.message };
    }
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching products" };
  }
};
export const fetchVendorProductsOptions = async (
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/products/options`, {
      method: "GET",
      // cache: 'force-cache',
      // next: { revalidate: 3600 },
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
      const errorData = await response.json().catch(() => null);
      return { status: response.status, message: errorData?.message };
    }
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching products" };
  }
};
export const fetchVendorActiveProducts = async (
  token: string,
  companyId: string,
) => {
  const cleanToken = token.replace(/['"]+/g, "");
  try {
    const response = await fetch(`${BASE_API_URL}/v1/products/active`, {
      method: "GET",
      cache: "no-cache",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "company-id": companyId || "",
      },
    });
    if (response.status !== 200) {
      const errorData = await response.json().catch(() => null);
      return { status: response.status, message: errorData?.message };
    }
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching products" };
  }
};
export const fetchVendorOneProducts = async (
  id: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/products/${id}/details`, {
      method: "GET",
      cache: "no-cache",
      // next: { revalidate: 3600 },
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
      const errorData = await response.json().catch(() => null);
      return { status: response.status, message: errorData?.message };
    }
    return await response.json();
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};
export const deleteProduct = async (
  productId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/products/${productId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { status: response.status, message: errorData?.message };
    }
    revalidatePath("/vendor/products");
    revalidatePath(`/vendor/products/${productId}`);
    return await response.json();
  } catch (error) {
    return { status: 500, statusText: "Internal Server Error" + error };
  }
};
// ==========================================
// PRODUCT VARIANT API ENDPOINTS
// ==========================================

export const createProductVariant = async (
  variantData: FormData,
  productId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/product-variant`, {
      method: "POST",
      body: variantData,
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "company-id": companyId || "",
      },
    });
    const res = await response.json();
    revalidatePath("/vendor/products/variants");
    revalidatePath(`/vendor/products/${productId}/productVariants`);
    revalidatePath("/vendor/products");
    return res;
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};
export const createInventoryRecord = async (
  productVariantId: string,
  warehouseId: string,
  stockQuantity: number,
  token: string,
  companyId: string,
) => {
  const response = await fetch(`${BASE_API_URL}/v1/inventory`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "company-id": companyId || "",
    },
    body: JSON.stringify({ productVariantId, warehouseId, stockQuantity }),
  });
  return response.json();
};
export const fetchLowStockAlerts = async (token: string, companyId: string) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/inventory/alerts/low-stock`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "company-id": companyId || "",
      },
    });
    return res.json();
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};
export const updateProductVariant = async (
  formData: FormData,
  productId: string,
  variantId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/${variantId}`,
      {
        method: "PATCH",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "company-id": companyId || "",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { status: response.status, message: errorData?.message };
    }

    const res = await response.json();
    revalidatePath(`/vendor/products/${productId}/variants`);
    return res;
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};
export const fetchProductVariants = async (
  productId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/${productId}`,
      {
        method: "GET",
        cache: "no-cache",
        // next: { revalidate: 3600 },
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status !== 200) {
      return [];
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
export const deleteProductVariant = async (
  productId: string,
  variantId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/${variantId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { status: response.status, message: errorData?.message };
    }
    revalidatePath(`/vendor/products/${productId}/variants`);
    revalidatePath("/vendor/products");
    return await response.json();
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};
export const fetchVariant = async (
  variantId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/variant/${variantId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status !== 200) {
      return null;
    }
    return await response.json();
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};
// ==========================================
// ORDERS API ENDPOINTS
// ==========================================

export const fetchVendorPendingOrders = async (
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/orders/pending`, {
      method: "GET",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
      return [];
    }
    return await response.json();
  } catch (error) {
    return [];
  }
};
export const fetchVendorOrderList = async (
  token: string,
  companyId: string,
  offset: number = 0,
  limit: number = 10,
  status?: OrderStatus | "",
  sortBy?: string,
) => {
  const queryParams = new URLSearchParams();
  queryParams.append("offset", String(offset));
  queryParams.append("limit", String(limit));
  if (status && (status as string) !== "undefined") {
    queryParams.append("status", status);
  }
  if (sortBy && sortBy !== "undefined") {
    queryParams.append("sortBy", sortBy);
  }

  const response = await fetch(
    `${BASE_API_URL}/v1/orders?${queryParams.toString()}`,
    {
      method: "GET",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.status !== 200) {
    if (response.status === 403)
      throw new Error("Access denied. Please check your subscription limits.");
    throw new Error("Failed to fetch orders from server.");
  }
  return await response.json();
};
export const fetchVendorOrderDetails = async (
  orderId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/orders/${orderId}/details`,
      {
        method: "GET",
        cache: "no-cache",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status !== 200) {
      return {};
    }
    return await response.json();
  } catch (error) {
    return {};
  }
};
export const fetchUpdateOrderStatus = async (
  orderId: string,
  status: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/orders/${orderId}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      },
    );
    if (response.status !== 200) {
      const errorData = await response.json().catch(() => null);
      return { status: response.status, message: errorData?.message };
    }
    return await response.json();
  } catch (error) {}
};
export const fetchAddTrackingUrl = async (
  orderId: string,
  trackingUrl: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/shipping`, {
      method: "POST",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId: orderId, trackingUrl: trackingUrl }),
    });
    if (response.status !== 201) {
      const errorData = await response.json().catch(() => null);
      return { status: response.status, message: errorData?.message };
    }
    return await response.json();
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};
export const fetchUpdateTrackingUrl = async (
  orderId: string,
  trackingUrl: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/shipping/${orderId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trackingUrl: trackingUrl }),
    });
    if (response.status !== 201) {
      const errorData = await response.json().catch(() => null);
      return { status: response.status, message: errorData?.message };
    }
    return await response.json();
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};
// ==========================================
// WAREHOUSE API ENDPOINTS
// ==========================================

export const fetchCreateWarehouseLocation = async (
  warehouseAddress: any,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/warehouse`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(warehouseAddress),
    });
    revalidatePath(`/vendor`);
    return await response.json();
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};
export const fetchUpdateWarehouseLocation = async (
  locationId: string,
  warehouseData: any,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/warehouse/${locationId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(warehouseData),
    });

    return await response.json();
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};
export const fetchVendorWarehouseLocations = async (
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/warehouse`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "company-id": companyId || "",
      },
    });
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error fetching warehouse locations" };
  }
};
export const fetchVendorWarehouse = async (
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/warehouse/options`, {
      method: "GET",
      ...getCacheConfig(3600),
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error fetching warehouse locations" };
  }
};

export const fetchDeleteWarehouseLocation = async (
  locationId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/warehouse/${locationId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};

export const fetchCreateCompanyLocation = async (
  addressData: any,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/address/company`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });
    revalidatePath(`/vendor`);
    return await response.json();
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};
export const fetchUpdateCompanyLocation = async (
  locationId: string,
  addressData: any,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/address/company/${locationId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      },
    );

    return await response.json();
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};

export const fetchDeleteCompanyLocation = async (
  locationId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/address/company/${locationId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error deleting company location" };
  }
};

export const fetchGetCompanyLocations = async (
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/address/company`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "company-id": companyId || "",
      },
    });
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error fetching company locations" };
  }
};
export const fetchUpdateOrderItem = async (
  itemId: string,
  formData: any,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/order-items/${itemId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    return await response.json();
  } catch (error) {
    return {
      data: {},
      status: 500,
      statusText: "Internal Server Error" + error,
    };
  }
};

// ==========================================
// PRODUCT API ENDPOINTS
// ==========================================

export const fetchGetVendorReturnRequests = async (
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/returns/vendor`, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching return requests" };
  }
};
export const fetchGetVendorReturnById = async (
  returnId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/returns/vendor/${returnId}`,
      {
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error fetching return request" };
  }
};
export const FetchUpdateReturnStatus = async (
  returnId: string,
  updates: {
    status: ReturnStatus;
    store_owner_note?: string;
    tracking_id?: string;
  },
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/returns/${returnId}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update return status");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchGetCompanyRefunds = async (
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/refunds`, {
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching company refunds" };
  }
};
export const fetchCompanyCustomers = async (
  offset: number,
  limit: number,
  status: string,
  sortBy: string,
  token: string,
  companyId: string,
  date?: Date,
) => {
  try {
    let url = `${BASE_API_URL}/v1/company/customers?offset=${offset}&limit=${limit}&status=${status}&sortBy=${sortBy}`;
    if (date) {
      url += `&date=${encodeURIComponent(date.toISOString())}`;
    }
    const response = await fetch(url, {
      ...getCacheConfig(3600),
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching company customers" };
  }
};
export const FetchSuspendCustomer = async (
  customerId: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/users/${customerId}/suspend`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error suspending customer" };
  }
};
// ==========================================
// FINANCE & TAXATION API ENDPOINTS
// ==========================================
export const fetchBulkInvoiceUrls = async (
  orderIds: string[],
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/invoice/bulk-download`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderIds }),
    });
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching bulk invoice URLs" };
  }
};
export const fetchGstRecords = async (
  offset: number,
  limit: number,
  search: string,
  statusFilter: string,
  sortBy: string,
  token: string,
  companyId: string,
) => {
  try {
    let url = `${BASE_API_URL}/v1/finances/gst?sort_by=${sortBy}&offset=${offset}&limit=${limit}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    return { data: [] };
  }
};

export const fetchCreateGstRecord = async (
  formData: any,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/finances/gst`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error saving GST" };
  }
};

export const fetchTaxProfiles = async (
  sortBy: string,
  date: Date | undefined,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-profiles?sort_by=${sortBy}${date ? `&date=${date.toISOString()}` : ""}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: [] };
  }
};

export const fetchTaxSlabOptions = async (token: string, companyId: string) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-slab-options`,
      {
        method: "GET",
        ...getCacheConfig(3600),
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: [] };
  }
};
// Add this below your existing finance API calls
export const fetchAssignProductTax = async (
  data: { product_id: string; tax_slab_id: string },
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/product-tax-mappings`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );
    revalidatePath("/vendor/finances/product-taxes");
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error assigning product tax" };
  }
};
export const fetchBulkAssignProductTax = async (
  data: { product_ids: string[]; tax_slab_id: string },
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/product-tax-bulk-mappings`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );
    revalidatePath("/vendor/finances/product-taxes");
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error assigning product tax" };
  }
};
export const fetchProductTaxMappings = async (
  offSet: number,
  sortBy: string,
  statusFilter: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/product-tax-mappings?offset=${offSet}&sort_by=${sortBy}&status=${statusFilter}`,
      {
        cache: "no-store",
        method: "GET",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching product tax mappings" };
  }
};

export const fetchGstInvoices = async (
  offset: number,
  limit: number,
  search: string,
  sortBy: string,
  date: Date | undefined,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/gst-invoices?offset=${offset}&limit=${limit}&search=${search}&sort_by=${sortBy}${date ? `&date=${date.toISOString()}` : ""}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching GST invoices" };
  }
};
// Add these below your existing finance fetch functions

export const fetchCreateTaxProfile = async (
  formData: any,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/finances/tax-profiles`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error saving Tax Profile" };
  }
};

// ==========================================
// FINANCE & TAXATION: GST REGISTRATIONS
// ==========================================

export const fetchSingleGstRecord = async (
  id: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/finances/gst/${id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    return { data: null };
  }
};

export const fetchUpdateGstRecord = async (
  id: string,
  data: any,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/finances/gst/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    revalidatePath(`/vendor/finances/gst`);
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error updating GST" };
  }
};

export const fetchDeleteGstRecord = async (
  id: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/finances/gst/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    revalidatePath("/vendor/finances/gst");
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error deleting GST" };
  }
};

// ==========================================
// FINANCE & TAXATION: TAX PROFILES
// ==========================================

export const fetchSingleTaxProfile = async (
  id: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-profiles/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: null };
  }
};

export const fetchUpdateTaxProfile = async (
  id: string,
  data: any,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-profiles/${id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );
    revalidatePath("/vendor/finances/tax-profiles");
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error updating Tax Profile" };
  }
};

// ==========================================
// FINANCE & TAXATION: TAX RATES & RULES
// ==========================================

//  Company Branding â”

export const fetchCompanyBranding = async (
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/company-identity/branding`, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return { data: null };
    return res.json();
  } catch (error) {
    return { data: null, message: "Error fetching company branding" };
  }
};

export const upsertCompanyBranding = async (
  payload: FormData,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/company-identity/branding`, {
      method: "POST",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    });

    // Purge cache for both CMS and Storefront Layout
    revalidatePath("/vendor");
    revalidatePath("/");

    const data = await res.json();
    return {
      status: res.status,
      ok: res.ok,
      data: data?.data ?? data,
    };
  } catch (error) {
    return {
      status: 500,
      ok: false,
      data: null,
      message: "Error upserting company branding",
    };
  }
};

//  Company Legal Profile

export const fetchCompanyLegalProfile = async (
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/company-identity/legal-profile`,
      {
        cache: "force-cache",
        //  revalidate: 3600,
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) return { data: null };
    return res.json();
  } catch (error) {
    return { data: null };
  }
};

export const upsertCompanyLegalProfile = async (
  payload: any,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/company-identity/legal-profile`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      data: {},
      success: false,
      message: "Error upserting company legal profile",
    };
  }
};

//  Company Compliance

export const fetchCompanyCompliance = async (
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/compliance`, {
      cache: "no-store",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch (error) {
    return { data: [] };
  }
};

export const upsertCompanyComplianceField = async (
  payload: {
    country_code: string;
    field_key: string;
    field_value: string;
    is_active?: boolean;
    valid_until?: string | null;
  },
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/company-identity/compliance`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      data: {},
      success: false,
      message: "Error upserting company compliance field",
    };
  }
};

export const deleteCompanyComplianceField = async (
  fieldId: string,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/company-identity/compliance/${fieldId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      data: {},
      success: false,
      message: "Error deleting company compliance field",
    };
  }
};

//  Company Document Config

export const fetchCompanyDocumentConfig = async (
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/company-identity/document-config`,
      {
        ...getCacheConfig(3600),
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) return { data: null };
    return res.json();
  } catch (error) {
    return { data: null };
  }
};

export const upsertCompanyDocumentConfig = async (
  payload: FormData,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/company-identity/document-config`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      },
    );
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      data: {},
      success: false,
      message: "Error upserting company document config",
    };
  }
};

//  Product Policies â”

export const fetchProductPolicies = async (
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/product-policies`, {
      cache: "no-store",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch (error) {
    return { data: [] };
  }
};

export const fetchProductPolicyById = async (
  id: string,
  token: string,
  companyId: string,
) => {
  const res = await fetch(`${BASE_API_URL}/v1/product-policies/${id}`, {
    cache: "no-store",
    credentials: "include",
    headers: {
      "company-id": companyId || "",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return { data: null };
  return res.json();
};

export const createProductPolicy = async (
  payload: any,
  token: string,
  companyId: string,
) => {
  const res = await fetch(`${BASE_API_URL}/v1/product-policies`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "company-id": companyId || "",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  revalidatePath("/vendor");
  return res.json();
};

export const updateProductPolicy = async (
  id: string,
  payload: any,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/product-policies/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      data: {},
      success: false,
      message: "Error updating product policy",
    };
  }
};

export const deleteProductPolicy = async (
  id: string,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/product-policies/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      data: {},
      success: false,
      message: "Error deleting product policy",
    };
  }
};

//  Category Policy Assignments â”

export const assignPolicyToCategory = async (
  payload: { category_id: string; policy_id: string; priority?: number },
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/category-assign`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      data: {},
      success: false,
      message: "Error assigning policy to category",
    };
  }
};

export const fetchAssignedProductPolicyOverride = async (
  payload: {
    product_id: string;
    policy_id: string;
    overrides_category?: boolean;
  },
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/product-override`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      data: {},
      success: false,
      message: "Error fetching assigned product policy override",
    };
  }
};

export const fetchCategoryPolicies = async (
  categoryId: string,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/category/${categoryId}`,
      {
        cache: "no-store",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) return { data: [] };
    return res.json();
  } catch (error) {
    return { data: [] };
  }
};

export const assignPolicyToCategories = async (
  payload: { category_id: string; policy_id: string; priority?: number },
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/category-assign`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      data: {},
      success: false,
      message: "Error assigning policy to categories",
    };
  }
};

export const removePolicyFromCategory = async (
  assignmentId: string,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/category-assign/${assignmentId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      data: {},
      success: false,
      message: "Error removing policy from category",
    };
  }
};

//  Product Policy Overrides â”

export const fetchProductPolicyOverrides = async (
  productId: string,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/product-override/${productId}`,
      {
        cache: "no-store",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) return { data: [] };
    return res.json();
  } catch (error) {
    return { data: [] };
  }
};

export const fetchCreateAssignedProductPolicyOverride = async (
  payload: {
    product_id: string;
    policy_id: string;
    overrides_category?: boolean;
  },
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/product-override`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      data: {},
      success: false,
      message: "Error creating assigned product policy override",
    };
  }
};

export const removeProductPolicyOverride = async (
  overrideId: string,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/product-override/${overrideId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      data: {},
      success: false,
      message: "Error removing product policy override",
    };
  }
};

//  Policy Coverage Aggregation

export const fetchPolicyCoverageOverview = async (
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/coverage/overview`,
      {
        cache: "no-store",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) return { data: [] };
    return res.json();
  } catch (error) {
    return { data: [] };
  }
};

export const fetchPolicyCoverageDetails = async (
  policyId: string,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/coverage/${policyId}`,
      {
        cache: "no-store",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) return { data: null };
    return res.json();
  } catch (error) {
    return { data: null };
  }
};

export const fetchRevenueAnalytics = async (
  token: string,
  days: number = 30,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/orders/analytics/revenue?days=${days}`,
      {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "company-id": companyId || "",
        },
      },
    );
    // if (!res.ok) return { data: null };
    return res.json();
  } catch (error) {
    return { data: null };
  }
};
export const fetchTopProducts = async (token: string, companyId: string) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/orders/analytics/top-products`,
      {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "company-id": companyId || "",
        },
      },
    );
    return res.json();
  } catch (error) {
    return { data: [] };
  }
};

export const fetchAllComplianceRegistrations = async (
  token: string,
  companyId: string,
): Promise<{ success: boolean; data: ComplianceField[] }> => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/compliance-registration`, {
      cache: "no-store",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return { success: false, data: [] };
    return res.json();
  } catch {
    return { success: false, data: [] };
  }
};

export const registerComplianceField = async (
  payload: ComplianceFieldPayload,
  token: string,
  companyId: string,
): Promise<{
  success: boolean;
  data?: CompanyComplianceField;
  message?: string;
}> => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/compliance`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    revalidatePath("/vendor");
    return res.json();
  } catch (err) {
    return { success: false, message: "Failed to register compliance field" };
  }
};

//  POST: upload a proof document

export const uploadComplianceProofDocument = async (
  fieldId: string,
  file: File,
  label: string | undefined,
  token: string,
  companyId: string,
): Promise<{
  success: boolean;
  status: string;
  data?: ComplianceDocument | null;
  message?: string;
}> => {
  try {
    const formData = new FormData();
    formData.append("proof_document", file);
    formData.append("compliance_field_id", fieldId);
    if (label) formData.append("label", label);

    const res = await fetch(
      `${BASE_API_URL}/v1/compliance/field/${fieldId}/documents`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );
    revalidatePath("/vendor");
    return res.json();
  } catch (error: any) {
    return {
      data: null,
      status: error.status,
      success: false,
      message: "Failed to upload document",
    };
  }
};

export const fetchStockManagerVariants = async (
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/stock-manager`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching stock manager variants" };
  }
};
export const quickUpdateStock = async (
  productVariantId: string,
  quantity: number,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/inventory/${productVariantId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }), // The backend expects 'quantity'
      },
    );
    revalidatePath("/vendor/products");
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error updating stock" };
  }
};

export const fetchCreateTaxSlab = async (
  formData: any,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/v1/finances/tax-slabs`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error creating tax slab" };
  }
};

export const fetchTaxSlabs = async (
  sortBy: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-slabs?sort_by=${sortBy ?? "desc"}`,
      {
        cache: "no-store",
        method: "GET",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: { data: [] } };
  }
};

export const fetchSingleTaxSlab = async (
  id: string,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-slabs/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: null };
  }
};

export const fetchUpdateTaxSlab = async (
  id: string,
  data: any,
  token: string,
  companyId: string,
) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-slabs/${id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );
    revalidatePath(`/vendor/finances/tax-rates`);
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error updating tax slab" };
  }
};

// ==========================================
// NAVBAR API ENDPOINTS
// ==========================================

export interface UpsertNavMenuPayload {
  logo_src?: string;
  logo_alt?: string;
  logo_href?: string;
  logo_alignment?: NavMenuLogoAlignment;
  position?: NavMenuPosition;
  show_shadow?: boolean;
  show_border?: boolean;
  search_visible?: boolean;
  search_placeholder?: string;
  search_endpoint?: string;
  show_account?: boolean;
  show_wishlist?: boolean;
  show_cart?: boolean;
}

export interface NavItemMetaPayload {
  display_type?: NavItemDisplayType;
  show_category_icons?: boolean;
  parent_category_id?: string;
  col_type?: NavItemColType;
  col_title?: string;
  promo_image_url?: string;
  promo_title?: string;
  promo_subtitle?: string;
  promo_cta_href?: string;
  icon_url?: string;
  route_key?: string;
  product_ids?: string[];
}
export interface CreateNavItemPayload {
  menu_id: string;
  parent_id?: string;
  label: string;
  href: string;
  item_type: NavItemType;
  category_id?: string;
  has_mega_menu: boolean;
  sort_order?: number;
  root_category_id?: string | null;
  meta?: NavItemMetaPayload;
  layout_type?: NavLayoutType;
  target_route?: string;
}

/** GET /v1/navbar â€” public storefront fetch */
export const fetchNavbarConfig = async (companyId: string) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/navbar`, {
      method: "GET",
      credentials: "include",
      headers: { "company-id": companyId || "" },
      next: { revalidate: 60, tags: ["navbar"] },
    });
    return await res.json();
  } catch {
    return null;
  }
};
/** PUT /v1/navbar/menu â€” upsert scalar navbar settings */
export const upsertNavbarMenu = async (
  payload: UpsertNavMenuPayload,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/navbar/menu`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "company-id": companyId || "",
      },
      body: JSON.stringify(payload),
    });
    revalidatePath("/vendor/cms");
    return await res.json();
  } catch {
    return { success: false, message: "Error saving navbar settings" };
  }
};

/** POST /v1/navbar/items â€” create an L1 or L2 nav item */
export const createNavbarItem = async (
  payload: CreateNavItemPayload,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/navbar/items`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "company-id": companyId || "",
      },
      body: JSON.stringify(payload),
    });
    revalidatePath("/vendor/cms");

    return await res.json();
  } catch {
    return { success: false, message: "Error creating nav item" };
  }
};

/** PATCH /v1/navbar/items/:id â€” partial update */
export const updateNavbarItem = async (
  id: string,
  payload: Partial<CreateNavItemPayload>,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/navbar/items/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "company-id": companyId || "",
      },
      body: JSON.stringify(payload),
    });
    revalidatePath("/vendor/cms");

    return await res.json();
  } catch {
    return { success: false, message: "Error updating nav item" };
  }
};

/** DELETE /v1/navbar/items/:id */
export const deleteNavbarItem = async (
  id: string,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/navbar/items/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "company-id": companyId || "",
      },
    });
    revalidatePath("/vendor/cms");

    return await res.json();
  } catch {
    return { success: false, message: "Error deleting nav item" };
  }
};

/** PUT /v1/navbar/items/reorder â€” bulk sort_order update */
export const reorderNavbarItems = async (
  items: { id: string; sort_order: number }[],
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/navbar/items/reorder`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "company-id": companyId || "",
      },
      body: JSON.stringify({ items }),
    });
    revalidatePath("/vendor/cms");
    ("navbar");
    return await res.json();
  } catch {
    return { success: false, message: "Error reordering nav items" };
  }
};

// ==========================================
// SHIPPING LOGISTICS API ENDPOINTS
// ==========================================

export const fetchShippingSettings = async (
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/shipping/settings`, {
      cache: "no-store",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return { data: null };
    return res.json();
  } catch (error) {
    return { data: null, message: "Error fetching shipping settings" };
  }
};

export const updateShippingSettings = async (
  payload: any,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/shipping/settings`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      success: false,
      message: "Error updating shipping settings",
    };
  }
};

export const fetchLogisticCompanies = async (
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/vendor/shipping/logistic-companies`,
      {
        cache: "no-store",
        credentials: "include",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      return { data: [] };
    }
    const json = await res.json();

    return json;
  } catch (error) {
    return { data: [], message: "Error fetching logistic companies" };
  }
};

export const fetchVendorShippingPreferences = async (
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/vendor/shipping/preferences`, {
      cache: "no-store",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return { data: null };
    return res.json();
  } catch (error) {
    return { data: null, message: "Error fetching shipping preferences" };
  }
};

export const updateVendorShippingPreferences = async (
  payload: any,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/vendor/shipping/preferences`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return { success: false, message: "Error updating shipping preferences" };
  }
};

export const fetchCalculateShippingRates = async (
  payload: any,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/vendor/shipping/calculate-rates`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    return res.json();
  } catch (error) {
    return { data: null, message: "Error calculating shipping rates" };
  }
};

// ==========================================
// VENDOR PAYMENTS CONFIG API ENDPOINTS
// ==========================================

export const fetchVendorPaymentConfig = async (
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/vendor/payment/config`, {
      cache: "no-store",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
};

export const updateVendorPaymentConfig = async (
  payload: any,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/vendor/payment/config`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    revalidatePath("/vendor");
    return res.json();
  } catch (error) {
    return {
      success: false,
      message: "Error updating payment configuration",
    };
  }
};
// ==========================================
// SUBSCRIPTION APIS
// ==========================================

export const getAvailableSubscriptionPlans = async (companyId: string) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/subscription/plans`, {
      method: "GET",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch available plans");
    return res.json();
  } catch (error) {
    return null;
  }
};

export const getSubscriptionStatus = async (
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/subscription/status`, {
      method: "GET",
      credentials: "include",
      headers: {
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Failed to fetch subscription status");
    return res.json();
  } catch (error) {
    return null;
  }
};

export const upgradeSubscriptionPlan = async (
  token: string,
  plan_id: string,
  companyId: string,
) => {
  try {
    const res = await fetch(`${BASE_API_URL}/v1/subscription/upgrade`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan_id }),
    });
    return res.json();
  } catch (error) {
    return {
      success: false,
      message: "Error upgrading subscription plan",
    };
  }
};

export const getVendorEarnings = async (
  search: string,
  offset: number,
  limit: number,
  status: string,
  date: string,
  sortBy: string,
  token: string,
  companyId: string,
) => {
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/finances/earnings?search=${search}&offset=${offset}&limit=${limit}&status=${status}&date=${date}&sortby=${sortBy}`,
      {
        method: "GET",
        headers: {
          "company-id": companyId || "",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch earnings");
    }
    return res.json();
  } catch (error) {
    throw error;
  }
};
