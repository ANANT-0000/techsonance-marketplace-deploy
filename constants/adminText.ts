export const ASSIGN_SECTION_TEXT = {
  ASSIGN_PERMISSION_TITLE: "Assign Permission to Role",
  SELECT_ROLE: "Select role",
  SELECT_PERMISSION: "Select permission",
  ASSIGNING: "Assigning...",
  ASSIGN: "Assign",
  CURRENT_ASSIGNMENTS: "Current Assignments",
  NO_PERMISSIONS_ASSIGNED: "No permissions assigned",
  NO_ASSIGNMENTS_FOUND: "No assignments found",
};

export const DASHBOARD_CHART_TEXT = {
  WEEK_1: "Week 1",
  WEEK_2: "Week 2",
  WEEK_3: "Week 3",
  WEEK_4: "Week 4",
  JANUARY: "January",
  FEBRUARY: "February",
  MARCH: "March",
  APRIL: "April",
  MAY: "May",
  JUNE: "June",
  VENDORS: "Vendors",
  VENDOR_GROWTH: "Vendor Growth",
  LAST_30_DAYS: "Last 30 days",
  LAST_6_MONTHS: "Last 6 months",
  LAST_1_YEAR: "Last 1 year",
};

export const DOCUMENT_CARD_TEXT = {
  PDF: "PDF",
  FILE: "File",
};

export const DOCUMENT_MODAL_TEXT = {
  OPEN_ORIGINAL: "Open Original",
  PREVIEW_NOT_AVAILABLE: "Preview not available for this file type.",
  OPEN_FILE: "Open file ↗",
};

export const DOCUMENT_SECTION_TEXT = {
  NO_DOCUMENTS_SUBMITTED: "No documents submitted",
  SUBMITTED_DOCUMENTS: "Submitted Documents",
  CLICK_TO_PREVIEW: "Click any document to preview",
};

export const FORM_NAV_ROW_TEXT = {
  PREVIOUS: "Previous",
  CONTINUE: "Continue",
};

export const NAVBAR_TEXT = {
  SEARCH_SYSTEM: "Search system...",
  ACTIVE_WORKSPACE: "Active workspace",
  LOGOUT: "Logout",
};

export const PERMISSIONS_TEXT = {
  DELETE: "Delete",
  PERMISSIONS_TITLE: "Permissions",
  ADD: "Add",
  LOADING: "Loading permissions...",
  NO_PERMISSIONS_YET: "No permissions yet.",
};

export const ROLES_TEXT = {
  DELETE: "Delete",
  ROLES_TITLE: "Roles",
  ADD: "Add",
  LOADING: "Loading roles...",
  NO_ROLES_FOUND: "No roles found. Start by adding one!",
};

export const VENDOR_CREATED_TOAST_TEXT = {
  TITLE: "Vendor Created!",
  DESCRIPTION_SUFFIX:
    " has been registered. Credentials will be sent to their email after review.",
  SUCCESS_MSG: "Registration submitted successfully",
};

export const ADMIN_LOGIN_TEXT = {
  STEP_VALIDATING: "Validating credentials",
  STEP_PERMISSIONS: "Checking access permissions",
  STEP_INITIALISING: "Initialising admin session",
  TITLE: "System Administration",
  SUBTITLE: "Restricted access — authorised personnel only",
  ID_LABEL: "Admin ID / Email",
  ID_PLACEHOLDER: "admin@company.com",
  PASS_LABEL: "Secure Key / Password",
  HIDE_PASS: "Hide password",
  SHOW_PASS: "Show password",
  BTN_AUTH: "→ Authenticate",
  MONITOR_MSG: "All access attempts are logged and monitored",
  LOADING_TITLE: "Verifying identity",
  LOADING_SUBTITLE: "Please wait…",
  SUCCESS_TITLE: "Access granted",
  SUCCESS_SUBTITLE: "Identity verified. Taking you to the admin panel…",
  REDIRECT_PREFIX: "Redirecting in ",
  REDIRECT_SUFFIX: "s",
  ERROR_TITLE: "Access denied",
  ERROR_DEFAULT_MSG: "Invalid credentials or insufficient permissions.",
  BTN_TRY_AGAIN: "Try again",
};

export const SUBSCRIBATION_TEXT = {
  PAGE_TITLE: "Plan & Subscription Workspace",
  PAGE_DESCRIPTION:
    "Configure plan pricing tier options, access features, and manage active vendor subscription lifecycles.",
  SECTION_CMS_TITLE: "Plan Pricing & Features",
  SECTION_CMS_SUBTITLE:
    "Configure standard plans, pricing levels, and access features.",
  SECTION_LIFECYCLE_TITLE: "Active Vendor Subscriptions",
  SECTION_LIFECYCLE_SUBTITLE:
    "Track, upgrade, extend, or cancel vendor subscription periods.",

  SEARCH_PLACEHOLDER: "Search by company name or store link...",
  NEW_PLAN_PLACEHOLDER: "Plan name (e.g., starter, pro)...",
  FILTER_STATUS_LABEL: "Filter by Status",
  FILTER_ALL_STATUS: "All Statuses",

  TABLE_HEADERS: {
    COMPANY_NAME: "Company Name",
    DOMAIN: "Store Domain",
    CURRENT_PLAN: "Current Plan",
    STATUS: "Subscription Status",
    TRIAL_ENDS: "Trial Ends",
    PERIOD_ENDS: "Period Ends",
    DATE_CREATED: "Subscription Start Date",
    ACTIONS: "Actions",
  },

  STATUS_LABELS: {
    trial: "Trial Mode",
    active: "Active",
    expired: "Expired",
    cancelled: "Cancelled",
    grace_period: "Grace Period",
  },

  ACTIONS: {
    MANAGE: "Manage",
    VIEW: "View Details",
    REFRESH: "Refresh",
    SAVING: "Saving changes...",
    LOADING: "Loading data...",
    NO_DATA: "No vendor subscriptions found matching your filters.",
    EDIT_TITLE: "Manage Vendor Subscription",
    EDIT_DESC:
      "Upgrade or downgrade plan levels, adjust status, and change trial or billing cycle dates.",
    COMPANY_LABEL: "Company",
    DOMAIN_LABEL: "Store Domain",
    PLAN_LABEL: "Subscription Plan",
    STATUS_LABEL: "Subscription Status",
    TRIAL_START: "Trial Start Date & Time",
    TRIAL_END: "Trial End Date & Time",
    PERIOD_START: "Billing Cycle Start",
    PERIOD_END: "Billing Cycle End",
    GRACE_END: "Grace Period End Date & Time",
    CANCELLED_AT: "Cancellation Date & Time",
    SAVE_BTN: "Save Changes",
    CANCEL_BTN: "Cancel",
    SUCCESS_UPDATE: "Vendor subscription updated successfully!",
    FAILED_UPDATE: "Failed to update vendor subscription.",
    FETCH_ERROR: "Failed to load vendor subscriptions.",
    FEATURE_KEY_LABEL: "Feature Name / Identifier",
    FEATURE_KEY_PLACEHOLDER: "e.g., maximum-products-allowed",
    PLAN_DESC_LABEL: "Plan Description",
    PLAN_DESC_SUBTITLE:
      "A short, merchant-friendly summary displayed on the landing page pricing cards.",
    PLAN_DESC_PLACEHOLDER:
      "e.g. For individuals and small businesses getting started with their own branded store.",
    PREVIEW_TITLE: "Storefront Card Preview (Approximate)",
  },
  CMS_EDITOR: {
    UNSAVED_CHANGES: "Unsaved changes",
    SAVE_DRAFT_BTN: "Save Draft",
    PUBLISH_LIVE_BTN: "Publish Live",
    UNPUBLISH_BTN: "Unpublish",
    PRICING_TITLE: "Pricing Tier Intervals",
    ADD_PRICE_BTN: "Add Price",
    LABEL_INTERVAL: "Interval",
    LABEL_CURRENCY: "Currency",
    LABEL_AMOUNT: "Amount",
    NO_PRICES: "No prices yet — add at least one before saving.",
    FEATURES_TITLE: "Feature Flags & Limits",
    FEATURES_SUBTITLE: "Order here is the order they appear on cards.",
    ADD_FEATURE_BTN: "Add Feature",
    LABEL_FEATURE_KEY: "Feature Key",
    LABEL_BEHAVIOR: "Behavior",
    LABEL_VALUE: "Value",
    NO_FEATURES: "No feature flags on this plan yet.",
    PREVIEW_NO_FEATURES: "No visible feature flags yet.",
    TOGGLE_ENABLED: "Yes (Enabled)",
    TOGGLE_DISABLED: "No (Disabled)",
    BEHAVIOR_TOGGLE: "Toggle Switch (Yes/No)",
    BEHAVIOR_TEXT: "Text / Limit Value",
    FEATURE_VALUE_PLACEHOLDER: "e.g., 50, Unlimited, Premium...",
    PREVIEW_DEFAULT_DESC: "For growing businesses.",
    MONTHLY_LABEL: "/mo",
    BILLED_ANNUALLY_LABEL: "billed annually",
  },
};
