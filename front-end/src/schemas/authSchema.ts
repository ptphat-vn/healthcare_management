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
