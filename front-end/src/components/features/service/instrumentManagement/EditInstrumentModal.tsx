import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Instrument } from "@/types/instrument.type";
import EditInstrumentForm from "./EditInstrumentForm";
import type { UpdateInstrumentFormData } from "@/schemas/instrumentSchema";

interface EditInstrumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instrument: Instrument;
  onUpdate: (instrument: Instrument) => void;
}

export default function EditInstrumentModal({
  open,
  onOpenChange,
  instrument,
  onUpdate,
}: EditInstrumentModalProps) {
  const handleUpdate = (formData: UpdateInstrumentFormData) => {
    // Merge the form data with the existing instrument data
    const updatedInstrument: Instrument = {
      ...instrument,
      ...formData,
    };
    onUpdate(updatedInstrument);
    toast.success("Cập nhật thiết bị thành công!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thiết bị</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin thiết bị {instrument.name}
          </DialogDescription>
        </DialogHeader>

        <EditInstrumentForm
          defaultValues={{
            name: instrument.name,
            model: instrument.model || "",
            manufacturer: instrument.manufacturer || "",
            serialNumber: instrument.serialNumber || "",
            location: instrument.location || "",
            description: instrument.description || "",
            status: instrument.status || "Active"
          }}
          onSubmit={handleUpdate}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
