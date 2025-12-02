import { Checkbox } from "@/components/ui/checkbox";
import { useGetMedicalRecordsQuery } from "@/services/medicalRecordApi";
import type { MedicalRecord } from "@/types/medicalRecord.type";
import type { RequestedTestName } from "@/types/request.type";
import { requestedTests } from "@/types/request.type";
import { useState } from "react";

interface TestOrderFormProps {
  initialMedicalRecordId?: string;
  initialRequestedTests?: RequestedTestName[];
  isLoading?: boolean;
  onSubmit: (
    medicalRecordId: string,
    requestedTests: RequestedTestName[]
  ) => void;
  onCancel: () => void;
}

export function TestOrderAddForm({
  initialMedicalRecordId = "",
  initialRequestedTests = [],
  isLoading,
  onSubmit,
  onCancel,
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
      <section className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">
          Medical Record <span className="text-red-500">*</span>
        </label>
        {isMedicalRecordsLoading ? (
          <div className="text-sm text-gray-500">Loading medical records...</div>
        ) : medicalRecordsError ? (
          <div className="text-sm text-red-500">
            Error loading medical records
          </div>
        ) : (
          <select
            name="medicalRecordId"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMedicalRecord}
            onChange={(e) => setSelectedMedicalRecord(e.target.value)}
            required
          >
            <option value="">Select medical record</option>
            {medicalRecords?.data?.patient?.map((record: MedicalRecord) => (
              <option key={record._id} value={record._id}>
                {record.fullName} ({record._id})
              </option>
            ))}
          </select>
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
          <div className="overflow-x-auto">
            <table className="min-w-[480px] w-full border-collapse text-sm">
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
                    <td className="p-2 border border-gray-200">{test}</td>
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
        </div>
      </section>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Close
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {isLoading ? "Creating..." : "Create Test Order"}
        </button>
      </div>
    </form>
  );
}
