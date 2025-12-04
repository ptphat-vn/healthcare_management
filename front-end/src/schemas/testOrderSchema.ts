import { z } from "zod";

export const testOrderPatientInfoSchema = z.object({
  patientName: z
    .string()
    .min(1, "Patient name is required")
    .max(100, "Patient name must be less than 100 characters"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
  gender: z.enum(["male", "female", "other"]),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

export type TestOrderPatientInfo = z.infer<typeof testOrderPatientInfoSchema>;
