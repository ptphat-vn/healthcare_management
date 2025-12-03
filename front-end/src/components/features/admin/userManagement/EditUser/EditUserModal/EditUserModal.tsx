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

import { EditUserForm } from "@/components/features/admin/userManagement/EditUser/EditUserForm/EditUserForm";

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
      <DialogContent className="max-w-[96vw] sm:max-w-3xl p-0 overflow-hidden">
        <div className="flex flex-col max-h-[90vh]">
          <DialogHeader className="px-4 sm:px-6 pt-4 pb-2 border-b bg-white sticky top-0 z-10">
            <DialogTitle className="text-lg sm:text-2xl font-bold">
              Edit User
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 sm:px-6 pb-4 overflow-y-auto flex-1">
            {open && user && (
              <EditUserForm
                onSubmit={onSubmit}
                onClose={handleClose}
                isLoading={isLoading}
                defaultValues={user}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

