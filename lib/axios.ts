import axios from "axios";
import {
  ACCESS_TOKEN_KEY,
  USER_STORAGE_KEY,
  IS_AUTHENTICATED_KEY,
  CART_KEY,
  BASE_API_URL,
} from "@/constants";
import { getCompanyDomain } from "./get-domain";

// Create a base Axios instance
const AxiosAPI = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ==========================================
// 1. REQUEST INTERCEPTOR (Outgoing)
// ==========================================
let domainCache: string | null = null;
AxiosAPI.interceptors.request.use(
  async (config) => {
    // Only access localStorage if we are on the client side (browser)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      // If a token exists, attach it to the Authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (!domainCache) {
        domainCache = await getCompanyDomain();
      }
      config.headers["company-domain"] = domainCache;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ==========================================
// 2. RESPONSE INTERCEPTOR (Incoming)
// ==========================================
AxiosAPI.interceptors.response.use(
  (response: any) => {
    // If the request succeeds, just pass it through
    return response;
  },
  (error) => {
    // If the backend throws a 401 Unauthorized (Expired or Invalid Token)
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        // Only redirect on explicitly protected areas — public storefront
        // pages ("/", "/store", etc.) must never be interrupted
        const isProtectedRoute =
          currentPath.startsWith("/admin") ||
          currentPath.startsWith("/vendor") ||
          currentPath.startsWith("/customer");

        if (isProtectedRoute) {
          // Nuke all auth data from storage
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(IS_AUTHENTICATED_KEY);
          localStorage.removeItem(CART_KEY);
          if (currentPath.startsWith("/admin")) {
            window.location.href = "/auth/adminLogin";
          } else if (currentPath.startsWith("/vendor")) {
            window.location.href = "/auth/vendorLogin";
          } else {
            window.location.href = "/auth/customerLogin";
          }
        }
        // For public routes just let the calling code handle the error
      }
    }
    return Promise.reject(error);
  },
);

export default AxiosAPI;
