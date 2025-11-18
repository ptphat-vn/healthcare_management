import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được bỏ trống")
    .email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Password không được bỏ trống")
    .min(6, "Password tối thiểu phải có 6 kí tự"),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Email không đúng định dạng"),
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số"),
  identifyNumber: z.string().regex(/^[0-9]{9,12}$/, "Số CMND/CCCD phải có 9-12 chữ số"),
  gender: z.enum(["male", "female"], { message: "Giới tính phải là nam hoặc nữ" }),
  dateOfBirth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, "Ngày sinh phải đúng định dạng YYYY-MM-DD"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: z.string().min(8, "Xác nhận mật khẩu phải có ít nhất 8 ký tự"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});
export const otpSchema = z.object({
  code: z.string().regex(/^\d{4,6}$/, "OTP phải gồm 4-6 chữ số"),
});
export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: z.string().min(8, "Xác nhận mật khẩu phải có ít nhất 8 ký tự"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  path: ["confirmPassword"],
  message: "Mật khẩu xác nhận không khớp",
});
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type OtpForm = z.infer<typeof otpSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type loginFormData = z.infer<typeof loginSchema>;
export type registerFormData = z.infer<typeof registerSchema>;
