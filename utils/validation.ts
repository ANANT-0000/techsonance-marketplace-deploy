import * as z from 'zod'
import { ProductStatusEnum, PromotionType } from './Types';
export const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
);
export const passwordValidationSchema = z.string().regex(passwordValidation, "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character");
const company_complianceSchema = z.array(
    z.object({
      field_key: z.string( "Field key is required" )
        .trim()
        .min(1, "Field key cannot be empty")
        .max(100, "Field key is too long"),

      field_value: z.string("Field value is required" )
        .trim()
        .min(1, "Field value cannot be empty")
        .max(1000, "Field value is too long"),

      is_active: z.boolean()
        .optional()
        .default(false),

      valid_until: z.string()
        .trim()
        // Optional: Validates it's an actual date format. Remove if it's just a free-text string.
        .datetime({ error: "Must be a valid ISO date string (e.g., 2026-12-31T23:59:59Z)" }) 
        .optional()
        .nullable()
        .or(z.literal('')) // Allows an empty string "" to pass validation without failing
    })
  )

export const vendorRegisterSchema = z.object({
  company_name: z.string().min(2, "Company name is required"),
  store_owner_first_name: z.string().min(2, "Owner first name is required"),
  store_owner_last_name: z.string().min(2, "Owner last name is required"),
  country_code: z.string().min(1, "Country code is required"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9\-]+$/, "Please use format 123-456-7890"),
  category: z.string().min(1, "Category is required"),
  company_structure: z.string().min(1, "Company structure is required"),
  company_domain: z
    .string()
    .min(3, "Domain is too short")
    .regex(/^[a-z0-9-]+$/, "Domain can only contain lowercase letters, numbers, and hyphens"),
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.email("Enter a valid email address"),
  company_compliance: company_complianceSchema,
  password: z.string().regex(passwordValidation, "Password must contain at least one letter and one number and be at least 8 characters long"),
  confirm_password: z.string().regex(passwordValidation, "Password must contain at least one letter and one number and be at least 8 characters long"),
}).refine((data) => data.password === data.confirm_password, {
  error: "Passwords do not match",
  path: ["confirm_password"],
});
export type VendorRegisterSchema = z.infer<typeof vendorRegisterSchema>;

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string().regex(passwordValidation, "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character").min(1, { error: "Password is required" }).max(36, { error: "Password cannot exceed 36 characters" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const customerRegisterSchema = z.object({
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

  email: z.string().email("Invalid email address").min(1, "Email is required"),

  phone_number: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid format (e.g., +1234567890)")
    .optional()
    .or(z.literal("")),

  password: z
    .string()
    .min(8, "Password too short")
    .regex(passwordValidation, "Password must include uppercase, lowercase, number, and special character"),

  confirm_password: z.string(),

  terms_accepted: z.boolean().default(false),
}).refine((data) => data.password === data.confirm_password, {
  error: "Passwords do not match",
  path: ["confirm_password"],
});
export type CustomerRegisterSchemaType = Partial<z.infer<typeof customerRegisterSchema>>;

export const productSchema = z.object({
  variantId: z.string().optional(),
  productName: z
    .string()
    .min(1, { error: "Product name is required" })
    .max(355, { error: "Name is too long" }),
  description: z
    .string()
    .min(10, { error: "Description must be at least 10 characters" }).max(5000, { error: "Description cannot exceed 5000 characters" }),
  features: z.array(
    z.object({
      title: z.string().min(1, { error: "Feature title required" }).max(355, { error: "Feature title is too long" }),
      description: z
        .string()
        .min(1, { error: "Feature details required" })
        .max(5000, { error: "Feature details cannot exceed 5000 characters" })
        .or(z.number())
        .or(z.boolean()),
    })
  ).min(1, { error: "Add at least one feature" }),

  attributes: z.array(
    z.object({
      name: z.string().min(1, { error: "Attribute name required" }).max(355, { error: "Attribute name is too long" }),
      value: z.string().min(1, { error: "Attribute value required" }).max(355, { error: "Attribute value is too long" }),
    })
  ),
  basePrice: z.string()
    .min(1, { error: "Price is required" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      error: "Invalid price format. Use numbers like 99 or 99.99"
    })
    .transform((val) => parseFloat(val)),

  discountPercent: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Invalid discount format" })
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? parseFloat(val) : null),

  stocks: z.string()
    .regex(/^\d+$/, { error: "Stock must be a non-negative integer" })
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? parseInt(val, 10) : null),

  sku: z.string().optional(),

  category: z.string().min(1, { error: "Please select a category" }),

  status: z.enum(ProductStatusEnum, { error: "Please select a status" }),
  warehouseId: z.string().min(1, { error: "Warehouse is required" }),
  taxRateId: z.string().min(1, { error: "Tax rate is required" }),
  productMedia: z.array(z.any()).min(0, { error: "At least one product image is required" }).max(1, { error: "You can upload up to 1 image" }),
  featureMedia: z.array(z.any()).min(0, { error: "At least one feature image is required" }).max(10, { error: "You can upload up to 10 images" }),
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
      name: z.string().min(1, { error: "Attribute name required" }).max(355, { error: "Attribute name is too long" }),
      value: z.string().min(1, { error: "Attribute value required" }).max(355, { error: "Attribute value is too long" }),
    })
  ),
  basePrice: z.string()
    .min(1, { error: "Price is required" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      error: "Invalid price format. Use numbers like 99 or 99.99"
    })
    .transform((val) => parseFloat(val)),

  discountPercent: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Invalid discount format" })
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? parseFloat(val) : null),

  stocks: z.string()
    .regex(/^\d+$/, { error: "Stock must be a non-negative integer" })
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? parseInt(val, 10) : null),

  sku: z.string().optional(),
  status: z.enum(ProductStatusEnum, {
    error: "Please select a status"
  }),
  variantMediaMain: z.array(z.any()).min(0, { error: "At least one product image is required" }).max(1, { error: "You can upload up to 1 image" }),
  variantMediaGallery: z.array(z.any()).min(0, { error: "At least one feature image is required" }).max(10, { error: "You can upload up to 10 images" }),
});

export type ProductVariantFormValuesType = z.infer<typeof productVariantSchema>;

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Name is required" })
    .max(50, { error: "Name is too long" }),

  email: z.email({ error: "Invalid email address" }).min(3, { error: "Email is required" })
    .max(100, { error: "Email cannot exceed 100 characters" }),

  phone: z
    .string()
    .min(1, { error: "Phone number is required" })
    // Regex ensures ONLY digits. No 'e', '+', or '-' allowed.
    .regex(/^[0-9]+$/, { error: "Please enter digits only" })
    .min(10, { error: "Phone number must be at least 10 digits" }).max(15, { error: "Phone number cannot exceed 15 digits" }),

  message: z
    .string()
    .min(10, { error: "Message must be at least 10 characters long" })
    .max(1000, { error: "Message cannot exceed 1000 characters" }),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const changePasswordSchema = z.object({
  current_password: z
    .string()
    .min(1, { error: "Current password is required" }).max(36, { error: "Current password cannot exceed 36 characters" })
    .regex(passwordValidation, { error: "Current password must be at least 8 characters long and include uppercase, lowercase, number, and special character" }),

  new_password: z
    .string().max(36, { error: "New password cannot exceed 36 characters" }).regex(passwordValidation, { error: "New password must be at least 8 characters long and include uppercase, lowercase, number, and special character" }),

  confirm_password: z
    .string()
    .min(1, { error: "Please confirm your new password" }),
}).refine((data) => data.new_password === data.confirm_password, {
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
    .min(2, { error : "Last name must be at least 2 characters" })
    .max(50, { error: "Last name cannot exceed 50 characters" }),

  email: z
    .email({ error: "Invalid email address" })
    .min(1, { error: "Email is required" })
    .max(24, { error: "Email cannot exceed 24 characters" }),

  phone: z
    .string()
    .min(10, { error: "Phone number must be at least 10 digits" })
    .max(15, { error: "Phone number cannot exceed 15 digits" })
    .regex(/^[0-9]+$/, { error: "Please enter digits only (no 'e' or symbols)" }),
});

export type ProfileEditData = z.infer<typeof profileEditSchema>;

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, { message: "Code must be at least 3 characters" })
    .max(20, { message: "Code cannot exceed 20 characters" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Code must be alphanumeric" }),

  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters" })
    .max(100, { message: "Description cannot exceed 100 characters" }),

  discount_type: z.enum(PromotionType, {
    message: "Please select a valid discount type" }),

  value: z
    .number({ error: "Value is required and must be a number" })
    .positive({ error: "Value must be greater than zero" })
    .max(1000000, { message: "Value is unusually high" }),

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
    error: "Year is required and must be a number"
  }),

  startSequence: z.number({
    error: "Sequence is required and must be a number"
  }).min(1, { error: "Sequence must start at 1 or higher" }),
  termsAndNotes: z.string().optional(),
  signatureUrl: z.string().optional(),
});

export type BillingFormData = z.infer<typeof billingSchema>;

const ADDRESS_TYPE_ENUM = ['home', 'work', 'warehouse', 'hub', 'other'] as const;
export const AddressSchema = z.object({
  // id: z.uuid({ error: "Invalid unique identifier" }),
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
  phone: z.string()
    .regex(/^[\d\s]+$/, "Phone number must contain only digits and spaces")
    .min(10, "Phone number is too short")
    .max(15, "Phone number is too long").transform((val) => val.replace(/\s/g, '')),
  address_for: z.enum(ADDRESS_TYPE_ENUM),

  address_line_1: z.string().min(1, "Address line 1 is required"),
  address_line_2: z.string().optional(),

  city: z.string().min(1, "City is required"),

  state: z.string().min(1, "State is required"),
  street: z.string().min(1, "Street is required"),
  country: z.string().min(1, "Country is required"),
  landmark: z.string().min(1, "Landmark is required"),

  postal_code: z.string()
    .length(6, "Postal code must be exactly 6 digits")
    .regex(/^\d+$/, "Postal code must be numeric"),

  is_default: z.boolean().default(false),
});

export type AddressType = z.infer<typeof AddressSchema>;

export enum LocationForEnum {
  WAREHOUSE = "warehouse",
  HUB = "hub",
  OTHER = "other"
}
export const locationSchema = z.object({
  default: z.string().transform(val => val === 'true'), // Converts string "true" to boolean true
  name: z.string().min(3, { error: "Name must be at least 3 characters" }),
  type: z.enum(LocationForEnum, {
    error: "Please select a valid type"
  }),
  address: z.string().min(5, { error: "Address must be at least 5 characters" }),
  city: z.string().min(2, { error: "City is required" }),
  state: z.string().min(2, { error: "State is required" }),
  contactPerson: z.string().optional(),
  phone: z.string()
    .refine(val => !val || /^\+?[0-9\s\-]{7,15}$/.test(val), {
      error: "Invalid phone number format"
    }),
});

export type LocationFormData = z.infer<typeof locationSchema>;


export const brandingSchema = z.object({
  logo_url: z.string().optional(),
  logo_dark_url: z.string().optional(),
  watermark_url: z.string().optional(),
  favicon_url: z.string().optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').default('#000000'),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional().or(z.literal('')),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional().or(z.literal('')),
  font_family: z.string().min(1, 'Required').default('Inter'),
});

export const legalSchema = z.object({
  legal_name: z.string().min(2, 'Required'),
  trade_name: z.string().optional(),
  country_code: z.string().length(2, 'Must be 2-letter ISO code'),
  registered_address_id: z.string(),
  support_email: z.email('Invalid email').optional().or(z.literal('')),
  support_phone: z.string().optional(),
  website_url: z.url('Invalid URL').optional().or(z.literal('')),
});

export const docConfigSchema = z.object({
  invoice_number_prefix: z.string().min(1).max(10).default('INV'),
  invoice_number_format: z.string().min(1).default('{PREFIX}-{YYYY}-{SEQ8}'),
  invoice_sequence_reset: z.enum(['APRIL', 'CALENDAR']).default('APRIL'),
  default_currency: z.string().length(3).default('INR'),
  default_timezone: z.string().min(1).default('Asia/Kolkata'),
  date_format: z.string().min(1).default('DD/MM/YYYY'),
  signatory_name: z.string().optional(),
  signatory_designation: z.string().optional(),
  signatory_signature_url: z.string().optional(),
  invoice_footer_text: z.string().optional(),
  invoice_terms_and_conditions: z.string().optional(),
});
export const policyFormSchema = z.object({
  policy_name: z.string()
    .trim()
    .min(3, "Policy name must be at least 3 characters")
    .max(100, "Cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Only letters, numbers, spaces, hyphens, and underscores"),
  
  policy_type: z.string()
    .trim()
    .min(1, "Please select a policy type"),  
  duration_value: z.number()
    .min(1, "Duration must be at least 1")
    .max(36500, "Duration exceeds realistic limits")
    .optional()
    .or(z.nan().transform(() => undefined)), 
  
  duration_unit: z.string().optional(),
  
  coverage_description: z.string().trim().max(2000, "Cannot exceed 2000 characters").optional(),
  exclusions: z.string().trim().max(2000, "Cannot exceed 2000 characters").optional(),
  service_provider: z.string().trim().max(100, "Cannot exceed 100 characters").optional(),
  
  
  claim_contact_email: z.literal('')
    .or(z.string().trim().email("Please enter a valid email address"))
    .optional(), 

  claim_contact_phone: z.literal('')
    .or(z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, "Valid format: +1234567890"))
    .optional(),
    
  claim_process_description: z.string().trim().max(2000, "Cannot exceed 2000 characters").optional(),
  
  generates_document: z.boolean({ error: "Required" }),
  is_active: z.boolean({ error: "Required" }),
});

export type PolicyFormSchemaType = z.infer<typeof policyFormSchema>;

export const ticketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(150, "Subject is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description is too long"),
  priority: z.enum(["High", "Medium", "Low"]),
  attachment: z
    .any()
    .nullable()
    .refine(
      (val) => {
        if (val === null || val === undefined) return true;
        return typeof val === "object" && "name" in val && "size" in val;
      },
      { message: "Invalid file" }
    ),
});

export type TicketFormData = z.infer<typeof ticketSchema>;