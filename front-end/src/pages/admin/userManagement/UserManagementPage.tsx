import { useState } from "react";
import UserList from "@/components/features/admin/userManagement/UserList";
import AddUserModal from "@/components/features/admin/userManagement/AddUserModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function UserManagementPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-[20px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage all users in your system. Add, edit, block, or delete users.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 btn-primary"
          >
            <Plus size={18} />
            <span>Add New User</span>
          </Button>
          <AddUserModal
            open={isAddUserModalOpen}
            onOpenChange={setIsAddUserModalOpen}
          />
        </div>
      </div>

      {/* Danh sách User */}
      <UserList />
    </div>
  );
}
