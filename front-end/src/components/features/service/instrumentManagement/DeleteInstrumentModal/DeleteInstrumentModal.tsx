import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Instrument } from "@/types/instrument.type";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { useDeleteInstrumentMutation } from "@/services/instrumentApi";

interface DeleteInstrumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instrument: Instrument;
  onDelete: (id: string) => void;
}

export default function DeleteInstrumentModal({
  open,
  onOpenChange,
  instrument,
  onDelete,
}: DeleteInstrumentModalProps) {
  const [deleteInstrument, { isLoading }] = useDeleteInstrumentMutation();

  const handleDelete = async () => {
    try {
      await deleteInstrument(instrument._id).unwrap();
      toast.success(`Instrument "${instrument.name}" has been deleted`);
      onDelete(instrument._id);
      onOpenChange(false);
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Failed to delete instrument");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <div className="flex items-start gap-2.5 sm:items-center">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-0.5 sm:mt-0" />
            <DialogTitle className="text-base sm:text-lg">
              Confirm Delete Instrument
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm">
            Are you sure you want to delete this instrument? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2">
          <div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Instrument Name:{" "}
            </span>
            <span className="text-xs sm:text-sm text-gray-900 wrap-break-word">
              {instrument.name}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">
              Serial Number:{" "}
            </span>
            <span className="text-sm text-gray-900">
              {instrument.serialNumber}
            </span>
          </div>
          <div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Model:{" "}
            </span>
            <span className="text-xs sm:text-sm text-gray-900 wrap-break-word">
              {instrument.model}
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Deleting..." : "Delete Instrument"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
