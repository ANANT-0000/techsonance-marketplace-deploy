import type { Link } from "@/components/common/InnerSideBar.tsx";
// Base URLs from environment variables//
export const VENDOR_BASE_URL = process.env.NEXT_PUBLIC_VENDOR_URL;
export const CUSTOMER_BASE_URL = process.env.NEXT_PUBLIC_USER_BASE_URL;
export const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_BASE_URL;
export const VENDOR_AUTH_URL = process.env.NEXT_PUBLIC_VENDOR_AUTH_URL;
export const CUSTOMER_AUTH_URL = process.env.NEXT_PUBLIC_USER_AUTH_URL;
export const ADMIN_AUTH_URL = process.env.NEXT_PUBLIC_ADMIN_AUTH_URL;
export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;


// Asset paths (served from /public/assets/)
const BRAND_LOGO = "/assets/e-commerce_brand_logo.png";
const CUSTOMER_LOGIN_POSTER = "/assets/customer form poster 2.png";
const TS_LOGO = "/assets/TS_Logo.png";
const BAR_TOGGLE_ICON = "/assets/bar toggle icon.png";
const vendor_icon = "/assets/vendor icon.png";
const customers_icon = "/assets/customers icon.png";
const analytics_icon = "/assets/analytics icon.png";
const settings_icon = "/assets/settings icon.png";
const customer_care_icon = "/assets/customer care icon.png";
const dashboard_icon = "/assets/dashboard icon.png";
const searchImgDark = "/assets/Search dark.png";
const searchImgLight = "/assets/Search light.png";
const heartLight = "/assets/icons-heart-light.png";
const heartDark = "/assets/icons-heart-dark.png";
const cartImgDark = "/assets/shoppingCart.png";
const userIcon = "/assets/user icon.png";
const delete_icon = "/assets/delete_icon.png";
const arrow = "/assets/arrow_icon.png";
const down_arrow = "/assets/down_arrow.png";
const internet_icon = "/assets/internet_icon.png";
const file_icon = "/assets/file_icon.png";
const product_icon = "/assets/box_icon.png";
const order_icon = "/assets/order_icon.png";
const marketing_icon = "/assets/marketing_icon.png";
const finance_icon = "/assets/finance_icon.png";
const inventory_icon = "/assets/notes_icon.png";
// Social Media Icons
const instagram = "/assets/instagram icon.png";
const facebook = "/assets/facebook icon.png";
const youtube = "/assets/youtube icon.png";
// Theme Toggle Icons
const toggle_light = "/assets/toggle-light.png";
const toggle_dark = "/assets/toggle-dark.png";
const replacement_icon = "/assets/replacement icon.png";

import { Product, UserRole } from "../utils/Types"

export { UserRole };

export const COUNTRY_CODES = [
    { value: "+1", label: "🇺🇸 +1" }, // United States / Canada
    { value: "+44", label: "🇬🇧 +44" }, // United Kingdom
    { value: "+91", label: "🇮🇳 +91" }, // India
    { value: "+61", label: "🇦🇺 +61" }, // Australia
    { value: "+33", label: "🇫🇷 +33" }, // France
    { value: "+49", label: "🇩🇪 +49" }, // Germany
    { value: "+81", label: "🇯🇵 +81" }, // Japan
    { value: "+86", label: "🇨🇳 +86" }, // China
    { value: "+55", label: "🇧🇷 +55" }, // Brazil
    { value: "+52", label: "🇲🇽 +52" }, // Mexico
    { value: "+27", label: "🇿🇦 +27" }, // South Africa
    { value: "+971", label: "🇦🇪 +971" }, // United Arab Emirates
];
export const productData: Product[] = [
    {
        "id": "prod-001",
        "productName": "Noise Air Clips Wireless Open Ear Earbuds",
        "sku": "AUD-MIC-001",
        "stock": 90,
        "price": 8999,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-MIC-001/200/200"
    },
    {
        "id": "prod-002",
        "productName": "boAt 2025 Launch Rockerz 113",
        "sku": "AUD-HDP-002",
        "stock": 183,
        "price": 2099,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-HDP-002/200/200"
    },
    {
        "id": "prod-003",
        "productName": "Noise Airwave Bluetooth in Ear Neckband",
        "sku": "AUD-SPK-003",
        "stock": 45,
        "price": 12999,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-SPK-003/200/200"
    },
    {
        "id": "prod-004",
        "productName": "OnePlus Bullets Wireless Z3 in-Ear Neckband",
        "sku": "AUD-SND-004",
        "stock": 46,
        "price": 4099,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-SND-004/200/200"
    },
    {
        "id": "prod-005",
        "productName": "pTron Tangent Buzz w",
        "sku": "AUD-SND-005",
        "stock": 22,
        "price": 4099,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-SND-005/200/200"
    },
    {
        "id": "prod-006",
        "productName": "ZEBRONICS Duke Plus, Wireless Over Ear Headphone",
        "sku": "AUD-SND-006",
        "stock": 196,
        "price": 1299,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-SND-006/200/200"
    },
    {
        "id": "prod-007",
        "productName": "Sony WF-C510 Wireless Bluetooth Earbuds",
        "sku": "AUD-SND-007",
        "stock": 172,
        "price": 3499,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-SND-007/200/200"
    },
    {
        "id": "prod-008",
        "productName": "Boat New Launch Rockerz 650 Pro",
        "sku": "AUD-SND-008",
        "stock": 237,
        "price": 3499,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-SND-008/200/200"
    },
    {
        "id": "prod-009",
        "productName": "JBL Tune 760NC",
        "sku": "AUD-HDP-009",
        "stock": 36,
        "price": 2099,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-HDP-009/200/200"
    },
    {
        "id": "prod-010",
        "productName": "Sennheiser Momentum 4",
        "sku": "AUD-HDP-010",
        "stock": 183,
        "price": 4099,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-HDP-010/200/200"
    },
    {
        "id": "prod-011",
        "productName": "Samsung Galaxy Buds2 Pro",
        "sku": "AUD-WLS-011",
        "stock": 91,
        "price": 1499,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-WLS-011/200/200"
    },
    {
        "id": "prod-012",
        "id": "prod-012",
        "productName": "Bose QuietComfort Ultra",
        "sku": "AUD-HDP-012",
        "stock": 198,
        "price": 2099,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-HDP-012/200/200"
    },
    {
        "id": "prod-013",
        "productName": "Realme Buds Air 5",
        "sku": "AUD-WLS-013",
        "stock": 197,
        "price": 24999,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-WLS-013/200/200"
    },
    {
        "id": "prod-014",
        "productName": "Skullcandy Crusher ANC 2",
        "sku": "AUD-SND-014",
        "stock": 181,
        "price": 12999,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-SND-014/200/200"
    },
    {
        "id": "prod-015",
        "productName": "Marshall Major IV",
        "sku": "AUD-HDP-015",
        "stock": 248,
        "price": 12999,
        "status": "Active",
        "imageUrl": "https://picsum.photos/seed/AUD-HDP-015/200/200"
    }
]
export interface NavLinkType {
    [key: string]: string;
}
export const VENDOR_NAV_LINKS: NavLinkType[] = [
    { Dashboard: '/vendor', icon: dashboard_icon },
    { Products: '/vendor/products', icon: product_icon },
    { Orders: '/vendor/orders', icon: order_icon },
    { Inventory: '/vendor/inventory', icon: inventory_icon },
    { Analytics: '/vendor/finances', icon: finance_icon },
    { Marketing: '/vendor/marketing', icon: marketing_icon },
    { 'Customer Care': '/vendor/customerCare', icon: customer_care_icon },
    { Settings: '/vendor/settings', icon: settings_icon },
]

export const ADMIN_NAV_LINKS: NavLinkType[] = [
    { Dashboard: '/admin', icon: dashboard_icon },
    { Vendor: '/admin/vendorManagement', icon: vendor_icon },
    // { Customers: '/admin/customers', icon: customers_icon },
    { Analytics: '/admin/auditLog', icon: analytics_icon },
    { "Support Tickets": '/admin/supportTickets', icon: customer_care_icon },
    { Settings: '/admin/settings', icon: settings_icon },
]

export const VENDOR_SETTINGS_LINKS: Link[] = [
    {
        section: "general",
        list: [
            { title: 'Store Profile', path: '/vendor/settings', icon: 'profile' },
            { title: 'Locations & Warehouses', path: '/vendor/settings/locations', icon: 'locations' },

        ],
    },
    {
        section: "organization",
        list: [
            { title: 'Billing & Banking', path: '/vendor/settings/billing', icon: 'billing' },
        ],
    },
    {
        section: "account",
        list: [
            { title: 'Business Profile', path: '/vendor/settings/businessProfile', icon: 'businessProfile' },
            { title: 'Security & Password', path: '/vendor/settings/security', icon: 'usersRoles' },
            // { title: 'Preferences', path: '/vendor/settings/preferences', icon: 'preferences' },

        ]
    }
]




//Customer Home hero title and description
export const HOME_HERO_TITLE = "Welcome to Sound Sphere - Your Ultimate Music Marketplace";
export const HOME_HERO_DESC = "Discover, buy, and sell music products with ease. Join our vibrant community of music lovers and elevate your sound experience today!";



// Exporting all constants
export { CUSTOMER_LOGIN_POSTER, BRAND_LOGO, BAR_TOGGLE_ICON, TS_LOGO, toggle_light, toggle_dark, vendor_icon, customers_icon, analytics_icon, settings_icon, customer_care_icon, dashboard_icon, instagram, facebook, youtube, searchImgDark, searchImgLight, heartLight, heartDark, cartImgDark, userIcon, delete_icon, arrow, down_arrow, internet_icon, file_icon, replacement_icon };
