import { id, pl } from "date-fns/locale";
import { BusinessStructure, categoryOptions, COUNTRY_CODES } from "./common";

export const ORGANIZATION_DETAIL_FIELDS = [
    { id: "company_name", label: "Company Name", placeholder: "Enter your company name", type: "text" },
    { id: "store_owner_first_name", label: "First Name", placeholder: "Enter your first name", type: "text" },
    { id: "store_owner_last_name", label: "Last Name", placeholder: "Enter your last name", type: "text" },
    {
        id: "phone_number", label: "Business Phone Number", groupField: [
            { id: "country_code", type: "select", options: COUNTRY_CODES, styles: "rounded-r-none" },
            { id: "phone_number", type: "tel", placeholder: "123-456-7890", styles: "rounded-l-none" },
        ]
    },

    { id: "category", label: "Business Category", type: "select", options: categoryOptions },
    { id: "company_structure", label: "Business Structure", type: "select", options: BusinessStructure },
];

export const BUSINESS_ADMIN_ACCOUNT_FIELDS = [
    { id: "first_name", label: "Admin First Name", placeholder: "Enter your first name", type: "text" },
    { id: "last_name", label: "Admin Last Name", placeholder: "Enter your last name", type: "text" },
    { id: "email", label: "Admin Email", placeholder: "Enter your email", type: "email" },
    { id: "password", label: "Password", placeholder: "Enter your password", type: "password" },
    { id: "confirm_password", label: "Confirm Password", placeholder: "Confirm your password", type: "password" },
];

export enum RegistrationStages {
    Organization = "organization",
    Instance = "instance",
    Compliance = "compliance",
    AdminAccount = "admin_account",
    Documents = "documents",
}

export const CUSTOMER_REGISTRATION_FIELDS = [
    { id: "first_name", label: "First name", type: "text", placeholder: "Enter your first name" },
    { id: "last_name", label: "Last name", type: "text", placeholder: "Enter your last name" },
    { id: "email", label: "Email", type: "text", placeholder: "Enter your email" },
    { id: "password", label: "Password", type: "password", placeholder: "Password" },
    { id: "confirm_password", label: "Confirm Password", type: "password", placeholder: "Please reenter password" },
]
export const PASSWORD_CHANGE_FORM_FIELDS = [
    {
        id: "current_password",
        label: "Current Password",
        placeholder: "Enter your current password",
        type: "password"
    },
    {
        id: "new_password",
        label: "New Password",
        placeholder: "Enter your new password",
        type: "password"
    },
    {
        id: "confirm_password",
        label: "Confirm New Password",
        placeholder: "Re-enter your new password",
        type: "password"
    }
]
export const ADDRESS_FIELDS: {
    id: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
}[] = [
    { id: "address_for", label: "Address Type", type: "select", options: ["home", "work", "other"], placeholder: "Select address type", required: true },
    { id: 'name', label: 'Recipient Name', type: 'text', placeholder: "Enter recipient's name", required: true },
    { id: "phone", label: "Phone", type: "text", placeholder: "Enter contact number for this address", required: true },
    { id: "address_line_1", label: "Address Line 1", type: "text", placeholder: "Enter street address", required: true },
    { id: "address_line_2", label: "Address Line 2", type: "text", placeholder: "Enter apartment, suite, etc.", required: false },

    { id: "street", label: "Street", type: "text", placeholder: "Enter street name", required: true },
    { id: "city", label: "City", type: "text", placeholder: "Enter city", required: true },
    { id: "state", label: "State", type: "text", placeholder: "Enter state", required: true },
    { id: "postal_code", label: "Postal Code", type: "text", placeholder: "Enter postal code", required: true },
    { id: "country", label: "Country", type: "text", placeholder: "Enter country", required: true },
    { id: "landmark", label: "Landmark", type: "text", placeholder: "Enter nearby landmark", required: true },
    { id: "is_default", label: "Set as default address", type: "checkbox" }

] as const;
export const WAREHOUSE_ADDRESS_FIELDS: {
    id: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
}[] = [
    { id: "address_for", label: "Warehouse Type", type: "select", options: ["warehouse", "hub", "other"], placeholder: "Select warehouse type", required: true },
    { id: 'name', label: 'Warehouse Name', type: 'text', placeholder: "Enter warehouse name", required: true },
    { id: "phone", label: "Contact Number", type: "text", placeholder: "Enter contact number for this warehouse", required: true },
    { id: "address_line_1", label: "Address Line 1", type: "text", placeholder: "Enter street address", required: true },
    { id: "address_line_2", label: "Address Line 2", type: "text", placeholder: "Enter apartment, suite, etc.", required: false },

    { id: "street", label: "Street", type: "text", placeholder: "Enter street name", required: true },
    { id: "city", label: "City", type: "text", placeholder: "Enter city", required: true },
    { id: "state", label: "State", type: "text", placeholder: "Enter state", required: true },
    { id: "postal_code", label: "Postal Code", type: "text", placeholder: "Enter postal code", required: true },
    { id: "country", label: "Country", type: "text", placeholder: "Enter country", required: true },
    { id: "landmark", label: "Landmark", type: "text", placeholder: "Enter nearby landmark", required: true },
    { id: "is_default", label: "Set as default warehouse", type: "checkbox" }

] as const;
export const PAYMENT_METHODS_FIELDS = [
    { id: 'UPI', label: 'UPI', placeholder: 'Enter your UPI ID', type: 'text', description: 'We will redirect you to your UPI app to complete the payment.' },
    { id: 'CreditCard', label: 'Credit or Debit Card', placeholder: 'Card Number', type: 'text', description: 'We accept all major credit and debit cards. Your card details are processed securely.' },
    { id: 'cod', label: 'Cash on Delivery/Pay on Delivery', placeholder: 'Enter delivery instructions', type: 'text', description: 'Cash, UPI and Cards accepted. Know more.' }
];
export const AUDIT_LOG_COLUMNS = [
    { id: 'timestamp', label: 'TIMESTAMP' },
    { id: 'actor', label: 'ACTOR(USER)' },
    { id: 'tenant', label: 'COMPANY' },
    { id: 'actionType', label: 'ACTION TYPE' },
    { id: 'targetEntity', label: 'TARGET ENTITY' },
    { id: 'details', label: 'DETAILS' },
    { id: 'ipAddress', label: 'IP ADDRESS' },
];
export const AUTH_LOG_FILTERS = [
    { id: 'all', label: 'All Status' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'suspended', label: 'Suspended' },
];
export const PRODUCT_FORM_PRICING_FIELDS = [
    { name: "basePrice", label: "Base Price (₹)", type: "number", placeholder: "0.00" },
    { name: "discountPercent", label: "Discount (%)", type: "number", placeholder: "0" },
    { name: "stocks", label: "Stock Quantity", type: "number", placeholder: "0" },
    { name: 'sku', label: "SKU", type: 'text', placeholder: "Enter Sku" }
];
export const PRODUCT_FORM_FIELDS = [

    {
        section: "Price & Inventory", icon: 'tag', fields: [
            { name: "basePrice", label: "Base Price (₹)", type: "number", placeholder: "0.00" },
            { name: "discountPercent", label: "Discount (%)", type: "number", placeholder: "0" },
            { name: "stocks", label: "Stock Quantity", type: "number", placeholder: "0" },
            { name: "sku", label: "SKU", type: "text", placeholder: "Enter SKU" },
        ]
    },
    {
        section: "Category & Taxation", icon: 'building-2', fields: [
            { name: "category", label: "Category", type: "select", },
            { name: "status", label: "Status", type: "select", },
            { name: "taxProfile", label: "Tax Profile", type: "select", },
        ]

    }
]