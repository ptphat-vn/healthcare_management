import { type MedicalRecord, type CreateMedicalRecordRequest, type UpdateMedicalRecordRequest } from "@/types/medicalRecord.type";

/**
 * Transform form data to backend format for creating medical record
 */
export const transformFormToCreateRequest = (formData: Record<string, unknown>): CreateMedicalRecordRequest => {
  const result: CreateMedicalRecordRequest = {
    userId: String(formData.userId || ""),
  };

  // Blood Type
  if (formData.bloodType) {
    result.bloodType = formData.bloodType as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  }

  // Emergency Contact - chỉ tạo nếu TẤT CẢ fields đều có giá trị và không empty
  const emergencyName = String(formData.emergencyName || "").trim();
  const emergencyPhone = String(formData.emergencyPhone || "").trim();
  const emergencyRelationship = String(formData.emergencyRelationship || "").trim();
  
  if (emergencyName && emergencyPhone && emergencyRelationship) {
    result.emergencyContact = {
      name: emergencyName,
      phoneNumber: emergencyPhone,
      relationship: emergencyRelationship
    };
  }

  // Medical History - chỉ tạo nếu có ít nhất 1 array không empty
  const allergies = formData.allergies 
    ? String(formData.allergies).split(',').map((a: string) => a.trim()).filter((a: string) => a)
    : [];
  const chronicConditions = formData.chronicConditions 
    ? String(formData.chronicConditions).split(',').map((c: string) => c.trim()).filter((c: string) => c)
    : [];
  const medications = formData.medications 
    ? String(formData.medications).split(',').map((m: string) => m.trim()).filter((m: string) => m)
    : [];
  const previousSurgeries = formData.previousSurgeries 
    ? String(formData.previousSurgeries).split(',').map((s: string) => s.trim()).filter((s: string) => s)
    : [];

  // Chỉ tạo medicalHistory nếu có ít nhất 1 array không empty
  if (allergies.length > 0 || chronicConditions.length > 0 || medications.length > 0 || previousSurgeries.length > 0) {
    result.medicalHistory = {};
    if (allergies.length > 0) result.medicalHistory.allergies = allergies;
    if (chronicConditions.length > 0) result.medicalHistory.chronicConditions = chronicConditions;
    if (medications.length > 0) result.medicalHistory.medications = medications;
    if (previousSurgeries.length > 0) result.medicalHistory.previousSurgeries = previousSurgeries;
  }

  // Insurance Info - chỉ tạo nếu TẤT CẢ required fields có giá trị và không empty
  const insuranceProvider = String(formData.insuranceProvider || "").trim();
  const insurancePolicyNumber = String(formData.insurancePolicyNumber || "").trim();
  const insuranceExpiryDate = formData.insuranceExpiryDate 
    ? String(formData.insuranceExpiryDate).trim() 
    : undefined;

  if (insuranceProvider && insurancePolicyNumber) {
    result.insuranceInfo = {
      provider: insuranceProvider,
      policyNumber: insurancePolicyNumber,
      expiryDate: insuranceExpiryDate || undefined
    };
  }

  return result;
};

/**
 * Transform form data to backend format for updating medical record
 */
export const transformFormToUpdateRequest = (formData: Record<string, unknown>, recordId: string): UpdateMedicalRecordRequest => {
  const result: UpdateMedicalRecordRequest = { _id: recordId };
  
  if (formData.fullName && String(formData.fullName).trim()) result.fullName = String(formData.fullName);
  if (formData.dateOfBirth && String(formData.dateOfBirth).trim()) result.dateOfBirth = String(formData.dateOfBirth);
  if (formData.gender) result.gender = formData.gender as 'male' | 'female';
  if (formData.bloodType) result.bloodType = formData.bloodType as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  if (formData.phoneNumber && String(formData.phoneNumber).trim()) result.phoneNumber = String(formData.phoneNumber);
  if (formData.email && String(formData.email).trim()) result.email = String(formData.email);
  if (formData.address && String(formData.address).trim()) result.address = String(formData.address);
  if (formData.identifyNumber && String(formData.identifyNumber).trim()) result.identifyNumber = String(formData.identifyNumber);
  
  if (formData.emergencyName && String(formData.emergencyName).trim()) {
    result.emergencyContact = {
      name: String(formData.emergencyName),
      phoneNumber: String(formData.emergencyPhone || ""),
      relationship: String(formData.emergencyRelationship || "")
    };
  }
  
  const medicalHistory: {
    allergies?: string[];
    chronicConditions?: string[];
    medications?: string[];
    previousSurgeries?: string[];
  } = {};
  if (formData.allergies && String(formData.allergies).trim()) {
    medicalHistory.allergies = String(formData.allergies).split(',').map((s: string) => s.trim()).filter((s: string) => s);
  }
  if (formData.chronicConditions && String(formData.chronicConditions).trim()) {
    medicalHistory.chronicConditions = String(formData.chronicConditions).split(',').map((s: string) => s.trim()).filter((s: string) => s);
  }
  if (formData.medications && String(formData.medications).trim()) {
    medicalHistory.medications = String(formData.medications).split(',').map((s: string) => s.trim()).filter((s: string) => s);
  }
  if (formData.previousSurgeries && String(formData.previousSurgeries).trim()) {
    medicalHistory.previousSurgeries = String(formData.previousSurgeries).split(',').map((s: string) => s.trim()).filter((s: string) => s);
  }
  if (Object.keys(medicalHistory).length > 0) result.medicalHistory = medicalHistory;
  
  if (formData.insuranceProvider && String(formData.insuranceProvider).trim()) {
    result.insuranceInfo = {
      provider: String(formData.insuranceProvider),
      policyNumber: String(formData.insurancePolicyNumber || ""),
      expiryDate: formData.insuranceExpiryDate && String(formData.insuranceExpiryDate).trim() ? String(formData.insuranceExpiryDate) : undefined
    };
  }
  
  return result;
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

  // Required fields validation for create (userId) or update (no required fields)
  if (formData.userId && !String(formData.userId || "").trim()) errors.push("User ID is required");

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
