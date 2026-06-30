import { BASE_API_URL } from "@/constants";
import { getCompanyDomain } from "@/lib/get-domain";
import { getCacheConfig } from "./cache";

export const fetchProduct = async (productId: string) => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(`${BASE_API_URL}/v1/products/${productId}`, {
      method: "GET",
      ...getCacheConfig(300),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
      },
    });
    if (response.status !== 200) {
    }
    return await response.json();
  } catch (error) {
    // ignore
  }
};
export const fetchProductVariantDetails = async (id: string) => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(
      `${BASE_API_URL}/v1/product-variant/details/${id}`,
      {
        method: "GET",
        ...getCacheConfig(300),
        credentials: "include",
      headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
        },
      },
    );

    const result = await response.json();

    if (response.status !== 200) {
      // handle non-200 silently
    }

    return {
      data: result.data,
      success: response.status === 200,
      message:
        result?.message || (response.status === 200 ? "Success" : "Failed"),
    };
  } catch (error) {
    return { data: undefined, success: false, message: "Error occurred" };
  }
};
// ─── Primary products fetch — supports all query params ──────────────────────
export type SortBy =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "discount";
export interface ProductQueryParams {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: SortBy;
  offset?: number;
  limit?: number;
}

export interface ProductsResponse {
  data: any[];
  total: number;
  offset: number;
  limit: number;
  totalPages: number;
}
export const fetchProducts = async (
  params: ProductQueryParams = {},
): Promise<ProductsResponse> => {
  const companyDomain = await getCompanyDomain();

  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.category) searchParams.set("category", params.category);
  if (params.min_price !== undefined)
    searchParams.set("min_price", String(params.min_price));
  if (params.max_price !== undefined)
    searchParams.set("max_price", String(params.max_price));
  if (params.sort_by) searchParams.set("sort_by", params.sort_by);
  if (params.offset !== undefined)
    searchParams.set("offset", String(params.offset));
  if (params.limit !== undefined)
    searchParams.set("limit", String(params.limit));

  const qs = searchParams.toString();
  const url = `${BASE_API_URL}/v1/products/all${qs ? `?${qs}` : ""}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
      },
    });
    if (response.status !== 200) {
      return { data: [], total: 0, offset: 0, limit: 12, totalPages: 0 };
    }
    const json = await response.json();
    const payload = json?.data ?? json;

    if (Array.isArray(payload)) {
      return {
        data: payload,
        total: payload.length,
        offset: 0,
        limit: payload.length,
        totalPages: 1,
      };
    }
    return payload;
  } catch (error) {
    return { data: [], total: 0, offset: 0, limit: 12, totalPages: 0 };
  }
};
export const fetchProductProducts = async (
  params: ProductQueryParams = {},
): Promise<ProductsResponse> => {
  const companyDomain = await getCompanyDomain();

  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.category) searchParams.set("category", params.category);
  if (params.min_price !== undefined)
    searchParams.set("min_price", String(params.min_price));
  if (params.max_price !== undefined)
    searchParams.set("max_price", String(params.max_price));
  if (params.sort_by) searchParams.set("sort_by", params.sort_by);
  if (params.offset !== undefined)
    searchParams.set("offset", String(params.offset));
  if (params.limit !== undefined)
    searchParams.set("limit", String(params.limit));

  const qs = searchParams.toString();
  const url = `${BASE_API_URL}/v1/products/all${qs ? `?${qs}` : ""}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
      },
    });
    if (response.status !== 200) {
      return { data: [], total: 0, offset: 0, limit: 12, totalPages: 0 };
    }
    const json = await response.json();
    const payload = json?.data ?? json;

    if (Array.isArray(payload)) {
      return {
        data: payload,
        total: payload.length,
        offset: 0,
        limit: payload.length,
        totalPages: 1,
      };
    }
    return payload;
  } catch (error) {
    return { data: [], total: 0, offset: 0, limit: 12, totalPages: 0 };
  }
};

export const fetchProductOptions = async (): Promise<
  { id: string; name: string }[]
> => {
  try {
    const companyDomain = await getCompanyDomain();
    const response = await fetch(`${BASE_API_URL}/v1/products/options`, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
      },
    });
    if (response.status !== 200) {
      return [];
    }
    const json = await response.json();
    return json?.data ?? json ?? [];
  } catch (error) {
    return [];
  }
};

export const fetchProductSuggestions = async (
  search: string,
): Promise<{ id: string; name: string }[]> => {
  if (!search || search.trim().length < 2) return [];
  try {
    const options = await fetchProductOptions();
    const term = search.trim().toLowerCase();
    return options
      .filter((opt) => opt.name.toLowerCase().includes(term))
      .slice(0, 8);
  } catch {
    return [];
  }
};

export const fetchHomepageProducts = async (
  limit: number = 8,
): Promise<{ data: any[] }> => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(
      `${BASE_API_URL}/v1/products/homepage?limit=${limit}`,
      {
        method: "GET",
        ...getCacheConfig(300),
        credentials: "include",
      headers: {
          "Content-Type": "application/json",
          "company-domain": companyDomain,
        },
      },
    );
    if (response.status !== 200) {
      return { data: [] };
    }
    return await response.json();
  } catch (error) {
    return { data: [] };
  }
};

export const fetchCategory = async (category: string) => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(`${BASE_API_URL}/v1/categories/${category}`, {
      method: "GET",
      ...getCacheConfig(300),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
      },
    });
    if (response.status !== 200) {
      return null;
    }
    const json = await response.json();
    const data = json?.data ?? json;
    // The endpoint returns an array of categories, get the first element
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    return null;
  }
};

export const fetchCategories = async (): Promise<any[]> => {
  const companyDomain = await getCompanyDomain();
  try {
    const response = await fetch(`${BASE_API_URL}/v1/categories?limit=100`, {
      method: "GET",
      ...getCacheConfig(300),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "company-domain": companyDomain,
      },
    });
    if (response.status !== 200) {
      return [];
    }
    const json = await response.json();
    return json?.data ?? json ?? [];
  } catch (error) {
    return [];
  }
};
