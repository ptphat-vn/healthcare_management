import { useState } from "react";
import { useGetMedicalRecordByIdQuery } from "@/services/medicalRecordApi";
import { useGetAllTestOrderQuery } from "@/services/testOrderApi";
import type { MedicalRecord } from "@/types/medicalRecord.type";
import type { TestOrder } from "@/types/testOrder.type";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, User, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react"; // Added missing import

export default function MedicalRecordDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "history">(
    "overview"
  );
  const {
    data: medicalRecordResponse,
    isLoading,
    isError,
    error,
  } = useGetMedicalRecordByIdQuery(id || "");
  const medicalRecord: MedicalRecord | undefined = medicalRecordResponse?.data;
  const {
    data: testOrdersData,
    isLoading: isLoadingTestOrders,
    refetch: refetchTestOrders,
  } = useGetAllTestOrderQuery(
    medicalRecord?.email
      ? {
          search: medicalRecord.email,
          sortBy: "createdDate",
          sortOrder: -1,
          page: 1,
          limit: 100,
        }
      : undefined,
    {
      skip: !medicalRecord?.email,
    }
  );

  React.useEffect(() => {
    if (medicalRecord?.email) {
      refetchTestOrders();
    }
  }, [medicalRecord?.email, refetchTestOrders]);

  const testOrders: TestOrder[] = React.useMemo(() => {
    if (!testOrdersData?.data?.testOrder || !medicalRecord) {
      return [];
    }
    return testOrdersData.data.testOrder.filter((order: TestOrder) => {
      const emailMatch =
        order.email?.toLowerCase().trim() ===
        medicalRecord.email?.toLowerCase().trim();

      const nameMatch =
        order.patientName?.toLowerCase().trim() ===
        medicalRecord.fullName?.toLowerCase().trim();
      console.log(nameMatch);

      return emailMatch;
    });
  }, [testOrdersData?.data?.testOrder, medicalRecord]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <div className="ml-4 text-lg text-gray-600">
          Loading medical record details...
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="p-6 text-red-600">
        Error loading medical record:{" "}
        {(error as { data?: { message?: string }; message?: string })?.data
          ?.message || (error as { message?: string })?.message}
      </div>
    );

  if (!medicalRecord)
    return <div className="p-6 text-gray-500">Medical record not found.</div>;

  const calcAge = (dateOfBirth: string) => {
    const d = new Date(dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age >= 0 ? String(age) : "-";
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "reviewed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "ai_reviewed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Medical Records
        </Button>
      </div>

      <div className="mb-6 sm:mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                  Medical Record Details
                </h1>
                <p className="text-blue-100 text-sm sm:text-base md:text-lg">
                  View and manage medical record information
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="bg-white/20 px-3 sm:px-4 py-2 rounded-lg text-left w-full sm:w-auto">
                <span className="text-xs sm:text-sm font-medium opacity-90">
                  Patient Name
                </span>
                <p className="text-lg sm:text-xl font-bold">
                  {medicalRecord.fullName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b mb-4 sm:mb-6 overflow-x-auto">
        <div className="flex min-w-max">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "text-gray-900 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "history"
                ? "text-gray-900 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-900"
            }`}
          >
            Test History
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Patient Information */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
                <h2 className="text-lg sm:text-xl font-bold">
                  Patient Information
                </h2>
              </div>

              <div className="space-y-3">
                {/* Hàng 1: Full Name + Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Full Name
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">
                      {medicalRecord.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Gender
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900 capitalize">
                      {medicalRecord.gender}
                    </p>
                  </div>
                </div>

                {/* Hàng 2: Date of Birth + Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Date of Birth
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">
                      {medicalRecord.dateOfBirth
                        ? new Date(
                            medicalRecord.dateOfBirth
                          ).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Age</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">
                      {medicalRecord.dateOfBirth
                        ? calcAge(medicalRecord.dateOfBirth)
                        : "—"}{" "}
                      years old
                    </p>
                  </div>
                </div>

                {/* Hàng 3: Blood Type + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Blood Type
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">
                      {medicalRecord.bloodType || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Phone
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">
                      {medicalRecord.phoneNumber}
                    </p>
                  </div>
                </div>

                {/* Hàng 4: Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Email
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-blue-600 underline">
                      {medicalRecord.email || "—"}
                    </p>
                  </div>
                </div>

                {/* Address giữ full width */}
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">
                    Address
                  </p>
                  <p className="font-semibold text-sm sm:text-base text-gray-900">
                    {medicalRecord.address}
                  </p>
                </div>

                {medicalRecord.identifyNumber && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Identity Number
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">
                      {medicalRecord.identifyNumber}
                    </p>
                  </div>
                )}

                {/* Record Information giữ nguyên phía dưới */}
                <div className="border-t pt-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                    Record Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        Created At
                      </p>
                      <p className="font-semibold text-sm sm:text-base text-gray-900">
                        {new Date(medicalRecord.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        Updated At
                      </p>
                      <p className="font-semibold text-sm sm:text-base text-gray-900">
                        {new Date(medicalRecord.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                <h2 className="text-lg sm:text-xl font-bold">
                  Medical Information
                </h2>
              </div>

              <div className="space-y-3">
                {medicalRecord.medicalHistory && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {medicalRecord.medicalHistory.allergies &&
                        medicalRecord.medicalHistory.allergies.length > 0 && (
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">
                              Allergies
                            </p>
                            <p className="font-semibold text-sm sm:text-base text-gray-900">
                              {medicalRecord.medicalHistory.allergies.join(
                                ", "
                              )}
                            </p>
                          </div>
                        )}

                      {medicalRecord.medicalHistory.chronicConditions &&
                        medicalRecord.medicalHistory.chronicConditions.length >
                          0 && (
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">
                              Chronic Conditions
                            </p>
                            <p className="font-semibold text-sm sm:text-base text-gray-900">
                              {medicalRecord.medicalHistory.chronicConditions.join(
                                ", "
                              )}
                            </p>
                          </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {medicalRecord.medicalHistory.medications &&
                        medicalRecord.medicalHistory.medications.length > 0 && (
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">
                              Current Medications
                            </p>
                            <p className="font-semibold text-sm sm:text-base text-gray-900">
                              {medicalRecord.medicalHistory.medications.join(
                                ", "
                              )}
                            </p>
                          </div>
                        )}

                      {medicalRecord.medicalHistory.previousSurgeries &&
                        medicalRecord.medicalHistory.previousSurgeries.length >
                          0 && (
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">
                              Previous Surgeries
                            </p>
                            <p className="font-semibold text-sm sm:text-base text-gray-900">
                              {medicalRecord.medicalHistory.previousSurgeries.join(
                                ", "
                              )}
                            </p>
                          </div>
                        )}
                    </div>
                  </>
                )}
                {medicalRecord.emergencyContact && (
                  <div className="border-t pt-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">
                          Name
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-gray-900">
                          {medicalRecord.emergencyContact.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">
                          Phone
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-gray-900">
                          {medicalRecord.emergencyContact.phoneNumber}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">
                          Relationship
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-gray-900">
                          {medicalRecord.emergencyContact.relationship}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {medicalRecord.insuranceInfo && (
                  <div className="border-t pt-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                      Insurance Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">
                          Provider
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-gray-900">
                          {medicalRecord.insuranceInfo.provider}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">
                          Policy Number
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-gray-900">
                          {medicalRecord.insuranceInfo.policyNumber}
                        </p>
                      </div>
                      {medicalRecord.insuranceInfo.expiryDate && (
                        <div className="col-span-2">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">
                            Expiry Date
                          </p>
                          <p className="font-semibold text-sm sm:text-base text-gray-900">
                            {new Date(
                              medicalRecord.insuranceInfo.expiryDate
                            ).toLocaleDateString()}
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
          <div className="flex items-center gap-2 p-4 sm:p-6 border-b border-gray-200">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
            <h2 className="text-lg sm:text-xl font-bold">Test History</h2>
          </div>

          {isLoadingTestOrders ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading test history...</p>
            </div>
          ) : testOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No test orders found for this patient
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 hover:bg-blue-50">
                    <TableHead className="font-semibold text-gray-900 text-xs sm:text-sm p-3">
                      Created Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-xs sm:text-sm">
                      Run Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-xs sm:text-sm">
                      Doctor in charge
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-xs sm:text-sm">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-xs sm:text-sm">
                      Tests
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-center text-xs sm:text-sm">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testOrders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-gray-50">
                      <TableCell className="text-xs sm:text-sm p-3">
                        {new Date(order.createdDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {order.runDate
                          ? new Date(order.runDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {order.runByUser?.fullName || order.runBy || "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {order.requestedTests?.length || 0} test(s)
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const roleCode = user?.data?.roleCode || "admin";
                            navigate(`/${roleCode}/test-order/${order._id}`);
                          }}
                          className="text-xs sm:text-sm"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
