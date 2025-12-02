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
      <DialogContent className="w-full max-w-sm px-4 sm:px-5 py-4">
        <DialogHeader className="px-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Delete Reagent</DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-2">
          <p className="text-sm text-gray-600 mb-2">
            You are about to delete:
          </p>
          <div className="space-y-1">
            <p className="font-semibold text-gray-900">{reagent?.name}</p>
            <p className="text-sm text-gray-600">
              Catalog: {reagent?.catalogNumber} | Manufacturer:{" "}
              {reagent?.manufacturer}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 flex flex-col sm:flex-row sm:justify-end pt-4">
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