import AddRoleModal from "@/components/features/admin/roleManagement/AddRoleModal";
import RoleList from "@/components/features/admin/roleManagement/roleList";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function RoleManagementPage() {
  const [isOpen, setIsOpen] = useState(false);
  console.log(isOpen);
  const { user } = useAuth();

  return (
    <div className="p-6 bg-white min-h-screen rounded-[20px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Roles Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Manage all roles in your system
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setIsOpen(true)}
            className={getRoleButtonClass(user?.data.roleCode)}
          >
            <Plus size={18} />
            <span>Add New Role</span>
          </Button>
          <AddRoleModal open={isOpen} onOpenChange={setIsOpen} />
        </div>
      </div>
      <RoleList />
    </div>
  );
}
