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
import { MoreHorizontal, Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import type { GenderUser, User } from "@/types/user.type";
import EditUserModal from "@/components/features/admin/userManagement/EditUser/EditUserModal/EditUserModal";
import DeleteUserModal from "@/components/features/admin/userManagement/DeleteUserModal";
import { useGetAllUserQuery } from "@/services/userApi";
import { formatDate } from "@/utils/formatDate";
import { useNavigate } from "react-router-dom";
import SearchAndFilter from "@/components/ui/searchAndFilter/SearchAndFilter";
import PaginationUI from "@/components/ui/pagination/PaginationUI";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth();
  const roles = user?.data.roleCode;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<number | "">(1); // Mặc định Active
  const [sortBy, setSortBy] = useState<
    "fullName" | "email" | "createdAt" | "updatedAt" | undefined
  >();
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

  if (error) {
    const errMsg = (error as any)?.message || error || "Unknown error";
    return (
      <Alert variant="destructive" className="my-8">
        <AlertTitle>Error loading users</AlertTitle>
        <AlertDescription>{errMsg}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-4">
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
            setStatus(1); // Reset về Active
            setSortBy(undefined);
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
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <AlertCircle size={16} />
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
                              navigate(`/${roles}/user-management/${user._id}`)
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
