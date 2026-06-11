export const INVENTORY_TEXT = {
  STATS: {
    TOTAL_SKUS: "Total SKUs",
    LOW_STOCK: "Low Stock",
    OUT_OF_STOCK: "Out of Stock",
    HEALTHY: "Healthy",
  },
  ALERTS: {
    TITLE: "Stock Alerts",
    OUT_OF_STOCK: "Out of stock",
    LEFT: "left",
  },
  FILTERS: {
    SEARCH_PLACEHOLDER: "Search by name or SKU…",
    ALL: "All",
    LOW_STOCK: "Low Stock",
    OUT_OF_STOCK: "Out of Stock",
    REFRESH: "Refresh",
  },
  TABLE: {
    HEADERS: {
      PRODUCT: "Product",
      SKU: "SKU",
      ACTIVE: "Active",
      WAREHOUSE: "Warehouse",
      STOCK: "Stock",
      STATUS: "Status",
      PRICE: "Price",
    },
    NO_ITEMS: "No inventory items found.",
    STATUS_OUT: "Out of Stock",
    STATUS_LOW: "Low Stock",
    STATUS_IN: "In Stock",
  },
  PAGINATION: {
    SHOWING: "Showing",
    OF: "of",
    RECORDS: "records",
  },
};

export const VENDOR_NAVBAR_TEXT = {
  ACTIVE_WORKSPACE: "Active workspace",
  LOGOUT: "Logout",
};

export const INNER_SIDEBAR_TEXT = {
  ARIA_COLLAPSE: "Collapse sidebar",
  ARIA_EXPAND: "Expand sidebar",
};

export const VENDOR_PROFILE_TEXT = {
  BADGES: {
    VERIFIED: "Verified",
    UNVERIFIED: "Unverified",
  },
  SECTIONS: {
    VENDOR_PROFILE: "Vendor Profile",
    ABOUT_STORE: "About Store",
    OWNER: "Owner",
  },
  INFO: {
    NO_DESCRIPTION: "No store description added yet.",
    BUSINESS_OWNER: "Business owner",
    COMPANY_DOMAIN: "Company Domain",
    STRUCTURE: "Structure",
    FONT_FAMILY: "Font Family",
    CREATED: "Created: ",
    UPDATED: "Updated: ",
  }
};

export const CATEGORY_MANAGER_TEXT = {
  ERRORS: {
    NO_TOKEN: "Authentication Token not found! Try to Login Again!",
    CREATE_FAIL: "Failed to create category. Please try again.",
  },
  SUCCESS: {
    CREATED: "Category created successfully",
  },
  STATS: {
    TOTAL: "Total Categories",
  },
  FORM: {
    TITLE: "Add New Category",
    NAME_LABEL: "Category Name",
    NAME_PLACEHOLDER: "e.g. Electronics",
    DESC_LABEL: "Description",
    DESC_PLACEHOLDER: "Briefly describe what goes here...",
    BTN_LOADING: "Creating...",
    BTN_DEFAULT: "Create Category",
  },
  TABLE: {
    HEADERS: {
      CATEGORY: "Category",
      DESCRIPTION: "Description",
      ACTIONS: "Actions",
    },
    LOADING: "Loading categories...",
    NO_DATA: "No categories found. Create your first one to get started!",
    BTN_EDIT: "Edit",
    BTN_DELETE: "Delete",
  }
};

export const FINANCIAL_COMPLIANCE_TEXT = {
  EMPTY_STATE: "Select a country above to load the required compliance fields.",
  HEADER: "Financial & Tax Compliance",
  REQUIRED_COUNT: "required",
  FIELD_REQUIRED: "is required",
  OPTIONAL: "optional",
  FORMAT_HINT: "Format check will run on blur",
};

export const PLAN_SELECTION_TEXT = {
  META: {
    STARTER_BADGE: "Free to start",
    STARTER_CTA: "Start free trial",
    PRO_BADGE: "Most popular",
    PRO_CTA: "Start free trial",
    ENT_BADGE: "Contact sales",
    ENT_CTA: "Contact sales",
  },
  MESSAGES: {
    FREE: "Free",
    AFTER_TRIAL: " / mo after trial",
    SUBTITLE_PREFIX: "All plans start with a ",
    SUBTITLE_SUFFIX: "-day free trial. No credit card required.",
    FOOTER_PREFIX: "You won't be charged during your ",
    FOOTER_SUFFIX: "-day trial. Cancel anytime.",
  }
};

export enum BadgeVariant {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning"
}

export const TRIAL_BANNER_TEXT = {
  GRACE_PERIOD: "Your trial expired. You have a 3-day grace period remaining.",
  ENDED: "Your trial has ended.",
  ENDS_IN: (days: number) => `Your free trial ends in ${days} day${days !== 1 ? 's' : ''}.`,
  UPGRADE_RESTORE: "Upgrade to restore access",
  UPGRADE_NOW: "Upgrade now",
  DISMISS: "Dismiss banner"
};

export enum BannerUrgency {
  INFO = "info",
  WARNING = "warning",
  DANGER = "danger"
}

export enum AlertSeverity {
  OUT_OF_STOCK = "out_of_stock",
  LOW_STOCK = "low_stock",
  IN_STOCK = "in_stock",
}

export enum StatusFilter {
  ALL = "all",
  LOW = "low",
  OUT = "out",
}

export const DOC_UPLOAD_TEXT = {
  STATUS: {
    OF: "of",
    UPLOADED: "uploaded",
    REQUIRED_MISSING: "required missing",
  },
  ERRORS: {
    MISSING_HEADER: "Required documents missing:",
  },
  LABELS: {
    REQUIRED: "required",
    OPTIONAL: "optional",
  },
  ACTIONS: {
    REMOVE_FILE: "Remove file",
    UPLOAD_HINT: "Click to upload — PDF, JPG, PNG (max 10MB)",
  }
};

export const COUPON_CARD_TEXT = {
  TITLE: "Active Promotions",
  NA: "N/A",
  EMPTY: {
    TITLE: "No promotions available",
    DESC: "Create a promo code to offer discounts to your customers.",
  },
  STATUS: {
    ACTIVE: "Active",
    EXPIRED: "Expired",
    AUTO: "Auto",
  },
  DISCOUNT: {
    LABEL: "Discount",
    PCT_OFF: "% OFF",
    AMT_OFF: " OFF",
  },
  LABELS: {
    VALIDITY: "Validity",
    MIN_SPEND: "Min Spend",
    MAX_CAP: "Max Cap",
    PER_USER: " / user",
    TOTAL: " total",
    USED: " used",
    EDIT_RULES: "Edit Rules",
  }
};

export const COUPON_MODEL_TEXT = {
  TOASTS: {
    ERR_LOAD_PRODUCTS: "Failed to load product options.",
    ERR_LOAD_COUPON: "Failed to load coupon details.",
    SUCCESS_UPDATE: "Coupon updated successfully!",
    SUCCESS_CREATE: "Coupon created successfully!",
    ERR_UPDATE: "Failed to update coupon.",
    ERR_CREATE: "Failed to create coupon.",
  },
  RULE_LABELS: {
    MIN_CART: "Min cart value (₹)",
    MIN_QTY: "Min quantity",
    SEGMENT: "Customer segment",
    FIRST_ORDER: "First order only",
    PRODUCT: "Product in cart",
    NEW_CUST: "New customer (days)",
    DATE_RANGE: "Day-of-week range",
    MAX_USES: "Max uses per user",
  },
  HEADER: {
    EDIT: "Edit Coupon",
    NEW: "New Coupon",
    EDIT_DESC: "Update the promo code details below.",
    NEW_DESC: "Fill in the details to create a new promo code."
  },
  BASIC_INFO: {
    CODE: "Coupon Code",
    CODE_PH: "SUMMER50",
    DESC: "Description",
    DESC_PH: "Summer Sale 2026",
    TYPE: "Discount Type",
    VALUE: "Value",
    VALID_FROM: "Valid From",
    VALID_TO: "Valid To"
  },
  DISCOUNT_TYPES: {
    PERCENTAGE: "Percentage (%)",
    FIXED: "Fixed Amount (₹)",
    TIERED: "Tiered Discount",
    SHIPPING: "Free Shipping",
    BOGO: "Buy 1 Get 1"
  },
  ADVANCED: {
    TITLE: "Advanced Limits (Optional)",
    MAX_AMT: "Max Discount Amount (₹)",
    MAX_AMT_PH: "e.g. 500",
    TOTAL_USES: "Total Max Uses",
    TOTAL_USES_PH: "Unlimited if empty",
    USES_PER_USER: "Uses Per User",
    USES_PER_USER_PH: "e.g. 1",
    AUTO_APPLY: "Auto-apply at checkout",
    ACTIVE: "Active",
    PRODUCTS: "Applicable Products (Optional)",
    PRODUCTS_SELECT: "— Select a product to add —",
    NO_PRODUCTS: "No products selected — coupon applies to entire cart."
  },
  RULES: {
    TITLE: "Promotion Rules",
    DESC: "All rules must pass for coupon to apply (AND logic).",
    ADD: "Add Rule",
    EMPTY: "No rules added. The coupon will apply to all eligible carts.",
    TYPE_LBL: "Rule Type",
    NEGATE: "Negate",
    MIN_CART_AMT: "Minimum cart amount (₹)",
    MIN_CART_AMT_PH: "e.g. 500",
    MIN_QTY: "Minimum quantity",
    MIN_QTY_PH: "e.g. 3",
    SEGMENT: "Segment ID",
    SEGMENT_PH: "UUID of customer segment",
    FIRST_ORDER_HINT: "Applies only to a customer's first order — no extra config needed.",
    PRODUCT_ID: "Required product",
    PRODUCT_ID_PH: "— Select a product —",
    DAYS_AGO: "Registered within (days)",
    DAYS_AGO_PH: "e.g. 30",
    DAYS_OF_WEEK: "Active on days",
    MAX_USES: "Max uses per user (rule-level override)",
    MAX_USES_PH: "e.g. 2",
    FOOTER_SAVING: "Saving…",
    FOOTER_UPDATE: "Update Coupon",
    FOOTER_CREATE: "Create Coupon"
  }
};

export const PROMO_CONFIG_TEXT = {
  LABELS: {
    PROMO_TYPE: "Promotion Type *",
    DISCOUNT_VAL: "Discount value",
    CART_ELIGIBILITY: "Cart eligibility",
    USAGE_LIMITS: "Usage limits",
    QUANTITIES: "Quantities",
    FREE_PRODUCT: "Free product",
    BOGO_CONFIG: "BOGO config",
    MIN_CART: "Min Cart (₹)",
    DISCOUNT_PCT: "Discount (%)",
    DISCOUNT_PCT_AST: "Discount Percentage *",
    MAX_CAP: "Max Discount Cap (₹)",
    MIN_CART_VAL: "Minimum Cart Value (₹)",
    MAX_CART_VAL: "Maximum Cart Value (₹)",
    MAX_USES: "Max Uses (total)",
    MAX_USES_USER: "Max Uses Per Customer",
    AMOUNT_OFF: "Amount Off (₹) *",
    BUY_QTY: "Buy Quantity *",
    GET_QTY: "Get Quantity *",
    FREE_VARIANT: "Free Product Variant *",
    DISC_ON_GET: "Discount % on Get Items",
    MAX_REDEMPTIONS: "Max Redemptions Per Order",
    FREE_ITEM_QTY: "Free Item Quantity",
    DISC_ON_FREE: "Discount on Free Item (%)",
    SAME_PRODUCT: "Same Product Only?",
    SHIPPING_CONFIG: "Shipping config",
    MAX_SHIPPING_WAIVED: "Max Shipping Waived (₹) *",
    APPLICABLE_CARRIERS: "Applicable Carriers",
    TIER_CONFIG: "Discount tiers",
    TIERS: "Tiers *",
    TIER_TYPE: "Tier Type",
    STACKABLE: "Stack With Other Promos?",
    BUNDLE_PRODUCTS: "Bundle products",
    BUNDLE_VARIANTS: "Bundle Variants * (select all that apply)",
    BUNDLE_PRICING: "Bundle pricing",
    BUNDLE_PRICE: "Bundle Price (₹) *",
    BUNDLE_DISC_TYPE: "Bundle Discount Type",
    BUNDLE_DISC_PCT: "Bundle Discount (%)",
    REQUIRE_ALL: "Require All Items?",
  },
  PLACEHOLDERS: {
    EG_500: "e.g. 500",
    EG_10: "e.g. 10",
    EG_20: "e.g. 20",
    EG_299: "e.g. 299",
    EG_499: "e.g. 499",
    EG_100: "e.g. 100",
    EG_200: "e.g. 200",
    EG_1000: "e.g. 1000",
    EG_1: "e.g. 1",
    EG_2: "e.g. 2",
    OPTIONAL: "Optional",
    FULL_FREE: "100 = fully free",
    UNLIMITED: "Leave blank = unlimited",
    HUNDRED: "100",
  },
  HINTS: {
    PCT_RANGE: "Enter a value between 1 – 100.",
    NO_CAP: "Leave blank for no cap.",
    MUST_BUY: "Customer must buy this many items.",
    GIVEN_FREE: "Items given free or discounted.",
    FREE_VARIANT_DESC: "The product variant the customer receives for free (or at discount).",
    GIVE_FREE: "Set 100 to give items completely free.",
    BOGO_QTY: "Typically 1 for \"Buy 1 Get 1\" — adjust for variants.",
    FREE_VARIANT_BOGO: "Which variant does the customer get for free?",
    DEFAULT_100: "Default 100 = fully free.",
    MAX_SHIPPING_HINT: "Maximum shipping cost that will be waived. Leave blank to cover any amount.",
    CARRIERS_HINT: "Comma-separated. Leave blank to apply to all carriers.",
    TIER_HINT: "Each tier applies when the cart value meets the minimum threshold.",
    BUNDLE_VARIANTS_HINT: "Select all variants that must be in the cart together.",
    BUNDLE_PRICE_HINT: "Final price when all bundle items are in cart.",
  },
  ACTIONS: {
    ADD_TIER: "+ Add tier",
    REMOVE_TIER: "Remove tier",
  },
  COMMON: {
    LOADING_VARIANTS: "Loading variants…",
    SELECTED_VARIANTS: "selected",
    VARIANT_S: "variant",
    VARIANTS_S: "variants",
    SKU: "SKU",
    PRICE: "Price",
    LEFT: "left",
    OUT: "Out",
    IN_STOCK: "in stock",
    OUT_OF_STOCK: "Out of stock",
    SELECT_VARIANT: "Select a variant…",
    LOADING: "Loading…",
    YES_SAME_PRODUCT: "Yes — free item must be same product",
    NO_DIFF_VARIANT: "No — can pick a different variant",
    TIER_PERCENTAGE: "Percentage (%) off cart",
    TIER_FIXED: "Fixed (₹) off cart",
    STACK_NO: "No — use only this promotion",
    STACK_YES: "Yes — can stack with other codes",
    BUNDLE_FIXED: "Fixed bundle price",
    BUNDLE_PCT: "Percentage off bundle",
    BUNDLE_AMT: "Amount off bundle",
    REQUIRE_ALL_YES: "Yes — all selected variants must be in cart",
    REQUIRE_ALL_NO: "No — discount triggers with any subset",
  }
};

export const PRODUCT_FORM_TEXT = {
  PAGE: {
    CREATE: {
      headerTitle: "Create New Product",
      headerDesc: "Fill in the details below to list a new product.",
      draftButton: "Save Draft",
      submitButton: "Publish Product",
    },
    UPDATE: {
      headerTitle: "Update Product",
      headerDesc: "Update the details below to modify the product.",
      draftButton: "Save Draft",
      submitButton: "Update Product",
    }
  },
  FILE_UPLOAD_LABELS: [
    {
      label: "Product Thumbnail",
      fieldName: "productMedia",
      limit: 1,
      hint: "We highly recommend a square image (1:1 ratio) for the best display on the marketplace.",
    },
    {
      label: "Feature / Specification Media",
      fieldName: "featureMedia",
      limit: 5,
      hint: "Upload detailed shots or videos to showcase features. You can upload up to 5 files.",
    },
  ],
  GENERAL_FIELDS: [
    {
      name: "productName",
      label: "Product Name",
      placeholder: "e.g. Classic Cotton T-Shirt",
      type: "text",
    },
    {
      name: "description",
      label: "Description",
      placeholder: "Write a detailed description of the product...",
      type: "textarea",
    },
  ],
  SECTIONS: {
    GENERAL: "General Information",
    FEATURES: "Product Features",
    ATTRIBUTES: "Product Attributes",
    PRICING: "Pricing & Inventory",
    MEDIA: "Media & Assets",
    CATEGORY_TAX: "Product Category & Taxation (GST)"
  },
  ACTIONS: {
    ADD_FEATURE: "Add Feature",
    ADD_ATTRIBUTE: "Add Attribute",
    BACK: "Back"
  },
  LABELS: {
    FEAT_TITLE: "Feature Title",
    FEAT_TITLE_PH: "e.g. Waterproof",
    DETAILS: "Details",
    FEAT_DESC_PH: "Feature description…",
    ATTR_TITLE: "Attribute Title",
    ATTR_TITLE_PH: "e.g. Material Type",
    ATTR_DESC_PH: "e.g. 100% Cotton",
    CATEGORY: "Category",
    SELECT_CATEGORY: "Select Category",
    TAX_RATE: "Tax Rate",
    SELECT_TAX: "Select Tax Rate",
    WAREHOUSE: "Warehouse",
    SELECT_WAREHOUSE: "Select Warehouse"
  },
  MEDIA_GUIDE: {
    TITLE: "Image Guidelines:",
    DESC: "For optimal performance and visual consistency, please upload high-resolution images under 10MB. Keep the main product centered with a clean background.",
    BROWSE: "Click to browse files",
    LIMITS: "PNG, JPG, MP4 up to 10MB"
  }
};

export const PRODUCT_VARIANT_FORM_TEXT = {
  PAGE: {
    CREATE: {
      TITLE: "Add Product Variant",
    },
    UPDATE: {
      TITLE: "Edit Product Variant",
    }
  },
  FILE_UPLOAD_LABELS: [
    {
      label: "Product Images / Thumbnail",
      fieldName: "variantMediaMain",
    },
    {
      label: "Feature / Specification Media",
      fieldName: "variantMediaGallery",
    },
  ],
  SECTIONS: {
    DETAILS: "Variant Details",
    PRICING: "Pricing & Inventory",
    MEDIA: "Variant Images"
  },
  LABELS: {
    NAME: "Variant Name",
    NAME_PH: "e.g. Red - Medium",
    ATTR_TITLE: "Variant Attributes",
    ATTR_NAME: "Attribute (e.g. Color, Size)",
    ATTR_NAME_PH: "e.g. Size",
    ATTR_VAL: "Value",
    ATTR_VAL_PH: "e.g. Large",
    WAREHOUSE: "Warehouse",
    SELECT_WAREHOUSE: "Select warehouse"
  },
  ACTIONS: {
    BACK: "Back",
    ADD_ATTR: "Add Attribute",
    UPLOAD: "Click to upload",
    CANCEL: "Cancel",
    SAVING: "Saving…",
    UPDATE: "Update Variant",
    SAVE: "Save Variant"
  },
  MEDIA_GUIDE: {
    LIMITS: "PNG, JPG, MP4 up to 10MB"
  }
};

export const ANALYSIS_BOARD_TEXT = {
  PRESETS: {
    LAST_7_DAYS: "Last 7 days",
    LAST_30_DAYS: "Last 30 days",
    LAST_90_DAYS: "Last 90 days",
    THIS_MONTH: "This month",
    THIS_YEAR: "This year",
  },
  DATE_PICKER: {
    QUICK_SELECT: "Quick select",
    CANCEL: "Cancel",
    APPLY: "Apply",
  },
  METRICS: {
    REVENUE: "Revenue",
    ORDERS: "Orders",
    GROSS_SALES: "Gross sales",
    PLATFORM_FEES: "Platform fees",
    GST_TAX: "GST / tax",
    REFUNDS: "Refunds",
    NET_PROFIT: "Net profit",
    MARGIN: "Margin",
    TOTAL_DEDUCTIONS: "Total deductions",
    AVG_ORDER_VAL: "Avg. order value",
    REV_PER_DAY: "Revenue per day",
    EFF_TAX_RATE: "Effective tax rate",
    BEST_CATEGORY: "Best category",
    TOP_SKU: "Top SKU",
    TOTAL_TOP: "Total (top ",
    ORDERS_OVER: "Orders over ",
    DAYS: " days",
    TOTAL_LOWER: "total"
  },
  TABLES: {
    CATEGORY: "Category",
    SHARE: "Share",
    TOTAL: "Total",
    DERIVED_INSIGHTS: "Derived Insights",
  }
};

export const BRANDING_TAB_TEXT = {
  HOME_SECTION_FIELDS: [
    {
      key: "hero",
      label: "Interactive Hero Banner",
      desc: "Promotional slider or video background",
    },
    {
      key: "lookbook",
      label: "Shoppable Lookbook",
      desc: "Image with interactive hotspots",
    },
    {
      key: "scarcity",
      label: "Scarcity & Urgency Timer",
      desc: "Flash sales countdown and active promo alerts",
    },
    {
      key: "social_proof",
      label: "Trust & Social Proof",
      desc: "Customer testimonials slider and trust badges",
    },
    {
      key: "curated",
      label: "Curated Discovery Slider",
      desc: "Horizontal scrollable product showcase lists",
    },
    {
      key: "categories",
      label: "Shop Categories Grid",
      desc: "Grid layout of shop categories",
    },
    {
      key: "products",
      label: "Featured Products Grid",
      desc: "Grid layout of featured master products",
    },
    {
      key: "promo",
      label: "Middle Promo Card",
      desc: "Mid-page promotional banner card",
    },
    {
      key: "new_arrivals",
      label: "New Arrivals Block",
      desc: "Showcase of recently launched items",
    },
    {
      key: "newsletter",
      label: "Newsletter Subscription Banner",
      desc: "Signup banner at the footer area",
    },
  ],
  PRESETS: [
    {
      name: "Techsonance Classic",
      primary_color: "#2563eb",
      secondary_color: "#4f46e5",
      accent_color: "#3b82f6",
      background_color: "#f8fafc",
      text_color: "#0f172a",
      navbar_bg: "#ffffff",
      navbar_fg: "#0f172a",
      footer_bg: "#0f172a",
      footer_fg: "#ffffff",
      card_style: "standard" as const,
      border_radius: "md" as const,
    },
    {
      name: "Emerald Eco",
      primary_color: "#059669",
      secondary_color: "#10b981",
      accent_color: "#34d399",
      background_color: "#f0fdf4",
      text_color: "#064e3b",
      navbar_bg: "#ffffff",
      navbar_fg: "#064e3b",
      footer_bg: "#064e3b",
      footer_fg: "#ffffff",
      card_style: "standard" as const,
      border_radius: "lg" as const,
    },
    {
      name: "Sunset Orange",
      primary_color: "#ea580c",
      secondary_color: "#f97316",
      accent_color: "#fb923c",
      background_color: "#fff7ed",
      text_color: "#431407",
      navbar_bg: "#ffffff",
      navbar_fg: "#431407",
      footer_bg: "#431407",
      footer_fg: "#ffffff",
      card_style: "standard" as const,
      border_radius: "md" as const,
    },
    {
      name: "Midnight Premium",
      primary_color: "#3b82f6",
      secondary_color: "#60a5fa",
      accent_color: "#93c5fd",
      background_color: "#0f172a",
      text_color: "#f8fafc",
      navbar_bg: "#1e293b",
      navbar_fg: "#f8fafc",
      footer_bg: "#0f172a",
      footer_fg: "#f8fafc",
      card_style: "glassmorphic" as const,
      border_radius: "xl" as const,
    },
    {
      name: "Luxury Rose",
      primary_color: "#be185d",
      secondary_color: "#db2777",
      accent_color: "#f472b6",
      background_color: "#fdf2f8",
      text_color: "#500724",
      navbar_bg: "#ffffff",
      navbar_fg: "#500724",
      footer_bg: "#500724",
      footer_fg: "#ffffff",
      card_style: "glassmorphic" as const,
      border_radius: "full" as const,
    },
  ],
  FONT_OPTIONS: [
    "Inter",
    "Plus Jakarta Sans",
    "DM Sans",
    "Outfit",
    "Nunito",
    "Poppins",
    "Raleway",
    "Lato",
    "Source Sans Pro",
    "IBM Plex Sans",
  ],
  SECTIONS: {
    LOGOS: "Logos & Brand Assets",
    COLORS: "Color Theme Customization",
    TYPOGRAPHY: "Storefront Layout & Typography",
    HOMEPAGE: "Homepage Section Manager",
  },
  FIELDS: {
    PRIMARY_LOGO_LBL: "Primary Logo",
    PRIMARY_LOGO_HINT: "Used in headers and invoices",
    DARK_VARIANT_LBL: "Dark Variant",
    DARK_VARIANT_HINT: "For dark-themed PDF documents",
    WATERMARK_LBL: "Watermark",
    WATERMARK_HINT: "Faint stamp printed behind content",
    FAVICON_LBL: "Favicon",
    FAVICON_HINT: "Appears on browser tabs/emails",
    QUICK_PRESETS: "Quick Style Presets",
    ACCENT_PALETTE: "Accent Palette",
    PRIMARY_ACCENT: "Primary Accent",
    SECONDARY_ACCENT: "Secondary Accent",
    ACCENT_COLOR: "Accent Color",
    LAYOUT_BG_TEXT: "Layout Background & Text",
    PAGE_BG_COLOR: "Page Background Color",
    TEXT_COLOR: "Text Color",
    NAVBAR_FOOTER_PALETTE: "Navbar & Footer Palette",
    NAVBAR_BG: "Navbar Background",
    NAVBAR_FG: "Navbar Text/Foreground",
    FOOTER_BG: "Footer Background",
    FOOTER_FG: "Footer Text/Foreground",
    TYPO_FONT_FAMILY: "Typography Font Family",
    TYPO_HINT: "Loaded dynamically on storefront",
    NAVBAR_POS: "Navbar Position",
    NAVBAR_POS_HINT: "Header behaviour on scroll",
    NAVBAR_STICKY: "Sticky (Follow scroll)",
    NAVBAR_STATIC: "Static (Stay at top)",
    LOGO_ALIGN: "Header Logo Alignment",
    LOGO_ALIGN_HINT: "Brand positioning in navbar",
    LEFT_ALIGNED: "Left Aligned",
    CENTER_ALIGNED: "Center Aligned",
    FOOTER_STYLE: "Footer Style",
    FOOTER_STYLE_HINT: "Amount of details in footer",
    DETAILED_FOOTER: "Detailed Multi-Column",
    SIMPLE_FOOTER: "Simple Center Row",
    BORDER_RADIUS: "Border Radius",
    BORDER_RADIUS_HINT: "Curves on buttons, inputs & cards",
    SHARP_CORNERS: "Sharp Corners (0px)",
    SMALL_CORNERS: "Small (4px)",
    MEDIUM_CORNERS: "Medium (8px)",
    LARGE_CORNERS: "Large (12px)",
    XL_CORNERS: "Extra Large (16px)",
    ROUNDED_CORNERS: "Rounded / Pill (24px)",
    CARD_STYLE: "Card Display Style",
    CARD_STYLE_HINT: "Aesthetic styling of cards",
    STANDARD_CARD: "Standard Flat Bordered",
    GLASSMORPHIC_CARD: "Glassmorphic Blur",
    HOMEPAGE_DESC: "Toggle which modular sections are active on your home page, and order them to design your custom landing page.",
    ACTIVE_POS: "Active (Pos: ",
    INACTIVE: "Inactive",
    MOVE_UP: "Move Up",
    MOVE_DOWN: "Move Down",
  }
};

export const CAMPAIGN_FORM_TEXT = {
  TOASTS: {
    VALID_FROM_REQ: "Valid From date is required",
    NAME_REQ: "Campaign name is required",
    UPDATED: "Campaign updated",
    CREATED: "Campaign created",
    ERR_SAVE: "Failed to save campaign",
  },
  HEADER: {
    EDIT: "Edit Campaign",
    CREATE: "Create New Campaign",
    DESC: "Configure your promotion details, rules, and scheduling.",
  },
  BASIC_INFO: {
    NAME: "Campaign Name *",
    NAME_PH: "e.g. Summer Sale 20% Off",
    STATUS: "Status",
    DESC_LBL: "Description",
    DESC_PH: "Customer-facing description shown at checkout",
    INTERNAL_NOTE_LBL: "Internal Note",
    INTERNAL_NOTE_PH: "Internal team notes (not visible to customers)",
    PRIORITY: "Priority",
    PRIORITY_HINT: "Higher number = applied first when multiple promos are active.",
    AUTO_APPLY: "Auto-apply",
    AUTO_APPLY_HINT: "(no coupon code needed)",
    EXCLUSIVE: "Exclusive",
    EXCLUSIVE_HINT: "(cannot stack with other promos)",
  },
  STATUS_OPTIONS: {
    DRAFT: "Draft",
    ACTIVE: "Active (publish now)",
    REVIEW: "Submit for Review",
  },
  DISCOUNT_CONFIG: "Discount Configuration",
  SCHEDULE_USAGE: {
    TITLE: "Schedule & Usage",
    VALID_FROM: "Valid From *",
    VALID_TO: "Valid To",
    VALID_TO_HINT: "Leave blank for no expiry.",
    GLOBAL_CAP: "Global Use Cap",
    GLOBAL_CAP_PH: "Leave blank = unlimited",
    GLOBAL_CAP_HINT: "Total times this promo can be redeemed across all customers.",
  },
  FOOTER: {
    CANCEL: "Cancel",
    SAVING: "Saving…",
    UPDATE: "Update Campaign",
    CREATE: "Create Campaign",
  }
};

export const DOCUMENT_CONFIG_TAB_TEXT = {
  SECTIONS: {
    INVOICE_NUMBERING: "Invoice Numbering",
    SIGNATORY: "Authorized Signatory",
    FOOTER_TERMS: "Invoice Footer & Terms",
    LOCALE: "Output Locale",
  },
  INVOICE_NUMBERING: {
    PREFIX_LABEL: "Prefix",
    PREFIX_HINT: "e.g. INV, TAX-INV, SINV",
    FORMAT_LABEL: "Format String",
    FORMAT_HINT: "Tokens: {PREFIX} {YYYY} {YY} {MM} {DD} {SEQ8} {SEQ6}",
    SEQ_RESET_LABEL: "Sequence Reset",
    SEQ_RESET_HINT: "Auto-detected from your timezone",
    PREVIEW: "Preview",
  },
  SIGNATORY: {
    NAME_LABEL: "Signatory Name",
    NAME_PH: "e.g. Rahul Sharma",
    DESIG_LABEL: "Designation",
    DESIG_PH: "e.g. Managing Director",
    SIG_LABEL: "Signature Image",
    SIG_HINT: "PNG with transparent background recommended",
  },
  FOOTER: {
    TEXT_LABEL: "Footer Text",
    TEXT_HINT: "Printed at the bottom of every invoice page",
    TEXT_PH: "Thank you for shopping with us. All disputes subject to Surat jurisdiction.",
    TERMS_LABEL: "Terms & Conditions",
    TERMS_HINT: "Printed on last page or as a section",
    TERMS_PH: "1. All sales are final unless otherwise specified…",
  },
  LOCALE: {
    CURRENCY_LABEL: "Default Currency",
    TZ_LABEL: "Timezone",
    DATE_FORMAT_LABEL: "Date Format",
  },
  TIMEZONES: [
    "Asia/Kolkata",
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Dubai",
    "Asia/Singapore",
  ],
  DATE_FORMATS: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"],
  CURRENCIES: ["INR", "USD", "GBP", "EUR", "AED", "SGD"],
};

export const SEGMENT_FORM_TEXT = {
  TOASTS: {
    ERR_FETCH: "Failed to fetch segment data",
    ERR_NO_CRITERIA: "Add at least one criterion",
    ERR_VAL_REQ: "All criteria need a value",
    UPDATED: "Segment updated",
    CREATED: "Segment created",
    ERR_SAVE: "Failed to save segment",
  },
  HEADER: {
    EDIT: "Edit Customer Segment",
    CREATE: "Create New Segment",
    DESC: "Define dynamic groups based on customer behavior.",
  },
  FIELDS: {
    NAME_LBL: "Segment Name *",
    NAME_PH: "e.g. High-Value Buyers",
    MATCH_LOGIC_LBL: "Match Logic",
    MATCH_AND: "ALL criteria must match (AND)",
    MATCH_OR: "ANY criterion must match (OR)",
    DESC_LBL: "Description",
    DESC_PH: "Optional note about this segment",
    CRITERIA_LBL: "Criteria",
    ADD_CRITERIA: "Add Criteria",
  },
  FOOTER: {
    CANCEL: "Cancel",
    SAVING: "Saving…",
    UPDATE: "Update Segment",
    CREATE: "Create Segment",
  },
  FIELD_OPTIONS: [
    { value: "total_orders", label: "Total Orders" },
    { value: "total_spent", label: "Total Spent (₹)" },
    { value: "average_order_value", label: "Average Order Value (₹)" },
    { value: "registered_days_ago", label: "Days Since Registration" },
    { value: "last_order_days_ago", label: "Days Since Last Order" },
  ],
  OPERATOR_OPTIONS: [
    { value: "gte", label: "≥ (at least)" },
    { value: "lte", label: "≤ (at most)" },
    { value: "eq", label: "= (exactly)" },
  ],
};

export const LEGAL_PROFILE_TAB_TEXT = {
  SECTIONS: {
    LEGAL_ID: "Legal Identity",
    CONTACT: "Contact Printed on Document Footer",
  },
  FIELDS: {
    LEGAL_NAME: "Legal Name *",
    LEGAL_NAME_HINT: "Must match your tax registration documents exactly",
    LEGAL_NAME_PH: "ACME PRIVATE LIMITED",
    TRADE_NAME: "Trade / Brand Name",
    TRADE_NAME_HINT: "The name customers see (can differ from legal name)",
    TRADE_NAME_PH: "Acme Store",
    COUNTRY: "Country of Incorporation *",
    LOCATIONS: "Company Locations",
    EMAIL: "Support Email",
    EMAIL_PH: "support@example.com",
    PHONE: "Support Phone",
    PHONE_PH: "+91 98765 43210",
    WEBSITE: "Website URL",
    WEBSITE_PH: "https://example.com",
  }
};

export const SEQUENCE_RESET_SELECT_TEXT = {
  ALL_OPTIONS: [
    {
      value: "APRIL",
      label: "Indian / UK Financial Year (Apr 1)",
      month: 4,
      day: 1,
      countries: "India, UK, Canada, New Zealand",
    },
    {
      value: "JANUARY",
      label: "Calendar Year (Jan 1)",
      month: 1,
      day: 1,
      countries: "Most of EU, China, Brazil, Russia",
    },
    {
      value: "JULY",
      label: "Australian Financial Year (Jul 1)",
      month: 7,
      day: 1,
      countries: "Australia, Pakistan, Bangladesh, Egypt",
    },
    {
      value: "OCTOBER",
      label: "US Federal Fiscal Year (Oct 1)",
      month: 10,
      day: 1,
      countries: "United States (federal), Myanmar",
    },
    {
      value: "MARCH",
      label: "Japanese Fiscal Year (Apr 1 / Mar 31)",
      month: 4,
      day: 1,
      countries: "Japan (same April start as India)",
    },
  ],
  DETECTED_TZ: "Detected timezone:",
  UNKNOWN: "unknown",
  AUTO_SELECTED: "auto-selected",
  USED_BY: "Used by:",
  NEXT_RESET: "Next reset:",
};

export const SIGNATURE_UPLOAD_TEXT = {
  CURRENT: "Current Signature",
  REMOVE: "Remove signature",
  CLICK_UPLOAD: "Click to upload",
  OR_DRAG: "or drag & drop",
  HINT: "PNG with transparent background recommended",
};

export const DELETE_BTN_TEXT = {
  ERR_AUTH: "Authentication not found! Try to Login Again!",
  DELETE: "Delete"
};

export const SAVE_BUTTON_TEXT = {
  SAVING: "Saving…",
  SAVED: "Saved",
  SAVE_CHANGES: "Save Changes"
};

export const VARIANT_IMG_GRID_TEXT = {
  ALT_TEXT: "Variant Image"
};

export const LOGO_UPLOAD_TEXT = {
  REPLACE: "Click to replace",
  UPLOAD: "Upload image"
};
