import { z } from "zod";

export const testOrderPatientInfoSchema = z.object({
  patientName: z
    .string()
    .min(1, "Patient name is required")
    .max(100, "Patient name must be less than 100 characters"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female"]),
  address: z.string().optional(),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
});

export type TestOrderPatientInfo = z.infer<typeof testOrderPatientInfoSchema>;
