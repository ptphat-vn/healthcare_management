import { useState } from "react";
import UserList from "@/components/features/admin/userManagement/UserList";
import AddUserModal from "@/components/features/admin/userManagement/AddUserModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function UserManagementPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">User Management</h1>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center"
          >
            <Plus size={15} />
            <span className="ml-2">Add New User</span>
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
