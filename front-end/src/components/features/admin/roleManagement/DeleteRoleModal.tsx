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
import type { Roles } from "@/types/roles.type";
import { useDeleteRoleMutation } from "@/services/roleApi";
import { toast } from "sonner";

interface DeleteRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Roles | null;
}

export default function DeleteRoleModal({
  open,
  onOpenChange,
  role,
}: DeleteRoleModalProps) {
  const [deleteRole, { isLoading }] = useDeleteRoleMutation();

  if (!role) return null;

  const handleConfirm = async () => {
    try {
      await deleteRole(role._id as any).unwrap();
      onOpenChange(false);
      toast.success("Role deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete role: " + err);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Delete Role
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-600 pt-2">
            Are you sure you want to delete this role? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Role Name:
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {role.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Role Code:
              </span>
              <span className="text-sm text-gray-900">{role.code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Privileges:
              </span>
              <span className="text-sm text-gray-900">
                {role.privileges.length} privilege(s)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Warning:</p>
              <p className="mt-1">
                All users assigned to this role may be affected. This role will
                be permanently removed from the system.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 sm:flex-none cursor-pointer"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
