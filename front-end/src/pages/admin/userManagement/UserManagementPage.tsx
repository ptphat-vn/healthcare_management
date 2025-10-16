import { useState } from "react";
import UserList from "@/components/features/admin/userManagement/UserList";
import AddUserModal from "@/components/features/admin/userManagement/AddUserModal";
import { Button } from "@/components/ui/button";

export default function UserManagementPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold flex items-center justify-between mb-6">User Management</h1>

      <div className="flex items-center justify-end mb-6">
        <Button
          onClick={() => setIsAddUserModalOpen(true)}
          className="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-icon lucide-plus">
            <path d="M5 12h14" /><path d="M12 5v14" />
          </svg>
          Add new patient
        </Button>
        {/* Modal tạo user */}
        <AddUserModal
          open={isAddUserModalOpen}
          onOpenChange={setIsAddUserModalOpen}
        />
      </div>

      {/* Danh sách User */}
      <UserList />



    </div >
  );
}
