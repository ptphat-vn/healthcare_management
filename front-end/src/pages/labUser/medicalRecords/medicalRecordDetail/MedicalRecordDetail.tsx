import { useState } from "react";
import { useGetMedicalRecordByIdQuery } from "@/services/medicalRecordApi";
import type { MedicalRecord } from "@/types/medicalRecord.type";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, FileText, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Fake data for Test History
interface TestHistory {
  id: string;
  testType: string;
  testDate: string;
  status: "Complete" | "In Progress" | "Pending" | "Review";
  priority: "NORMAL" | "URGENT";
  performedBy: string;
  results?: string;
}

const fakeTestHistory: TestHistory[] = [
  {
    id: "TH-001234",
    testType: "Complete Blood Count",
    testDate: "2024-01-15",
    status: "Complete",
    priority: "NORMAL",
    performedBy: "Lab Tech Mike",
    results: "Normal"
  },
  {
    id: "TH-001235",
    testType: "Lipid Panel",
    testDate: "2024-01-10",
    status: "Complete",
    priority: "NORMAL",
    performedBy: "Lab Tech Sarah",
    results: "High Cholesterol"
  },
  {
    id: "TH-001236",
    testType: "Thyroid Function",
    testDate: "2024-01-05",
    status: "In Progress",
    priority: "URGENT",
    performedBy: "Lab Tech John"
  },
  {
    id: "TH-001237",
    testType: "Blood Glucose",
    testDate: "2024-01-01",
    status: "Review",
    priority: "NORMAL",
    performedBy: "Lab Tech Mike",
    results: "Elevated"
  }
];

export default function MedicalRecordDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

  const {
    data: medicalRecordResponse,
    isLoading,
    isError,
    error,
  } = useGetMedicalRecordByIdQuery(id || "");

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <div className="ml-4 text-lg text-gray-600">
          Đang tải thông tin hồ sơ bệnh án...
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="p-6 text-red-600">
        Error loading medical record:{" "}
        {(error as { data?: { message?: string }; message?: string })?.data?.message || (error as { message?: string })?.message}
      </div>
    );

  const medicalRecord: MedicalRecord | undefined = medicalRecordResponse?.data;
  if (!medicalRecord) return <div className="p-6 text-gray-500">Medical record not found.</div>;

  // Calculate age from date of birth
  const calcAge = (dateOfBirth: string) => {
    const d = new Date(dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age >= 0 ? String(age) : "-";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/medical-records")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Medical Records
        </Button>
      </div>

      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Medical Record Details</h1>
                <p className="text-blue-100 text-lg">View and manage medical record information</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 px-4 py-2 rounded-lg text-right">
                <span className="text-sm font-medium opacity-90">Patient ID</span>
                <p className="text-xl font-bold">{medicalRecord.patientId}</p>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg text-right">
                <span className="text-sm font-medium opacity-90">Patient Name</span>
                <p className="text-xl font-bold">{medicalRecord.fullName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b mb-6">
        <div className="flex">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-6 text-base font-semibold transition-colors border-b-2 ${activeTab === "overview"
                ? "text-gray-900 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-900"
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-6 text-base font-semibold transition-colors border-b-2 ${activeTab === "history"
                ? "text-gray-900 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-900"
              }`}
          >
            Medical History
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 gap-6">
            {/* Patient Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-6 w-6" />
                <h2 className="text-xl font-bold">Patient Information</h2>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Patient ID</p>
                    <p className="font-semibold text-gray-900">{medicalRecord.patientId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900">{medicalRecord.fullName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                    <p className="font-semibold text-gray-900">
                      {medicalRecord.dateOfBirth ? new Date(medicalRecord.dateOfBirth).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Gender</p>
                    <p className="font-semibold text-gray-900 capitalize">{medicalRecord.gender}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Age</p>
                    <p className="font-semibold text-gray-900">
                      {medicalRecord.dateOfBirth ? calcAge(medicalRecord.dateOfBirth) : "—"} years old
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Blood Type</p>
                    <p className="font-semibold text-gray-900">{medicalRecord.bloodType || "—"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{medicalRecord.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-blue-600 underline">{medicalRecord.email || "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="font-semibold text-gray-900">{medicalRecord.address}</p>
                </div>

                {medicalRecord.identifyNumber && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Identity Number</p>
                    <p className="font-semibold text-gray-900">{medicalRecord.identifyNumber}</p>
                  </div>
                )}

                {/* Record Information */}
                <div className="border-t pt-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Record Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Created At</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(medicalRecord.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Updated At</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(medicalRecord.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Record ID</p>
                  <p className="font-semibold text-gray-900">
                    {medicalRecord._id || medicalRecord.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-6 w-6" />
                <h2 className="text-xl font-bold">Medical Information</h2>
              </div>

              <div className="space-y-3">
                {/* Medical History */}
                {medicalRecord.medicalHistory && (
                  <>
                    {/* First row: Allergies and Chronic Conditions */}
                    <div className="grid grid-cols-2 gap-4">
                      {medicalRecord.medicalHistory.allergies && medicalRecord.medicalHistory.allergies.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Allergies</p>
                          <p className="font-semibold text-gray-900">
                            {medicalRecord.medicalHistory.allergies.join(", ")}
                          </p>
                        </div>
                      )}

                      {medicalRecord.medicalHistory.chronicConditions && medicalRecord.medicalHistory.chronicConditions.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Chronic Conditions</p>
                          <p className="font-semibold text-gray-900">
                            {medicalRecord.medicalHistory.chronicConditions.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Second row: Current Medications and Previous Surgeries */}
                    <div className="grid grid-cols-2 gap-4">
                      {medicalRecord.medicalHistory.medications && medicalRecord.medicalHistory.medications.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Current Medications</p>
                          <p className="font-semibold text-gray-900">
                            {medicalRecord.medicalHistory.medications.join(", ")}
                          </p>
                        </div>
                      )}

                      {medicalRecord.medicalHistory.previousSurgeries && medicalRecord.medicalHistory.previousSurgeries.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Previous Surgeries</p>
                          <p className="font-semibold text-gray-900">
                            {medicalRecord.medicalHistory.previousSurgeries.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Emergency Contact */}
                {medicalRecord.emergencyContact && (
                  <div className="border-t pt-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Name</p>
                        <p className="font-semibold text-gray-900">{medicalRecord.emergencyContact.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                        <p className="font-semibold text-gray-900">{medicalRecord.emergencyContact.phoneNumber}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500 mb-1">Relationship</p>
                        <p className="font-semibold text-gray-900">{medicalRecord.emergencyContact.relationship}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insurance Information */}
                {medicalRecord.insuranceInfo && (
                  <div className="border-t pt-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Insurance Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Provider</p>
                        <p className="font-semibold text-gray-900">{medicalRecord.insuranceInfo.provider}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Policy Number</p>
                        <p className="font-semibold text-gray-900">{medicalRecord.insuranceInfo.policyNumber}</p>
                      </div>
                      {medicalRecord.insuranceInfo.expiryDate && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500 mb-1">Expiry Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(medicalRecord.insuranceInfo.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 p-6 border-b border-gray-200">
            <FileText className="h-6 w-6" />
            <h2 className="text-xl font-bold">Test History</h2>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50 hover:bg-blue-50">
                  <TableHead className="font-semibold text-gray-900">Test ID</TableHead>
                  <TableHead className="font-semibold text-gray-900">Test Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">Test Date</TableHead>
                  <TableHead className="font-semibold text-gray-900">Priority</TableHead>
                  <TableHead className="font-semibold text-gray-900">Performed By</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900">Results</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fakeTestHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Không tìm thấy lịch sử xét nghiệm nào
                    </TableCell>
                  </TableRow>
                ) : (
                  fakeTestHistory.map((test) => (
                    <TableRow key={test.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{test.id}</TableCell>
                      <TableCell>{test.testType}</TableCell>
                      <TableCell>{new Date(test.testDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${test.priority === "URGENT"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                            }`}
                        >
                          {test.priority}
                        </span>
                      </TableCell>
                      <TableCell>{test.performedBy}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${test.status === "Complete"
                              ? "bg-green-100 text-green-800"
                              : test.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : test.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-purple-100 text-purple-800"
                            }`}
                        >
                          {test.status}
                        </span>
                      </TableCell>
                      <TableCell>{test.results || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-100"
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}