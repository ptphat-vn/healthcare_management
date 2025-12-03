import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type CreateUserFormData } from "@/schemas/userSchema";
import { type CreateUserRequest } from "@/types/request.type";
import { NewUserForm } from "../AddUserForm/NewUserForm";
import { useState } from "react";
import { useCreateUserMutation } from "@/services/userApi";
import { toast } from "sonner";

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddUserModal({
  open,
  onOpenChange,
}: AddUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [createUser] = useCreateUserMutation();

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setIsLoading(true);

      const requestData: CreateUserRequest = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phone,
        identifyNumber: data.identifyNumber,
        gender: data.gender as "male" | "female",
        dateOfBirth: data.dateOfBirth,
        password: data.password,
        address: data.address,
      };

      console.log("Creating new user:", requestData);

      const result = await createUser(requestData).unwrap();

      toast.success(result?.message || "Create User Successfully!!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating user:", error);
      const err = error as { data?: { message?: string } };
      toast.error(
        err.data?.message || "Tạo người dùng thất bại, vui lòng thử lại"
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
      <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 gap-0 overflow-hidden max-h-[95vh] rounded-lg">
        <DialogHeader className="px-4 sm:px-6 pt-4 pb-2 border-b bg-white shrink-0">
          <DialogTitle className="text-lg sm:text-2xl font-bold">
            Add New User
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-4 overflow-y-auto">
            {open && (
              <NewUserForm
                onSubmit={onSubmit}
                onClose={handleClose}
                isLoading={isLoading}
              />
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
