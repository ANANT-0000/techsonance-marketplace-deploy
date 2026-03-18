import type { Link } from "@/components/common/InnerSideBar";

// ============================================================
// ASSET PATHS (served from /public/assets/)
// ============================================================

export const BRAND_LOGO = "/assets/e-commerce_brand_logo.png";
export const CUSTOMER_LOGIN_POSTER = "/assets/customer form poster 2.png";
export const TS_LOGO = "/assets/TS_Logo.png";
export const BAR_TOGGLE_ICON = "/assets/bar toggle icon.png";

// Role Icons
export const vendor_icon = "/assets/vendor icon.png";
export const customers_icon = "/assets/customers icon.png";
export const analytics_icon = "/assets/analytics icon.png";
export const settings_icon = "/assets/settings icon.png";
export const customer_care_icon = "/assets/customer care icon.png";
export const dashboard_icon = "/assets/dashboard icon.png";

// Search / UI Icons
export const searchImgDark = "/assets/Search dark.png";
export const searchImgLight = "/assets/Search light.png";
export const heartLight = "/assets/icons-heart-light.png";
export const heartDark = "/assets/icons-heart-dark.png";
export const cartImgDark = "/assets/shoppingCart.png";
export const userIcon = "/assets/user icon.png";
export const delete_icon = "/assets/delete_icon.png";
export const arrow = "/assets/arrow_icon.png";
export const down_arrow = "/assets/down_arrow.png";
export const internet_icon = "/assets/internet_icon.png";
export const file_icon = "/assets/file_icon.png";
export const product_icon = "/assets/box_icon.png";
export const order_icon = "/assets/order_icon.png";
export const marketing_icon = "/assets/marketing_icon.png";
export const finance_icon = "/assets/finance_icon.png";
export const inventory_icon = "/assets/notes_icon.png";
export const replacement_icon = "/assets/replacement icon.png";

// Social Media Icons
export const instagram = "/assets/instagram icon.png";
export const facebook = "/assets/facebook icon.png";
export const youtube = "/assets/youtube icon.png";

// Theme Toggle Icons
export const toggle_light = "/assets/toggle-light.png";
export const toggle_dark = "/assets/toggle-dark.png";

// ============================================================
// TYPES  (Re-exported from utils/Types.ts)
// ============================================================

export { UserRole } from "@/utils/Types";
export type { UserProfile, Address, Cart, CartItem, Wishlist, UserOrder, OrderStatus, Order, Permission, RoleDefinition } from "@/utils/Types";

// ============================================================
// SHARED INTERFACES
// ============================================================

export interface NavLinkType {
  [key: string]: string;
}

export interface FooterLinkType {
  title: string;
  url: string;
  icon?: string;
  styles?: string;
  category?: string;
}

export interface FooterSectionType {
  header: string;
  links: FooterLinkType[];
}

export interface tabLinkType {
  [key: string]: string;
}

// ============================================================
// COUNTRY CODES
// ============================================================

export const COUNTRY_CODES = [
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+44", label: "🇬🇧 +44" },
  { value: "+91", label: "🇮🇳 +91" },
  { value: "+61", label: "🇦🇺 +61" },
  { value: "+33", label: "🇫🇷 +33" },
  { value: "+49", label: "🇩🇪 +49" },
  { value: "+81", label: "🇯🇵 +81" },
  { value: "+86", label: "🇨🇳 +86" },
  { value: "+55", label: "🇧🇷 +55" },
  { value: "+52", label: "🇲🇽 +52" },
  { value: "+27", label: "🇿🇦 +27" },
  { value: "+971", label: "🇦🇪 +971" },
];

// ============================================================
// BASE URLs (from environment variables)
// ============================================================

export const VENDOR_BASE_URL = process.env.NEXT_PUBLIC_VENDOR_AUTH_URL;
export const CUSTOMER_BASE_URL = process.env.NEXT_PUBLIC_CUSTOMER_BASE_URL;
export const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_BASE_URL;
export const VENDOR_AUTH_URL = process.env.NEXT_PUBLIC_VENDOR_AUTH_URL;
export const CUSTOMER_AUTH_URL = process.env.NEXT_PUBLIC_CUSTOMER_BASE_URL;

// ============================================================
// HERO / HOME CONTENT
// ============================================================

export const HOME_HERO_TITLE = "Welcome to Sound Sphere - Your Ultimate Music Marketplace";
export const HOME_HERO_DESC = "Discover, buy, and sell music products with ease. Join our vibrant community of music lovers and elevate your sound experience today!";
