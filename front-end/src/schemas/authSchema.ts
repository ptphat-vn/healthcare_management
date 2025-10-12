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
export type loginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Họ tên không được bỏ trống"),
    email: z
      .string()
      .min(1, "Email không được bỏ trống")
      .email("Email không hợp lệ"),
    phoneNumber: z
      .string()
      .min(9, "Số điện thoại không hợp lệ")
      .max(15, "Số điện thoại không hợp lệ"),
    identifyNumber: z.string().min(6, "CMND/CCCD không hợp lệ"),
    dateOfBirth: z.string().min(1, "Ngày sinh không được bỏ trống"),
    gender: z.string().min(1, "Giới tính không được bỏ trống"),
    password: z.string().min(6, "Password tối thiểu 6 kí tự"),
    confirmPassword: z.string().min(6, "Xác nhận mật khẩu tối thiểu 6 kí tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });
export type registerFormData = z.infer<typeof registerSchema>;
