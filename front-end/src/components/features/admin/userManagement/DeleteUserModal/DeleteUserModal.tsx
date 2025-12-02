import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { User } from "@/types/user.type";
import { useDeleteUserMutation } from "@/services/userApi";
import { toast } from "sonner";

interface DeleteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export default function DeleteUserModal({
  open,
  onOpenChange,
  user,
}: DeleteUserModalProps & { onConfirm?: () => void }) {
  const [deleteUser, { isLoading }] = useDeleteUserMutation();

  if (!user) return null;

  const handleConfirm = async () => {
    try {
      await deleteUser(user._id).unwrap();

      onOpenChange(false);
      toast.success("Delete successfully !!");
    } catch (err) {
      toast.error("Delete failed!" + err);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-0 overflow-hidden">
        <div className="px-4 sm:px-6 pt-4 pb-2 border-b bg-white">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                Delete User
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-4 sm:px-6 py-4 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Full Name:
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {user.fullName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <span className="text-sm text-gray-900">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Phone:</span>
                <span className="text-sm text-gray-900">{user.phoneNumber}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Warning:</p>
                <p className="mt-1">
                  All data associated with this user will be permanently deleted
                  from the system.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
