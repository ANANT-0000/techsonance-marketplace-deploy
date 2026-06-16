import { Building2, FileArchive, Globe2, ShieldCheck } from "lucide-react";
import { BusinessStructure, categoryOptions, COUNTRY_CODES } from "./common";
import { VendorRegisterSchema } from "@/utils/validation";
import { FieldConfig, FieldType } from "@/utils/Types";
import { TAX_PROFILE_FORM_TEXT, TAX_RATES_FORM_TEXT } from "./vendorText";
export const STEPS = [
  { id: 0, label: "Organization", icon: Building2 },
  { id: 1, label: "Domain", icon: Globe2 },
  { id: 2, label: "Compliance", icon: ShieldCheck },
  { id: 3, label: "Documents", icon: FileArchive },
];

// Fields validated per step by react-hook-form
export const STEP_RHF_FIELDS: Record<number, (keyof VendorRegisterSchema)[]> = {
  0: [
    "company_name",
    "store_owner_first_name",
    "store_owner_last_name",
    "email",
    "country_code",
    "phone_number",
    "category",
    "company_structure",
  ],
  1: ["company_domain"],
  2: [],
  3: [],
};
export const BUSINESS_CATEGORIES = [
  "Fashion & Apparel",
  "Electronics & Gadgets",
  "Food & Beverages",
  "Health & Wellness",
  "Home & Living",
  "Beauty & Personal Care",
  "Sports & Outdoors",
  "Books & Stationery",
  "Toys & Games",
  "Automotive",
  "Industrial & B2B",
  "Other",
];

export const COMPANY_STRUCTURES = [
  "Sole Proprietorship",
  "Partnership Firm",
  "Limited Liability Partnership (LLP)",
  "Private Limited Company (Pvt. Ltd.)",
  "Public Limited Company",
  "One Person Company (OPC)",
  "NGO / Non-Profit",
  "Other",
];
export const ORGANIZATION_DETAIL_FIELDS = [
  {
    id: "company_name",
    label: "Company Name",
    placeholder: "Enter your company name",
    type: "text",
  },
  {
    id: "store_owner_first_name",
    label: "First Name",
    placeholder: "Enter your first name",
    type: "text",
  },
  {
    id: "store_owner_last_name",
    label: "Last Name",
    placeholder: "Enter your last name",
    type: "text",
  },
  {
    id: "email",
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
  },

  {
    id: "phone_number",
    label: "Business Phone Number",
    groupField: [
      {
        id: "country_code",
        type: "select",
        options: COUNTRY_CODES,
        styles: "rounded-r-none",
      },
      {
        id: "phone_number",
        type: "tel",
        placeholder: "123-456-7890",
        styles: "rounded-l-none",
      },
    ],
  },

  {
    id: "category",
    label: "Business Category",
    type: "select",
    options: categoryOptions,
  },
  {
    id: "company_structure",
    label: "Business Structure",
    type: "select",
    options: BusinessStructure,
  },
];

export const BUSINESS_ADMIN_ACCOUNT_FIELDS = [
  {
    id: "email",
    label: "Admin Email",
    placeholder: "Enter your email",
    type: "email",
  },
  {
    id: "password",
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
  },
  {
    id: "confirm_password",
    label: "Confirm Password",
    placeholder: "Confirm your password",
    type: "password",
  },
];

// export enum RegistrationStages {
//     Organization = "organization",
//     Instance = "instance",
//     Compliance = "compliance",
//     AdminAccount = "admin_account",
//     Documents = "documents",
// }
export enum RegistrationStages {
  Organization = "organization",
  Instance = "instance",
  Compliance = "compliance",
  Documents = "documents",
}

export const PLAN_FEATURES: Record<
  string,
  { label: string; included: boolean }[]
> = {
  starter: [
    { label: "50 products", included: true },
    { label: "200 orders / month", included: true },
    { label: "Basic promotions", included: true },
    { label: "Custom domain", included: false },
    { label: "Priority support", included: false },
  ],
  pro: [
    { label: "5,000 products", included: true },
    { label: "Unlimited orders", included: true },
    { label: "Full promotions", included: true },
    { label: "Custom domain", included: true },
    { label: "Priority support", included: false },
  ],
  enterprise: [
    { label: "Unlimited products", included: true },
    { label: "Unlimited orders", included: true },
    { label: "Full promotions", included: true },
    { label: "Custom domain", included: true },
    { label: "Priority support", included: true },
  ],
};
export const CUSTOMER_REGISTRATION_FIELDS = [
  {
    id: "first_name",
    label: "First name",
    type: "text",
    placeholder: "Enter your first name",
    required: true,
  },
  {
    id: "last_name",
    label: "Last name",
    type: "text",
    placeholder: "Enter your last name",
    required: true,
  },
  {
    id: "email",
    label: "Email",
    type: "text",
    placeholder: "Enter your email",
    required: true,
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "Password",
    required: true,
  },
  {
    id: "confirm_password",
    label: "Confirm Password",
    type: "password",
    placeholder: "Please reenter password",
    required: true,
  },
];
export const PASSWORD_CHANGE_FORM_FIELDS = [
  {
    id: "current_password",
    label: "Current Password",
    placeholder: "Enter your current password",
    type: "password",
  },
  {
    id: "new_password",
    label: "New Password",
    placeholder: "Enter your new password",
    type: "password",
  },
  {
    id: "confirm_password",
    label: "Confirm New Password",
    placeholder: "Re-enter your new password",
    type: "password",
  },
];
export const ADDRESS_FIELDS: {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: any[];
}[] = [
  {
    id: "address_for",
    label: "Address Type",
    type: "select",
    options: ["home", "work", "other"],
    placeholder: "Select address type",
    required: true,
  },
  {
    id: "name",
    label: "Recipient Name",
    type: "text",
    placeholder: "Enter recipient's name",
    required: true,
  },
  {
    id: "phone",
    label: "Phone",
    type: "text",
    placeholder: "Enter contact number for this address",
    required: true,
  },
  {
    id: "address_line_1",
    label: "Address Line 1",
    type: "text",
    placeholder: "Enter street address",
    required: true,
  },
  {
    id: "street",
    label: "Street",
    type: "text",
    placeholder: "Enter street name",
    required: true,
  },
  {
    id: "landmark",
    label: "Landmark",
    type: "text",
    placeholder: "Enter nearby landmark",
    required: true,
  },
  {
    id: "country",
    label: "Country",
    type: "select",
    options: [],
    placeholder: "Enter country",
    required: true,
  },
  {
    id: "state",
    label: "State",
    type: "select",
    options: [],
    placeholder: "Enter state",
    required: true,
  },
  {
    id: "city",
    label: "City",
    type: "select",
    options: [],
    placeholder: "Enter city",
    required: true,
  },
  {
    id: "postal_code",
    label: "Postal Code",
    type: "text",
    placeholder: "Enter postal code",
    required: true,
  }, // Changed to text

  { id: "is_default", label: "Set as default address", type: "checkbox" },
] as const;

export const WAREHOUSE_ADDRESS_FIELDS: {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}[] = [
  {
    id: "address_for",
    label: "Warehouse Type",
    type: "select",
    options: ["warehouse", "hub", "other"],
    placeholder: "Select warehouse type",
    required: true,
  },
  {
    id: "name",
    label: "Warehouse Name",
    type: "text",
    placeholder: "Enter warehouse name",
    required: true,
  },
  {
    id: "phone",
    label: "Contact Number",
    type: "text",
    placeholder: "Enter contact number for this warehouse",
    required: true,
  },
  {
    id: "address_line_1",
    label: "Address Line 1",
    type: "text",
    placeholder: "Enter street address",
    required: true,
  },

  {
    id: "street",
    label: "Street",
    type: "text",
    placeholder: "Enter street name",
    required: true,
  },
  {
    id: "country",
    label: "Country",
    type: "select",
    options: [],
    placeholder: "Enter country",
    required: true,
  },
  {
    id: "state",
    label: "State",
    type: "select",
    options: [],
    placeholder: "Enter state",
    required: true,
  },
  {
    id: "city",
    label: "City",
    type: "select",
    options: [],
    placeholder: "Enter city",
    required: true,
  },
  {
    id: "postal_code",
    label: "Postal Code",
    type: "text",
    placeholder: "Enter postal code",
    required: true,
  },
  {
    id: "landmark",
    label: "Landmark",
    type: "text",
    placeholder: "Enter nearby landmark",
    required: true,
  },
  { id: "is_default", label: "Set as default warehouse", type: "checkbox" },
] as const;

export const PAYMENT_METHODS_FIELDS = [
  {
    id: "UPI",
    label: "UPI",
    placeholder: "Enter your UPI ID",
    type: "text",
    description:
      "We will redirect you to your UPI app to complete the payment.",
  },
  {
    id: "CreditCard",
    label: "Credit or Debit Card",
    placeholder: "Card Number",
    type: "text",
    description:
      "We accept all major credit and debit cards. Your card details are processed securely.",
  },
  {
    id: "cod",
    label: "Cash on Delivery/Pay on Delivery",
    placeholder: "Enter delivery instructions",
    type: "text",
    description: "Cash, UPI and Cards accepted. Know more.",
  },
];
export const AUDIT_LOG_COLUMNS = [
  { id: "timestamp", label: "TIMESTAMP" },
  { id: "actor", label: "ACTOR(USER)" },
  { id: "tenant", label: "COMPANY" },
  { id: "actionType", label: "ACTION TYPE" },
  { id: "targetEntity", label: "TARGET ENTITY" },
  { id: "details", label: "DETAILS" },
  { id: "ipAddress", label: "IP ADDRESS" },
];
export const AUTH_LOG_FILTERS = [
  { id: "all", label: "All Status" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "suspended", label: "Suspended" },
];
export const PRODUCT_FORM_PRICING_FIELDS = [
  {
    name: "basePrice",
    label: "Base Price (₹)",
    type: "number",
    placeholder: "0.00",
  },
  {
    name: "discountPercent",
    label: "Discount (%)",
    type: "number",
    placeholder: "0",
  },
  { name: "stocks", label: "Stock Quantity", type: "number", placeholder: "0" },
  { name: "sku", label: "SKU", type: "text", placeholder: "Enter Sku" },
];
export const PRODUCT_FORM_FIELDS = [
  {
    section: "Price & Inventory",
    icon: "tag",
    fields: [
      {
        name: "basePrice",
        label: "Base Price (₹)",
        type: "number",
        placeholder: "0.00",
      },
      {
        name: "discountPercent",
        label: "Discount (%)",
        type: "number",
        placeholder: "0",
      },
      {
        name: "stocks",
        label: "Stock Quantity",
        type: "number",
        placeholder: "0",
      },
      { name: "sku", label: "SKU", type: "text", placeholder: "Enter SKU" },
    ],
  },
  {
    section: "Category & Taxation",
    icon: "building-2",
    fields: [
      { name: "category", label: "Category", type: "select" },
      { name: "status", label: "Status", type: "select" },
      { name: "taxProfile", label: "Tax Profile", type: "select" },
    ],
  },
];
// 3. DYNAMIC FIELDS ARRAY
export const GST_FORM_FIELDS = [
  {
    name: "gst_number",
    label: "GSTIN Number",
    type: "text",
    required: true,
    placeholder: "e.g. 22AAAAA0000A1Z5",
    gridSpan: 2,
  },
  {
    name: "legal_name",
    label: "Legal Name (As per PAN)",
    type: "text",
    required: true,
    gridSpan: 1,
  },
  {
    name: "trade_name",
    label: "Trade Name",
    type: "text",
    required: true,
    gridSpan: 1,
  },
  {
    name: "state_code",
    label: "State Code",
    type: "text",
    required: true,
    placeholder: "e.g. 22",
    gridSpan: 1,
  },
  {
    name: "registration_type",
    label: "Registration Type",
    type: "select",
    options: [
      { label: "Regular", value: "Regular" },
      { label: "Composition", value: "Composition" },
    ],
    gridSpan: 1,
  },
  {
    name: "registration_date",
    label: "Registration Date",
    type: "date",
    required: true,
    gridSpan: 1,
  },
  {
    name: "effective_from",
    label: "Effective From",
    type: "date",
    required: true,
    gridSpan: 1,
  },
  {
    name: "is_default",
    label: "Set as Primary/Default GST Number",
    type: "checkbox",
    gridSpan: 2,
  },
];

export const TAX_PROFILE_FORM_FIELDS: FieldConfig[] = [
  {
    name: "profile_type",
    label: TAX_PROFILE_FORM_TEXT.FIELDS.NAME_LABEL,
    type: FieldType.TEXT,
    required: true,
    placeholder: TAX_PROFILE_FORM_TEXT.FIELDS.NAME_PLACEHOLDER,
    gridSpan: 2,
  },
  {
    name: "tax_profile_description",
    label: TAX_PROFILE_FORM_TEXT.FIELDS.DESC_LABEL,
    type: FieldType.TEXTAREA,
    required: true,
    placeholder: TAX_PROFILE_FORM_TEXT.FIELDS.DESC_PLACEHOLDER,
    gridSpan: 2,
  },
  {
    name: "is_default",
    label: TAX_PROFILE_FORM_TEXT.FIELDS.DEFAULT_LABEL,
    type: FieldType.CHECKBOX,
    gridSpan: 2,
  },
];
export const TAXSLAB_FORM_FIELDS: FieldConfig[] = [
  // Links to Tax Profile (required by tax_types insert)
  {
    name: "tax_profile_id",
    label: TAX_RATES_FORM_TEXT.FIELDS.TAX_PROFILE.LABEL,
    type: FieldType.SELECT,
    required: true,
    placeholder: TAX_RATES_FORM_TEXT.FIELDS.TAX_PROFILE.PLACEHOLDER,
    note: TAX_RATES_FORM_TEXT.FIELDS.TAX_PROFILE.NOTE,
    gridSpan: 2,
  },

  // tax_types fields (semantic definition)
  {
    name: "tax_name",
    label: TAX_RATES_FORM_TEXT.FIELDS.TAX_NAME.LABEL,
    type: FieldType.TEXT,
    required: true,
    placeholder: TAX_RATES_FORM_TEXT.FIELDS.TAX_NAME.PLACEHOLDER,
    note: TAX_RATES_FORM_TEXT.FIELDS.TAX_NAME.NOTE,
  },
  {
    name: "tax_code",
    label: TAX_RATES_FORM_TEXT.FIELDS.TAX_CODE.LABEL,
    type: FieldType.TEXT,
    required: true,
    placeholder: TAX_RATES_FORM_TEXT.FIELDS.TAX_CODE.PLACEHOLDER,
    note: TAX_RATES_FORM_TEXT.FIELDS.TAX_CODE.NOTE,
  },
  {
    name: "tax_scope",
    label: TAX_RATES_FORM_TEXT.FIELDS.TAX_SCOPE.LABEL,
    type: FieldType.SELECT,
    required: true,
    options: [
      {
        value: "Intra-state",
        label: TAX_RATES_FORM_TEXT.FIELDS.TAX_SCOPE.OPTIONS.INTRA,
      },
      {
        value: "Inter-state",
        label: TAX_RATES_FORM_TEXT.FIELDS.TAX_SCOPE.OPTIONS.INTER,
      },
      {
        value: "Both",
        label: TAX_RATES_FORM_TEXT.FIELDS.TAX_SCOPE.OPTIONS.BOTH,
      },
    ],

    note: TAX_RATES_FORM_TEXT.FIELDS.TAX_SCOPE.NOTE,
    gridSpan: 2,
  },

  // tax_slabs fields (numeric rate)
  {
    name: "slab_name",
    label: TAX_RATES_FORM_TEXT.FIELDS.SLAB_NAME.LABEL,
    type: FieldType.TEXT,
    required: true,
    placeholder: TAX_RATES_FORM_TEXT.FIELDS.SLAB_NAME.PLACEHOLDER,
  },
  {
    name: "total_rate",
    label: TAX_RATES_FORM_TEXT.FIELDS.TOTAL_RATE.LABEL,
    type: FieldType.NUMBER,
    required: true,
    placeholder: TAX_RATES_FORM_TEXT.FIELDS.TOTAL_RATE.PLACEHOLDER,
    step: "0.01",
    note: TAX_RATES_FORM_TEXT.FIELDS.TOTAL_RATE.NOTE,
  },
  {
    name: "description",
    label: TAX_RATES_FORM_TEXT.FIELDS.DESCRIPTION.LABEL,
    type: FieldType.TEXTAREA,
    placeholder: TAX_RATES_FORM_TEXT.FIELDS.DESCRIPTION.PLACEHOLDER,
    note: TAX_RATES_FORM_TEXT.FIELDS.DESCRIPTION.NOTE,
    gridSpan: 2,
  },
  {
    name: "effective_from",
    label: TAX_RATES_FORM_TEXT.FIELDS.EFFECTIVE_FROM.LABEL,
    type: FieldType.DATE,
    required: true,
  },
  {
    name: "effective_to",
    label: TAX_RATES_FORM_TEXT.FIELDS.EFFECTIVE_TO.LABEL,
    type: FieldType.DATE,
  },
  {
    name: "is_exempt",
    label: TAX_RATES_FORM_TEXT.FIELDS.IS_EXEMPT.LABEL,
    type: FieldType.CHECKBOX,
    gridSpan: 2,
  },
];
