import { useState } from "react";
import UserList from "@/components/features/admin/userManagement/UserList";
import AddUserModal from "@/components/features/admin/userManagement/AddUserModal";
import { Button } from "@/components/ui/button";

export default function UserManagementPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">User Management</h1>
      
      {/* Nút tạo User */}
      <Button
        onClick={() => setIsAddUserModalOpen(true)}
        className="mb-4"
      >
        Add new patient
      </Button>
      {/* Modal tạo user */}
      <AddUserModal 
        open={isAddUserModalOpen} 
        onOpenChange={setIsAddUserModalOpen} 
      />

      {/* Danh sách User */}
      <UserList />
      
      
      
    </div>
  );
}
