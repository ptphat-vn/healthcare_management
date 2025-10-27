import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import TestOrderForm, { type TestOrderFormData } from "./TestOrderForm";
import type { TestOrder } from "./TestOrderList";
import { useUpdateTestOrderMutation } from "@/services/testOrderApi";

interface EditTestOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: TestOrder | null;
  onSuccess?: () => void;
}

export default function EditTestOrderModal({ open, onOpenChange, order, onSuccess }: EditTestOrderModalProps) {
  const [updateTestOrder] = useUpdateTestOrderMutation();

  const handleSubmit = async (formData: TestOrderFormData) => {
    if (!order) return;
    
    try {
      await updateTestOrder({
        id: order._id,
        ...formData,
        gender: (formData.gender as "male" | "female"),
      }).unwrap();
      
      toast.success("Test order updated successfully!");
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error("Update failed: " + (err?.data?.message || "Unknown error"));
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Test Order</DialogTitle>
        </DialogHeader>
        
        <TestOrderForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          initialData={{
            patientName: order.patientName,
            dateOfBirth: order.dateOfBirth,
            gender: order.gender,
            address: order.address,
            phoneNumber: order.phoneNumber,
            email: order.email,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
