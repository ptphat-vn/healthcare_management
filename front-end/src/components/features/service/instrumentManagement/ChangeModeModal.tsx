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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Instrument, InstrumentMode } from "@/types/instrument.type";
import { toast } from "sonner";
import { Activity } from "lucide-react";

interface ChangeModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instrument: Instrument;
  onUpdate: (instrument: Instrument) => void;
}

export default function ChangeModeModal({
  open,
  onOpenChange,
  instrument,
  onUpdate,
}: ChangeModeModalProps) {
  const [newMode, setNewMode] = useState<InstrumentMode>(instrument.mode);
  const [reason, setReason] = useState("");
  const [qcPassed, setQcPassed] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate
    if (newMode === instrument.mode) {
      setError("Mode mới phải khác với mode hiện tại");
      return;
    }

    if ((newMode === "maintenance" || newMode === "inactive") && !reason.trim()) {
      setError("Vui lòng nhập lý do chuyển mode");
      return;
    }

    if (newMode === "ready" && !qcPassed) {
      setError("Vui lòng xác nhận thiết bị đã vượt qua kiểm tra QC");
      return;
    }

    const updatedInstrument: Instrument = {
      ...instrument,
      mode: newMode,
      status: newMode === "inactive" ? "inactive" : newMode === "maintenance" ? "maintenance" : "active",
      updatedAt: new Date().toISOString(),
      modeHistory: [
        ...(instrument.modeHistory || []),
        {
          previousMode: instrument.mode,
          newMode,
          reason: reason || undefined,
          changedBy: "current-user-id",
          changedByName: "Current User",
          timestamp: new Date(),
          qcPassed: newMode === "ready" ? qcPassed : undefined,
        },
      ],
    };

    onUpdate(updatedInstrument);
    toast.success(`Đã chuyển mode thiết bị thành ${newMode}`);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setNewMode(instrument.mode);
    setReason("");
    setQcPassed(false);
    setError("");
  };

  const getModeLabel = (mode: InstrumentMode) => {
    const labels = {
      ready: "Ready - Sẵn sàng",
      maintenance: "Maintenance - Bảo trì",
      inactive: "Inactive - Không hoạt động",
    };
    return labels[mode];
  };

  const getModeDescription = (mode: InstrumentMode) => {
    const descriptions = {
      ready: "Thiết bị sẵn sàng để thực hiện xét nghiệm cho bệnh nhân",
      maintenance: "Thiết bị đang trong quá trình bảo trì, QC, QA hoặc sửa chữa",
      inactive: "Thiết bị tạm ngưng hoạt động, chờ bảo trì",
    };
    return descriptions[mode];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <DialogTitle>Thay đổi Mode thiết bị</DialogTitle>
          </div>
          <DialogDescription>
            Thiết bị: <span className="font-semibold">{instrument.name}</span> ({instrument.code})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Mode */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="text-sm font-medium text-gray-500">Mode hiện tại</label>
            <p className="text-base font-semibold mt-1">{getModeLabel(instrument.mode)}</p>
          </div>

          {/* New Mode */}
          <div className="space-y-2">
            <Label htmlFor="newMode">
              Mode mới <span className="text-red-500">*</span>
            </Label>
            <Select value={newMode} onValueChange={(value) => setNewMode(value as InstrumentMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ready" disabled={instrument.mode === "ready"}>
                  Ready - Sẵn sàng
                </SelectItem>
                <SelectItem value="maintenance" disabled={instrument.mode === "maintenance"}>
                  Maintenance - Bảo trì
                </SelectItem>
                <SelectItem value="inactive" disabled={instrument.mode === "inactive"}>
                  Inactive - Không hoạt động
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">{getModeDescription(newMode)}</p>
          </div>

          {/* Reason (for Maintenance or Inactive) */}
          {(newMode === "maintenance" || newMode === "inactive") && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Lý do <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do chuyển mode..."
                rows={3}
              />
            </div>
          )}

          {/* QC Confirmation (for Ready) */}
          {newMode === "ready" && (
            <div className="flex items-start space-x-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
              <Checkbox
                id="qcPassed"
                checked={qcPassed}
                onCheckedChange={(checked) => setQcPassed(checked as boolean)}
              />
              <div className="space-y-1">
                <label
                  htmlFor="qcPassed"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Xác nhận QC đã passed <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600">
                  Tôi xác nhận rằng thiết bị đã vượt qua các kiểm tra chất lượng (QC) và sẵn sàng hoạt động
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit">Xác nhận thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
