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

import LoadingSpinner from "@/components/ui/loading/LoadingSpinner";
import { useGetMedicalRecordsQuery } from "@/services/medicalRecordApi";

export default function MedicalRecordPatientPage() {
  const {
    data: medicalRecordResponse,
    isLoading,
    isError,
    error,
  } = useGetMedicalRecordsQuery({ limit: 10 });

  const calculateAge = (dob: string) => {
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    return age;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-8">
        <LoadingSpinner message="Đang tải thông tin hồ sơ bệnh án..." />
      </div>
    );
  }

  if (isError || !medicalRecordResponse?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold">
              {error && "data" in error
                ? (error.data as { message?: string })?.message ||
                  "Không thể tải thông tin hồ sơ bệnh án"
                : "Không tìm thấy hồ sơ bệnh án"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const medicalRecord = medicalRecordResponse.data;
  console.log(medicalRecord);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Medical Record
              </h1>
              <p className="text-gray-600 mt-1">
                Complete patient health information
              </p>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-3 text-blue-700">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Patient Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50/50 transition-colors duration-200 group">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <IdCard className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Patient ID
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    {medicalRecord.patient[0]._id}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-indigo-50/50 transition-colors duration-200 group">
                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Full Name
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    {medicalRecord.patient[0].fullName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-pink-50/50 transition-colors duration-200 group">
                <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                  <CalendarDays className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Date of Birth
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    {medicalRecord.patient[0].dateOfBirth}{" "}
                    <span className="text-pink-600">
                      ({calculateAge(medicalRecord.patient[0].dateOfBirth)}{" "}
                      years)
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-50/50 transition-colors duration-200 group">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Gender
                  </p>
                  <p className="font-bold text-gray-900 text-lg capitalize">
                    {medicalRecord.patient[0].gender}
                  </p>
                </div>
              </div>
              {medicalRecord.patient[0].bloodType && (
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-red-50/50 transition-colors duration-200 group">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                    <HeartPulse className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Blood Type
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {medicalRecord.patient[0].bloodType}
                    </p>
                  </div>
                </div>
              )}
              {medicalRecord.patient[0].identifyNumber && (
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50/50 transition-colors duration-200 group">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <IdCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      ID Number
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {medicalRecord.patient[0].identifyNumber}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50/50 transition-colors duration-200 group">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Phone Number
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    {medicalRecord.patient[0].phoneNumber}
                  </p>
                </div>
              </div>
              {medicalRecord.patient[0].email && (
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-indigo-50/50 transition-colors duration-200 group">
                  <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Mail className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <p className="font-bold text-gray-900 text-lg break-all">
                      {medicalRecord.patient[0].email}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-50/50 transition-colors duration-200 group">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Home className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Address
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    {medicalRecord.patient[0].address}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {medicalRecord.patient[0].emergencyContact && (
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 border-b border-yellow-100">
              <CardTitle className="flex items-center gap-3 text-yellow-700">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Emergency Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-yellow-50/50 transition-colors duration-200 group">
                  <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                    <User className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Name
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {medicalRecord.patient[0].emergencyContact.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-orange-50/50 transition-colors duration-200 group">
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <Phone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Phone Number
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {medicalRecord.patient[0].emergencyContact.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-red-50/50 transition-colors duration-200 group">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                    <Users className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Relationship
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {medicalRecord.patient[0].emergencyContact.relationship}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medical History */}
        {medicalRecord.patient[0].medicalHistory && (
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 border-b border-red-100">
              <CardTitle className="flex items-center gap-3 text-red-700">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg shadow-md">
                  <HeartPulse className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Medical History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 hover:bg-red-50 transition-colors">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Allergies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {medicalRecord.patient[0].medicalHistory.allergies &&
                    medicalRecord.patient[0].medicalHistory.allergies.length >
                      0 ? (
                      medicalRecord.patient[0].medicalHistory.allergies.map(
                        (allergy: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-shadow"
                          >
                            {allergy}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-gray-400 italic text-sm">None</span>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-yellow-50/50 border border-yellow-100 hover:bg-yellow-50 transition-colors">
                  <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Chronic Conditions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {medicalRecord.patient[0].medicalHistory
                      .chronicConditions &&
                    medicalRecord.patient[0].medicalHistory.chronicConditions
                      .length > 0 ? (
                      medicalRecord.patient[0].medicalHistory.chronicConditions.map(
                        (condition: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-shadow"
                          >
                            {condition}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-gray-400 italic text-sm">None</span>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50 transition-colors">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Previous Surgeries
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {medicalRecord.patient[0].medicalHistory
                      .previousSurgeries &&
                    medicalRecord.patient[0].medicalHistory.previousSurgeries
                      .length > 0 ? (
                      medicalRecord.patient[0].medicalHistory.previousSurgeries.map(
                        (surgery: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-shadow"
                          >
                            {surgery}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-gray-400 italic text-sm">None</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insurance Info */}
        {medicalRecord.patient[0].insuranceInfo && (
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-3 text-green-700">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Insurance Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-50/50 transition-colors duration-200 group">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Provider
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {medicalRecord.patient[0].insuranceInfo.provider}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-50/50 transition-colors duration-200 group">
                  <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <IdCard className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Policy Number
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {medicalRecord.patient[0].insuranceInfo.policyNumber}
                    </p>
                  </div>
                </div>
                {medicalRecord.patient[0].insuranceInfo.expiryDate && (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-teal-50/50 transition-colors duration-200 group">
                    <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                      <CalendarDays className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Expiry Date
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {medicalRecord.patient[0].insuranceInfo.expiryDate}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Record Metadata */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-gray-50 via-slate-50 to-zinc-50 border-b border-gray-100">
            <CardTitle className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg shadow-md">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Record Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50/50 transition-colors duration-200 group">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Created At
                  </p>
                  <p className="font-bold text-gray-900 text-sm">
                    {new Date(
                      medicalRecord.patient[0].createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-indigo-50/50 transition-colors duration-200 group">
                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Updated At
                  </p>
                  <p className="font-bold text-gray-900 text-sm">
                    {new Date(
                      medicalRecord.patient[0].updatedAt
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-yellow-50/50 transition-colors duration-200 group">
                <div
                  className={`p-2 rounded-lg group-hover:opacity-80 transition-colors ${
                    medicalRecord.patient[0].isDeleted
                      ? "bg-red-100"
                      : "bg-green-100"
                  }`}
                >
                  <AlertCircle
                    className={`w-5 h-5 ${
                      medicalRecord.patient[0].isDeleted
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      medicalRecord.patient[0].isDeleted
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        medicalRecord.patient[0].isDeleted
                          ? "bg-red-500"
                          : "bg-green-500"
                      } animate-pulse`}
                    ></span>
                    {medicalRecord.patient[0].isDeleted ? "Deleted" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}








