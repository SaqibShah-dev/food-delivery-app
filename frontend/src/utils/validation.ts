import { z } from "zod";
import type { ZodIssue } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address.")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(6, "Password must be at least 6 characters.")
    .max(100, "Password cannot exceed 100 characters."),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Full name is required.")
      .min(2, "Enter your full name.")
      .max(50, "Name cannot exceed 50 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address.")
      .toLowerCase(),
    password: z
      .string()
      .min(1, "Password is required.")
      .min(8, "Use at least 8 characters.")
      .max(100, "Password cannot exceed 100 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter and one number.")
      .regex(/\d/, "Include at least one letter and one number."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const checkoutAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .min(2, "Enter your full name.")
    .max(100, "Full name cannot exceed 100 characters."),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .regex(/^[+\d][\d\s()-]{6,19}$/, "Enter a valid phone number."),
  street: z
    .string()
    .trim()
    .min(1, "Street address is required.")
    .min(5, "Enter a complete street address.")
    .max(200, "Street address cannot exceed 200 characters."),
  city: z
    .string()
    .trim()
    .min(1, "City is required.")
    .min(2, "City must contain at least 2 characters.")
    .max(100, "City cannot exceed 100 characters."),
  country: z
    .string()
    .trim()
    .min(1, "Country is required.")
    .min(2, "Country must contain at least 2 characters.")
    .max(100, "Country cannot exceed 100 characters."),
});

export const foodFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),
  description: z
    .string()
    .trim()
    .min(5, "Description must contain at least 5 characters.")
    .max(1000, "Description cannot exceed 1000 characters."),
  price: z
    .string()
    .trim()
    .min(1, "Price is required.")
    .refine((value) => Number.isFinite(Number(value)), "Enter a valid price.")
    .transform(Number)
    .pipe(
      z
        .number()
        .positive("Price must be greater than 0.")
        .max(100000, "Price cannot exceed 100000."),
    ),
  category: z
    .string()
    .trim()
    .min(2, "Category must contain at least 2 characters.")
    .max(50, "Category cannot exceed 50 characters."),
  image: z.custom<File | null>(
    (value) =>
      value === null ||
      (typeof File !== "undefined" && value instanceof File),
    "Choose a valid image.",
  ),
  isEditing: z.boolean(),
}).superRefine(({ image, isEditing }, context) => {
  if (!isEditing && !image) {
    context.addIssue({
      code: "custom",
      path: ["image"],
      message: "Choose an image for the new food item.",
    });
  }
});

export const orderDateFilterSchema = z
  .object({
    startDate: z.string(),
    endDate: z.string(),
  })
  .refine(
    ({ startDate, endDate }) =>
      !startDate || !endDate || startDate <= endDate,
    {
      path: ["endDate"],
      message: "Start date must be on or before end date.",
    },
  );

export function mapZodFieldErrors<T extends string>(
  issues: readonly ZodIssue[],
  fields: readonly T[],
): Partial<Record<T, string>> {
  const errors: Partial<Record<T, string>> = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (
      typeof field === "string" &&
      fields.includes(field as T) &&
      !errors[field as T]
    ) {
      errors[field as T] = issue.message;
    }
  }

  return errors;
}
