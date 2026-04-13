import * as z from 'zod'
import { CouponDiscountTypeEum, ProductStatusEnum } from './Types';
export const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
);
export const passwordValidationSchema = z.string().regex(passwordValidation, "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character");

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
  password: z.string().regex(passwordValidation, "Password must contain at least one letter and one number and be at least 8 characters long"),
  confirm_password: z.string().regex(passwordValidation, "Password must contain at least one letter and one number and be at least 8 characters long"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});
export type VendorRegisterSchemaType = z.infer<typeof vendorRegisterSchema>;

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string().regex(passwordValidation, "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character").min(1, { message: "Password is required" }).max(36, { message: "Password cannot exceed 36 characters" }),
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

  terms_accepted: z.boolean().optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});
export type CustomerRegisterSchemaType = Partial<z.infer<typeof customerRegisterSchema>>;

export const productSchema = z.object({
  variantId: z.string().optional(),
  productName: z
    .string()
    .min(1, { message: "Product name is required" })
    .max(355, { message: "Name is too long" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }).max(5000, { message: "Description cannot exceed 5000 characters" }),
  features: z.array(
    z.object({
      title: z.string().min(1, { message: "Feature title required" }).max(355, { message: "Feature title is too long" }),
      description: z
        .string()
        .min(1, { message: "Feature details required" })
        .max(5000, { message: "Feature details cannot exceed 5000 characters" })
        .or(z.number())
        .or(z.boolean()),
    })
  ).min(1, { message: "Add at least one feature" }),

  attributes: z.array(
    z.object({
      name: z.string().min(1, { message: "Attribute name required" }).max(355, { message: "Attribute name is too long" }),
      values: z.string().min(1, { message: "Attribute value required" }).max(355, { message: "Attribute value is too long" }),
    })
  ),
  basePrice: z.string()
    .min(1, { message: "Price is required" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: "Invalid price format. Use numbers like 99 or 99.99"
    })
    .transform((val) => parseFloat(val)),

  discountPercent: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Invalid discount format" })
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? parseFloat(val) : null),

  stocks: z.string()
    .regex(/^\d+$/, { message: "Stock must be a non-negative integer" })
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? parseInt(val, 10) : null),

  sku: z.string().optional(),

  category: z.string().min(1, { message: "Please select a category" }),

  status: z.enum(ProductStatusEnum, {
    error: () => ({ message: "Please select a status" }),
  }),
  taxProfile: z.string().min(1, { message: "Tax profile is required" }),
  productMedia: z.array(z.any()).min(0, { message: "At least one product image is required" }).max(1, { message: "You can upload up to 1 image" }),
  featureMedia: z.array(z.any()).min(0, { message: "At least one feature image is required" }).max(10, { message: "You can upload up to 10 images" }),
});
// Replace z.infer with these two:
export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormOutput = z.output<typeof productSchema>;
export type ProductFormValuesType = z.infer<typeof productSchema>;

export const productVariantSchema = z.object({
  variantId: z.string().optional(),
  variantName: z
    .string()
    .min(1, { message: "Variant name is required" })
    .max(355, { message: "Name is too long" }),
  attributes: z.array(
    z.object({
      name: z.string().min(1, { message: "Attribute name required" }).max(355, { message: "Attribute name is too long" }),
      value: z.string().min(1, { message: "Attribute value required" }).max(355, { message: "Attribute value is too long" }),
    })
  ),
  basePrice: z.string()
    .min(1, { message: "Price is required" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: "Invalid price format. Use numbers like 99 or 99.99"
    })
    .transform((val) => parseFloat(val)),

  discountPercent: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Invalid discount format" })
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? parseFloat(val) : null),

  stocks: z.string()
    .regex(/^\d+$/, { message: "Stock must be a non-negative integer" })
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? parseInt(val, 10) : null),

  sku: z.string().optional(),
  status: z.enum(ProductStatusEnum, {
    error: () => ({ message: "Please select a status" }),
  }),
  variantMediaMain: z.array(z.any()).min(0, { message: "At least one product image is required" }).max(1, { message: "You can upload up to 1 image" }),
  variantMediaGallery: z.array(z.any()).min(0, { message: "At least one feature image is required" }).max(10, { message: "You can upload up to 10 images" }),
});

export type ProductVariantFormValuesType = z.infer<typeof productVariantSchema>;

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name is too long" }),

  email: z.email({ message: "Invalid email address" }).min(3, { message: "Email is required" })
    .max(100, { message: "Email cannot exceed 100 characters" }),

  phone: z
    .string()
    .min(1, { message: "Phone number is required" })
    // Regex ensures ONLY digits. No 'e', '+', or '-' allowed.
    .regex(/^[0-9]+$/, { message: "Please enter digits only" })
    .min(10, { message: "Phone number must be at least 10 digits" }).max(15, { message: "Phone number cannot exceed 15 digits" }),

  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters long" })
    .max(1000, { message: "Message cannot exceed 1000 characters" }),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const changePasswordSchema = z.object({
  current_password: z
    .string()
    .min(1, { message: "Current password is required" }).max(36, { message: "Current password cannot exceed 36 characters" })
    .regex(passwordValidation, { message: "Current password must be at least 8 characters long and include uppercase, lowercase, number, and special character" }),

  new_password: z
    .string().max(36, { message: "New password cannot exceed 36 characters" }).regex(passwordValidation, { message: "New password must be at least 8 characters long and include uppercase, lowercase, number, and special character" }),

  confirm_password: z
    .string()
    .min(1, { message: "Please confirm your new password" }),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export const profileEditSchema = z.object({
  profile_picture: z
    .url({ message: "Please enter a valid image URL" })
    .optional()
    .or(z.literal("")),

  first_name: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" })
    .max(50, { message: "First name cannot exceed 50 characters" }),

  last_name: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(50, { message: "Last name cannot exceed 50 characters" }),

  email: z
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" })
    .max(24, { message: "Email cannot exceed 24 characters" }),

  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number cannot exceed 15 digits" })
    .regex(/^[0-9]+$/, { message: "Please enter digits only (no 'e' or symbols)" }),
});

export type ProfileEditData = z.infer<typeof profileEditSchema>;

export const ticketSchema = z.object({
  subject: z
    .string()
    .min(5, { message: "Subject must be at least 5 characters" })
    .max(100, { message: "Subject is too long" }),

  description: z
    .string()
    .min(20, { message: "Please provide a more detailed description (min 20 chars)" })
    .max(3000, { message: "Description is too long" }),

  priority: z.enum(["High", "Medium", "Low"], {
    error: () => ({ message: "Please select a valid priority" }),
  }),
  attachment: z
    .any()
    .optional()
    .refine((files) => {
      if (!files || files.length === 0) return true; // Optional
      return files[0]?.size <= 25 * 1024 * 1024; // Max 25MB
    }, { message: "Max file size is 25MB" }),
});

export type TicketFormData = z.infer<typeof ticketSchema>;

export const couponSchema = z.object({
  type: z.enum(CouponDiscountTypeEum, {
    error: () => ({ message: "Please select a valid discount type" }),
  }),
  code: z
    .string()
    .min(3, { message: "Code must be at least 3 characters" }).max(20, { message: "Code cannot exceed 20 characters" })
    .regex(/^[A-Z0-9]+$/, { message: "Code must be uppercase alphanumeric" }),
  value: z
    .number({ message: "Value is required and must be a number" })
    // Prevents negative numbers and 0
    .positive({ message: "Discount value must be strictly greater than zero" })
    // Prevents absurdly high numbers that might break your database
    .max(1000000, { message: "Discount value is unusually high" }),

  rules: z
    .array(
      z.object({
        // Prevents empty strings and limits length
        rule_type: z
          .string()
          .min(1, { message: "Rule type is required" })
          .max(50, { message: "Rule type cannot exceed 50 characters" }),

        rule_value: z
          .string()
          .min(1, { message: "Rule value is required" })
          .max(200, { message: "Rule value cannot exceed 200 characters" })
      })
    )
    .max(10, { message: "You can only add a maximum of 10 rules" })
    .optional()
});

export type CouponFormData = z.infer<typeof couponSchema>;

export const billingSchema = z.object({
  gstin: z
    .string()
    .min(1, { message: "GSTIN is required" })
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
      message: "Invalid GSTIN format (e.g., 24ABCDE1234F1Z5)",
    }),

  pan: z
    .string()
    .min(1, { message: "PAN is required" })
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
      message: "Invalid PAN format (e.g., ABCDE1234F)",
    }),

  businessName: z
    .string()
    .min(3, { message: "Business name must be at least 3 characters" })
    .max(50, { message: "Business name cannot exceed 50 characters" }),

  prefix: z
    .string()
    .min(1, { message: "Prefix is required" })
    .max(5, { message: "Prefix too long (max 5)" }),

  year: z.number({
    message: "Year is required and must be a number"
  }),

  startSequence: z.number({
    message: "Sequence is required and must be a number"
  }).min(1, { message: "Sequence must start at 1 or higher" }),
  termsAndNotes: z.string().optional(),
  signatureUrl: z.string().optional(),
});

export type BillingFormData = z.infer<typeof billingSchema>;

const ADDRESS_TYPE_ENUM = ['home', 'work', 'other'] as const;
export const AddressSchema = z.object({
  // id: z.uuid({ message: "Invalid unique identifier" }),
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
  phone: z.string()
    .regex(/^\d+$/, "Phone number must contain only digits")
    .min(10, "Phone number is too short")
    .max(15, "Phone number is too long"),
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
  HUB = "hub"
}
export const locationSchema = z.object({
  default: z.string().transform(val => val === 'true'), // Converts string "true" to boolean true
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  type: z.enum(LocationForEnum, {
    message: "Please select a valid type"
  }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  contactPerson: z.string().optional(),
  phone: z.string()
    .refine(val => !val || /^\+?[0-9\s\-]{7,15}$/.test(val), {
      message: "Invalid phone number format"
    }),
});

export type LocationFormData = z.infer<typeof locationSchema>;