import UserList from "@/components/features/admin/userManagement/UserList";
import AddUserDialog from "@/components/features/manager/UserManagement/AddUserDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";
import { Plus } from "lucide-react";
import React, { useState } from "react";

export default function UserManagementPage() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-[20px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage all users in your system.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddUserOpen(true)}
            className={getRoleButtonClass(user?.data.roleCode)}
          >
            <Plus size={18} />
            <span>Add New User</span>
          </Button>
          <AddUserDialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen} />
        </div>
      </div>
      <UserList />
    </div>
  );
}
