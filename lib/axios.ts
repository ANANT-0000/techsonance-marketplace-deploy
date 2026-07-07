import axios from "axios";
import {
  USER_STORAGE_KEY,
  IS_AUTHENTICATED_KEY,
  CART_KEY,
  BASE_API_URL,
  ACCESS_TOKEN_KEY,
} from "@/constants";
import { getCompanyDomain } from "./get-domain";

import {
  ClientActionCode,
  SanitizedErrorResponse,
} from "@/utils/error/error.types";
import toast from "react-hot-toast";

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
      if (!domainCache) {
        domainCache = await getCompanyDomain();
      }
      config.headers["company-domain"] = domainCache;

      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token && token !== "undefined" && token !== "null") {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
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
    let suppressToast = false;
    if (error.config?.headers) {
      if (typeof error.config.headers.get === "function") {
        suppressToast = error.config.headers.get("x-suppress-toast") === "true";
      } else {
        suppressToast =
          error.config.headers["x-suppress-toast"] === "true" ||
          error.config.headers["x-suppress-toast"] === true;
      }
    }

    if (!suppressToast) {
      if (error.response && error.response.data) {
        const { message, action, errorCode, statusCode } = error.response
          .data as SanitizedErrorResponse;
        switch (action) {
          case ClientActionCode.RETRY:
            toast.error(`${message} Click to retry.`);
            break;
          case ClientActionCode.UPDATE_INPUT:
            toast.error(message || "Please check your entries.");
            break;
          case ClientActionCode.NAVIGATE_HOME:
            toast.error(message);
            window.location.href = "/";
            break;
          case ClientActionCode.CONTACT_SUPPORT:
            toast.error(`${message} (Error Ref: ${errorCode})`);
            break;
          default:
            toast.error(
              message || "An unexpected error occurred. Please try again.",
            );
        }
      } else {
        toast.error("Network connectivity issue. Please try again.");
      }
    }
    return Promise.reject(error);
  },
);

export default AxiosAPI;
