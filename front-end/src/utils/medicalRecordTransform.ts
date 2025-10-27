import { type MedicalRecord, type CreateMedicalRecordRequest, type UpdateMedicalRecordRequest } from "@/types/medicalRecord.type";

/**
 * Transform form data to backend format for creating medical record
 */
export const transformFormToCreateRequest = (formData: Record<string, unknown>): CreateMedicalRecordRequest => {
  return {
    patientId: String(formData.patientId || ""),
    fullName: String(formData.fullName || ""),
    dateOfBirth: String(formData.dateOfBirth || ""),
    gender: formData.gender as 'male' | 'female',
    bloodType: formData.bloodType ? formData.bloodType as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' : undefined,
    phoneNumber: String(formData.phoneNumber || ""),
    email: formData.email ? String(formData.email) : undefined,
    address: String(formData.address || ""),
    identifyNumber: formData.identifyNumber ? String(formData.identifyNumber) : undefined,
    emergencyContact: formData.emergencyName ? {
      name: String(formData.emergencyName),
      phoneNumber: String(formData.emergencyPhone || ""),
      relationship: String(formData.emergencyRelationship || "")
    } : undefined,
    medicalHistory: {
      allergies: formData.allergies ? String(formData.allergies).split(',').map((a: string) => a.trim()).filter((a: string) => a) : undefined,
      chronicConditions: formData.chronicConditions ? String(formData.chronicConditions).split(',').map((c: string) => c.trim()).filter((c: string) => c) : undefined,
      medications: formData.medications ? String(formData.medications).split(',').map((m: string) => m.trim()).filter((m: string) => m) : undefined,
      previousSurgeries: formData.previousSurgeries ? String(formData.previousSurgeries).split(',').map((s: string) => s.trim()).filter((s: string) => s) : undefined
    },
    insuranceInfo: formData.insuranceProvider ? {
      provider: String(formData.insuranceProvider),
      policyNumber: String(formData.insurancePolicyNumber || ""),
      expiryDate: formData.insuranceExpiryDate ? String(formData.insuranceExpiryDate) : undefined
    } : undefined
  };
};

/**
 * Transform form data to backend format for updating medical record
 */
export const transformFormToUpdateRequest = (formData: Record<string, unknown>, recordId: string): UpdateMedicalRecordRequest => {
  return {
    _id: recordId,
    fullName: String(formData.fullName || ""),
    dateOfBirth: String(formData.dateOfBirth || ""),
    gender: formData.gender as 'male' | 'female',
    bloodType: formData.bloodType ? formData.bloodType as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' : undefined,
    phoneNumber: String(formData.phoneNumber || ""),
    email: formData.email ? String(formData.email) : undefined,
    address: String(formData.address || ""),
    identifyNumber: formData.identifyNumber ? String(formData.identifyNumber) : undefined,
    emergencyContact: formData.emergencyName ? {
      name: String(formData.emergencyName),
      phoneNumber: String(formData.emergencyPhone || ""),
      relationship: String(formData.emergencyRelationship || "")
    } : undefined,
    medicalHistory: {
      allergies: formData.allergies ? String(formData.allergies).split(',').map((a: string) => a.trim()).filter((a: string) => a) : undefined,
      chronicConditions: formData.chronicConditions ? String(formData.chronicConditions).split(',').map((c: string) => c.trim()).filter((c: string) => c) : undefined,
      medications: formData.medications ? String(formData.medications).split(',').map((m: string) => m.trim()).filter((m: string) => m) : undefined,
      previousSurgeries: formData.previousSurgeries ? String(formData.previousSurgeries).split(',').map((s: string) => s.trim()).filter((s: string) => s) : undefined
    },
    insuranceInfo: formData.insuranceProvider ? {
      provider: String(formData.insuranceProvider),
      policyNumber: String(formData.insurancePolicyNumber || ""),
      expiryDate: formData.insuranceExpiryDate ? String(formData.insuranceExpiryDate) : undefined
    } : undefined
  };
};

/**
 * Transform backend data to form format for editing
 */
export const transformBackendToFormData = (record: MedicalRecord): Record<string, unknown> => {
  return {
    patientId: record.patientId || "",
    fullName: record.fullName || "",
    phoneNumber: record.phoneNumber || "",
    email: record.email || "",
    dateOfBirth: record.dateOfBirth || "",
    gender: record.gender || "",
    bloodType: record.bloodType || "",
    address: record.address || "",
    identifyNumber: record.identifyNumber || "",
    allergies: record.medicalHistory?.allergies?.join(", ") || "",
    chronicConditions: record.medicalHistory?.chronicConditions?.join(", ") || "",
    medications: record.medicalHistory?.medications?.join(", ") || "",
    previousSurgeries: record.medicalHistory?.previousSurgeries?.join(", ") || "",
    emergencyName: record.emergencyContact?.name || "",
    emergencyRelationship: record.emergencyContact?.relationship || "",
    emergencyPhone: record.emergencyContact?.phoneNumber || "",
    insuranceProvider: record.insuranceInfo?.provider || "",
    insurancePolicyNumber: record.insuranceInfo?.policyNumber || "",
    insuranceExpiryDate: record.insuranceInfo?.expiryDate || "",
  };
};

/**
 * Validate form data before submission
 */
export const validateFormData = (formData: Record<string, unknown>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields validation
  if (!String(formData.patientId || "").trim()) errors.push("Patient ID is required");
  if (!String(formData.fullName || "").trim()) errors.push("Full name is required");
  if (!String(formData.dateOfBirth || "").trim()) errors.push("Date of birth is required");
  if (!String(formData.gender || "").trim()) errors.push("Gender is required");
  if (!String(formData.phoneNumber || "").trim()) errors.push("Phone number is required");
  if (!String(formData.address || "").trim()) errors.push("Address is required");

  // Email validation
  const email = String(formData.email || "");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format");
  }

  // Phone number validation (10-11 digits only)
  const phoneNumber = String(formData.phoneNumber || "");
  if (phoneNumber && !/^[0-9]{10,11}$/.test(phoneNumber)) {
    errors.push("Phone number must be 10-11 digits");
  }

  // Emergency contact validation
  if (formData.emergencyName && !formData.emergencyPhone) {
    errors.push("Emergency phone number is required when emergency name is provided");
  }
  
  // Emergency contact phone validation
  const emergencyPhone = String(formData.emergencyPhone || "");
  if (emergencyPhone && !/^[0-9]{10,11}$/.test(emergencyPhone)) {
    errors.push("Emergency phone number must be 10-11 digits");
  }
  
  // Identity number validation (9-12 digits)
  const identifyNumber = String(formData.identifyNumber || "");
  if (identifyNumber && !/^[0-9]{9,12}$/.test(identifyNumber)) {
    errors.push("Identity number must be 9-12 digits");
  }

  // Insurance validation
  if (formData.insuranceProvider && !formData.insurancePolicyNumber) {
    errors.push("Insurance policy number is required when provider is provided");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format date for display
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
};

/**
 * Format date for input field
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};
