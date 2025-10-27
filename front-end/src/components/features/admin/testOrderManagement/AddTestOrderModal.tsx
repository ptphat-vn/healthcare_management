import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import TestOrderForm, { type TestOrderFormData } from "./TestOrderForm";
import { useCreateTestOrderMutation } from "@/services/testOrderApi";

interface AddTestOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddTestOrderModal({ open, onOpenChange, onSuccess }: AddTestOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createTestOrder, { isLoading }] = useCreateTestOrderMutation();

  const handleSubmit = async (formData: TestOrderFormData) => {
    try {
      setIsSubmitting(true);
      const response = await createTestOrder(formData).unwrap();
      
      toast.success("Test order created successfully!");
      console.log("Created test order:", response);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating test order:", error);
      const errorMsg = error?.data?.message || error?.message || "Failed to create test order";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Test Order</DialogTitle>
        </DialogHeader>

        {isSubmitting || isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Creating test order...</p>
          </div>
        ) : (
          <TestOrderForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
