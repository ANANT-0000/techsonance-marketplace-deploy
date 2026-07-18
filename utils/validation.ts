import * as z from "zod";
import { BannerPlacement, ProductStatus, PromotionType } from "./Types";
// Removed COMPLIANCE_REGEX import
import {
  BRANDING_DEFAULT_PRIMARY_COLOR,
  BRANDING_DEFAULT_BACKGROUND_COLOR,
  BRANDING_DEFAULT_TEXT_COLOR,
  BRANDING_DEFAULT_WHITE_COLOR,
  VENDOR_REGISTER_TEXT,
} from "@/constants";
export const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-+]).{8,}$/,
);

export const PASSWORD_REQUIREMENTS_REGEX = {
  LOWERCASE: /[a-z]/,
  UPPERCASE: /[A-Z]/,
  NUMBER: /\d/,
  SPECIAL_CHAR: /[^a-zA-Z\d]/,
};

export const passwordValidationSchema = z
  .string()
  .regex(
    passwordValidation,
    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
  );

export const COMPLIANCE_REGEX: Record<
  string,
  { pattern: RegExp; message: string }
> = {
  // India
  gstin: {
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
    message:
      "Invalid GSTIN. Format: 2-digit state code + 10-char PAN + 1-char entity + Z + 1-char checksum",
  },
  pan: {
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    message:
      "Invalid PAN. Format: 5 uppercase letters + 4 digits + 1 uppercase letter",
  },
  fssai: {
    pattern: /^[0-9]{14}$/,
    message: "FSSAI license must be exactly 14 digits",
  },
  aadhaar: {
    pattern: /^\d{12}$/,
    message: "Aadhaar must be exactly 12 digits",
  },
  personal_pan: {
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    message: "Invalid Personal PAN",
  },
  // Bangladesh
  bin: {
    pattern: /^[0-9]{9}$/,
    message: "Invalid BIN. Must be exactly 9 digits",
  },
  tin: {
    pattern: /^[0-9]{12}$/,
    message: "Invalid TIN. Must be exactly 12 digits",
  },
  // Sri Lanka
  tin_lk: {
    pattern: /^[0-9]{9}([0-9]{3})?$/,
    message: "Invalid TIN. Must be 9 or 12 digits",
  },
  vat_reg: {
    pattern: /^[0-9]{9}[VX]$/,
    message: "Invalid VAT number. Format: 9 digits followed by V or X",
  },
  nid_bd: {
    pattern: /^(\d{10}|\d{13}|\d{17})$/,
    message: "NID must be 10, 13, or 17 digits",
  },
  nic_lk: {
    pattern: /^(\d{9}[VXvx]|\d{12})$/,
    message: "Invalid NIC format",
  },
  emirates_id: {
    pattern: /^\d{15}$/,
    message: "Emirates ID must be exactly 15 digits",
  },
  iqama_sa: {
    pattern: /^\d{10}$/,
    message: "Iqama / National ID must be exactly 10 digits",
  },
};

// ─── Single compliance entry ──────────────────────────────────────────────────
const complianceEntrySchema = z.object({
  field_key: z.string().min(1),
  field_value: z.string(), // validated at step level, not schema level (dynamic)
  is_active: z.boolean().optional().default(true),
  valid_until: z.string().optional(),
});

const maxDigits = 3; // Change this number to your limit
// ─── Main schema ─────────────────────────────────────────────────────────────
export const vendorRegisterSchema = z
  .object({
    // Step 0 — Organization
    company_name: z
      .string()
      .trim()
      .min(2, "Company name must be at least 2 characters")
      .max(100, "Company name too long")
      .regex(
        /^[a-zA-Z0-9\s&.,'-]+$/,
        "Only letters, numbers, spaces, and basic punctuation are allowed",
      )
      .refine((val) => !/(.)\1{2,}/.test(val), {
        message: "Consecutive repeating characters are not allowed",
      })
      .refine(
        (val) => {
          const digitCount = (val.match(/\d/g) || []).length;
          return digitCount <= maxDigits;
        },
        {
          message: `Company name can contain at most ${maxDigits} numbers`,
        },
      ),
    store_owner_first_name: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name too long")
      .regex(
        /^[A-Za-z\s'-]+$/,
        "First name can only contain letters, spaces, hyphens and apostrophes",
      )
      .refine((val) => !/(.)\1{2,}/.test(val.toLowerCase()), {
        message: "Consecutive repeating characters are not allowed",
      }),
    store_owner_last_name: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name too long")
      .regex(
        /^[A-Za-z\s'-]+$/,
        "Last name can only contain letters, spaces, hyphens and apostrophes",
      )
      .refine((val) => !/(.)\1{2,}/.test(val.toLowerCase()), {
        message: "Consecutive repeating characters are not allowed",
      }),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .max(254, "Email too long"),
    country_code: z.string().min(1, "Please select a country code"),
    phone_number: z
      .string()
      .min(7, "Phone number too short")
      .max(15, "Phone number too long")
      .regex(
        /^[0-9\-\s\+\(\)]+$/,
        "Enter a valid phone number (digits, spaces, hyphens, +, parentheses)",
      ),
    category: z.string().min(1, "Please select a business category"),
    company_structure: z.string().min(1, "Please select a company structure"),
    password: z
      .string()
      .min(8, "Password too short")
      .regex(
        passwordValidation,
        "Password must include uppercase, lowercase, number, and special character",
      ),
    confirm_password: z.string(),
    plan_id: z.string().min(1, "Please select a subscription plan"),
    // Step 1 - Domain
    domain_type: z.enum(["subdomain", "custom"]).default("subdomain"),
    company_domain: z
      .string()
      .min(3, "Domain must be at least 3 characters")
      .max(255, "Domain too long"),

    // Step 2 — Compliance (array; individual field_value regex validated at step level)
    company_compliance: z.array(complianceEntrySchema).default([]),
  })
  .refine((data) => data.password === data.confirm_password, {
    error: "Passwords do not match",
    path: ["confirm_password"],
  })
  .superRefine((data, ctx) => {
    if (data.domain_type === "subdomain") {
      const slug = data.company_domain || "";
      if (slug.length < 3) {
        ctx.addIssue({
          code: "custom",
          path: ["company_domain"],
          message: "Domain must be at least 3 characters",
        });
      }
      if (slug.length > 63) {
        ctx.addIssue({
          code: "custom",
          path: ["company_domain"],
          message: "Domain too long (max 63 chars)",
        });
      }
      if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]{3,}$/.test(slug)) {
        ctx.addIssue({
          code: "custom",
          path: ["company_domain"],
          message:
            "Domain: lowercase letters and numbers only, no leading/trailing hyphens",
        });
      }
    } else if (data.domain_type === "custom") {
      const custom = data.company_domain || "";
      if (!custom) {
        ctx.addIssue({
          code: "custom",
          path: ["company_domain"],
          message: "Please enter your custom domain",
        });
      } else if (
        !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i.test(
          custom,
        )
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["company_domain"],
          message: "Domain must include a valid extension like .com or .co.in",
        });
      }
    }
  });

export type VendorRegisterSchema = z.infer<typeof vendorRegisterSchema>;

export const SUBDOMAIN_RULES = [
  {
    text: VENDOR_REGISTER_TEXT.DOMAIN_RULE_SUB_1,
    isValid: (val: string) => /^[a-z0-9-]+$/.test(val) && !/[A-Z]/.test(val),
  },
  {
    text: VENDOR_REGISTER_TEXT.DOMAIN_RULE_SUB_2,
    isValid: (val: string) =>
      val.length > 0 && !val.startsWith("-") && !val.endsWith("-"),
  },
  {
    text: VENDOR_REGISTER_TEXT.DOMAIN_RULE_SUB_3,
    isValid: (val: string) => val.length >= 3 && val.length <= 63,
  },
];

export const CUSTOM_DOMAIN_RULES = [
  {
    text: VENDOR_REGISTER_TEXT.DOMAIN_RULE_CUS_1,
    isValid: (val: string) =>
      val.length > 0 && !/^https?:\/\//i.test(val) && !/^www\./i.test(val),
  },
  {
    text: VENDOR_REGISTER_TEXT.DOMAIN_RULE_CUS_2,
    isValid: (val: string) =>
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i.test(
        val,
      ),
  },
  {
    text: VENDOR_REGISTER_TEXT.DOMAIN_RULE_CUS_3,
    isValid: (val: string) =>
      val.length > 0 && !/\/$/.test(val) && val.split("/").length === 1,
  },
];
// ─── Step-level compliance validator (called in nextStep for step 2) ──────────
// Returns a map of field_key → error message string (empty = valid)
export function validateComplianceFields(
  fields: { value: string; label: string; required: boolean }[],
  complianceValues: Record<string, string>, // { gstin: "27AAP...", pan: "ABCDE..." }
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const val = (complianceValues[field.value] ?? "").trim();

    if (field.required && !val) {
      errors[field.value] = `${field.label} is required`;
      continue;
    }

    if (val && COMPLIANCE_REGEX[field.value]) {
      const { pattern, message } = COMPLIANCE_REGEX[field.value];
      if (!pattern.test(val)) {
        errors[field.value] = message;
      }
    }
  }

  return errors;
}

// ─── Document upload validator (called in nextStep for step 2 & step 3) ───────
// Returns list of missing required document labels
export function validateRequiredDocuments(
  fields: { value: string; label: string; required: boolean }[],
  fileMap: { file: File | null; type: string; index: number }[],
): string[] {
  const missing: string[] = [];
  fields.forEach((field, index) => {
    if (!field.required) return;
    const entry = fileMap.find((f) => f.index === index);
    if (!entry?.file) {
      missing.push(field.label);
    }
  });
  return missing;
}

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string()
    .regex(
      passwordValidation,
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    )
    .min(1, { error: "Password is required" })
    .max(36, { error: "Password cannot exceed 36 characters" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const customerRegisterSchema = z
  .object({
    first_name: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50)
      .regex(/^[A-Za-z\s\-']+$/, "Invalid characters in name"), // Allows spaces/hyphens

    last_name: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50)
      .regex(/^[A-Za-z\s\-']+$/, "Invalid characters in name"),

    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required"),

    phone_number: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid format (e.g., +1234567890)")
      .optional()
      .or(z.literal("")),

    password: z
      .string()
      .min(8, "Password too short")
      .regex(
        passwordValidation,
        "Password must include uppercase, lowercase, number, and special character",
      ),

    confirm_password: z.string(),

    terms_accepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    error: "Passwords do not match",
    path: ["confirm_password"],
  });
export type CustomerRegisterSchemaType = Partial<
  z.infer<typeof customerRegisterSchema>
>;

export const productSchema = z.object({
  variantId: z.string().optional(),
  productName: z
    .string()
    .min(1, { error: "Product name is required" })
    .max(355, { error: "Name is too long" }),
  description: z
    .string()
    .min(10, { error: "Description must be at least 10 characters" })
    .max(5000, { error: "Description cannot exceed 5000 characters" }),
  features: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, { error: "Feature title required" })
          .max(355, { error: "Feature title is too long" }),
        description: z
          .string()
          .min(1, { error: "Feature details required" })
          .max(5000, { error: "Feature details cannot exceed 5000 characters" })
          .or(z.number())
          .or(z.boolean()),
      }),
    )
    .min(1, { error: "Add at least one feature" }),

  attributes: z.array(
    z.object({
      name: z
        .string()
        .min(1, { error: "Attribute name required" })
        .max(355, { error: "Attribute name is too long" }),
      value: z
        .string()
        .min(1, { error: "Attribute value required" })
        .max(355, { error: "Attribute value is too long" }),
    }),
  ),
  basePrice: z
    .string()
    .min(1, { error: "Price is required" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      error: "Invalid price format. Use numbers like 99 or 99.99",
    })
    .transform((val) => parseFloat(val)),

  discountPercent: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Invalid discount format" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? parseFloat(val) : null)),

  stocks: z
    .string()
    .regex(/^\d+$/, { error: "Stock must be a non-negative integer" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? parseInt(val, 10) : null)),

  sku: z.string().optional(),

  category: z.string().min(1, { error: "Please select a category" }),

  status: z.enum(Object.values(ProductStatus) as [string, ...string[]], {
    error: "Please select a status",
  }),
  warehouseId: z.string().min(1, { error: "Warehouse is required" }),
  taxSlabId: z.string().min(1, { error: "Tax slab is required" }),
  weight_kg: z
    .string()
    .min(1, { error: "Weight is required" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      error: "Invalid weight format. Use numbers like 0.5 or 10",
    }),
  length_cm: z
    .string()
    .min(1, { error: "Length is required" })
    .regex(/^\d+$/, { error: "Length must be a positive integer" })
    .transform((val) => parseInt(val, 10)),
  width_cm: z
    .string()
    .min(1, { error: "Width is required" })
    .regex(/^\d+$/, { error: "Width must be a positive integer" })
    .transform((val) => parseInt(val, 10)),
  height_cm: z
    .string()
    .min(1, { error: "Height is required" })
    .regex(/^\d+$/, { error: "Height must be a positive integer" })
    .transform((val) => parseInt(val, 10)),
  productMedia: z
    .array(z.any())
    .min(0, { error: "At least one product image is required" })
    .max(1, { error: "You can upload up to 1 image" }),
  featureMedia: z
    .array(z.any())
    .min(0, { error: "At least one feature image is required" })
    .max(10, { error: "You can upload up to 10 images" }),
});
// Replace z.infer with these two:
export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormOutput = z.output<typeof productSchema>;
export type ProductFormValuesType = z.infer<typeof productSchema>;

export const productVariantSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  warehouseId: z.string().optional(),
  variantName: z
    .string()
    .min(1, { error: "Variant name is required" })
    .max(355, { error: "Name is too long" }),
  attributes: z.array(
    z.object({
      name: z
        .string()
        .min(1, { error: "Attribute name required" })
        .max(355, { error: "Attribute name is too long" }),
      value: z
        .string()
        .min(1, { error: "Attribute value required" })
        .max(355, { error: "Attribute value is too long" }),
    }),
  ),
  basePrice: z
    .string()
    .min(1, { error: "Price is required" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      error: "Invalid price format. Use numbers like 99 or 99.99",
    })
    .transform((val) => parseFloat(val)),

  discountPercent: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Invalid discount format" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? parseFloat(val) : null)),

  stocks: z
    .string()
    .regex(/^\d+$/, { error: "Stock must be a non-negative integer" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? parseInt(val, 10) : null)),

  sku: z.string().optional(),
  status: z.enum(Object.values(ProductStatus) as [string, ...string[]], {
    error: "Please select a status",
  }),
  weight_kg: z
    .string()
    .min(1, { error: "Weight is required" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      error: "Invalid weight format. Use numbers like 0.5 or 10",
    }),
  length_cm: z
    .string()
    .min(1, { error: "Length is required" })
    .regex(/^\d+$/, { error: "Length must be a positive integer" })
    .transform((val) => parseInt(val, 10)),
  width_cm: z
    .string()
    .min(1, { error: "Width is required" })
    .regex(/^\d+$/, { error: "Width must be a positive integer" })
    .transform((val) => parseInt(val, 10)),
  height_cm: z
    .string()
    .min(1, { error: "Height is required" })
    .regex(/^\d+$/, { error: "Height must be a positive integer" })
    .transform((val) => parseInt(val, 10)),
  variantMediaMain: z
    .array(z.any())
    .min(0, { error: "At least one product image is required" })
    .max(1, { error: "You can upload up to 1 image" }),
  variantMediaGallery: z
    .array(z.any())
    .min(0, { error: "At least one feature image is required" })
    .max(10, { error: "You can upload up to 10 images" }),
});

export type ProductVariantFormValuesType = z.infer<typeof productVariantSchema>;

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Name is required" })
    .max(50, { error: "Name is too long" }),

  email: z
    .email({ error: "Invalid email address" })
    .min(3, { error: "Email is required" })
    .max(100, { error: "Email cannot exceed 100 characters" }),

  phone: z
    .string()
    .min(1, { error: "Phone number is required" })
    // Regex ensures ONLY digits. No 'e', '+', or '-' allowed.
    .regex(/^[0-9]+$/, { error: "Please enter digits only" })
    .min(10, { error: "Phone number must be at least 10 digits" })
    .max(15, { error: "Phone number cannot exceed 15 digits" }),

  message: z
    .string()
    .min(10, { error: "Message must be at least 10 characters long" })
    .max(1000, { error: "Message cannot exceed 1000 characters" }),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, { error: "Current password is required" })
      .max(36, { error: "Current password cannot exceed 36 characters" })
      .regex(passwordValidation, {
        error:
          "Current password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      }),

    new_password: z
      .string()
      .max(36, { error: "New password cannot exceed 36 characters" })
      .regex(passwordValidation, {
        error:
          "New password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      }),

    confirm_password: z
      .string()
      .min(1, { error: "Please confirm your new password" }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    error: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export const profileEditSchema = z.object({
  profile_picture: z
    .url({ error: "Please enter a valid image URL" })
    .optional()
    .or(z.literal("")),

  first_name: z
    .string()
    .min(2, { error: "First name must be at least 2 characters" })
    .max(50, { error: "First name cannot exceed 50 characters" }),

  last_name: z
    .string()
    .min(2, { error: "Last name must be at least 2 characters" })
    .max(50, { error: "Last name cannot exceed 50 characters" }),

  email: z
    .email({ error: "Invalid email address" })
    .min(1, { error: "Email is required" })
    .max(24, { error: "Email cannot exceed 24 characters" }),

  phone: z
    .string()
    .min(10, { error: "Phone number must be at least 10 digits" })
    .max(15, { error: "Phone number cannot exceed 15 digits" })
    .regex(/^[0-9]+$/, {
      error: "Please enter digits only (no 'e' or symbols)",
    }),
});

export type ProfileEditData = z.infer<typeof profileEditSchema>;

export const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, { message: "Code must be at least 3 characters" })
      .max(20, { message: "Code cannot exceed 20 characters" })
      .regex(/^[a-zA-Z0-9]+$/, { message: "Code must be alphanumeric" }),

    description: z
      .string()
      .min(3, { message: "Description must be at least 3 characters" })
      .max(100, { message: "Description cannot exceed 100 characters" }),

    discount_type: z.enum(
      Object.values(PromotionType) as [string, ...string[]],
      {
        message: "Please select a valid discount type",
      },
    ),

    value: z
      .number("Enter a valid amount")
      .min(0.01, "Value must be greater than 0"),

    valid_from: z.string().min(1, { message: "Start date is required" }),
    valid_to: z.string().min(1, { message: "End date is required" }),

    // Optional Advanced Limits
    min_order_amount: z.string().optional(),
    max_discount_amount: z.string().optional(),
    max_uses: z.number().optional().nullable(),
    max_uses_per_user: z.number().optional().nullable(),

    // Booleans
    is_auto_applied: z.boolean().optional(),
    is_active: z.boolean().optional(),
    applicable_product_ids: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discount_type === PromotionType.PERCENTAGE && data.value > 100) {
      ctx.addIssue({
        code: "custom",
        message: "Percentage discounts cannot exceed 100%",
        path: ["value"],
      });
    }
    if (new Date(data.valid_to) < new Date(data.valid_from)) {
      ctx.addIssue({
        code: "custom",
        message: "End date cannot be earlier than start date",
        path: ["valid_to"],
      });
    }
  });

export type CouponFormData = z.infer<typeof couponSchema>;

export const billingSchema = z.object({
  gstin: z
    .string()
    .min(1, { error: "GSTIN is required" })
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
      error: "Invalid GSTIN format (e.g., 24ABCDE1234F1Z5)",
    }),

  pan: z
    .string()
    .min(1, { error: "PAN is required" })
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
      error: "Invalid PAN format (e.g., ABCDE1234F)",
    }),

  businessName: z
    .string()
    .min(3, { error: "Business name must be at least 3 characters" })
    .max(50, { error: "Business name cannot exceed 50 characters" }),

  prefix: z
    .string()
    .min(1, { error: "Prefix is required" })
    .max(5, { error: "Prefix too long (max 5)" }),

  year: z.number({
    error: "Year is required and must be a number",
  }),

  startSequence: z
    .number({
      error: "Sequence is required and must be a number",
    })
    .min(1, { error: "Sequence must start at 1 or higher" }),
  termsAndNotes: z.string().optional(),
  signatureUrl: z.string().optional(),
});

export type BillingFormData = z.infer<typeof billingSchema>;

const ADDRESS_TYPE_ENUM = [
  "home",
  "work",
  "warehouse",
  "hub",
  "other",
] as const;
export const AddressSchema = z.object({
  // id: z.uuid({ error: "Invalid unique identifier" }),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(36, "Name must not exceed 36 characters")
    .regex(
      /^[a-zA-Z\s\-]+$/,
      "Name can only contain letters spaces, and hyphens",
    ),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits with no spaces"),
  address_for: z.enum(ADDRESS_TYPE_ENUM),

  address_line_1: z
    .string()
    .min(1, "Address line 1 is required")
    .max(100, "Address line 1 must not exceed 100 characters"),

  city: z
    .string()
    .min(1, "City is required")
    .max(50, "City must not exceed 50 characters"),

  state: z
    .string()
    .min(1, "State is required")
    .max(50, "State must not exceed 50 characters"),
  street: z
    .string()
    .min(1, "Street is required")
    .max(100, "Street must not exceed 100 characters"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(50, "Country must not exceed 50 characters"),
  landmark: z
    .string()
    .min(1, "Landmark is required")
    .max(100, "Landmark must not exceed 100 characters"),

  postal_code: z
    .string()
    .length(6, "Postal code must be exactly 6 digits")
    .regex(/^\d+$/, "Postal code must be numeric"),

  is_default: z.boolean().default(false),
});

export type AddressType = z.infer<typeof AddressSchema>;

export enum LocationFor {
  WAREHOUSE = "warehouse",
  HUB = "hub",
  OTHER = "other",
}
export const locationSchema = z.object({
  default: z.string().transform((val) => val === "true"), // Converts string "true" to boolean true
  name: z.string().min(3, { error: "Name must be at least 3 characters" }),
  type: z.enum(Object.values(LocationFor) as [string, ...string[]], {
    error: "Please select a valid type",
  }),
  address: z
    .string()
    .min(5, { error: "Address must be at least 5 characters" }),
  city: z.string().min(2, { error: "City is required" }),
  state: z.string().min(2, { error: "State is required" }),
  contactPerson: z.string().optional(),
  phone: z.string().refine((val) => !val || /^\+?[0-9\s\-]{7,15}$/.test(val), {
    error: "Invalid phone number format",
  }),
});

export type LocationFormData = z.infer<typeof locationSchema>;

export const brandingSchema = z.object({
  logo_url: z.string().optional(),
  logo_dark_url: z.string().optional(),
  watermark_url: z.string().optional(),
  favicon_url: z.string().optional(),
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .default(BRANDING_DEFAULT_PRIMARY_COLOR),
  secondary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .optional()
    .or(z.literal("")),
  accent_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .optional()
    .or(z.literal("")),
  font_family: z.string().min(1, "Required").default("Inter"),
  background_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .default(BRANDING_DEFAULT_BACKGROUND_COLOR),
  text_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .default(BRANDING_DEFAULT_TEXT_COLOR),
  navbar_bg: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .default(BRANDING_DEFAULT_WHITE_COLOR),
  navbar_fg: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .default(BRANDING_DEFAULT_TEXT_COLOR),
  footer_bg: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .default(BRANDING_DEFAULT_TEXT_COLOR),
  footer_fg: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .default(BRANDING_DEFAULT_WHITE_COLOR),
  navbar_position: z.string().optional().default("sticky"),
  logo_alignment: z.string().optional().default("left"),
  footer_style: z.string().optional().default("detailed"),
  border_radius: z.string().optional().default("md"),
  card_style: z.string().optional().default("standard"),
  homepage_layout: z
    .array(z.string())
    .optional()
    .default([
      "hero",
      "categories",
      "products",
      "promo",
      "new_arrivals",
      "newsletter",
    ]),
});

export const legalSchema = z.object({
  legal_name: z.string().min(2, "Required"),
  trade_name: z.string().optional(),
  country_code: z.string().length(2, "Must be 2-letter ISO code"),
  registered_address_id: z.string(),
  support_email: z.email("Invalid email").optional().or(z.literal("")),
  support_phone: z.string().optional(),
  website_url: z.url("Invalid URL").optional().or(z.literal("")),
});

export const docConfigSchema = z.object({
  invoice_number_prefix: z.string().min(1).max(10).default("INV"),
  invoice_number_format: z.string().min(1).default("{PREFIX}-{YYYY}-{SEQ8}"),
  invoice_sequence_reset: z.enum(["APRIL", "CALENDAR"]).default("APRIL"),
  default_currency: z.string().length(3).default("INR"),
  default_timezone: z.string().min(1).default("Asia/Kolkata"),
  date_format: z.string().min(1).default("DD/MM/YYYY"),
  signatory_name: z.string().optional(),
  signatory_designation: z.string().optional(),
  signatory_signature_url: z.string().optional(),
  invoice_footer_text: z.string().optional(),
  invoice_terms_and_conditions: z.string().optional(),
});
export const policyFormSchema = z.object({
  policy_name: z
    .string()
    .trim()
    .min(3, "Policy name must be at least 3 characters")
    .max(100, "Cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Only letters, numbers, spaces, hyphens, and underscores",
    ),

  policy_type: z.string().trim().min(1, "Please select a policy type"),
  duration_value: z
    .number()
    .min(1, "Duration must be at least 1")
    .max(36500, "Duration exceeds realistic limits")
    .optional()
    .or(z.nan().transform(() => undefined)),

  duration_unit: z.string().optional(),

  coverage_description: z
    .string()
    .trim()
    .max(2000, "Cannot exceed 2000 characters")
    .optional(),
  exclusions: z
    .string()
    .trim()
    .max(2000, "Cannot exceed 2000 characters")
    .optional(),
  service_provider: z
    .string()
    .trim()
    .max(100, "Cannot exceed 100 characters")
    .optional(),

  claim_contact_email: z.email("Please enter a valid email address").optional(),

  claim_contact_phone: z
    .literal("")
    .or(
      z
        .string()
        .trim()
        .regex(/^\+?[1-9]\d{1,14}$/, "Valid format: +1234567890"),
    )
    .optional(),

  claim_process_description: z
    .string()
    .trim()
    .max(2000, "Cannot exceed 2000 characters")
    .optional(),

  generates_document: z.boolean({ error: "Required" }),
  is_active: z.boolean({ error: "Required" }),

  // ─── Return & Replacement Fields ─────────────────────────────────────────
  /** Whether customers can return this product for a refund. */
  is_returnable: z.boolean().default(false),

  /** Whether customers can request a replacement unit. */
  is_replaceable: z.boolean().default(false),

  /**
   * Days from delivery within which a return can be initiated.
   * Only relevant when is_returnable = true. Max 365 days.
   */
  return_window_days: z
    .number()
    .int("Must be a whole number")
    .min(1, "Must be at least 1 day")
    .max(365, "Cannot exceed 365 days")
    .optional()
    .or(z.nan().transform(() => undefined)),

  /**
   * Days from delivery within which a replacement can be requested.
   * Only relevant when is_replaceable = true. Max 365 days.
   */
  replacement_window_days: z
    .number()
    .int("Must be a whole number")
    .min(1, "Must be at least 1 day")
    .max(365, "Cannot exceed 365 days")
    .optional()
    .or(z.nan().transform(() => undefined)),

  /**
   * Freetext eligibility conditions displayed to the customer.
   * e.g. "Item must be unused, sealed, with all original accessories."
   */
  return_conditions: z
    .string()
    .trim()
    .max(1000, "Cannot exceed 1000 characters")
    .optional(),
  // ─────────────────────────────────────────────────────────────────────────
});

export type PolicyFormSchemaType = z.infer<typeof policyFormSchema>;

export const ticketSchema = z.object({
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(150, "Subject is too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description is too long"),
  priority: z.enum(["High", "Medium", "Low"]),
  attachment: z
    .any()
    .nullable()
    .refine(
      (val) => {
        if (val === null || val === undefined) return true;
        return typeof val === "object" && "name" in val && "size" in val;
      },
      { message: "Invalid file" },
    ),
});

export type TicketFormData = z.infer<typeof ticketSchema>;

export const bannerSchema = z.object({
  placement: z.enum(Object.values(BannerPlacement) as [string, ...string[]], {
    message: "Please select a valid placement",
  }),

  image_alt_text: z.string().max(200).optional().or(z.literal("")),
  headline: z.string().min(3).max(150).optional().or(z.literal("")),
  sub_headline: z.string().max(250).optional().or(z.literal("")),
  cta_label: z.string().min(2).max(50).optional().or(z.literal("")),
  cta_url: z.string().optional().or(z.literal("")),
  valid_from: z.string().optional().or(z.literal("")),
  valid_to: z.string().optional().or(z.literal("")),

  display_order: z.coerce.number().int().min(0).optional(),

  promotion_id: z.string().optional().or(z.literal("")),
  is_active: z.boolean().default(true),

  image_url: z.any().optional(),
  image_url_mobile: z.any().optional(),
  remove_image_url: z.any().optional(),
  remove_image_url_mobile: z.any().optional(),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;
