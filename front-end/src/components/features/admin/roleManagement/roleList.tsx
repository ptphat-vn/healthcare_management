import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PaginationUI from "@/components/ui/pagination/PaginationUI";
import SearchAndFilter from "@/components/ui/searchAndFilter/SearchAndFilter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAllRoleQuery } from "@/services/roleApi";
import type { Roles } from "@/types/roles.type";
import formatPrivilege from "@/utils/formatPrivilege";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import DeleteRoleModal from "./DeleteRoleModal";
import AddRoleModal from "./AddRoleModal";

export default function RoleList() {
  const [roleList, setRoleList] = useState<Roles[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "code" | "createAt">("");
  const [sortOrder, setSortOrder] = useState<1 | -1 | undefined>(-1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Roles | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<Roles | null>(null);
  const { data, isLoading, error } = useGetAllRoleQuery({
    search,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: 8,
  });
  useEffect(() => {
    if (data?.data.role) {
      setRoleList(data.data.role);
    }
  }, [data]);
  const pagination = data?.data.pagination;
  const totalPages = pagination?.totalPages || 1;

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteRole = (role: Roles) => {
    setSelectedRole(role);
    setDeleteModalOpen(true);
  };
  const handleEditRole = (role: Roles) => {
    setEditRole(role);
    setAddModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Roles...</p>
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
    <div className="w-full space-x-4">
      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-4 border-gray-200">
        <SearchAndFilter
          searchTerm={search}
          onSearchChange={setSearch}
          sortOptions={[
            { value: "name", label: "Role Name" },
            { value: "code", label: "Role Code" },
            { value: "createdAt", label: "Created At" },
          ]}
          sortByValue={sortBy}
          sortOrder={sortOrder}
          onSortByChange={(v) => setSortBy(v as "name" | "code" | "createAt")}
          onSortOrderChange={(v) =>
            setSortOrder(v === "" ? -1 : (Number(v) as 1 | -1))
          }
          showClearFilters
          onClearFilters={() => {
            setSearch("");
            setSortBy("");
            setSortOrder(-1);
            setCurrentPage(1);
          }}
        />
      </div>
      {/* table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                <TableHead className="font-semibold text-gray-700 w-16">
                  No
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[50px]">
                  Role Name
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[100px]">
                  Role Code
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[300px]">
                  Privileges
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[300px]">
                  Description
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700 w-20">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleList.length === 0 ? (
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
                      <p className="text-lg font-medium">No roles found</p>
                      <p className="text-sm">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                roleList.map((role, index) => (
                  <TableRow
                    key={role._id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="text-start font-medium text-gray-600">
                      {(currentPage - 1) * 8 + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {role.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatPrivilege(role.code)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <div className="flex flex-wrap gap-1 items-center">
                        {role.privileges.slice(0, 2).map((p, i) => (
                          <Badge key={i} variant="secondary">
                            {formatPrivilege(p)}
                          </Badge>
                        ))}
                        {role.privileges.length > 3 && (
                          <span className="ml-2 text-xs text-gray-500 cursor-pointer">
                            +{role.privileges.length - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-black">
                      {role.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-100 transition-colors cursor-pointer"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="h-4 w-4 " />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => handleEditRole(role)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Edit className="mr-2 h-4 w-4 text-green-600" />
                            <span className="text-gray-700">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteRole(role)}
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
      <div className="mt-4 mr-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
          {roleList.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-semibold">{(currentPage - 1) * 8 + 1}</span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(currentPage * 8, pagination?.total || 0)}
              </span>{" "}
              of <span className="font-semibold">{pagination?.total || 0}</span>{" "}
              roles
            </>
          ) : (
            <>No roles to display</>
          )}
        </div>
        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
          {totalPages > 1 && (
            <PaginationUI
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handleChangePage}
            />
          )}
        </div>
      </div>
      <DeleteRoleModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        role={selectedRole}
      />

      <AddRoleModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        role={editRole}
      />
    </div>
  );
}
