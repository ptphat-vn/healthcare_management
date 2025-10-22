import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewMedicalRecordForm } from "./NewMedicalRecordForm";
import { useState } from "react";

interface AddMedicalRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddMedicalRecordModal({
  open,
  onOpenChange,
  onSuccess,
}: AddMedicalRecordModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: unknown) => {
    try {
      setIsLoading(true);
      console.log("Creating medical record:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating medical record:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Patient Medical Record</DialogTitle>
        </DialogHeader>

        {open && (
          <NewMedicalRecordForm
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
