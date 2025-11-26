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
  } = useGetMedicalRecordsQuery();

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
    <form onSubmit={handleSubmit}>
      <div>
        <label className="font-semibold">Medical Record</label>
        {isMedicalRecordsLoading ? (
          <div>Loading...</div>
        ) : medicalRecordsError ? (
          <div>Error loading medical records</div>
        ) : (
          <select
            name="medicalRecordId"
            className="w-full p-2 border rounded"
            value={selectedMedicalRecord}
            onChange={(e) => setSelectedMedicalRecord(e.target.value)}
            required
          >
            <option value="">Select medical record</option>
            {medicalRecords?.data?.patient?.map((record: MedicalRecord) => (
              <option key={record._id} value={record._id}>
                Name: {record.fullName} - ID: {record._id}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="mt-4">
        <label className="font-semibold mb-2 block">Select Tests</label>
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 border text-left w-12">#</th>
                <th className="p-2 border text-left">Test Name</th>
                <th className="p-2 border text-center w-24">Select</th>
              </tr>
            </thead>
            <tbody>
              {requestedTests.map((test, idx) => (
                <tr key={test}>
                  <td className="p-2 border">{idx + 1}</td>
                  <td className="p-2 border">{test}</td>
                  <td className="p-2 border text-center">
                    <Checkbox
                      checked={selectedTests.includes(test)}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setSelectedTests([...selectedTests, test]);
                        } else if (checked === false) {
                          setSelectedTests(
                            selectedTests.filter((t) => t !== test)
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
        <small className="text-gray-500">
          Tick to select one or more tests.
        </small>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="btn-admin px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          className="ml-2 px-4 py-2 bg-gray-300 rounded"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
