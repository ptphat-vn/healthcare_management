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
import type { TestOrder } from "./TestOrderList";
import { useDeleteTestOrderMutation } from "@/services/testOrderApi";
import { toast } from "sonner";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: TestOrder | null;
  onSuccess?: () => void;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [deleteTestOrder, { isLoading }] = useDeleteTestOrderMutation();

  if (!order) return null;

  const handleConfirm = async () => {
    try {
      await deleteTestOrder(order._id).unwrap();
      onOpenChange(false);
      toast.success("Test order deleted successfully!");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error("Delete failed: " + (err?.data?.message || "Unknown error"));
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
              Delete Test Order
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-600 pt-2">
            Are you sure you want to delete this test order? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Patient Name:
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {order.patientName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <span className="text-sm text-gray-900">{order.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Phone:</span>
              <span className="text-sm text-gray-900">{order.phoneNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className="text-sm font-semibold text-gray-900">{order.status}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Warning:</p>
              <p className="mt-1">
                This test order and all associated data will be permanently deleted
                from the system.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Deleting..." : "Delete Test Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
