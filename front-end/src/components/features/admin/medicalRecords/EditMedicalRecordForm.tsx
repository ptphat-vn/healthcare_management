import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  updateMedicalRecordSchema,
  type UpdateMedicalRecordFormData,
} from "@/schemas/medicalRecordSchema";
import { transformFormToUpdateRequest, transformBackendToFormData } from "@/utils/medicalRecordTransform";
import { type MedicalRecord, type UpdateMedicalRecordRequest } from "@/types/medicalRecord.type";
import Input from "@/components/ui/input/Input";

interface EditMedicalRecordFormProps {
  onSubmit: (data: UpdateMedicalRecordRequest) => void;
  onClose: () => void;
  isLoading?: boolean;
  defaultValues: MedicalRecord;
}

export function EditMedicalRecordForm({
  onSubmit,
  onClose,
  isLoading = false,
  defaultValues,
}: EditMedicalRecordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateMedicalRecordFormData>({
    resolver: zodResolver(updateMedicalRecordSchema),
    defaultValues: {
      patientId: "",
      fullName: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: "",
      gender: undefined,
      bloodType: undefined,
      address: "",
      identifyNumber: "",
      allergies: "",
      chronicConditions: "",
      medications: "",
      previousSurgeries: "",
      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
      insuranceProvider: "",
      insurancePolicyNumber: "",
      insuranceExpiryDate: "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      const formData = transformBackendToFormData(defaultValues);
      reset(formData as UpdateMedicalRecordFormData);
    }
  }, [defaultValues, reset]);

  const onFormSubmit = (data: UpdateMedicalRecordFormData) => {
    const recordId = defaultValues._id || defaultValues.id || "";
    const transformedData = transformFormToUpdateRequest(data, recordId);
    onSubmit(transformedData);
  };

  return (
    <div className="flex flex-col gap-1">
      <form className="space-y-2" onSubmit={handleSubmit(onFormSubmit)}>
        {/* Patient's Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
            Patient's Information
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Input
              {...register("patientId")}
              label="Patient ID"
              required
              error={errors.patientId?.message}
              placeholder="Enter patient ID"
              autoComplete="off"
            />
            <Input
              {...register("fullName")}
              label="Full Name"
              required
              error={errors.fullName?.message}
              placeholder="Enter full name"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              {...register("dateOfBirth")}
              type="date"
              label="Date of Birth"
              required
              error={errors.dateOfBirth?.message}
            />
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                {...register("gender")}
                className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.gender?.message ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender?.message && (
                <p className="text-xs text-red-500">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Blood Type
              </label>
              <select
                {...register("bloodType")}
                className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.bloodType?.message ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {errors.bloodType?.message && (
                <p className="text-xs text-red-500">{errors.bloodType.message}</p>
              )}
            </div>
            <Input
              {...register("phoneNumber")}
              label="Phone Number"
              required
              error={errors.phoneNumber?.message}
              placeholder="Enter phone number"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              {...register("email")}
              type="email"
              label="Email"
              error={errors.email?.message}
              placeholder="Enter email"
              autoComplete="off"
            />
            <Input
              {...register("identifyNumber")}
              label="Identity Number"
              error={errors.identifyNumber?.message}
              placeholder="Enter identity number"
              autoComplete="off"
            />
          </div>

          <Input
            {...register("address")}
            label="Address"
            required
            error={errors.address?.message}
            placeholder="Enter full address"
            autoComplete="off"
          />
        </div>

        {/* Medical Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
            Medical Information
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Allergies
              </label>
              <textarea
                {...register("allergies")}
                placeholder="Enter allergies (comma separated)"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${
                  errors.allergies?.message ? "border-red-500" : "border-gray-300"
                }`}
                rows={2}
              />
              {errors.allergies?.message && (
                <p className="text-sm text-red-500">{errors.allergies.message}</p>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Chronic Conditions
              </label>
              <textarea
                {...register("chronicConditions")}
                placeholder="Enter chronic conditions (comma separated)"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${
                  errors.chronicConditions?.message ? "border-red-500" : "border-gray-300"
                }`}
                rows={2}
              />
              {errors.chronicConditions?.message && (
                <p className="text-sm text-red-500">{errors.chronicConditions.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Current Medications
              </label>
              <textarea
                {...register("medications")}
                placeholder="Enter current medications (comma separated)"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${
                  errors.medications?.message ? "border-red-500" : "border-gray-300"
                }`}
                rows={2}
              />
              {errors.medications?.message && (
                <p className="text-sm text-red-500">{errors.medications.message}</p>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Previous Surgeries
              </label>
              <textarea
                {...register("previousSurgeries")}
                placeholder="Enter previous surgeries (comma separated)"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${
                  errors.previousSurgeries?.message ? "border-red-500" : "border-gray-300"
                }`}
                rows={2}
              />
              {errors.previousSurgeries?.message && (
                <p className="text-sm text-red-500">{errors.previousSurgeries.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
            Emergency Contact
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Input
              {...register("emergencyName")}
              label="Emergency Contact Name"
              error={errors.emergencyName?.message}
              placeholder="Enter emergency contact name"
              autoComplete="off"
            />
            <Input
              {...register("emergencyPhone")}
              label="Emergency Phone"
              error={errors.emergencyPhone?.message}
              placeholder="Enter emergency phone number"
              autoComplete="off"
            />
          </div>
          
          <Input
            {...register("emergencyRelationship")}
            label="Relationship"
            error={errors.emergencyRelationship?.message}
            placeholder="Enter relationship"
            autoComplete="off"
          />
        </div>

        {/* Insurance Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
            Insurance Information
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Input
              {...register("insuranceProvider")}
              label="Insurance Provider"
              error={errors.insuranceProvider?.message}
              placeholder="Enter insurance provider"
              autoComplete="off"
            />
            <Input
              {...register("insurancePolicyNumber")}
              label="Policy Number"
              error={errors.insurancePolicyNumber?.message}
              placeholder="Enter policy number"
              autoComplete="off"
            />
          </div>
          
          <Input
            {...register("insuranceExpiryDate")}
            type="date"
            label="Expiry Date"
            error={errors.insuranceExpiryDate?.message}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 h-10 px-4 py-2"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            {isLoading ? "Updating..." : "Update Medical Record"}
          </button>
        </div>
      </form>
    </div>
  );
}