import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Instrument } from "@/types/instrument.type";
import { toast } from "sonner";

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
  const [formData, setFormData] = useState({
    name: instrument.name,
    code: instrument.code,
    model: instrument.model,
    manufacturer: instrument.manufacturer,
    purchaseDate: instrument.purchaseDate,
    lastMaintenanceDate: instrument.lastMaintenanceDate || "",
    lastCalibrationDate: instrument.lastCalibrationDate || "",
    responsiblePerson: instrument.responsiblePerson || "",
    nextMaintenanceDate: instrument.nextMaintenanceDate || "",
    notes: instrument.notes || "",
    reagentLevel: instrument.reagentLevel || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedInstrument: Instrument = {
      ...instrument,
      ...formData,
      updatedAt: new Date().toISOString(),
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên thiết bị</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Mã thiết bị</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Hãng sản xuất</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Ngày mua</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastMaintenanceDate">Ngày bảo trì gần nhất</Label>
              <Input
                id="lastMaintenanceDate"
                type="date"
                value={formData.lastMaintenanceDate}
                onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastCalibrationDate">Lần hiệu chuẩn gần nhất</Label>
              <Input
                id="lastCalibrationDate"
                type="date"
                value={formData.lastCalibrationDate}
                onChange={(e) => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextMaintenanceDate">Lịch bảo trì kế tiếp</Label>
              <Input
                id="nextMaintenanceDate"
                type="date"
                value={formData.nextMaintenanceDate}
                onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsiblePerson">Người phụ trách</Label>
              <Input
                id="responsiblePerson"
                value={formData.responsiblePerson}
                onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reagentLevel">Mức thuốc thử (%)</Label>
              <Input
                id="reagentLevel"
                type="number"
                min="0"
                max="100"
                value={formData.reagentLevel}
                onChange={(e) => setFormData({ ...formData, reagentLevel: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit">Lưu thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
