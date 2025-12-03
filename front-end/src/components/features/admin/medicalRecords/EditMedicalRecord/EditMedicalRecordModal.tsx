import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  type MedicalRecord,
  type UpdateMedicalRecordRequest,
} from "@/types/medicalRecord.type";
import { EditMedicalRecordForm } from "./EditMedicalRecordForm";
import { useUpdateMedicalRecordMutation } from "@/services/medicalRecordApi";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";

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
  onSuccess,
}: EditMedicalRecordModalProps) {
  const [updateMedicalRecord, { isLoading }] = useUpdateMedicalRecordMutation();
  const { user } = useAuth();

  const onSubmit = async (data: UpdateMedicalRecordRequest) => {
    if (!medicalRecord) return;

    try {
      const result = await updateMedicalRecord(data).unwrap();
      toast.success(result.message || "Medical record updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Error updating medical record:", error);

      const errorData = error as {
        data?: { errors?: Record<string, string>; message?: string };
      };
      if (errorData?.data?.errors) {
        const errorMessages = Object.values(errorData.data.errors).join("\n");
        toast.error(`Validation errors:\n${errorMessages}`);
      } else {
        toast.error(
          errorData?.data?.message || "Failed to update medical record"
        );
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold">
            Edit Patient Medical Record
          </DialogTitle>
        </DialogHeader>

        {open && medicalRecord && (
          <EditMedicalRecordForm
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
            isLoading={isLoading}
            defaultValues={medicalRecord}
            hideButtons={true}
            formId="edit-medical-record-form"
          />
        )}

        <DialogFooter className="gap-2 mt-4 sm:mt-6 flex-row sm:flex-row justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-auto sm:w-auto shadow-md hover:shadow-lg hover:bg-gray-100 hover:border-gray-400 transition-all"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-medical-record-form"
            disabled={isLoading}
            className={`w-auto sm:w-auto ${getRoleButtonClass(
              user?.data.roleCode
            )}`}
          >
            {isLoading ? "Updating..." : "Update Medical Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
