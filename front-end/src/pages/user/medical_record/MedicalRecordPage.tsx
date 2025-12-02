import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading/LoadingSpinner";
import { useGetMedicalRecordsQuery } from "@/services/medicalRecordApi";
import type {
  MedicalRecord,
  PatientTestOrderWithResults,
} from "@/types/medicalRecord.type";
import type { TestResults } from "@/types/testOrder.type";
import { AlertCircle } from "lucide-react";
import MedicalRecordHeader from "@/components/features/user/MedicalRecord/MedicalRecordHeader";
import EmergencyContactCard from "@/components/features/user/MedicalRecord/EmergencyContactCard";
import MedicalHistoryCard from "@/components/features/user/MedicalRecord/MedicalHistoryCard";
import InsuranceInfoCard from "@/components/features/user/MedicalRecord/InsuranceInfoCard";
import TestResultsCard from "@/components/features/user/MedicalRecord/TestResultsCard";

const formatDate = (value?: string, config?: Intl.DateTimeFormatOptions) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...config,
  });
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateAge = (dob?: string) => {
  if (!dob) return undefined;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

export default function MedicalRecordPatientPage() {
  const {
    data: medicalRecordResponse,
    isLoading,
    isError,
    error,
  } = useGetMedicalRecordsQuery({ limit: 10 });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner message="Loading your medical record..." />
      </div>
    );
  }

  if (isError || !medicalRecordResponse?.data) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-100 bg-white p-8 text-center shadow">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
            <AlertCircle className="h-7 w-7 text-rose-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Unable to load medical record
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {error && "data" in error
              ? (error.data as { message?: string })?.message ||
                "Please try again in a moment."
              : "Please try again in a moment."}
          </p>
        </div>
      </div>
    );
  }

  const patientRecord: MedicalRecord | undefined =
    medicalRecordResponse.data.patient?.[0];

  if (!patientRecord) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-blue-100 bg-white p-8 text-center shadow">
          <h2 className="text-xl font-semibold text-slate-900">
            No medical record found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            We could not locate an active record associated with your account.
          </p>
        </div>
      </div>
    );
  }

  const age = calculateAge(patientRecord.dateOfBirth);
  const testResults: TestResults[] = Array.isArray(patientRecord.testResults)
    ? (patientRecord.testResults as PatientTestOrderWithResults[]).flatMap(
        (group) => group.testResults ?? []
      )
    : [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[2.2fr,1fr]">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col gap-8 p-8">
              <MedicalRecordHeader patientRecord={patientRecord} age={age} />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-900">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Contact
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {patientRecord.phoneNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    {patientRecord.email}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-900">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Address
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {patientRecord.address}
                  </p>
                  <p className="text-xs text-slate-500">
                    Updated {formatDate(patientRecord.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {patientRecord.identifyNumber && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Identity Number
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {patientRecord.identifyNumber}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date of Birth
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(patientRecord.dateOfBirth)}{" "}
                    {age !== undefined && `(${age} yrs)`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Gender
                  </p>
                  <p className="text-sm font-semibold capitalize text-slate-900">
                    {patientRecord.gender}
                  </p>
                </div>
                {patientRecord.bloodType && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Blood Type
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {patientRecord.bloodType}
                    </p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-slate-100" />

              {/* Bottom row: record meta */}
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created At
                  </p>
                  <p className="mt-1 text-slate-900">
                    {formatDateTime(patientRecord.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Last Updated
                  </p>
                  <p className="mt-1 text-slate-900">
                    {formatDateTime(patientRecord.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        patientRecord.isDeleted
                          ? "bg-rose-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    {patientRecord.isDeleted ? "Inactive" : "Active"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,1.8fr]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {patientRecord.emergencyContact && (
              <EmergencyContactCard
                emergencyContact={patientRecord.emergencyContact}
              />
            )}
            {patientRecord.insuranceInfo && (
              <InsuranceInfoCard insuranceInfo={patientRecord.insuranceInfo} />
            )}
          </div>

          <div className="flex flex-col gap-6">
            <TestResultsCard
              testResults={testResults}
              formatDateTime={formatDateTime}
            />

            <MedicalHistoryCard
              medicalHistory={patientRecord.medicalHistory || {}}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
