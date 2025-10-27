import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewMedicalRecordForm } from "./NewMedicalRecordForm";
import { useCreateMedicalRecordMutation } from "@/services/medicalRecordApi";
import { toast } from "sonner";
import { type CreateMedicalRecordRequest } from "@/types/medicalRecord.type";

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
  const [createMedicalRecord, { isLoading }] = useCreateMedicalRecordMutation();

  const onSubmit = async (data: CreateMedicalRecordRequest) => {
    try {
      const result = await createMedicalRecord(data).unwrap();
      toast.success(result.message || "Medical record created successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Error creating medical record:", error);
      
      // Handle validation errors from backend
      const errorData = error as { data?: { errors?: Record<string, string>; message?: string } };
      if (errorData?.data?.errors) {
        const errorMessages = Object.values(errorData.data.errors).join('\n');
        toast.error(`Validation errors:\n${errorMessages}`);
      } else {
        toast.error(errorData?.data?.message || "Failed to create medical record");
      }
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
