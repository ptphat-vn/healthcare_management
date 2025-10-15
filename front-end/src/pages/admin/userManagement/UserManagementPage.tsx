import React from "react";
import UserList from "@/components/features/admin/userManagement/UserList";
import { Button } from "@/components/ui/button";

export default function UserManagementPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">User Management</h1>
      <Button
      onClick={() => (window.location.href = "/")}>
      Add new patient
     </Button>

    

      <UserList />
    </div>
  );
}
