import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { type MedicalRecord } from "@/types/medicalRecord.type";
import { EditMedicalRecordForm } from "./EditMedicalRecordForm";

interface EditMedicalRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicalRecord: MedicalRecord | null;
  onSuccess?: () => void;
}

export default function EditMedicalRecordModal({ 
  open, 
  onOpenChange, 
  medicalRecord,
  onSuccess 
}: EditMedicalRecordModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    if (!medicalRecord) return;
    
    try {
      setIsLoading(true);
      console.log("Updating medical record:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating medical record:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Patient Medical Record</DialogTitle>
        </DialogHeader>

        {open && medicalRecord && (
          <EditMedicalRecordForm
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
            isLoading={isLoading}
            defaultValues={medicalRecord}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
