import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/formatDate";
import type { EventLog } from "@/types/monitor.type";
import { FileText } from "lucide-react";

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        {open && log ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white shadow-lg -m-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Event Log Details</h1>
                    <p className="text-blue-100">
                      View detailed event log information
                    </p>
                  </div>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg text-right">
                  <span className="text-sm font-medium opacity-90">Action</span>
                  <p className="text-lg font-bold">{log.action}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Time & Operator */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">
                    Timestamp
                  </h3>
                  <div className="font-medium text-gray-900">
                    {formatDate(log.timestamp)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">
                    Operator
                  </h3>
                  <div className="font-medium text-gray-900">
                    {log.operator ?? "System"}
                  </div>
                </div>
              </div>

              {/* Action Badge */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  Action Type
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-medium border border-blue-200">
                  {log.action}
                </span>
              </div>

              {/* Message/Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  Event Details
                </h3>
                <div className="mt-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {log.message || "No additional details"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  onClick={handleClose}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No log selected.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
