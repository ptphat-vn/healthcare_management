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
      <DialogContent className="w-[95vw] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg [&>button]:hidden">
        {open && log ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 sm:p-6 text-white shadow-lg -m-4 sm:-m-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg shrink-0">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold wrap-break-word">
                      Event Log Details
                    </h1>
                    <p className="text-xs sm:text-sm text-blue-100 mt-0.5 sm:mt-1">
                      View detailed event log information
                    </p>
                  </div>
                </div>
                <div className="bg-white/20 px-3 sm:px-4 py-2 rounded-lg text-left sm:text-right shrink-0">
                  <span className="text-xs sm:text-sm font-medium opacity-90">
                    Action
                  </span>
                  <p className="text-base sm:text-lg font-bold wrap-break-word">
                    {log.action}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 sm:space-y-6">
              {/* Time & Operator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1.5 sm:mb-2">
                    Timestamp
                  </h3>
                  <div className="text-sm sm:text-base font-medium text-gray-900 wrap-break-word">
                    {formatDate(log.timestamp)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1.5 sm:mb-2">
                    Operator
                  </h3>
                  <div className="text-sm sm:text-base font-medium text-gray-900 wrap-break-word">
                    {log.operator?.name
                      ? log.operator?.role
                        ? `${log.operator.name} - ${log.operator.role}`
                        : log.operator.name
                      : log.operator?.role || "N/A"}
                  </div>
                </div>
              </div>

              {/* Action Badge */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1.5 sm:mb-2">
                  Action Type
                </h3>
                <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-md bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs sm:text-sm font-medium border border-blue-200 wrap-break-word">
                  {log.action}
                </span>
              </div>

              {/* Message/Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1.5 sm:mb-2">
                  Event Details
                </h3>
                <div className="mt-2 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap wrap-break-word min-w-0">
                    {log.message || "No additional details"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                <Button
                  onClick={handleClose}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm px-4 sm:px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 sm:py-12 text-center text-gray-500 px-4">
            <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
            <p className="text-base sm:text-lg">No log selected.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
