import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Instrument } from "@/types/instrument.type";
import EditInstrumentForm from "../EditInstrumentForm/EditInstrumentForm";
import type { UpdateInstrumentFormData } from "@/schemas/instrumentSchema";
import { useUpdateInstrumentMutation } from "@/services/instrumentApi";

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
  const [updateInstrument, { isLoading }] = useUpdateInstrumentMutation();

  const handleUpdate = async (formData: UpdateInstrumentFormData) => {
    try {
      const result = await updateInstrument({
        id: instrument._id,
        ...formData,
      }).unwrap();

      onUpdate(result.data as Instrument);
      toast.success("Instrument updated successfully!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update instrument");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Instrument</DialogTitle>
          <DialogDescription>
            Update information for instrument <b>{instrument.name}</b>
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
            status: instrument.status || "Active",
            categories: instrument.categories || [],
          }}
          onSubmit={handleUpdate}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
