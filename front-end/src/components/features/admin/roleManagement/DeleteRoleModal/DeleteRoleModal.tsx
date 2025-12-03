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
      await deleteRole({ roleId: role._id as string }).unwrap();
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
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader className="px-1">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 wrap-break-word">
                Delete Role
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs sm:text-sm md:text-base text-gray-600 pt-2 px-1 wrap-break-word">
            Are you sure you want to delete this role? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 my-3 sm:my-4 mx-1">
          <div className="space-y-2 sm:space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                Role Name:
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 wrap-break-word text-right sm:text-left">
                {role.name}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                Role Code:
              </span>
              <span className="text-xs sm:text-sm text-gray-900 wrap-break-word text-right sm:text-left">
                {role.code}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                Privileges:
              </span>
              <span className="text-xs sm:text-sm text-gray-900 text-right sm:text-left">
                {role.privileges.length} privilege(s)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded mx-1">
          <div className="flex items-start gap-2 sm:gap-2.5">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-yellow-800 min-w-0">
              <p className="font-medium">Warning:</p>
              <p className="mt-1 wrap-break-word">
                All users assigned to this role may be affected. This role will
                be permanently removed from the system.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t mt-auto px-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="cursor-pointer text-xs sm:text-sm"
            disabled={isLoading}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 cursor-pointer text-xs sm:text-sm"
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? "Deleting..." : "Delete Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
