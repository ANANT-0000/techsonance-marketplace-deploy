"use server";
import { BASE_API_URL } from "@/constants";
import { revalidatePath } from "next/cache";
import { getCompanyDomain } from "@/lib/get-domain";
import {
  CompanyComplianceField,
  ComplianceDocument,
  ComplianceField,
  ComplianceFieldPayload,
  NavItemColType,
  NavItemDisplayType,
  NavItemType,
  NavMenuLogoAlignment,
  NavMenuPosition,
  OrderStatus,
  ReturnStatus,
} from "./Types";

// ==========================================
// CATEGORY API ENDPOINTS
// ==========================================

export const fetchVendorsProductsCategory = async (token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/categories`, {
      method: "GET",
      // cache: 'force-cache',
      // next: { revalidate: 360 },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "company-domain": companyDomain,
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
  },
  token: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "company-domain": companyDomain,
      },
      body: JSON.stringify({ category: categoryData }),
    });
    if (response.status !== 201) {
      return { data: {}, message: "Failed to create product category" };
    }
    // revalidatePath('/vendor/products/categories');
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
  },
  token: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/categories/${categoryId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "company-domain": companyDomain,
        },
        body: JSON.stringify({ category: categoryData }),
      },
    );
    revalidatePath("/vendor/products/categories");
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error updating product category" };
  }
};
export const deleteVendorProductCategory = async (
  categoryId: string,
  token: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/categories/${categoryId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "company-domain": companyDomain,
        },
      },
    );
    if (response.status !== 200) {
      return {
        status: response.status,
        message: "Failed to delete product category",
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
) => {
  try {
    const companyDomain = await getCompanyDomain();

    const response = await fetch(`${BASE_API_URL}/v1/products/${vendorId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "company-domain": companyDomain,
      },
      body: productData,
    });
    if (!response.ok) {
      return { status: response.status, statusText: response.statusText };
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/products/${productId}`, {
      method: "PATCH",
      body: formData,
      headers: {
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return { status: response.status, statusText: response.statusText };
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/update-status/${productVariantId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
        headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      return { status: response.status, statusText: response.statusText };
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/products/vendor-products?offset=${offset}&limit=${limit}&search=${search ?? null}&category=${category ?? null}&status=${status ?? null}`,
      {
        method: "GET",
        // cache: 'force-cache',
        // next: { revalidate: 3600 },
        headers: {
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching products" };
  }
};
export const fetchVendorProductsOptions = async (token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/products/options`, {
      method: "GET",
      // cache: 'force-cache',
      // next: { revalidate: 3600 },
      headers: {
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching products" };
  }
};
export const fetchVendorActiveProducts = async (token: string) => {
  const cleanToken = token.replace(/['"]+/g, "");
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/products/active`, {
      method: "GET",
      cache: "no-cache",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "company-domain": companyDomain,
      },
    });
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching products" };
  }
};
export const fetchVendorOneProducts = async (id: string, token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/products/${id}/details`, {
      method: "GET",
      cache: "no-cache",
      // next: { revalidate: 3600 },
      headers: {
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
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
export const deleteProduct = async (productId: string, token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/products/${productId}`, {
      method: "DELETE",
      headers: {
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
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
) => {
  try {
    const companyDomain = await getCompanyDomain();

    const response = await fetch(`${BASE_API_URL}/v1/product-variant`, {
      method: "POST",
      body: variantData,
      headers: {
        Authorization: `Bearer ${token}`,
        "company-domain": companyDomain,
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
) => {
  const companyDomain = await getCompanyDomain();
  const response = await fetch(`${BASE_API_URL}/v1/inventory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "company-domain": companyDomain,
    },
    body: JSON.stringify({ productVariantId, warehouseId, stockQuantity }),
  });
  return response.json();
};
export const fetchLowStockAlerts = async (token: string) => {
  const companyDomain = await getCompanyDomain();
  try {
    const res = await fetch(`${BASE_API_URL}/v1/inventory/alerts/low-stock`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/${variantId}`,
      {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "company-domain": companyDomain,
        },
      },
    );

    if (!response.ok) {
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/${productId}`,
      {
        method: "GET",
        cache: "no-cache",
        // next: { revalidate: 3600 },
        headers: {
          "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/${variantId}`,
      {
        method: "DELETE",
        headers: {
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
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
export const fetchVariant = async (variantId: string, token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/variant/${variantId}`,
      {
        method: "GET",
        headers: {
          "company-domain": companyDomain,
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

export const fetchVendorPendingOrders = async (token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/orders/pending`, {
      method: "GET",
      headers: {
        "company-domain": companyDomain,
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
  offset: number = 0,
  limit: number = 10,
  token: string,
  status?: OrderStatus | undefined,
  sortBy?: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();

    const response = await fetch(
      `${BASE_API_URL}/v1/orders?offset=${offset}&limit=${limit}&status=${status || undefined}&sortBy=${sortBy || undefined}`,
      {
        method: "GET",
        cache: "no-cache",
        headers: {
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status !== 200) {
      return [];
    }
    return await response.json();
  } catch (error) {
    return [];
  }
};
export const fetchVendorOrderDetails = async (
  orderId: string,
  token: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/orders/${orderId}/details`,
      {
        method: "GET",
        cache: "no-cache",
        headers: {
          "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      },
    );
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {}
};
export const fetchAddTrackingUrl = async (
  orderId: string,
  trackingUrl: string,
  token: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/shipping`, {
      method: "POST",
      headers: {
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId: orderId, trackingUrl: trackingUrl }),
    });
    if (response.status !== 201) {
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/shipping/${orderId}`, {
      method: "PATCH",
      headers: {
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trackingUrl: trackingUrl }),
    });
    if (response.status !== 201) {
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/warehouse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/warehouse/${locationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
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
export const fetchVendorWarehouseLocations = async (token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/warehouse`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "company-domain": companyDomain,
      },
    });
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error fetching warehouse locations" };
  }
};
export const fetchVendorWarehouse = async (token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/warehouse/options`, {
      method: "GET",
      cache: "force-cache",
      next: { revalidate: 3600 },
      headers: {
        "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/warehouse/${locationId}`, {
      method: "DELETE",
      headers: {
        "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/address/company`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/address/company/${locationId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
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
export const fetchGetCompanyLocations = async (token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/address/company`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/order-items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
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

export const fetchGetVendorReturnRequests = async (token: string) => {
  try {
    const domain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/returns/vendor`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "company-domain": domain,
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
) => {
  try {
    const domain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/returns/vendor/${returnId}`,
      {
        headers: {
          "company-domain": domain,
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
) => {
  try {
    const domain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/returns/${returnId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "company-domain": domain,
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

export const fetchGetCompanyRefunds = async (token: string) => {
  try {
    const domain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/refunds`, {
      headers: {
        "company-domain": domain,
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
) => {
  try {
    const domain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/company/customers?offset=${offset}&limit=${limit}&status=${status}&sortBy=${sortBy}`,
      {
        cache: "no-store",
        // next: { revalidate: 3600 },
        headers: {
          "company-domain": domain,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: [], message: "Error fetching company customers" };
  }
};
export const FetchSuspendCustomer = async (
  customerId: string,
  token: string,
) => {
  try {
    const domain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/users/${customerId}/suspend`,
      {
        method: "PATCH",
        headers: {
          "company-domain": domain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/invoice/bulk-download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    let url = `${BASE_API_URL}/v1/finances/gst?sort_by=${sortBy}&offset=${offset}&limit=${limit}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    return { data: [] };
  }
};

export const fetchCreateGstRecord = async (formData: any, token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/finances/gst`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-profiles?sort_by=${sortBy}${date ? `&date=${date.toISOString()}` : ""}`,
      {
        method: "GET",
        headers: {
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: [] };
  }
};

export const fetchTaxSlabOptions = async (token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-slab-options`,
      {
        method: "GET",
        headers: {
          "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/product-tax-mappings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/product-tax-bulk-mappings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/product-tax-mappings?offset=${offSet}&sort_by=${sortBy}&status=${statusFilter}`,
      {
        cache: "no-store",
        method: "GET",
        headers: {
          "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/gst-invoices?offset=${offset}&limit=${limit}&search=${search}&sort_by=${sortBy}${date ? `&date=${date.toISOString()}` : ""}`,
      {
        method: "GET",
        headers: {
          "company-domain": companyDomain,
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

export const fetchCreateTaxProfile = async (formData: any, token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/finances/tax-profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
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

export const fetchSingleGstRecord = async (id: string, token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/finances/gst/${id}`, {
      method: "GET",
      headers: {
        "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/finances/gst/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
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

export const fetchDeleteGstRecord = async (id: string, token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/finances/gst/${id}`, {
      method: "DELETE",
      headers: {
        "company-domain": companyDomain,
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

export const fetchSingleTaxProfile = async (id: string, token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-profiles/${id}`,
      {
        method: "GET",
        headers: {
          "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-profiles/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
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

// ─── Company Branding ─────────────────────────────────────────────────────────

export const fetchCompanyBranding = async (token: string) => {
  const domain = await getCompanyDomain();
  try {
    const res = await fetch(`${BASE_API_URL}/v1/company-identity/branding`, {
      method: "GET",
      cache: "no-store",
      headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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
) => {
  const domain = await getCompanyDomain();
  try {
    const res = await fetch(`${BASE_API_URL}/v1/company-identity/branding`, {
      method: "POST",
      headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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

// ─── Company Legal Profile ────────────────────────────────────────────────────

export const fetchCompanyLegalProfile = async (token: string) => {
  const domain = await getCompanyDomain();
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/company-identity/legal-profile`,
      {
        cache: "force-cache",
        //  revalidate: 3600,
        headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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
) => {
  const domain = await getCompanyDomain();
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/company-identity/legal-profile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company-domain": domain,
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

// ─── Company Compliance ───────────────────────────────────────────────────────

export const fetchCompanyCompliance = async (token: string) => {
  const domain = await getCompanyDomain();
  try {
    const res = await fetch(`${BASE_API_URL}/v1/compliance`, {
      cache: "no-store",
      headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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
) => {
  const domain = await getCompanyDomain();
  try {
    const res = await fetch(`${BASE_API_URL}/v1/company-identity/compliance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "company-domain": domain,
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
) => {
  const domain = await getCompanyDomain();
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/company-identity/compliance/${fieldId}`,
      {
        method: "DELETE",
        headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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

// ─── Company Document Config ──────────────────────────────────────────────────

export const fetchCompanyDocumentConfig = async (token: string) => {
  const domain = await getCompanyDomain();
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/company-identity/document-config`,
      {
        //   cache: 'force-cache',
        //   revalidate: 3600,
        headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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
) => {
  const domain = await getCompanyDomain();
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/company-identity/document-config`,
      {
        method: "POST",
        headers: {
          "company-domain": domain,
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

// ─── Product Policies ─────────────────────────────────────────────────────────

export const fetchProductPolicies = async (token: string) => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(`${BASE_API_URL}/v1/product-policies`, {
      cache: "no-store",
      headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch (error) {
    return { data: [] };
  }
};

export const fetchProductPolicyById = async (id: string, token: string) => {
  const domain = await getCompanyDomain();
  const res = await fetch(`${BASE_API_URL}/v1/product-policies/${id}`, {
    cache: "no-store",
    headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { data: null };
  return res.json();
};

export const createProductPolicy = async (payload: any, token: string) => {
  const domain = await getCompanyDomain();
  const res = await fetch(`${BASE_API_URL}/v1/product-policies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "company-domain": domain,
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
) => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(`${BASE_API_URL}/v1/product-policies/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "company-domain": domain,
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

export const deleteProductPolicy = async (id: string, token: string) => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(`${BASE_API_URL}/v1/product-policies/${id}`, {
      method: "DELETE",
      headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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

// ─── Category Policy Assignments ─────────────────────────────────────────────

export const assignPolicyToCategory = async (
  payload: { category_id: string; policy_id: string; priority?: number },
  token: string,
) => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/category-assign`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company-domain": domain,
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
) => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/product-override`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company-domain": domain,
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
) => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/category/${categoryId}`,
      {
        cache: "no-store",
        headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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
) => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/category-assign`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company-domain": domain,
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
) => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/category-assign/${assignmentId}`,
      {
        method: "DELETE",
        headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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

// ─── Product Policy Overrides ────────────────────────────────────────────────

export const fetchProductPolicyOverrides = async (
  productId: string,
  token: string,
) => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/product-override/${productId}`,
      {
        cache: "no-store",
        headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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
) => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/product-override`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "company-domain": domain,
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
) => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/product-override/${overrideId}`,
      {
        method: "DELETE",
        headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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

// ─── Policy Coverage Aggregation ──────────────────────────────────────────────

export const fetchPolicyCoverageOverview = async (token: string) => {
  const domain = await getCompanyDomain();
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/coverage/overview`,
      {
        cache: "no-store",
        headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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
) => {
  const domain = await getCompanyDomain();
  try {
    const res = await fetch(
      `${BASE_API_URL}/v1/product-policies/coverage/${policyId}`,
      {
        cache: "no-store",
        headers: { "company-domain": domain, Authorization: `Bearer ${token}` },
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const res = await fetch(
      `${BASE_API_URL}/v1/orders/analytics/revenue?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "company-domain": companyDomain,
        },
      },
    );
    // if (!res.ok) return { data: null };
    return res.json();
  } catch (error) {
    return { data: null };
  }
};
export const fetchTopProducts = async (token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const res = await fetch(
      `${BASE_API_URL}/v1/orders/analytics/top-products`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "company-domain": companyDomain,
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
): Promise<{ success: boolean; data: ComplianceField[] }> => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(`${BASE_API_URL}/v1/compliance-registration`, {
      cache: "no-store",
      headers: {
        "company-domain": domain,
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
): Promise<{
  success: boolean;
  data?: CompanyComplianceField;
  message?: string;
}> => {
  try {
    const domain = await getCompanyDomain();
    const res = await fetch(`${BASE_API_URL}/v1/compliance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "company-domain": domain,
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

// ─── POST: upload a proof document ───────────────────────────────────────────

export const uploadComplianceProofDocument = async (
  fieldId: string,
  file: File,
  label: string | undefined,
  token: string,
): Promise<{
  success: boolean;
  status: string;
  data?: ComplianceDocument | null;
  message?: string;
}> => {
  try {
    const domain = await getCompanyDomain();
    const formData = new FormData();
    formData.append("proof_document", file);
    formData.append("compliance_field_id", fieldId);
    if (label) formData.append("label", label);

    const res = await fetch(
      `${BASE_API_URL}/v1/compliance/field/${fieldId}/documents`,
      {
        method: "POST",
        headers: {
          "company-domain": domain,
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

export const fetchStockManagerVariants = async (token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/stock-manager`,
      {
        method: "GET",
        headers: {
          "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/inventory/${productVariantId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
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

export const fetchCreateTaxSlab = async (formData: any, token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/finances/tax-slabs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    return await response.json();
  } catch (error) {
    return { data: {}, message: "Error creating tax slab" };
  }
};

export const fetchTaxSlabs = async (sortBy: string, token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-slabs?sort_by=${sortBy ?? "desc"}`,
      {
        cache: "no-store",
        method: "GET",
        headers: {
          "company-domain": companyDomain,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return await response.json();
  } catch (error) {
    return { data: { data: [] } };
  }
};

export const fetchSingleTaxSlab = async (id: string, token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-slabs/${id}`,
      {
        method: "GET",
        headers: {
          "company-domain": companyDomain,
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
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/finances/tax-slabs/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
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
  meta?: NavItemMetaPayload;
}

/** GET /v1/navbar — public storefront fetch */
export const fetchNavbarConfig = async () => {
  try {
    const companyDomain = await getCompanyDomain();
    const res = await fetch(`${BASE_API_URL}/v1/navbar`, {
      method: "GET",
      headers: { "company-domain": companyDomain },
      next: { revalidate: 60, tags: ["navbar"] },
    });
    return await res.json();
  } catch {
    return null;
  }
};
/** PUT /v1/navbar/menu — upsert scalar navbar settings */
export const upsertNavbarMenu = async (
  payload: UpsertNavMenuPayload,
  token: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const res = await fetch(`${BASE_API_URL}/v1/navbar/menu`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "company-domain": companyDomain,
      },
      body: JSON.stringify(payload),
    });
    revalidatePath("/vendor/cms");
    return await res.json();
  } catch {
    return { success: false, message: "Error saving navbar settings" };
  }
};

/** POST /v1/navbar/items — create an L1 or L2 nav item */
export const createNavbarItem = async (
  payload: CreateNavItemPayload,
  token: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const res = await fetch(`${BASE_API_URL}/v1/navbar/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "company-domain": companyDomain,
      },
      body: JSON.stringify(payload),
    });
    revalidatePath("/vendor/cms");
    return await res.json();
  } catch {
    return { success: false, message: "Error creating nav item" };
  }
};

/** PATCH /v1/navbar/items/:id — partial update */
export const updateNavbarItem = async (
  id: string,
  payload: Partial<CreateNavItemPayload>,
  token: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const res = await fetch(`${BASE_API_URL}/v1/navbar/items/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "company-domain": companyDomain,
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
export const deleteNavbarItem = async (id: string, token: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const res = await fetch(`${BASE_API_URL}/v1/navbar/items/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "company-domain": companyDomain,
      },
    });
    revalidatePath("/vendor/cms");
    return await res.json();
  } catch {
    return { success: false, message: "Error deleting nav item" };
  }
};

/** PUT /v1/navbar/items/reorder — bulk sort_order update */
export const reorderNavbarItems = async (
  items: { id: string; sort_order: number }[],
  token: string,
) => {
  try {
    const companyDomain = await getCompanyDomain();
    const res = await fetch(`${BASE_API_URL}/v1/navbar/items/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "company-domain": companyDomain,
      },
      body: JSON.stringify({ items }),
    });
    revalidatePath("/vendor/cms");
    return await res.json();
  } catch {
    return { success: false, message: "Error reordering nav items" };
  }
};
