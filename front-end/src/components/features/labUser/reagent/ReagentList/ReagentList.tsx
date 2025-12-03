import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
import PaginationUI from "@/components/ui/pagination/PaginationUI";
import SearchAndFilter from "@/components/ui/searchAndFilter/SearchAndFilter";
import { useGetAllReagentsQuery } from "@/services/reagentApi";
import { formatDate } from "@/utils/formatDate";
import type { Reagent } from "@/types/reagent.type";
import EditReagentModal from "../EditReagentModal/EditReagentModal";
import DeleteReagentModal from "../DeleteReagentModal/DeleteReagentModal";

interface ReagentListProps {
  onReagentDeleted?: () => void;
}

const ITEMS_PER_PAGE = 8;

const SORT_OPTIONS = [
  { value: "name", label: "Reagent Name" },
  { value: "catalogNumber", label: "Catalog Number" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "updatedAt", label: "Last Updated" },
];

export default function ReagentList({ onReagentDeleted }: ReagentListProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "catalogNumber" | "manufacturer" | "updatedAt"
  >("updatedAt");
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);
  const [isActive] = useState<string>("");

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReagent, setSelectedReagent] = useState<Reagent | null>(null);

  const { data, isLoading, error } = useGetAllReagentsQuery({
    search: searchTerm,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    isActive: isActive !== "" ? isActive === "true" : undefined,
  });

  const reagents: Reagent[] = data?.data?.reagents || [];
  const pagination = data?.data?.pagination || {
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
  };

  const handleView = (reagent: Reagent) => {
    const roleCode = user?.data?.roleCode || "lab_user";
    navigate(`/${roleCode}/reagent-management/${reagent._id}`);
  };

  const handleEdit = (reagent: Reagent) => {
    setSelectedReagent(reagent);
    setIsEditModalOpen(true);
  };

  const handleDelete = (reagent: Reagent) => {
    setSelectedReagent(reagent);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    onReagentDeleted?.();
  };

  const renderSkeletonRows = () => (
    <>
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
        <TableRow key={idx}>
          <TableCell>
            <Skeleton className="h-4 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={8} className="text-center py-12">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Inbox size={48} className="mb-4" />
          <p className="text-lg font-medium">No reagents found</p>
          <p className="text-sm">Try adjusting filters or search criteria</p>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">Error loading reagents data</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOptions={SORT_OPTIONS}
          sortByValue={sortBy}
          onSortByChange={(value) =>
            setSortBy(
              value as "name" | "catalogNumber" | "manufacturer" | "updatedAt"
            )
          }
          sortOrder={sortOrder}
          onSortOrderChange={(value) => setSortOrder(value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <TableHead className="w-16">No.</TableHead>
              <TableHead className="sticky left-0 z-20 bg-blue-50 hover:from-blue-100 hover:to-indigo-100">
                Reagent Name
              </TableHead>
              <TableHead>Catalog No.</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? renderSkeletonRows()
              : reagents.length === 0
              ? renderEmptyState()
              : reagents.map((reagent, idx) => (
                  <TableRow key={reagent._id} className="hover:bg-blue-50/50">
                    <TableCell className="font-medium text-gray-600">
                      {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 sticky left-0 z-20 bg-background">
                      {reagent.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {reagent.catalogNumber || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {reagent.manufacturer}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {reagent.usagePerRun?.unit || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          reagent.isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {reagent.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(reagent.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(reagent)}>
                            <Eye className="mr-2 h-4 w-4 text-blue-600" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(reagent)}>
                            <Edit className="mr-2 h-4 w-4 text-green-600" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(reagent)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && reagents.length > 0 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)}
            </span>{" "}
            of <span className="font-semibold">{pagination.total}</span> results
          </div>
          {pagination.totalPages > 1 && (
            <PaginationUI
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <EditReagentModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        reagent={selectedReagent}
        onSuccess={handleSuccess}
      />

      <DeleteReagentModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        reagent={selectedReagent}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
