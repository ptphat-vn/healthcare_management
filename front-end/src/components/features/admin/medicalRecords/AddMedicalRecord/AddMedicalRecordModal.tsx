import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateMedicalRecordMutation } from "@/services/medicalRecordApi";
import { toast } from "sonner";
import { type CreateMedicalRecordRequest } from "@/types/medicalRecord.type";
import { NewMedicalRecordForm } from "../NewMedicalRecordFrom/NewMedicalRecordForm";
import { useAuth } from "@/hooks/useAuth";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";

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
  const { user } = useAuth();

  const onSubmit = async (data: CreateMedicalRecordRequest) => {
    try {
      console.log("Submitting data:", JSON.stringify(data, null, 2));
      const result = await createMedicalRecord(data).unwrap();
      toast.success(result.message || "Medical record created successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Error creating medical record:", error);

      const errorData = error as {
        data?: { errors?: Record<string, string>; message?: string };
      };
      console.error("Error details:", errorData);

      if (errorData?.data?.errors) {
        const errorMessages = Object.entries(errorData.data.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join("\n");
        toast.error(`Validation errors:\n${errorMessages}`);
      } else {
        toast.error(
          errorData?.data?.message || "Failed to create medical record"
        );
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold">
            Add New Patient Medical Record
          </DialogTitle>
        </DialogHeader>

        {open && (
          <NewMedicalRecordForm
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
            isLoading={isLoading}
            hideButtons={true}
            formId="add-medical-record-form"
          />
        )}

        <DialogFooter className="gap-2 mt-4 sm:mt-6 flex-row sm:flex-row justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-auto sm:w-auto shadow-md hover:shadow-lg hover:bg-gray-100 hover:border-gray-400 transition-all"
          >
            Close
          </Button>
          <Button
            type="submit"
            form="add-medical-record-form"
            disabled={isLoading}
            className={`w-auto sm:w-auto ${getRoleButtonClass(
              user?.data.roleCode
            )}`}
          >
            {isLoading ? "Creating..." : "Create Medical Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
