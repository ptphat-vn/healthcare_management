import * as z from "zod";

export const createMedicalRecordSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  emergencyName: z.string().optional().or(z.literal("")),
  emergencyPhone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Emergency phone number must be 10-11 digits")
    .optional()
    .or(z.literal("")),
  emergencyRelationship: z.string().optional().or(z.literal("")),

  allergies: z.string().optional().or(z.literal("")),
  chronicConditions: z.string().optional().or(z.literal("")),
  medications: z.string().optional().or(z.literal("")),
  previousSurgeries: z.string().optional().or(z.literal("")),

  insuranceProvider: z.string().optional().or(z.literal("")),
  insurancePolicyNumber: z.string().optional().or(z.literal("")),
  insuranceExpiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry date must be in YYYY-MM-DD format")
    .optional()
    .or(z.literal("")),
})
.refine((data) => {
  if (data.emergencyName && !data.emergencyPhone) return false;
  return true;
}, {
  message: "Emergency phone number is required when emergency name is provided",
  path: ["emergencyPhone"],
})
.refine((data) => {
  if (data.insuranceProvider && !data.insurancePolicyNumber) return false;
  return true;
}, {
  message: "Insurance policy number is required when provider is provided",
  path: ["insurancePolicyNumber"],
});

export const updateMedicalRecordSchema = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")
    .optional(),
  gender: z.enum(["male", "female"]).optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits")
    .optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().min(1, "Address is required").optional(),
  identifyNumber: z
    .string()
    .regex(/^[0-9]{9,12}$/, "Identity number must be 9-12 digits")
    .optional()
    .or(z.literal("")),

  emergencyName: z.string().optional().or(z.literal("")),
  emergencyPhone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Emergency phone number must be 10-11 digits")
    .optional()
    .or(z.literal("")),
  emergencyRelationship: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  chronicConditions: z.string().optional().or(z.literal("")),
  medications: z.string().optional().or(z.literal("")),
  previousSurgeries: z.string().optional().or(z.literal("")),
  insuranceProvider: z.string().optional().or(z.literal("")),
  insurancePolicyNumber: z.string().optional().or(z.literal("")),
  insuranceExpiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry date must be in YYYY-MM-DD format")
    .optional()
    .or(z.literal("")),
})
.refine((data) => {
  if (data.emergencyName && !data.emergencyPhone) return false;
  return true;
}, {
  message: "Emergency phone number is required when emergency name is provided",
  path: ["emergencyPhone"],
})
.refine((data) => {
  if (data.insuranceProvider && !data.insurancePolicyNumber) return false;
  return true;
}, {
  message: "Insurance policy number is required when provider is provided",
  path: ["insurancePolicyNumber"],
});

export type CreateMedicalRecordFormData = z.infer<typeof createMedicalRecordSchema>;
export type UpdateMedicalRecordFormData = z.infer<typeof updateMedicalRecordSchema>;