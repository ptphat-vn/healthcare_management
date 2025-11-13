import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type CreateInstrumentFormData } from "@/schemas/instrumentSchema";
import { type CreateInstrumentRequest } from "@/types/instrument.type";
import { NewInstrumentForm } from "./NewInstrumentForm";
import { useState } from "react";
import { useCreateInstrumentMutation } from "@/services/instrumentApi";
import { toast } from "sonner";

interface AddInstrumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddInstrumentModal({
  open,
  onOpenChange,
}: AddInstrumentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [createInstrument] = useCreateInstrumentMutation();

  const onSubmit = async (data: CreateInstrumentFormData) => {
    try {
      setIsLoading(true);

      const requestData: CreateInstrumentRequest = {
        name: data.name,
        model: data.model,
        manufacturer: data.manufacturer,
        serialNumber: data.serialNumber,
        location: data.location,
        description: data.description,
        status: data.status,
        categories: data.categories,
      };

      console.log("Creating new instrument:", requestData);

      const result = await createInstrument(requestData).unwrap();

      toast.success(result?.message || "Create Instrument Successfully!!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating instrument:", error);
      const err = error as { data?: { message?: string } };
      toast.error(
        err.data?.message || "Failed to create instrument, please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Instrument</DialogTitle>
        </DialogHeader>

        {open && (
          <NewInstrumentForm
            onSubmit={onSubmit}
            onClose={handleClose}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
