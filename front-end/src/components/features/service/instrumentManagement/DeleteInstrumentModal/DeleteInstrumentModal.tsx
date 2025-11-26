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
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete instrument");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <DialogTitle>Confirm Delete Instrument</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this instrument? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-700">
              Instrument Name:{" "}
            </span>
            <span className="text-sm text-gray-900">{instrument.name}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">
              Instrument Code:{" "}
            </span>
            <span className="text-sm text-gray-900">{instrument.code}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Model: </span>
            <span className="text-sm text-gray-900">{instrument.model}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Instrument"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
