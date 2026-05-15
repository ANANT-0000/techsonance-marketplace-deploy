import axios from 'axios';
import { ACCESS_TOKEN_KEY, USER_STORAGE_KEY, IS_AUTHENTICATED_KEY, CART_KEY, BASE_API_URL } from '@/constants';
import { getCompanyDomain } from './get-domain';

// Create a base Axios instance
const AxiosAPI = axios.create({
    baseURL: BASE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'company-domain': await getCompanyDomain()
    },
    withCredentials: true
});

// ==========================================
// 1. REQUEST INTERCEPTOR (Outgoing)
// ==========================================
let domainCache: string | null = null;
AxiosAPI.interceptors.request.use(async (config) => {
        // Only access localStorage if we are on the client side (browser)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(ACCESS_TOKEN_KEY);
            // If a token exists, attach it to the Authorization header
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
             if (!domainCache){ domainCache = await getCompanyDomain();}
  config.headers['company-domain'] = domainCache;
}
return config;
    },
    (error) => {
        return Promise.reject(error);
    }
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
            console.warn("Token expired or unauthorized. Logging out...");
            if (typeof window !== 'undefined') {
                // Nuke all auth data from storage
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(USER_STORAGE_KEY);
                localStorage.removeItem(IS_AUTHENTICATED_KEY);
                localStorage.removeItem(CART_KEY);
                // Figure out where to kick the user based on their current URL
                const currentPath = window.location.pathname;
                if (currentPath.includes('/admin')) {
                    window.location.href = '/auth/adminLogin';
                } else if (currentPath.includes('/vendor')) {
                    window.location.href = '/auth/vendorLogin';
                } else {
                    window.location.href = '/auth/customerLogin';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default AxiosAPI 