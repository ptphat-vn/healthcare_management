import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format"),

  password: z
    .string()
    .trim()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email format"),
    phoneNumber: z
      .string()
      .regex(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits"),
    identifyNumber: z
      .string()
      .regex(/^[0-9]{9,12}$/, "ID number must be 9-12 digits"),
    gender: z.enum(["male", "female"], {
      message: "Gender must be male or female",
    }),
    dateOfBirth: z
      .string()
      .regex(
        /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
        "Date of birth must be in YYYY-MM-DD format"
      ),
    address: z.string().min(1, "Address is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});
export const otpSchema = z.object({
  code: z.string().regex(/^\d{4,6}$/, "OTP must be 4-6 digits"),
});
export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type OtpForm = z.infer<typeof otpSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type loginFormData = z.infer<typeof loginSchema>;
export type registerFormData = z.infer<typeof registerSchema>;
