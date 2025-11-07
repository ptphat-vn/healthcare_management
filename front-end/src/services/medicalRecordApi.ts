import type { APIResponse } from "@/types/response.type";
import type {
  MedicalRecord,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
} from "@/types/medicalRecord.type";
import { baseApi } from "./baseApi";

export const medicalRecordApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all medical records with pagination and filters
    getMedicalRecords: builder.query<
      APIResponse<{
        patient: MedicalRecord[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>,
      {
        search?: string;
        gender?: "male" | "female";
        dateOfBirthFrom?: string;
        dateOfBirthTo?: string;
        testType?: string;
        instrumentUsed?: string;
        dateRangeFrom?: string;
        dateRangeTo?: string;
        sortBy?: "fullName" | "dateOfBirth" | "createdAt" | "lastTestDate";
        sortOrder?: 1 | -1;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: "/patient-records",
        params,
      }),
      providesTags: ["medicalRecord"],
    }),

    // Get single medical record by ID
    getMedicalRecordById: builder.query<APIResponse<MedicalRecord>, string>({
      query: (id) => ({
        url: `/patient-records/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: "medicalRecord", id }],
    }),

    // Create new medical record
    createMedicalRecord: builder.mutation<
      APIResponse<MedicalRecord>,
      CreateMedicalRecordRequest
    >({
      query: (data) => ({
        url: "/patient-records",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["medicalRecord"],
    }),

    // Update medical record
    updateMedicalRecord: builder.mutation<
      APIResponse<MedicalRecord>,
      UpdateMedicalRecordRequest
    >({
      query: ({ _id, ...data }) => ({
        url: `/patient-records/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { _id }) => [
        { type: "medicalRecord", id: _id },
        "medicalRecord",
      ],
    }),

    // Delete medical record
    deleteMedicalRecord: builder.mutation<
      APIResponse<{ message: string }>,
      string
    >({
      query: (id) => ({
        url: `/patient-records/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "medicalRecord", id },
        "medicalRecord",
      ],
    }),

    // Add clinical note to medical record
    addClinicalNote: builder.mutation<
      APIResponse<MedicalRecord>,
      {
        patientId: string;
        content: string;
        noteType: "general" | "diagnosis" | "treatment" | "follow_up" | "other";
      }
    >({
      query: ({ patientId, ...noteData }) => ({
        url: `/patient-records/${patientId}/clinical-notes`,
        method: "POST",
        body: noteData,
      }),
      invalidatesTags: (_result, _error, { patientId }) => [
        { type: "medicalRecord", id: patientId },
        "medicalRecord",
      ],
    }),
  }),
});

export const {
  useGetMedicalRecordsQuery,
  useGetMedicalRecordByIdQuery,
  useCreateMedicalRecordMutation,
  useUpdateMedicalRecordMutation,
  useDeleteMedicalRecordMutation,
  useAddClinicalNoteMutation,
} = medicalRecordApi;
