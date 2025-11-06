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
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to delete reagent");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
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
          <p className="text-sm text-gray-600 mb-2">You are about to delete:</p>
          <div className="space-y-1">
            <p className="font-semibold text-gray-900">{reagent?.name}</p>
            <p className="text-sm text-gray-600">
              Catalog: {reagent?.catalogNumber} | Manufacturer: {reagent?.manufacturer}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
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