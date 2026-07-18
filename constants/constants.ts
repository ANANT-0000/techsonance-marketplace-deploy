export const VENDOR_BASE_URL = process.env.NEXT_PUBLIC_VENDOR_URL;
export const CUSTOMER_BASE_URL = process.env.NEXT_PUBLIC_USER_BASE_URL;
export const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_BASE_URL;
export const VENDOR_AUTH_URL = process.env.NEXT_PUBLIC_VENDOR_AUTH_URL;
export const CUSTOMER_AUTH_URL = process.env.NEXT_PUBLIC_CUSTOMER_AUTH_URL;
export const ADMIN_AUTH_URL = process.env.NEXT_PUBLIC_ADMIN_AUTH_URL;
export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;
export const PLATFORM_BASE_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_BASE_DOMAIN || "platform.com";

export const isClient = typeof window !== "undefined";
export const USER_STORAGE_KEY = "user";
export const ACCESS_TOKEN_KEY = "access_token";
export const PENDING_ACTION_KEY = "pending_action";
export const CART_KEY = "cart";
export const IS_AUTHENTICATED_KEY = "isAuthenticated";
export const WISHLIST_KEY = "wishlist";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const COOKIE_CONSENT_KEY = "cookie_consent";
export const COOKIE_CONSENT_VALUE = "true";

// Branding Default Colors
export const BRANDING_DEFAULT_PRIMARY_COLOR = "#000000";
export const BRANDING_DEFAULT_BACKGROUND_COLOR = "#f8fafc";
export const BRANDING_DEFAULT_TEXT_COLOR = "#0f172a";
export const BRANDING_DEFAULT_WHITE_COLOR = "#ffffff";

// Shared Theme/UI Colors
export const COLOR_BLACK = "#000000";
export const COLOR_WHITE = "#ffffff";
export const COLOR_AMBER = "#f59e0b";
export const COLOR_PINK = "#ec4899";
export const COLOR_DARK_CHARCOAL = "#131921";
export const COLOR_LIGHT_GRAY = "#f3f4f6";

// Razorpay Gateway Configurations
export const RAZORPAY_CURRENCY = "INR";
export const RAZORPAY_MERCHANT_NAME = "Techsonance Marketplace";
export const RAZORPAY_PAYMENT_DESCRIPTION = "Secure Order Payment";
