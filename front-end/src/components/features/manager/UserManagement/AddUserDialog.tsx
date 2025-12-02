import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewUserForm } from "../../admin/userManagement/AddNewUser/AddUserForm/NewUserForm";
import { useState } from "react";
import { useCreateUserMutation } from "@/services/userApi";
import type { CreateUserFormData } from "@/schemas/userSchema";
import { toast } from "sonner";
import type { CreateUserRequest } from "@/types/request.type";

interface AddUserDialog {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddUserDialog({ open, onOpenChange }: AddUserDialog) {
  const [isLoading, setIsLoading] = useState(false);
  const [createUser] = useCreateUserMutation();

  const onSubmit = async (dataUser: CreateUserFormData) => {
    try {
      setIsLoading(false);

      const requestData: CreateUserRequest = {
        fullName: dataUser.fullName,
        email: dataUser.email,
        phoneNumber: dataUser.phone,
        identifyNumber: dataUser.identifyNumber,
        gender: dataUser.gender?.toLowerCase() as "male" | "female",
        dateOfBirth: dataUser.dateOfBirth,
        password: dataUser.password,
        address: dataUser.address,
      };
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
      <DialogContent className="max-w-[96vw] sm:max-w-3xl p-0 overflow-hidden">
        <div className="flex flex-col max-h-[90vh]">
          <DialogHeader className="px-4 sm:px-6 pt-4 pb-2 border-b bg-white sticky top-0 z-10">
            <DialogTitle className="text-lg sm:text-2xl font-bold">
              Add New User
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 sm:px-6 pb-4 overflow-y-auto flex-1">
            {open && (
              <NewUserForm
                onSubmit={onSubmit}
                onClose={handleClose}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
