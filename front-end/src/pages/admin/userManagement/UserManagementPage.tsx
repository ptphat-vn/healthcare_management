import { useState } from "react";
import UserList from "@/components/features/admin/userManagement/UserList";
import AddUserModal from "@/components/features/admin/userManagement/AddNewUser/AddUserModal/AddUserModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";

export default function UserManagementPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const { user } = useAuth();
  console.log(user);

  return (
    <div className="p-4 sm:p-6 lg:p-4 bg-white min-h-screen rounded-[20px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Manage all users in your system.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setIsAddUserModalOpen(true)}
            className={getRoleButtonClass(user?.data.roleCode)}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Add New User</span>
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
