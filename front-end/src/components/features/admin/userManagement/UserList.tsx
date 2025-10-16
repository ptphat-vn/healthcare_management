import React, { useEffect, useState } from "react";
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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { GenderUser, RoleUser, User } from "@/types/user.type";
// import { User, GenderUser, RoleUser } from "@/types/user.type";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/**
 * Normalize MongoDB document -> User type
 */
function normalizeUser(doc: any): User {
  return {
    id: doc._id || doc.id,
    fullName: doc.fullName || "",
    email: doc.email || "",
    phoneNumber: doc.phoneNumber || "",
    identifyNumber: doc.identifyNumber || "",
    gender: (doc.gender || "male") as GenderUser,
    dateOfBirth: doc.dateOfBirth || new Date().toISOString(),
    role: (doc.role || "user") as RoleUser,
    status: typeof doc.status === "number" ? doc.status : 0,
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
  };
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users từ API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("🔍 Fetching users from:", `${API_BASE}/user/all`);

        const response = await fetch(`${API_BASE}/user/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("📥 Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("✅ Data received:", result);

        const normalized = (result.data || []).map(normalizeUser);
        setUsers(normalized);
      } catch (err: any) {
        console.error("❌ Failed to fetch users:", err);
        setError(err.message || "Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const formatGender = (gender: GenderUser) => {
    return gender === "male" ? "Nam" : "Nữ";
  };

  const formatRole = (role: RoleUser) => {
    const roleMap: Record<RoleUser, string> = {
      user: "Người dùng",
      admin: "Quản trị viên",
      manager: "Quản lý",
      consultant: "Tư vấn viên",
      service: "Dịch vụ",
    };
    return roleMap[role] || role;
  };

  const handleEdit = (user: User) => {
    // TODO: Mở modal/form edit
    console.log("Edit user:", user);
    alert(`Chức năng edit user: ${user.fullName}\nID: ${user.id}`);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Xác nhận xóa người dùng "${user.fullName}"?`)) return;

    try {
      // Note: Backend chưa có route DELETE, cần thêm vào
      console.log("Delete user:", user.id);
      alert("Chức năng xóa chưa được triển khai trên backend");

      // Khi có API DELETE:
      // const response = await fetch(`${API_BASE}/users/${user.id}`, {
      //   method: "DELETE",
      //   headers: { "Content-Type": "application/json" }
      // });
      // if (response.ok) {
      //   setUsers((prev) => prev.filter((u) => u.id !== user.id));
      // }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Xóa thất bại");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
            <p className="font-semibold text-red-800">Lỗi tải dữ liệu</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Full name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Phone number</TableHead>
              <TableHead className="font-semibold">ID card</TableHead>
              <TableHead className="font-semibold">Gender</TableHead>
              <TableHead className="font-semibold">Date of birth</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-gray-500"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.identifyNumber}</TableCell>
                  <TableCell>{formatGender(user.gender)}</TableCell>
                  <TableCell>{formatDate(user.dateOfBirth)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {formatRole(user.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                     {user.status === 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    ) : user.status === 1 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : user.status === 2 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Block
                      </span>
                    ): null}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleEdit(user)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(user)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
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

      {users.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{users.length}</span> người
          dùng
        </div>
      )}
    </div>
  );
}