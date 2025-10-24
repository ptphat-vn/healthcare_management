import * as z from "zod";

export const createUserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date of birth must be in YYYY-MM-DD format"
    ),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits"),
  gender: z.enum(["Male", "Female"], { 
    message: "Choose your gender",
  }).optional().refine((value) => value !== undefined, {
    message: "Choose your gender",
  }),
  identifyNumber: z
    .string()
    .regex(/^[0-9]{9,12}$/, "Identification number must be 9-12 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  address: z.string().optional(),
});

export const statusOptions = [
  { value: 0, label: "Inactive" },
  { value: 1, label: "Active" },
  { value: 2, label: "Blocked" },
];

export type CreateUserFormData = z.infer<typeof createUserSchema>;