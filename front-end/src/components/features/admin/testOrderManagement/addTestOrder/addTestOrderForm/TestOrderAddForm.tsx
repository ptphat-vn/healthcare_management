import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useGetMedicalRecordsQuery } from "@/services/medicalRecordApi";
import type { MedicalRecord } from "@/types/medicalRecord.type";
import type { RequestedTestName } from "@/types/request.type";
import { requestedTests } from "@/types/request.type";
import { useState } from "react";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";
import { useAuth } from "@/hooks/useAuth";

interface TestOrderFormProps {
  initialMedicalRecordId?: string;
  initialRequestedTests?: RequestedTestName[];
  isLoading?: boolean;
  onSubmit: (
    medicalRecordId: string,
    requestedTests: RequestedTestName[]
  ) => void;
  onClose: () => void;
}

export function TestOrderAddForm({
  initialMedicalRecordId = "",
  initialRequestedTests = [],
  isLoading,
  onSubmit,
  onClose,
}: TestOrderFormProps) {
  const {
    data: medicalRecords,
    isLoading: isMedicalRecordsLoading,
    error: medicalRecordsError,
  } = useGetMedicalRecordsQuery({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: -1,
    search: "",
  });
const {user} = useAuth()
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(
    initialMedicalRecordId
  );
  const [selectedTests, setSelectedTests] = useState<RequestedTestName[]>(
    initialRequestedTests
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedMedicalRecord, selectedTests);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <section className="grid gap-2">
        <Label htmlFor="medicalRecord">
          Medical Record <span className="text-red-500">*</span>
        </Label>
        {isMedicalRecordsLoading ? (
          <div className="text-xs text-blue-600 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading medical records...
          </div>
        ) : medicalRecordsError ? (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
            Error loading medical records
          </div>
        ) : (
          <Select
            value={selectedMedicalRecord || ""}
            onValueChange={(value) => setSelectedMedicalRecord(value)}
            required
            disabled={isMedicalRecordsLoading}
          >
            <SelectTrigger id="medicalRecord" className="w-full">
              <SelectValue
                placeholder={
                  isMedicalRecordsLoading
                    ? "Loading medical records..."
                    : "Select medical record"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {medicalRecords?.data?.patient &&
              medicalRecords.data.patient.length > 0 ? (
                medicalRecords.data.patient.map((record: MedicalRecord) => (
                  <SelectItem key={record._id} value={record._id || ""}>
                    {record.fullName}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-records" disabled>
                  No medical records available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Select Tests
          </label>
          <span className="text-xs text-gray-500">
            Choose one or more requested tests
          </span>
        </div>
        <div className="rounded-md border border-gray-200 overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600">
                <th className="p-2 border border-gray-200 w-12">#</th>
                <th className="p-2 border border-gray-200">Test Name</th>
                <th className="p-2 border border-gray-200 text-center w-20">
                  Select
                </th>
              </tr>
            </thead>
            <tbody>
              {requestedTests.map((test, idx) => (
                <tr
                  key={test}
                  className="odd:bg-white even:bg-gray-50 text-gray-800"
                >
                  <td className="p-2 border border-gray-200">{idx + 1}</td>
                  <td className="p-2 border border-gray-200 break-words">
                    {test}
                  </td>
                  <td className="p-2 border border-gray-200 text-center">
                    <Checkbox
                      checked={selectedTests.includes(test)}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setSelectedTests((prev) => [...prev, test]);
                        } else if (checked === false) {
                          setSelectedTests((prev) =>
                            prev.filter((t) => t !== test)
                          );
                        }
                      }}
                      id={`test-checkbox-${idx}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white h-8 px-3 text-xs sm:text-sm sm:h-9 font-medium text-gray-900 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center justify-center rounded-md ${getRoleButtonClass(user?.data.roleCode)} h-8 px-3 text-xs sm:text-sm sm:h-9 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
          >
            {isLoading ? "Creating..." : "Create Test Order"}
          </button>
        </div>
    </form>
  );
}
