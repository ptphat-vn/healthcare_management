import AddRoleModal from "@/components/features/admin/roleManagement/AddRoleModal/AddRoleModal";
import RoleList from "@/components/features/admin/roleManagement/RoleList/roleList";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function RoleManagementPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-[20px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles Management</h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage all roles in your system
          </p>
        </div>
        <div className="flex items-center gap-3 mr-4">
          <Button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 btn-primary"
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
