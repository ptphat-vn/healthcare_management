import { useEffect, useState } from "react";
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
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import type { GenderUser, User } from "@/types/user.type";
import EditUserModal from "@/components/features/admin/userManagement/EditUserModal";
import DeleteUserModal from "@/components/features/admin/userManagement/DeleteUserModal";
import { useGetAllUserQuery } from "@/services/userApi";
import { formatDate } from "@/utils/formatDate";
import { useNavigate } from "react-router-dom";
import SearchAndFilter from "@/components/ui/searchAndFilter/SearchAndFilter";
import PaginationUI from "@/components/ui/pagination/PaginationUI";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<
    "fullName" | "email" | "createdAt" | "updatedAt"
  >("");
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetAllUserQuery({
    page: currentPage,
    limit: 8,
    search,
    sortBy,
    sortOrder,
    status: status === "" ? undefined : status,
  });

  useEffect(() => {
    if (data?.data.user) {
      setUsers(data.data.user);
    }
  }, [data]);
  // console.log(data);

  const pagination = data?.data.pagination;
  const totalPages = pagination?.totalPages || 1;

  const formatGender = (gender: GenderUser) => {
    return gender === "male" ? "Male" : "Female";
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errMsg = error || (error as any)?.message || "Unknown error";
    return (
      <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-red-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-semibold text-red-800">Error loading data</p>
            <p className="text-sm text-red-600">{errMsg as any}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <SearchAndFilter
          searchTerm={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          sortOptions={[
            { value: "fullName", label: "Name" },
            { value: "email", label: "Email" },
            { value: "createdAt", label: "Created At" },
            { value: "updatedAt", label: "Updated At" },
          ]}
          sortByValue={sortBy}
          onSortByChange={(v) =>
            setSortBy(v as "fullName" | "email" | "createdAt" | "updatedAt")
          }
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          showClearFilters
          onClearFilters={() => {
            setSearch("");
            setStatus("");
            setSortBy("");
            setSortOrder(-1);
            setCurrentPage(1);
          }}
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
                  Full name
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[200px]">
                  Email
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[120px]">
                  Phone
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[120px]">
                  ID card
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Gender
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[120px]">
                  Birth date
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Role
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Status
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700 w-20">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <svg
                        className="w-16 h-16 mb-4 text-gray-300"
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
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, idx) => (
                  <TableRow
                    key={user._id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="text-start font-medium text-gray-600">
                      {(currentPage - 1) * 8 + idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {user.fullName}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {user.phoneNumber}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {user.identifyNumber}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatGender(user.gender)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(user.dateOfBirth)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                        {user.roleName}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.status === 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          Inactive
                        </span>
                      ) : user.status === 1 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Active
                        </span>
                      ) : user.status === 2 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          Blocked
                        </span>
                      ) : null}
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
                            onClick={() =>
                              navigate(`/admin/user-management/${user._id}`)
                            }
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Eye className="mr-2 h-4 w-4 text-blue-600" />
                            <span className="text-gray-700">View detail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(user)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Edit className="mr-2 h-4 w-4 text-green-600" />
                            <span className="text-gray-700">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(user)}
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
          {users.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-semibold">{(currentPage - 1) * 8 + 1}</span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(currentPage * 8, pagination?.total || 0)}
              </span>{" "}
              of <span className="font-semibold">{pagination?.total || 0}</span>{" "}
              users
            </>
          ) : (
            <>No users to display</>
          )}
        </div>
        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
          <PaginationUI
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handleChangePage}
          />
        </div>
      </div>

      {/* Modals */}
      <EditUserModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        user={selectedUser}
      />
      <DeleteUserModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        user={selectedUser}
      />
    </div>
  );
}
