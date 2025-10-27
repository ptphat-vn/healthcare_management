import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/formatDate";
import type { EventLog } from "@/types/monitor.type";

interface MonitoringDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: EventLog | null;
}

export default function MonitoringDetail({
  open,
  onOpenChange,
  log,
}: MonitoringDetailProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Event Log Detail
          </DialogTitle>
        </DialogHeader>

        {open && log ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-gray-500">Time</h4>
                <div className="font-medium">{formatDate(log.timestamp)}</div>
                <div className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Status</h4>
                <div className="font-medium">{log.status}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Action</h4>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded bg-gray-100 text-xs font-medium">
                {log.action}
              </div>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Message / Details</h4>
              <div className="mt-1 p-3 bg-gray-50 rounded border">
                {(log as any).details ?? log.message}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-gray-500">Operator</h4>
                <div className="font-medium">
                  {log.operator ?? (log as any).userId}
                </div>
              </div>
              <div>
                <h4 className="text-sm text-gray-500">Service</h4>
                <div className="font-medium">{log.service}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">No log selected.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
