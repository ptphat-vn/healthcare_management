import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDeleteReagentMutation } from "@/services/reagentApi";
import { Loader2, AlertTriangle } from "lucide-react";
import type { Reagent } from "@/types/reagent.type";

interface DeleteReagentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reagent: Reagent | null;
  onSuccess?: () => void;
}

export default function DeleteReagentModal({
  open,
  onOpenChange,
  reagent,
  onSuccess,
}: DeleteReagentModalProps) {
  const [deleteReagent, { isLoading }] = useDeleteReagentMutation();

  const handleDelete = async () => {
    if (!reagent) return;

    try {
      await deleteReagent(reagent._id).unwrap();
      toast.success("Reagent deleted successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Unable to delete reagent");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-sm p-0 gap-0 mx-auto rounded-lg">
        <DialogHeader className="px-3 sm:px-5 pt-3 sm:pt-4 pb-2 sm:pb-3 border-b shrink-0 rounded-t-lg">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg lg:text-xl">
                Delete Reagent
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-3 sm:px-5 py-3 sm:py-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              You are about to delete:
            </p>
            <div className="space-y-1">
              <p className="font-semibold text-sm sm:text-base text-gray-900">
                {reagent?.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Catalog: {reagent?.catalogNumber} | Manufacturer:{" "}
                {reagent?.manufacturer}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-3 sm:px-5 py-2.5 sm:py-3 border-t flex flex-col sm:flex-row sm:justify-end gap-2 shrink-0 rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
