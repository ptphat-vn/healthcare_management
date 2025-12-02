import { Badge } from "@/components/ui/badge";
import type { MedicalRecord } from "@/types/medicalRecord.type";

interface MedicalRecordHeaderProps {
  patientRecord: MedicalRecord;
  age?: number;
}

export default function MedicalRecordHeader({
  patientRecord,
}: MedicalRecordHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">
        <span className="h-px w-8 bg-sky-400/60" />
        Patient Profile
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
            HemoLab Care
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
            {patientRecord.fullName}
          </h1>
        </div>
        <Badge className="rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          {patientRecord.isDeleted ? "Record Inactive" : "Record Active"}
        </Badge>
      </div>
    </div>
  );
}
