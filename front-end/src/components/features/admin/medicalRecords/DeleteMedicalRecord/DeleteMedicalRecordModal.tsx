import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { MedicalRecord } from "@/types/medicalRecord.type";

interface DeleteMedicalRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicalRecord: MedicalRecord | null;
  onConfirm: () => void;
}

export default function DeleteMedicalRecordModal({
  open,
  onOpenChange,
  medicalRecord,
  onConfirm,
}: DeleteMedicalRecordModalProps) {
  if (!medicalRecord) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Delete Medical Record
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-600 pt-2">
            Are you sure you want to delete this medical record? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Patient:</span>
              <span className="text-sm font-semibold text-gray-900">{medicalRecord.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Patient ID:</span>
              <span className="text-sm text-gray-900">{medicalRecord.patientId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Gender:</span>
              <span className="text-sm text-gray-900 capitalize">{medicalRecord.gender}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Warning:</p>
              <p className="mt-1">
                All data associated with this medical record will be permanently deleted
                from the system.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-6">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Delete Medical Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
