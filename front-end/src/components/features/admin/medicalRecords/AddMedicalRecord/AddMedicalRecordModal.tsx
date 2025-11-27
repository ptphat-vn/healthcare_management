import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateMedicalRecordMutation } from "@/services/medicalRecordApi";
import { toast } from "sonner";
import { type CreateMedicalRecordRequest } from "@/types/medicalRecord.type";
import { NewMedicalRecordForm } from "../NewMedicalRecordFrom/NewMedicalRecordForm";

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
      console.log("Submitting data:", JSON.stringify(data, null, 2)); // Debug log
      const result = await createMedicalRecord(data).unwrap();
      toast.success(result.message || "Medical record created successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Error creating medical record:", error);
      
      // Handle validation errors from backend
      const errorData = error as { data?: { errors?: Record<string, string>; message?: string } };
      console.error("Error details:", errorData); // Debug log
      
      if (errorData?.data?.errors) {
        const errorMessages = Object.entries(errorData.data.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
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
