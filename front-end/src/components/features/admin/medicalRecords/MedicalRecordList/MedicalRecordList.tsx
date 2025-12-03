import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import ErrorAlert from "@/components/ui/error/ErrorAlert";
import EmptyState from "@/components/ui/empty/EmptyState";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import type { MedicalRecord } from "@/types/medicalRecord.type";
import EditMedicalRecordModal from "../EditMedicalRecord/EditMedicalRecordModal";
import DeleteMedicalRecordModal from "../DeleteMedicalRecord/DeleteMedicalRecordModal";
import {
  useGetMedicalRecordsQuery,
  useDeleteMedicalRecordMutation,
} from "@/services/medicalRecordApi";
import { toast } from "sonner";
import PaginationUI from "@/components/ui/pagination/PaginationUI";
import SearchAndFilter from "@/components/ui/searchAndFilter/SearchAndFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllTestOrderQuery } from "@/services/testOrderApi";
import { useMemo } from "react";
import { formatDate } from "@/utils/formatDate";

interface ApiError {
  data?: {
    message?: string;
  };
}

// Thêm các hàm helper giống như TestOrderList (thêm sau các imports, trước component)
const getStatusColor = (status: string) => {
  const statusStyles: Record<string, string> = {
    completed: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    reviewed: "bg-blue-100 text-blue-800 border-blue-200",
    ai_reviewed: "bg-purple-100 text-purple-800 border-purple-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const formatStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "Pending",
    completed: "Completed",
    reviewed: "Reviewed",
    ai_reviewed: "AI Reviewed",
    cancelled: "Cancelled",
  };
  return statusMap[status] || status;
};

export default function MedicalRecordList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<
    "fullName" | "dateOfBirth" | "createdAt" | "lastTestDate"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);

  // API hooks
  const {
    data: recordsData,
    isLoading,
    error,
    refetch,
  } = useGetMedicalRecordsQuery({
    search: search || undefined,
    gender: status === 1 ? "male" : status === 0 ? "female" : undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: 8,
  });
  const [deleteMedicalRecord] = useDeleteMedicalRecordMutation();

  const records = recordsData?.data?.patient || [];

  // Fetch all test orders to get last test date and status
  const { data: testOrdersData } = useGetAllTestOrderQuery({
    sortBy: "createdDate",
    sortOrder: -1,
    limit: 1000, // Fetch enough to cover all records
  });

  // Create a map of medicalRecordId to last test order (most recent)
  const lastTestByMedicalRecord = useMemo(() => {
    const map = new Map<string, { createdDate: string; status: string }>();
    
    if (testOrdersData?.data?.testOrder) {
      testOrdersData.data.testOrder.forEach((testOrder: any) => {
        // Get medicalRecordId from test order (may be in different formats)
        const medicalRecordId = 
          testOrder.medicalRecordId || 
          testOrder.medicalRecordId?._id || 
          testOrder.medicalRecordId?.toString();
        
        if (medicalRecordId) {
          const recordId = typeof medicalRecordId === 'object' 
            ? medicalRecordId._id || medicalRecordId.toString() 
            : medicalRecordId.toString();

          if (!map.has(recordId)) {
            map.set(recordId, {
              createdDate: testOrder.createdDate,
              status: testOrder.status,
            });
          }
        }
      });
    }
    
    return map;
  }, [testOrdersData]);

  const enrichedRecords = useMemo(() => {
    return records.map((record) => {
      const medicalRecordId = record._id || record.id;
      const lastTest = medicalRecordId 
        ? lastTestByMedicalRecord.get(medicalRecordId.toString())
        : null;
      
      return {
        ...record,
        lastTestDate: record.lastTestDate || lastTest?.createdDate,
        lastTestStatus: record.lastTestStatus || lastTest?.status,
      };
    });
  }, [records, lastTestByMedicalRecord]);


  const handleView = (record: MedicalRecord) => {
    const roleCode = user?.data?.roleCode;
    if (roleCode === "admin") {
      navigate(`/admin/medical-records/${record._id || record.id}`);
    } else if (roleCode === "lab_user") {
      navigate(`/lab_user/medical-records/${record._id || record.id}`);
    } else {
      navigate(`/lab_manager/medical-records/${record._id || record.id}`);
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return;

    try {
      const recordId = selectedRecord._id || selectedRecord.id;
      if (!recordId) {
        toast.error("Record ID not found");
        return;
      }
      await deleteMedicalRecord(recordId).unwrap();
      toast.success("Medical record deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedRecord(null);
      refetch();
    } catch (error: unknown) {
      console.error("Error deleting medical record:", error);

      const errorData = error as ApiError & {
        data?: { errors?: Record<string, string> };
      };
      if (errorData?.data?.errors) {
        const errorMessages = Object.values(errorData.data.errors).join("\n");
        toast.error(`Validation errors:\n${errorMessages}`);
      } else {
        toast.error(
          errorData?.data?.message || "Failed to delete medical record"
        );
      }
    }
  };

  if (error) {
    return (
      <ErrorAlert
        message={
          (error as ApiError)?.data?.message || "An unexpected error occurred"
        }
        title="Error loading medical records"
      />
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <SearchAndFilter
          searchTerm={search}
          onSearchChange={setSearch}
          gender={status}
          onGenderChange={setStatus}
          sortOptions={[
            { value: "fullName", label: "Full Name" },
            { value: "dateOfBirth", label: "Date of Birth" },
            { value: "createdAt", label: "Created At" },
            { value: "lastTestDate", label: "Last Test Date" },
          ]}
          sortByValue={sortBy}
          onSortByChange={(value) =>
            setSortBy(
              value as "fullName" | "dateOfBirth" | "createdAt" | "lastTestDate"
            )
          }
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          searchPlaceholder="Search medical records..."
          onClearFilters={() => {
            setSearch("");
            setStatus("");
            setSortBy("createdAt");
            setSortOrder(-1);
            setCurrentPage(1);
          }}
          showClearFilters={true}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                <TableHead className="font-semibold text-gray-700 w-16 px-3">
                  No
                </TableHead>
                {/* <TableHead className="font-semibold text-gray-700 w-32 px-4">
                  Patient ID
                </TableHead> */}
                <TableHead className="font-semibold text-gray-700 w-48 px-4">
                  Full Name
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-20 px-3">
                  Birthday
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-24 px-3">
                  Gender
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-28 px-3">
                  Blood Type
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-36 px-4">
                  Phone
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-56 px-4">
                  Email
                </TableHead>

                <TableHead className="font-semibold text-gray-700 w-36 px-4">
                  Last Test Date
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-32 px-4">
                  Last Test Status
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700 w-24 px-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : enrichedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-12">
                    <EmptyState
                      title="No medical records found"
                      description="Try adjusting your search or filter criteria"
                      icon={
                        <svg
                          className="w-16 h-16"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                enrichedRecords.map((record, idx) => (
                  <TableRow
                    key={record._id || record.id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="text-start font-medium text-gray-600 px-3">
                      {idx + 1}
                    </TableCell>
                    {/* <TableCell className="font-medium text-gray-900 px-4">
                      {record.patientId}
                    </TableCell> */}
                    <TableCell className="font-medium text-gray-900 px-4">
                      {record.fullName}
                    </TableCell>
                    <TableCell className="text-gray-600 px-4">
                      {new Date(record.dateOfBirth).toLocaleDateString()}
                    </TableCell>
                    {/* <TableCell className="text-gray-600 px-3">
                      {calcAge(record.dateOfBirth)}
                    </TableCell> */}
                    <TableCell className="text-gray-600 capitalize px-3">
                      {record.gender}
                    </TableCell>
                    <TableCell className="px-3">
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        {record.bloodType || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 px-4">
                      {record.phoneNumber}
                    </TableCell>
                    <TableCell className="text-gray-600 px-4">
                      {record.email || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600 px-4">
                      {record.lastTestDate
                        ? formatDate(record.lastTestDate)
                        : "-"}
                    </TableCell>
                    <TableCell className="px-4">
                      {record.lastTestStatus ? (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            record.lastTestStatus
                          )}`}
                        >
                          {formatStatusText(record.lastTestStatus)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right px-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-100 transition-colors"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => handleView(record)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Eye className="mr-2 h-4 w-4 text-blue-600" />
                            <span className="text-gray-700">View detail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(record)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Edit className="mr-2 h-4 w-4 text-green-600" />
                            <span className="text-gray-700">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(record)}
                            className="cursor-pointer hover:bg-red-50 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
          {enrichedRecords.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-semibold">{(currentPage - 1) * 8 + 1}</span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(
                  currentPage * 8,
                  recordsData?.data?.pagination?.total || 0
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold">
                {recordsData?.data?.pagination?.total || 0}
              </span>{" "}
              medical records
            </>
          ) : (
            <>No medical records to display</>
          )}
        </div>
        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
          {recordsData?.data?.pagination &&
            recordsData.data.pagination.totalPages > 1 && (
              <PaginationUI
                currentPage={currentPage}
                totalPages={recordsData.data.pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            )}
        </div>
      </div>
      <EditMedicalRecordModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        medicalRecord={selectedRecord}
      />

      <DeleteMedicalRecordModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        medicalRecord={selectedRecord}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
