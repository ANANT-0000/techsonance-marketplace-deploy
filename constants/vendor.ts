import { NavLinkType, StatCardConfig } from "@/utils/Types";
import { CAMPAIGN_ANALYTICS_TEXT } from "./vendorText";
import { CategoryFilterType } from "@/components/vendor/category/CategoryManager";
import { Folder, FolderPlus, Layers, ShoppingBag } from "lucide-react";

//used
export const VendorDocumentTypes: {
  label: string;
  value: string;
  required: boolean;
}[] = [
  {
    label: "Business Registration",
    value: "business_registration",
    required: true,
  },
  {
    label: "Financial Statements",
    value: "financial_statements",
    required: true,
  },
  {
    label: "Insurance Coverage",
    value: "insurance_coverage",
    required: true,
  },
  {
    label: "Compliance Certifications",
    value: "compliance_certifications",
    required: true,
  },
  {
    label: "Security Documentation",
    value: "security_documentation",
    required: true,
  },
  {
    label: "Contract Agreements",
    value: "contract_agreements",
    required: true,
  },
  {
    label: "Vendor Information",
    value: "vendor_information",
    required: true,
  },
  {
    label: "Business Continuity Plan",
    value: "business_continuity_plan",
    required: true,
  },
];
// ============================================================
// VENDOR NAVIGATION LINKS
// ============================================================
//used
export const VENDOR_NAV_LINKS: NavLinkType[] = [
  { Dashboard: "", icon: "layout-dashboard", section: "Main" },
  { Products: "products", icon: "package", section: "Main" },
  { Orders: "orders", icon: "shopping-cart", section: "Main" },
  { Analytics: "analytics", icon: "chart-column-stacked", section: "Main" },
  { Finances: "finances", icon: "hand-coins", section: "Finance & Growth" },
  { Marketing: "marketing", icon: "megaphone", section: "Finance & Growth" },
  { "CMS Manage": "cms", icon: "file-code", section: "Finance & Growth" },
  {
    "Config Documents": "configDocuments",
    icon: "file-text",
    section: "Documents",
  },
  { Settings: "settings", icon: "settings", divider: true },
];
export const FUNNEL_STEPS = [
  {
    key: "viewed",
    label: CAMPAIGN_ANALYTICS_TEXT.FUNNEL.VIEWED,
    icon: "eye",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    key: "clicked",
    label: CAMPAIGN_ANALYTICS_TEXT.FUNNEL.CLICKED,
    icon: "mouse-pointer",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    key: "applied",
    label: CAMPAIGN_ANALYTICS_TEXT.FUNNEL.APPLIED,
    icon: "shopping-cart",
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    key: "redeemed",
    label: CAMPAIGN_ANALYTICS_TEXT.FUNNEL.REDEEMED,
    icon: "check-circle",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
] as const;

// Define reusable types
interface SidebarLink {
  title: string;
  path: string | null;
  icon: string; // Lucide icon name
}

interface SidebarSection {
  section: string;
  list: SidebarLink[];
}

interface InnerSidebar {
  menu: string; // e.g. "Sales", "Catalog"
  sections: SidebarSection[];
}
// 1. Sidebar config with dynamic icon names
interface SidebarLink {
  title: string;
  path: string | null;
  icon: string; // kebab-case Lucide icon name
}

interface SidebarSection {
  section: string;
  list: SidebarLink[];
}

interface InnerSidebar {
  menu: string;
  sections: SidebarSection[];
}

// Factory function to generate links
export const getVendorInnerSidebarLinks = (
  selectedMenu: string,
): InnerSidebar[] =>
  [
    {
      menu: "Sales",
      sections: [
        {
          section: "Sellings",
          list: [
            { title: "Orders", path: `/vendor/orders`, icon: "shopping-cart" },
            {
              title: "Back Orders",
              path: `/vendor/orders/backOrders`,
              icon: "rotate-ccw",
            },
            // { title: "Failed Orders", path: `/vendor/orders/failedOrders`, icon: "x-circle" },
            // { title: "Archived", path: `/vendor/orders/archivedOrders`, icon: "archive" },
          ],
        },
        // {
        //   section: "Request",
        //   list: [{ title: "Quotes", path: `/vendor/quotes`, icon: "file-text" }],
        // },
      ],
    },
    {
      menu: "Catalog",
      sections: [
        {
          section: "Master Catalog",
          list: [
            { title: "Product List", path: `/vendor/products`, icon: "list" },
            {
              title: "Stock Update",
              path: `/vendor/products/stockUpdate`,
              icon: "refresh-cw",
            },
            // { title: "Variant Stock Update", path: `/vendor/products/variant-stock-update`, icon: "layers" },
            {
              title: "Category Management",
              path: `/vendor/products/categories`,
              icon: "layers",
            },
          ],
        },
        {
          section: "Configuration",
          list: [
            {
              title: "Product Variants",
              path: `/vendor/products/variants`,
              icon: "list-check",
            },
            {
              title: "Warehouses",
              path: `/vendor/products/warehouse`,
              icon: "map-pin",
            },
          ],
        },
        // {
        //   section: "Data",
        //   list: [
        //     { title: "Bulk Product Imports", path: `/vendor/products/import-products`, icon: "upload" },
        //     { title: "Export Data", path: `/vendor/products/export-products`, icon: "download" },
        //     { title: "Product Localization", path: `/vendor/products/product-localization`, icon: "globe" },
        //   ],
        // },
      ],
    },
    {
      menu: "Finances",
      sections: [
        {
          section: "Overview",
          list: [
            {
              title: "Earnings",
              path: `/vendor/finances`,
              icon: "trending-up",
            },
            // { title: 'Payouts', path: `/vendor/finances/payouts`, icon: 'credit-card' },
          ],
        },
        {
          section: "Ledger",
          list: [
            {
              title: "Refunds",
              path: `/vendor/finances/refunds`,
              icon: "corner-down-left",
            },
            {
              title: "Invoices",
              path: `/vendor/finances/invoices`,
              icon: "receipt",
            },
          ],
        },
        {
          section: "GST & Compliance",
          list: [
            {
              title: "GST Registrations",
              path: `/vendor/finances/gst`,
              icon: "shield-check",
            },
            // { title: 'Add GST Number', path: `/vendor/finances/gst/new`, icon: 'plus-circle' },
          ],
        },
        {
          section: "Taxation",
          list: [
            {
              title: "Tax Profiles",
              path: `/vendor/finances/tax-profiles`,
              icon: "layers",
            },
            {
              title: "Tax Types & Rates",
              path: `/vendor/finances/tax-rates`,
              icon: "percent",
            },
            {
              title: "Product Tax Mapping",
              path: `/vendor/finances/product-taxes`,
              icon: "tag",
            },
          ],
        },
      ],
    },
    {
      menu: "Marketing",
      sections: [
        {
          section: "Marketing Overview",
          list: [
            {
              title: "Dashboard",
              path: `/vendor/marketing`,
              icon: "layout-dashboard",
            },
          ],
        },
        {
          section: "Promotions",
          list: [
            {
              title: "Coupons",
              path: `/vendor/marketing/coupons`,
              icon: "tag",
            },
            {
              title: "Campaigns",
              path: `/vendor/marketing/campaigns`,
              icon: "megaphone",
            },
          ],
        },
        {
          section: "Engagement",
          list: [
            // { title: 'Notifications', path: `/vendor/marketing/notifications`, icon: 'bell' },
            // { title: 'Customer Reviews', path: `/vendor/marketing/reviews`, icon: 'message-square' },
            {
              title: "Banners",
              path: `/vendor/marketing/banners`,
              icon: "image",
            },
            {
              title: "Audiences",
              path: `/vendor/marketing/audiences`,
              icon: "users",
            },
          ],
        },
        // {
        //   section: 'Analytics',
        //   list: [
        //     { title: 'Performance', path: `/vendor/marketing/analytics`, icon: 'bar-chart-3' },
        //   ]
        // }
      ],
    },
    {
      menu: "Config Documents",
      sections: [
        {
          section: "Policy Management",
          list: [
            {
              title: "Product Policies",
              path: `/vendor/configDocuments`,
              icon: "shield-check",
            },
            {
              title: "Assign Policies",
              path: `/vendor/configDocuments/assign`,
              icon: "link",
            },
            {
              title: "Coverage Policies",
              path: `/vendor/configDocuments/coverage`,
              icon: "layers",
            },
          ],
        },
        // {
        //   section: "Legal & Compliance",
        //   list: [
        //     {
        //       title: "Vendor Agreements",
        //       path: `/vendor/settings/companyIdentity`, // Maps to existing legal/identity page
        //       icon: "file-signature"
        //     },
        //     {
        //       title: "Tax Profiles",
        //       path: `/vendor/finances/tax-profiles`,
        //       icon: "file-text"
        //     },
        //   ],
        // },
        {
          section: "Financial Documents",
          list: [
            {
              title: "Invoices",
              path: `/vendor/finances/invoices`,
              icon: "receipt",
            },
            {
              title: "GST Reports",
              path: `/vendor/finances/gst`,
              icon: "file-digit",
            },
          ],
        },
      ],
    },
    {
      menu: "Settings",
      sections: [
        {
          section: "General",
          list: [
            { title: "Store Profile", path: `/vendor/settings`, icon: "store" },
            {
              title: "Locations/Headquarters",
              path: `/vendor/settings/locations`,
              icon: "map-pin",
            },
            // { title: 'Business Hours', path: `/vendor/settings/business-hours`, icon: 'clock' },
          ],
        },
        {
          section: "Organization",
          list: [
            // { title: 'Billing & Banking', path: `/vendor/settings/billing`, icon: 'landmark' },
            {
              title: "Tax & Compliance",
              path: `/vendor/settings/compliance`,
              icon: "file-check",
            },
            {
              title: "Company Identity Configuration",
              path: `/vendor/settings/companyIdentity`,
              icon: "folder-open",
            },
          ],
        },
        // {
        //   section: 'Account',
        //   list: [
        // { title: 'Business Profile', path: `/vendor/settings/businessProfile`, icon: 'building-2' },
        // { title: 'Security & Password', path: `/vendor/settings/security`, icon: 'shield' },
        // { title: 'Notifications', path: `/vendor/settings/notifications`, icon: 'bell' },
        // { title: 'Team & Roles', path: `/vendor/settings/team`, icon: 'users' },
        //   ]
        // }
      ],
    },
    {
      menu: "CMS Manage",
      sections: [
        {
          section: "Storefront Pages",
          list: [
            { title: "Home Page", path: `/vendor/cms?page=home`, icon: "home" },
            {
              title: "Navbar Links",
              path: `/vendor/cms?page=navbar`,
              icon: "link-2",
            },
            {
              title: "Footer Config",
              path: `/vendor/cms?page=footer`,
              icon: "layout",
            },
          ],
        },
      ],
    },
  ].filter(
    (section) => section.menu.toLowerCase() === selectedMenu.toLowerCase(),
  );

// ============================================================
// VENDOR — COUPON MOCK DATA (MARKETING)
// ============================================================

// export const COUPON_DATA: CouponType[] = [
//   { id: 1, code: "WINTER26", discount_type: "PERCENTAGE", value: 25, status: "ACTIVE", conditions: { min_purchase_amount: 1000, customer_segment: "ALL", expiry_text: "Expires in 12 days" } },
//   { id: 2, code: "WELCOME2026", discount_type: "FLAT_AMOUNT", value: 100, currency: "INR", status: "ACTIVE", conditions: { customer_segment: "NEW_CUSTOMERS", expiry_text: "No expiry" } },
// ];

export const COUPON_COLORS = {
  text: [
    "text-blue-800",
    "text-green-800",
    "text-yellow-800",
    "text-gray-800",
    "text-purple-800",
    "text-pink-800",
    "text-indigo-800",
    "text-orange-800",
    "text-teal-800",
    "text-cyan-800",
  ],
  bg: [
    "bg-blue-100",
    "bg-green-100",
    "bg-yellow-100",
    "bg-gray-100",
    "bg-purple-100",
    "bg-pink-100",
    "bg-indigo-100",
    "bg-orange-100",
    "bg-teal-100",
    "bg-cyan-100",
  ],
};
// ============================================================
// VENDOR — CUSTOMER CARE MOCK DATA
// ============================================================

// export const CUSTOMER_TICKET_DATA: CustomerTicket[] = [
//   {
//     id: 1,
//     ticket_number: "#9021",
//     customer_name: "Sneha Kapoor",
//     related_order: "#ORD-00009921",
//     subject: "Received wrong size",
//     description:
//       "I ordered a Medium Cotton T-Shirt, but I received a Small. Please arrange for an exchange.",
//     status: "In Progress",
//     priority: "High",
//     created: " 2 hours ago",
//   },
//   {
//     id: 2,
//     ticket_number: "#8955",
//     customer_name: "Rahul Verma",
//     related_order: "#ORD-00005921",
//     subject: "Package marked delivered but not received",
//     description:
//       "The tracking says delivered yesterday, but I haven't received anything at my doorstep.",
//     status: "Resolved",
//     priority: "High",
//     created: " 1 day ago",
//   },
//   {
//     id: 3,
//     ticket_number: "#8810",
//     customer_name: "Amit Patel",
//     related_order: "#ORD-00004492",
//     subject: "Question about fabric care",
//     description:
//       "Can I machine wash the silk saree I bought, or is it dry clean only?",
//     status: "Resolved",
//     priority: "Low",
//     created: " 3 days ago",
//   },
//   {
//     id: 4,
//     ticket_number: "#8500",
//     customer_name: "Priya Singh",
//     related_order: "#ORD-00009455",
//     subject: "Refund not reflected yet",
//     description:
//       "I returned the item 5 days ago. When will the amount be credited back to my card?",
//     status: "Closed",
//     priority: "Medium",
//     created: " 1 week ago",
//   },
// ];

/** Type-safe filter dropdown options. */
export const CATEGORY_FILTER_OPTIONS = [
  {
    key: CategoryFilterType.ALL,
    label: "All Categories",
    value: CategoryFilterType.ALL,
  },
  {
    key: CategoryFilterType.PARENTS,
    label: "Parent Categories",
    value: CategoryFilterType.PARENTS,
  },
  {
    key: CategoryFilterType.SUBS,
    label: "Subcategories",
    value: CategoryFilterType.SUBS,
  },
  {
    key: CategoryFilterType.UNUSED,
    label: "Unused Categories",
    value: CategoryFilterType.UNUSED,
  },
  {
    key: CategoryFilterType.MOST_USED,
    label: "Most Used Categories",
    value: CategoryFilterType.MOST_USED,
  },
] as const;

// ── Validation Constraints ───────────────────────────────────

export const CATEGORY_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 300,
} as const;

// ── Pagination Defaults ──────────────────────────────────────

export const CATEGORY_PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
} as const;

// ── Stats Card Config ────────────────────────────────────────

export const CATEGORY_STATS_CONFIG: StatCardConfig[] = [
  {
    titleKey: "totalCategories",
    label: "Total Categories",
    icon: Folder,
    colorClass: "text-blue-600 bg-blue-50 border-blue-100",
  },
  {
    titleKey: "parentCategoriesCount",
    label: "Parent Categories",
    icon: Layers,
    colorClass: "text-green-600 bg-green-50 border-green-100",
  },
  {
    titleKey: "subcategoriesCount",
    label: "Subcategories",
    icon: FolderPlus,
    colorClass: "text-purple-600 bg-purple-50 border-purple-100",
  },
  {
    titleKey: "totalAssignedProducts",
    label: "Assigned Products",
    icon: ShoppingBag,
    colorClass: "text-amber-600 bg-amber-50 border-amber-100",
  },
];

// ── Auth Redirect ────────────────────────────────────────────

export const CATEGORY_AUTH = {
  LOGIN_REDIRECT_PATH: "/auth/vendorLogin",
  REDIRECT_DELAY_MS: 2000,
} as const;

// ── Table Headers ────────────────────────────────────────────

export const CATEGORY_TABLE_HEADERS = {
  CHECKBOX: "",
  CATEGORY: "Category",
  TYPE: "Type",
  DESCRIPTION: "Description",
  PRODUCTS: "Products",
  ACTIONS: "Actions",
} as const;

// ── Table Column Span ────────────────────────────────────────

export const CATEGORY_TABLE_COL_SPAN = 6;

// ── Export Config ────────────────────────────────────────────

export const CATEGORY_EXPORT = {
  FILE_NAME: "exported_categories.json",
  MIME_TYPE: "data:text/json;charset=utf-8,",
} as const;

// ── UI Labels ────────────────────────────────────────────────

export const CATEGORY_UI_LABELS = {
  // Page Header
  PAGE_TITLE: "Category Management",
  PAGE_DESCRIPTION:
    "Organize products using categories and subcategories in a responsive tree interface.",
  ADD_NEW_BUTTON: "Add New Category",

  // Form
  FORM_TITLE_CREATE: "Create Category",
  FORM_TITLE_EDIT: "Edit Category",
  FORM_DESC_CREATE: "Fill details below to build category relationship.",
  FORM_DESC_EDIT: "Modify fields below to update existing category.",
  PARENT_LABEL: "Parent Category (Optional)",
  PARENT_NONE_OPTION: "None (Make Parent Category)",
  PARENT_HELPER: "Select a parent if creating a nested subcategory.",
  NAME_LABEL: "Category Name",
  NAME_REQUIRED_MARKER: "*",
  NAME_PLACEHOLDER: "e.g. Headsets, Accessories, Gaming",
  DESCRIPTION_LABEL: "Description",
  DESCRIPTION_PLACEHOLDER:
    "Briefly explain what items belong in this category (max 300 characters)...",
  SUBMIT_CREATE: "Create Category",
  SUBMIT_UPDATE: "Update Category",
  RESET_BUTTON: "Reset",

  // Badges
  BADGE_PARENT: "Parent",
  BADGE_SUBCATEGORY: "Subcategory",

  // Search & Filters
  SEARCH_PLACEHOLDER: "Search categories, description, or parent name...",
  FILTER_LABEL: "Filter:",

  // Bulk Actions
  BULK_SELECTED_SUFFIX: "selected",
  BULK_MOVE_PLACEHOLDER: "Move to Parent...",
  BULK_MOVE_MAKE_PARENT: "Make Parent (None)",
  BULK_MOVE_BUTTON: "Move",
  BULK_EXPORT_BUTTON: "Export",
  BULK_DELETE_BUTTON: "Delete Selected",

  // Pagination
  PAGINATION_SHOWING: "Showing page",
  PAGINATION_OF: "of",
  PAGINATION_SUFFIX: "parent nodes",
  PAGINATION_PREV: "Prev",
  PAGINATION_NEXT: "Next",

  // Empty State
  EMPTY_TITLE: "No Categories Found",
  EMPTY_DESCRIPTION:
    "Try searching for a different keyword, adjust filters, or create your first category to organize products.",
  EMPTY_CTA: "Create First Category",

  // Detail Drawer
  DRAWER_TITLE: "Category Details",
  DRAWER_NAME_LABEL: "Name",
  DRAWER_DESCRIPTION_LABEL: "Description",
  DRAWER_NO_DESCRIPTION: "No description provided for this category.",
  DRAWER_PRODUCTS_LABEL: "Products",
  DRAWER_SUBCATEGORIES_LABEL: "Subcategories",
  DRAWER_SUBCATEGORIES_LIST_LABEL: "Subcategories List",
  DRAWER_NO_SUBCATEGORIES: "No subcategories assigned under this parent.",
  DRAWER_UPDATED_AT_LABEL: "Last Updated",
  DRAWER_PRODUCTS_SUFFIX: "products",
  DRAWER_PARENT_PREFIX: "Parent:",
  DRAWER_PARENT_CATEGORY: "Parent Category",
  DRAWER_EDIT_BUTTON: "Edit Category",
  DRAWER_CLOSE_BUTTON: "Close Details",
  DRAWER_PARENT_NONE: "None",

  // Delete Modal
  DELETE_MODAL_TITLE: "Warning: Subcategories Found",
  DELETE_MODAL_BODY:
    "Choose what action you want to take with the subcategories before deleting the parent category:",
  DELETE_MODAL_MOVE_LABEL: "Move subcategories to another parent",
  DELETE_MODAL_MOVE_NONE_OPTION: "None (Convert to root categories)",
  DELETE_MODAL_DELETE_ALL_LABEL: "Delete all subcategories",
  DELETE_MODAL_DELETE_ALL_DESC:
    "This will cascade delete all nested categories permanently.",
  DELETE_MODAL_CANCEL: "Cancel",
  DELETE_MODAL_CONFIRM: "Proceed & Delete",

  // No data fallback
  NO_DATA_DASH: "—",
} as const;

// ── Toast Messages ───────────────────────────────────────────

export const CATEGORY_TOAST = {
  // Success
  CREATED: "✓ Category Created Successfully",
  UPDATED: "✓ Category Updated Successfully",
  DELETED: "✓ Category Deleted Successfully",
  BULK_DELETED: (count: number) =>
    `✓ Successfully deleted ${count} categories.`,
  BULK_MOVED: (count: number) => `✓ Moved ${count} categories successfully.`,
  EXPORTED: "✓ Exported selected categories successfully.",
  HIERARCHY_UPDATED: (draggedName: string, targetName: string) =>
    `✓ "${draggedName}" nested under "${targetName}"`,

  // Errors
  NO_TOKEN: "Authentication Token not found! Try to Login Again!",
  NAME_TOO_SHORT: "Category name must be at least 2 characters.",
  UPDATE_FAILED: "Failed to update category",
  CREATE_FAILED: "Failed to create category",
  DELETE_FAILED: "Deletion failed",
  HIERARCHY_FAILED: "Failed to update category hierarchy",
  REORDER_FAILED: "Failed to reorder hierarchy.",
  DELETE_ERROR: "An error occurred during deletion.",
  UNEXPECTED_ERROR: "An unexpected error occurred.",
  DELETE_CATEGORY_FAILED: "Failed to delete category",
  NESTING_NOT_SUPPORTED:
    "Multi-level deep nesting is not supported. Keep it to Parent -> Subcategory.",

  // Delete Confirm
  DELETE_CONFIRM: (name: string) =>
    `Are you sure you want to delete "${name}"?`,
  BULK_DELETE_CONFIRM: (count: number) =>
    `Delete the ${count} selected categories?`,

  // Dynamic
  DELETE_MODAL_SUBTITLE: (name: string, count: number) =>
    `"${name}" contains ${count} subcategories.`,
} as const;
export const CmsNavbarConfig = {
  ERROR_LOAD_DATA:
    "We couldn't load the CMS navbar configuration. Please try again.",
  ERROR_SAVE_SETTINGS:
    "Something went wrong while saving the branding settings.",
  ERROR_ADD_LINK:
    "Something went wrong while adding the link. Please try again.",
  ERROR_SAVE_LINK:
    "Something went wrong while saving the link. Please try again.",
  ERROR_DELETE_LINK:
    "Something went wrong while deleting the link. Please try again.",
  ERROR_ADD_COLUMN:
    "Something went wrong while adding the column. Please try again.",
  ERROR_SAVE_COLUMN:
    "Something went wrong while saving the column. Please try again.",
  ERROR_DELETE_COLUMN:
    "Something went wrong while deleting the column. Please try again.",
  SUCCESS_SAVE_SETTINGS: "Branding settings saved successfully.",
  SUCCESS_ADD_LINK: "Navigation link added successfully.",
  SUCCESS_SAVE_LINK: "Navigation link saved successfully.",
  SUCCESS_DELETE_LINK: "Navigation link deleted successfully.",
  SUCCESS_ADD_COLUMN: "Column added successfully.",
  SUCCESS_SAVE_COLUMN: "Column saved successfully.",
  SUCCESS_DELETE_COLUMN: "Column deleted successfully.",
} as const;
