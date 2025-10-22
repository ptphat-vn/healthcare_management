import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import TestOrderForm, { type TestOrderFormData } from "./TestOrderForm";

interface AddTestOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTestOrderModal({ open, onOpenChange }: AddTestOrderModalProps) {
  const handleSubmit = (formData: TestOrderFormData) => {
    console.log("Test order data:", formData);
    toast.success("Test order created successfully!");
    onOpenChange(false);
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

        <TestOrderForm
          onSubmit={handleSubmit}
          onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
}
