import * as z from 'zod'
export const User = z.object({
  name: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters long").regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "Password must contain at least one letter and one number"),
})
export const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
);
export const passwordValidationSchema = z.string().regex(passwordValidation, "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character");

export const VendorRegistrationSchema = z.object({
  // 🔹 Organization Details
  businessName: z
    .string()
    .min(3, "Business name must be at least 3 characters")
    .max(100, "Business name must be under 100 characters"),

  category: z
    .string()
    .min(2, "Category is required"),

  ownerFullName: z
    .string()
    .min(3, "Owner full name must be at least 3 characters"),

  businessPhone: z
    .string()
    .regex(
      /^\+91\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
      "Phone must match +91 (555) 000-0000 format"
    ),

  // 🔹 Business Admin Account
  adminFullName: z
    .string()
    .min(3, "Admin full name must be at least 3 characters"),

  loginEmail: z
    .string()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain letters and numbers"
    ),

  confirmPassword: z
    .string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
