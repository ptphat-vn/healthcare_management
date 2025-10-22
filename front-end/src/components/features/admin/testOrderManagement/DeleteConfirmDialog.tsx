import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import type { TestOrder } from "./TestOrderList";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: TestOrder | null;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
}: DeleteConfirmDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Delete Test Order</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="py-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this test order?
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Order ID:</span>
              <span className="font-semibold">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Patient:</span>
              <span className="font-semibold">{order.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Test Type:</span>
              <span className="font-semibold">{order.testType}</span>
            </div>
          </div>
          <p className="text-red-600 text-sm mt-4 font-medium">
            ⚠️ This action cannot be undone.
          </p>
        </DialogDescription>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
