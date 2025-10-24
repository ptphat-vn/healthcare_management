import * as z from "zod";

export const createMedicalRecordSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date of birth must be in YYYY-MM-DD format"
    ),
  gender: z.enum(["male", "female"], { 
    message: "Please select a gender",
  }),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits"),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  identifyNumber: z
    .string()
    .regex(/^[0-9]{9,12}$/, "Identity number must be 9-12 digits")
    .optional()
    .or(z.literal("")),
  
  // Emergency Contact
  emergencyName: z.string().optional().or(z.literal("")),
  emergencyPhone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Emergency phone number must be 10-11 digits")
    .optional()
    .or(z.literal("")),
  emergencyRelationship: z.string().optional().or(z.literal("")),
  
  // Medical History
  allergies: z.string().optional().or(z.literal("")),
  chronicConditions: z.string().optional().or(z.literal("")),
  medications: z.string().optional().or(z.literal("")),
  previousSurgeries: z.string().optional().or(z.literal("")),
  
  // Insurance Info
  insuranceProvider: z.string().optional().or(z.literal("")),
  insurancePolicyNumber: z.string().optional().or(z.literal("")),
  insuranceExpiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry date must be in YYYY-MM-DD format")
    .optional()
    .or(z.literal("")),
}).refine((data) => {
  // If emergency name is provided, emergency phone is required
  if (data.emergencyName && !data.emergencyPhone) {
    return false;
  }
  return true;
}, {
  message: "Emergency phone number is required when emergency name is provided",
  path: ["emergencyPhone"],
}).refine((data) => {
  // If insurance provider is provided, policy number is required
  if (data.insuranceProvider && !data.insurancePolicyNumber) {
    return false;
  }
  return true;
}, {
  message: "Insurance policy number is required when provider is provided",
  path: ["insurancePolicyNumber"],
});

export const updateMedicalRecordSchema = createMedicalRecordSchema.partial().extend({
  patientId: z.string().min(1, "Patient ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date of birth must be in YYYY-MM-DD format"
    ),
  gender: z.enum(["male", "female"], { 
    message: "Please select a gender",
  }),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits"),
  address: z.string().min(1, "Address is required"),
});

export type CreateMedicalRecordFormData = z.infer<typeof createMedicalRecordSchema>;
export type UpdateMedicalRecordFormData = z.infer<typeof updateMedicalRecordSchema>;
