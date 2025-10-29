import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/loading/LoadingSpinner";
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
import EditMedicalRecordModal from "@/components/features/admin/medicalRecords/EditMedicalRecordModal";
import DeleteMedicalRecordModal from "@/components/features/admin/medicalRecords/DeleteMedicalRecordModal";
import {
  useGetMedicalRecordsQuery,
  useDeleteMedicalRecordMutation,
} from "@/services/medicalRecordApi";
import { toast } from "sonner";
import PaginationUI from "@/components/ui/pagination/PaginationUI";
import SearchAndFilter from "@/components/ui/searchAndFilter/SearchAndFilter";

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function MedicalRecordList() {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<
    "fullName" | "dateOfBirth" | "createdAt"
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

  // Helper function to calculate age from date of birth
  const calcAge = (dob?: string) => {
    if (!dob) return "-";
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return "-";
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age >= 0 ? String(age) : "-";
  };

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const handleView = (record: MedicalRecord) => {
    navigate(`/lab_user/medical-records/${record._id || record.id}`);
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

      // Handle validation errors from backend
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

  // Loading and error states
  if (isLoading) {
    return <LoadingSpinner message="Loading medical records..." />;
  }

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
      {/* Search and Filter */}
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
          ]}
          sortByValue={sortBy}
          onSortByChange={(value) =>
            setSortBy(value as "fullName" | "dateOfBirth" | "createdAt")
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                <TableHead className="font-semibold text-gray-700 w-16 px-3">
                  No
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-32 px-4">
                  Patient ID
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-48 px-4">
                  Full Name
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-20 px-3">
                  Age
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
                <TableHead className="font-semibold text-gray-700 w-32 px-4">
                  Date of Birth
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700 w-24 px-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
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
                records.map((record, idx) => (
                  <TableRow
                    key={record._id || record.id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="text-start font-medium text-gray-600 px-3">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 px-4">
                      {record.patientId}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 px-4">
                      {record.fullName}
                    </TableCell>
                    <TableCell className="text-gray-600 px-3">
                      {calcAge(record.dateOfBirth)}
                    </TableCell>
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
                      {new Date(record.dateOfBirth).toLocaleDateString()}
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

      {/* Pagination */}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
          {records.length > 0 ? (
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
                onPageChange={handleChangePage}
              />
            )}
        </div>
      </div>

      {/* Modals */}
      <EditMedicalRecordModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        medicalRecord={selectedRecord}
        onSuccess={() => {
          alert("Medical record updated successfully!");
        }}
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
