import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Instrument } from "@/types/instrument.type";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteInstrumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instrument: Instrument;
  onDelete: (id: string) => void;
}

export default function DeleteInstrumentModal({
  open,
  onOpenChange,
  instrument,
  onDelete,
}: DeleteInstrumentModalProps) {
  const handleDelete = () => {
    onDelete(instrument._id);
    toast.success(`Đã xóa thiết bị ${instrument.name}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <DialogTitle>Xác nhận xóa thiết bị</DialogTitle>
          </div>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa thiết bị này không? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-700">Tên thiết bị: </span>
            <span className="text-sm text-gray-900">{instrument.name}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Mã thiết bị: </span>
            <span className="text-sm text-gray-900">{instrument.code}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Model: </span>
            <span className="text-sm text-gray-900">{instrument.model}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Xóa thiết bị
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
