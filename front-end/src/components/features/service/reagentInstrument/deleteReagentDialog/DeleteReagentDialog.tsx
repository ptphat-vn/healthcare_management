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

interface DeleteReagentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reagentName: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteReagentDialog({
  open,
  onOpenChange,
  reagentName,
  onConfirm,
  isDeleting = false,
}: DeleteReagentDialogProps) {
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
                Delete Reagent from Instrument
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">"{reagentName}"</span>{" "}
              from this instrument?
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-4 sm:px-6 py-4 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Warning:</p>
                <p className="mt-1">
                  This action will unassign the reagent from the instrument. This cannot be undone.
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
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Reagent"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
