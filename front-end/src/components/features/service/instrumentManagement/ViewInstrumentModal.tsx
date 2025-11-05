import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Instrument } from "@/types/instrument.type";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";

interface ViewInstrumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instrument: Instrument;
}

export default function ViewInstrumentModal({
  open,
  onOpenChange,
  instrument,
}: ViewInstrumentModalProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      maintenance: "bg-yellow-100 text-yellow-800",
    };
    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>;
  };

  const getModeBadge = (mode: string) => {
    const styles = {
      ready: "bg-blue-100 text-blue-800",
      maintenance: "bg-orange-100 text-orange-800",
      inactive: "bg-red-100 text-red-800",
    };
    return <Badge className={styles[mode as keyof typeof styles]}>{mode}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết thiết bị</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tên thiết bị</label>
                <p className="text-base font-medium mt-1">{instrument.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mã thiết bị</label>
                <p className="text-base font-medium mt-1">{instrument.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Model</label>
                <p className="text-base mt-1">{instrument.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Hãng sản xuất</label>
                <p className="text-base mt-1">{instrument.manufacturer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày mua</label>
                <p className="text-base mt-1">{formatDate(instrument.purchaseDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Người phụ trách</label>
                <p className="text-base mt-1">{instrument.responsiblePerson || "-"}</p>
              </div>
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Trạng thái</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tình trạng</label>
                <div className="mt-1">{getStatusBadge(instrument.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mode</label>
                <div className="mt-1">{getModeBadge(instrument.mode)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mức thuốc thử</label>
                <p className="text-base mt-1 font-semibold">
                  {instrument.reagentLevel || 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Bảo trì & Hiệu chuẩn */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Bảo trì & Hiệu chuẩn</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày bảo trì gần nhất</label>
                <p className="text-base mt-1">
                  {instrument.lastMaintenanceDate ? formatDate(instrument.lastMaintenanceDate) : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Lịch bảo trì kế tiếp</label>
                <p className="text-base mt-1">
                  {instrument.nextMaintenanceDate ? formatDate(instrument.nextMaintenanceDate) : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Lần hiệu chuẩn gần nhất</label>
                <p className="text-base mt-1">
                  {instrument.lastCalibrationDate ? formatDate(instrument.lastCalibrationDate) : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          {instrument.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Ghi chú</h3>
              <p className="text-base bg-gray-50 p-3 rounded-lg">{instrument.notes}</p>
            </div>
          )}

          {/* Thông tin hệ thống */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Thông tin hệ thống</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                <p className="text-base mt-1">{formatDate(instrument.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày cập nhật</label>
                <p className="text-base mt-1">{formatDate(instrument.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
