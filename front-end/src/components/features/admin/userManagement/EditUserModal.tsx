import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type CreateUserFormData } from "@/schemas/userSchema";
import { type UpdateUserRequest } from "@/types/request.type";
import { useState } from "react";
import { useUpdateUserMutation } from "@/services/baseApi";
import { toast } from "sonner";
import { type User } from "@/types/user.type";

// Import EditUserForm dynamically to avoid TS issues
import { EditUserForm } from "@/components/features/admin/userManagement/EditUserForm";

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export default function EditUserModal({ open, onOpenChange, user }: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [updateUser] = useUpdateUserMutation();

  const onSubmit = async (data: CreateUserFormData) => {
    if (!user) return;
    
    try {
      setIsLoading(true);

      // Chuyển đổi dữ liệu từ form sang format API
      const requestData: UpdateUserRequest = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phone,
        identifyNumber: data.identifyNumber,
        gender: data.gender?.toLowerCase() as "male" | "female",
        dateOfBirth: data.dateOfBirth,
        address: data.address,
      };

      console.log("Updating user:", requestData);

      const result = await updateUser({ id: user.id, ...requestData }).unwrap();
      
      toast.success(result?.message || "Cập nhật người dùng thành công");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user:", error);
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Cập nhật người dùng thất bại, vui lòng thử lại");
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