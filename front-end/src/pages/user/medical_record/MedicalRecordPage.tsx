import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Phone,
  Mail,
  CalendarDays,
  Home,
  IdCard,
  HeartPulse,
  Shield,
  FileText,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";

const medicalRecord = {
  _id: "68fad6c638c2ff79d7e4c6b1",
  patientId: "P001234",
  fullName: "Nguyễn Văn Ne",
  dateOfBirth: "1990-01-15",
  gender: "male",
  phoneNumber: "0123456789",
  email: "patient@email.com",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  identifyNumber: "123456789",
  emergencyContact: {
    name: "Nguyễn Thị B",
    phoneNumber: "0987654321",
    relationship: "Spouse",
  },
  bloodType: "A-",
  medicalHistory: {
    allergies: ["Penicillin"],
    chronicDiseases: ["Hypertension"],
    surgeries: [],
  },
  insuranceInfo: {
    provider: "Bảo Việt",
    policyNumber: "BV123456",
    expiryDate: "2026-12-31",
  },
  testOrders: [],
  clinicalNotes: [],
  versionHistory: [{ version: 1, changedAt: "2025-10-24T01:30:46.734+00:00" }],
  isDeleted: false,
  createdAt: "2025-10-24T01:30:46.734+00:00",
  updatedAt: "2025-10-24T07:54:28.917+00:00",
  createdBy: "68f0a4f5a8b1373f8970e374",
  lastModifiedBy: "68f0a4f5a8b1373f8970e374",
  deletedAt: "2025-10-24T07:54:28.917+00:00",
  deletedBy: "68f0a4f5a8b1373f8970e374",
};

export default function MedicalRecordPage() {
  const calculateAge = (dob: string) => {
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Medical Record
          </h1>
          <p className="text-gray-500">Complete patient health information</p>
        </div>

        {/* Patient Info */}
        <Card className="mb-8 shadow-md border border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <User className="w-6 h-6" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <IdCard className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="font-semibold text-gray-800">
                    {medicalRecord.patientId}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-indigo-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold text-gray-800">
                    {medicalRecord.fullName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-pink-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-semibold text-gray-800">
                    {medicalRecord.dateOfBirth} (
                    {calculateAge(medicalRecord.dateOfBirth)} years)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {medicalRecord.gender}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <HeartPulse className="w-5 h-5 text-red-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Blood Type</p>
                  <p className="font-semibold text-gray-800">
                    {medicalRecord.bloodType}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IdCard className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">ID Number</p>
                  <p className="font-semibold text-gray-800">
                    {medicalRecord.identifyNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-semibold text-gray-800">
                    {medicalRecord.phoneNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800">
                    {medicalRecord.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-semibold text-gray-800">
                    {medicalRecord.address}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="mb-8 shadow-md border border-yellow-100">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Users className="w-6 h-6" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-yellow-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold text-gray-800">
                    {medicalRecord.emergencyContact.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-orange-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-semibold text-gray-800">
                    {medicalRecord.emergencyContact.phoneNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-red-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Relationship</p>
                  <p className="font-semibold text-gray-800">
                    {medicalRecord.emergencyContact.relationship}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical History */}
        {medicalRecord.medicalHistory && (
          <Card className="mb-8 shadow-md border border-red-100">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <HeartPulse className="w-6 h-6" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {medicalRecord.medicalHistory.allergies?.length > 0 ? (
                      medicalRecord.medicalHistory.allergies.map(
                        (allergy, idx) => (
                          <span
                            key={idx}
                            className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold"
                          >
                            {allergy}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Chronic Diseases</p>
                  <div className="flex flex-wrap gap-2">
                    {medicalRecord.medicalHistory.chronicDiseases?.length >
                    0 ? (
                      medicalRecord.medicalHistory.chronicDiseases.map(
                        (disease, idx) => (
                          <span
                            key={idx}
                            className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-semibold"
                          >
                            {disease}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Surgeries</p>
                  <div className="flex flex-wrap gap-2">
                    {medicalRecord.medicalHistory.surgeries?.length > 0 ? (
                      medicalRecord.medicalHistory.surgeries.map(
                        (surgery, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-semibold"
                          >
                            {surgery}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insurance Info */}
        {medicalRecord.insuranceInfo && (
          <Card className="mb-8 shadow-md border border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Shield className="w-6 h-6" />
                Insurance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Provider</p>
                    <p className="font-semibold text-gray-800">
                      {medicalRecord.insuranceInfo.provider}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IdCard className="w-5 h-5 text-emerald-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Policy Number</p>
                    <p className="font-semibold text-gray-800">
                      {medicalRecord.insuranceInfo.policyNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarDays className="w-5 h-5 text-teal-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className="font-semibold text-gray-800">
                      {medicalRecord.insuranceInfo.expiryDate}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Record Metadata */}
        <Card className="shadow-md border border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <Clock className="w-6 h-6" />
              Record Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(medicalRecord.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-indigo-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Updated At</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(medicalRecord.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Record ID</p>
                  <p className="font-semibold text-gray-800 text-xs break-all">
                    {medicalRecord._id}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p
                    className={`font-semibold ${
                      medicalRecord.isDeleted
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {medicalRecord.isDeleted ? "Deleted" : "Active"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
