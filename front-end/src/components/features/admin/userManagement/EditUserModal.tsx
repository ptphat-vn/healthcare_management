import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type CreateUserFormData } from "@/schemas/userSchema";
import { type UpdateUserRequest } from "@/types/request.type";
import { useState } from "react";
import { useUpdateUserMutation } from "@/services/userApi";
import { toast } from "sonner";
import { type User } from "@/types/user.type";

import { EditUserForm } from "@/components/features/admin/userManagement/EditUserForm";

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

type EditFormData = CreateUserFormData & { roleId?: string; status?: number };

export default function EditUserModal({
  open,
  onOpenChange,
  user,
}: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [updateUser] = useUpdateUserMutation();

  const onSubmit = async (data: EditFormData) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const requestData: UpdateUserRequest = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phone,
        identifyNumber: data.identifyNumber,
        gender: data.gender?.toLowerCase() as "male" | "female",
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        // Chỉ thêm roleId nếu nó không phải là chuỗi rỗng
        ...(data.roleId && data.roleId.trim() ? { roleId: data.roleId } : {}),
        status: data.status,
      };

      console.log("Updating user:", requestData);

      const result = await updateUser({
        id: user._id,
        ...requestData,
      }).unwrap();

      toast.success(result?.message || "Cập nhật người dùng thành công");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user:", error);
      const err = error as { data?: { message?: string } };
      toast.error(
        err.data?.message || "Cập nhật người dùng thất bại, vui lòng thử lại"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit User</DialogTitle>
        </DialogHeader>

        {open && user && (
          <EditUserForm
            onSubmit={onSubmit}
            onClose={handleClose}
            isLoading={isLoading}
            defaultValues={user}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

