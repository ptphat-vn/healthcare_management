import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EditTestOrderModal from "./EditTestOrderModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import PaginationUI from "@/components/ui/pagination/PaginationUI";
import { useGetAllTestOrderQuery } from "@/services/testOrderApi";
import { formatDate } from "@/utils/formatDate";
import SearchAndFilter from "@/components/ui/searchAndFilter/SearchAndFilter";

export interface TestOrder {
  _id: string;
  patientName: string;
  dateOfBirth: string;
  gender: "male" | "female";
  address: string;
  phoneNumber: string;
  email: string;
  status: "pending" | "cancelled" | "completed" | "reviewed" | "ai_reviewed";
  createdDate: string | Date;
  runDate?: string | Date;
  createdByUser?: {
    fullName: string;
    email: string;
  };
  runByUser?: {
    fullName: string;
    email: string;
  };
}

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

interface TestOrderListProps {
  onOrderDeleted?: () => void;
}

export default function TestOrderList({ onOrderDeleted }: TestOrderListProps) {
  const navigate = useNavigate();
  const [editingOrder, setEditingOrder] = useState<TestOrder | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<TestOrder | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "patientName" | "createdDate" | "runDate" | "status"
  >("createdDate");
  const [status, setStatus] = useState<
    "pending" | "cancelled" | "completed" | "reviewed" | "ai_reviewed" | ""
  >("");
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);

  const itemsPerPage = 8;

  const { data, isLoading, error } = useGetAllTestOrderQuery({
    search: searchTerm,
    sortBy,
    status: status || undefined,
    sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  });

  const testOrders: TestOrder[] = (data as any)?.data?.testOrder || [];
  const pagination = (data as any)?.data?.pagination || {
    page: 1,
    limit: itemsPerPage,
    total: 0,
    totalPages: 1,
  };

  const handleView = (order: TestOrder) => {
    navigate(`/admin/test-order/${order._id}`);
  };

  const handleEdit = (order: TestOrder) => {
    setEditingOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDelete = (order: TestOrder) => {
    setDeletingOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full space-y-4">
      {/* Error Alert - Tách riêng ở trên */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-red-800 font-semibold">
              Error loading test orders
            </h3>
            <p className="text-red-600 text-sm mt-1">
              {typeof error === "string"
                ? error
                : "An error occurred while loading data"}
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOptions={[
            { value: "patientName", label: "Patient Name" },
            { value: "createdDate", label: "Created Date" },
            { value: "runDate", label: "Run Date" },
            { value: "status", label: "Status" },
          ]}
          sortByValue={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          statusOptions={[
            { value: "", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "completed", label: "Completed" },
            { value: "reviewed", label: "Reviewed" },
            { value: "ai_reviewed", label: "AI Reviewed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
          statusValue={status}
          onStatusChange={setStatus}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                <TableHead className="font-semibold text-gray-700 w-16">
                  No
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[150px]">
                  Patient Name
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[150px]">
                  Contact
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[130px]">
                  Created Date
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[130px]">
                  Created By
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[100px]">
                  Status
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700 w-20">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton Loading
                Array.from({ length: 8 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : testOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Inbox size={24} />
                      <p className="text-lg font-medium">
                        No test orders found
                      </p>
                      <p className="text-sm">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                testOrders.map((order: TestOrder, idx: number) => (
                  <TableRow
                    key={order._id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="text-start font-medium text-gray-600">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {order.patientName}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <div>
                        <div className="text-sm text-gray-900">
                          {order.phoneNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(
                        typeof order.createdDate === "string"
                          ? order.createdDate
                          : order.createdDate.toString()
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <div>
                        <div className="text-sm text-gray-900">
                          {order.createdByUser?.fullName || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.createdByUser?.email || ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {formatStatusText(order.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
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
                            onClick={() => handleView(order)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Eye className="mr-2 h-4 w-4 text-blue-600" />
                            <span className="text-gray-700">View detail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(order)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Edit className="mr-2 h-4 w-4 text-green-600" />
                            <span className="text-gray-700">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(order)}
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
      {!isLoading && !error && testOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
            {testOrders.length > 0 ? (
              <>
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * itemsPerPage, pagination.total)}
                </span>{" "}
                of <span className="font-semibold">{pagination.total}</span>{" "}
                results
              </>
            ) : (
              "No results"
            )}
          </div>
          {pagination.totalPages > 1 && (
            <div className="w-full sm:w-auto flex justify-center sm:justify-end">
              <PaginationUI
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isEditModalOpen && editingOrder && (
        <EditTestOrderModal
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) setEditingOrder(null);
          }}
          order={editingOrder}
          onSuccess={() => {
            if (onOrderDeleted) {
              onOrderDeleted();
            }
          }}
        />
      )}

      {isDeleteDialogOpen && deletingOrder && (
        <DeleteConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) setDeletingOrder(null);
          }}
          order={deletingOrder}
          onSuccess={() => {
            if (onOrderDeleted) {
              onOrderDeleted();
            }
          }}
        />
      )}
    </div>
  );
}
