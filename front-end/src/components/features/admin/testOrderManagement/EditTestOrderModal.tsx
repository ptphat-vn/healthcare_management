import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import TestOrderForm, { type TestOrderFormData } from "./TestOrderForm";
import type { TestOrder } from "./TestOrderList";

interface EditTestOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: TestOrder | null;
}

export default function EditTestOrderModal({ open, onOpenChange, order }: EditTestOrderModalProps) {
  const handleSubmit = (formData: TestOrderFormData) => {
    console.log("Updated test order data:", formData);
    toast.success("Test order updated successfully!");
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Test Order - {order.id}</DialogTitle>
        </DialogHeader>
        
        <TestOrderForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          initialData={{
            patientName: order.patientName,
            patientDob: order.patientDob,
            age: order.age.toString(),
            gender: order.gender,
            testType: order.testType,
            priority: order.priority,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
