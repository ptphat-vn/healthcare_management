import { useState } from "react";
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
import { MoreHorizontal, Edit, Trash2, UserMinus } from "lucide-react";
import EditUserModal from "./EditUserModal";
import { type User } from "@/types/user.type";

const initialUsers: User[] = [
  {
    id: "1",
    fullName: "Nguyễn Văn A",
    dateOfBirth: "1990-05-12",
    gender: "male",
    phoneNumber: "0909123456",
    email: "a.nguyen@example.com",
    identifyNumber: "123456789",
    role: "user",
    status: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    fullName: "Trần Thị B",
    dateOfBirth: "1995-11-02",
    gender: "female",
    phoneNumber: "0912345678",
    email: "b.tran@example.com",
    identifyNumber: "987654321",
    role: "user",
    status: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export default function UserList() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEdit = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setSelectedUser(user);
      setEditModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Xác nhận xóa người dùng này?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleBan = (id: string) => {
    if (!confirm("Xác nhận khóa (ban) người dùng này?")) return;
    // ví dụ: gắn flag banned (ở đây giả lập bằng xóa)
    console.log("Ban user", id);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="w-full overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full name</TableHead>
            <TableHead>Date of birth</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{formatDate(user.dateOfBirth)}</TableCell>
              <TableCell>{user.gender === "male" ? "Male" : "Female"}</TableCell>
              <TableCell>{user.phoneNumber}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="More">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(user.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBan(user.id)}>
                      <UserMinus className="mr-2 h-4 w-4" /> Ban
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <EditUserModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        user={selectedUser}
      />
    </div>
  );
}