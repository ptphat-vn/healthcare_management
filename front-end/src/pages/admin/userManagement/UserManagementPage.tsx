import React from "react";
import UserList from "@/components/features/admin/userManagement/UserList";
import { Button } from "@/components/ui/button";

export default function UserManagementPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold flex items-center justify-between mb-6">User Management</h1>

      <div className="flex items-center justify-end mb-6">
        <Button onClick={() => (window.location.href = "/")}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus">
          <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          Add new patient
        </Button>
      </div>

      <UserList />
    </div>
  );
}
