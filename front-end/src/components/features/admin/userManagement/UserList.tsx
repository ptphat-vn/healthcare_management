import React, { useState } from "react";
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

type User = {
  id: string;
  fullName: string;
  dateOfBirth: string; // ISO date
  sex: "Male" | "Female" | "Other";
  phone: string;
  email: string;
};

const initialUsers: User[] = [
  {
    id: "1",
    fullName: "Nguyễn Văn A",
    dateOfBirth: "1990-05-12",
    sex: "Male",
    phone: "0909123456",
    email: "a.nguyen@example.com",
  },
  {
    id: "2",
    fullName: "Trần Thị B",
    dateOfBirth: "1995-11-02",
    sex: "Female",
    phone: "0912345678",
    email: "b.tran@example.com",
  },
];

export default function UserList() {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const handleEdit = (id: string) => {
    // mở modal hoặc chuyển route để edit
    console.log("Edit user", id);
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
              <TableCell>{user.sex}</TableCell>
              <TableCell>{user.phone}</TableCell>
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
    </div>
  );
}