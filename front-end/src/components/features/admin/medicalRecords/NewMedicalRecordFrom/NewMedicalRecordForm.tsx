
import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createMedicalRecordSchema,
  type CreateMedicalRecordFormData,
} from "@/schemas/medicalRecordSchema";
import { transformFormToCreateRequest } from "@/utils/medicalRecordTransform";
import { type CreateMedicalRecordRequest } from "@/types/medicalRecord.type";
import Input from "@/components/ui/input/Input";
import { useGetAllUserQuery } from "@/services/userApi";
import { type User } from "@/types/user.type";
import { Combobox } from "@/components/ui/combobox";
import {Select,SelectContent, SelectItem,SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface NewMedicalRecordFormProps {
  onSubmit: (data: CreateMedicalRecordRequest) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function NewMedicalRecordForm({
  onSubmit,
  onClose,
  isLoading = false,
}: NewMedicalRecordFormProps) {
  // Fetch all users
  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUserQuery({
    limit: 1000, 
    status: 1, 
  });
  
  const patientOptions = useMemo(() => {
    if (!usersData?.data?.user) return [];
    
    return usersData.data.user
      .filter((user: User) => user.roleCode === "patient" && user.patientId)
      .map((user: User) => ({
        value: user._id,
        label: user.fullName,
        description: `${user.email} - ${user.patientId || "N/A"}`,
      }));
  }, [usersData]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateMedicalRecordFormData>({
    resolver: zodResolver(createMedicalRecordSchema),
    defaultValues: {
      userId: "",
      bloodType: undefined,
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

  const onFormSubmit = (data: CreateMedicalRecordFormData) => {
    const transformedData = transformFormToCreateRequest(data);
    onSubmit(transformedData);
  };

  return (
    <div className="flex flex-col gap-1">
      <form className="space-y-2 sm:space-y-3" onSubmit={handleSubmit(onFormSubmit)}>
        <div className="space-y-3">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">
            Select Patient <span className="text-red-500">*</span>
            </label>
            <Controller
              name="userId"
              control={control}
              rules={{ required: "Please select a patient" }}
              render={({ field }) => (
                <Combobox
                  options={patientOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={isLoadingUsers ? "Loading patients..." : "Select a patient"}
                  searchPlaceholder="Search by name, email, or patient ID..."
                  emptyMessage={isLoadingUsers ? "Loading..." : "No patients found"}
                  disabled={isLoadingUsers} 
                />
              )}
            />
            {errors.userId && (
              <p className="text-sm text-red-500">{errors.userId.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-1">
            Clinical Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Blood Type
              </label>
              <Controller
                name="bloodType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger 
                      className={`w-full h-8 text-sm ${
                        errors.bloodType?.message ? "border-red-500" : ""
                      }`}
                      size="sm"
                    >
                      <SelectValue placeholder="Select Blood Type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[180px]">
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.bloodType?.message && (
                <p className="text-sm text-red-500">{errors.bloodType.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-1">
            Medical History
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 border-b pb-1">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              {...register("emergencyName")}
              label="Emergency Contact Name *"
              error={errors.emergencyName?.message}
              placeholder="Enter emergency contact name"
              autoComplete="off"
            />
            <Input
              {...register("emergencyPhone")}
              label="Emergency Phone *"
              error={errors.emergencyPhone?.message}
              placeholder="Enter emergency phone number"
              autoComplete="off"
            />
          </div>
          <Input
            {...register("emergencyRelationship")}
            label="Relationship *"
            error={errors.emergencyRelationship?.message}
            placeholder="Enter relationship"
            autoComplete="off"
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-1">
            Insurance Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 sm:space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 h-10 px-4 py-2 w-full sm:w-auto"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full sm:w-auto"
          >
            {isLoading ? "Creating..." : "Create Medical Record"}
          </button>
        </div>
      </form>
    </div>
  );
}