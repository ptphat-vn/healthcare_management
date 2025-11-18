import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateTestOrderMutation } from "@/services/testOrderApi";
import type {
  CreateTestOrderRequest,
  RequestedTestName,
} from "@/types/request.type";
import { toast } from "sonner";
import { TestOrderAddForm } from "./TestOrderAddForm";

interface AddTestOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
export default function AddTestOrderModal({
  open,
  onOpenChange,
  onSuccess,
}: AddTestOrderModalProps) {
  const [createTestOrder, { isLoading }] = useCreateTestOrderMutation();

  const handleSubmit = async (
    medicalRecordId: string,
    requestedTests: RequestedTestName[]
  ) => {
    if (!medicalRecordId) {
      toast.error("Please select a medical record");
      return;
    }
    if (requestedTests.length === 0) {
      toast.error("Please select at least one test");
      return;
    }
    try {
      const requestData: CreateTestOrderRequest = {
        medicalRecordId,
        requestedTests,
      };
      const result = await createTestOrder(requestData).unwrap();
      toast.success(result.message || "Create Test Order Successfully!!");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating test order:", error);
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Error to create Test order");
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Add New Test Order
          </DialogTitle>
        </DialogHeader>
        <TestOrderAddForm
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
