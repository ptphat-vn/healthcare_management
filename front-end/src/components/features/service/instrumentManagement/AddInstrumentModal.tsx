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

interface AddInstrumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddInstrumentModal({ open, onOpenChange }: AddInstrumentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    model: "",
    manufacturer: "",
    purchaseDate: "",
    responsiblePerson: "",
    nextMaintenanceDate: "",
    notes: "",
    reagentLevel: 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.name || !formData.code || !formData.model || !formData.manufacturer || !formData.purchaseDate) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const newInstrument: Instrument = {
      _id: `INS${Date.now()}`,
      ...formData,
      status: "active",
      mode: "ready",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In real app, this would call onAdd from props
    console.log("New instrument:", newInstrument);
    toast.success("Thêm thiết bị thành công!");
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      model: "",
      manufacturer: "",
      purchaseDate: "",
      responsiblePerson: "",
      nextMaintenanceDate: "",
      notes: "",
      reagentLevel: 100,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm thiết bị mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin thiết bị xét nghiệm mới
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên thiết bị <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên thiết bị"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">
                Mã thiết bị <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Nhập mã thiết bị"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">
                Model <span className="text-red-500">*</span>
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Nhập model"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">
                Hãng sản xuất <span className="text-red-500">*</span>
              </Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="Nhập hãng sản xuất"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">
                Ngày mua <span className="text-red-500">*</span>
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
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
                placeholder="Nhập tên người phụ trách"
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
              placeholder="Nhập ghi chú (nếu có)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit">Thêm thiết bị</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
