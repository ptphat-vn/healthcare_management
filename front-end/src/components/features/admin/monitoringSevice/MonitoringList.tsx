import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import type { EventLog } from "../../../../types/monitor.type";
import MonitoringDetail from "./MonitoringDetail";
import { useGetEventLogsQuery } from "@/services/eventLogApi";
import PaginationUI from "@/components/ui/pagination/PaginationUI";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";

export default function MonitoringList() {
  const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mappedLogs, setMappedLogs] = useState<EventLog[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data, isLoading, error } = useGetEventLogsQuery({
    page: currentPage,
    limit: 10,
  });

  // Map backend MongoDB data sang frontend format
  useEffect(() => {
    if (data?.data?.eventLogs) {
      const backendLogs = data.data.eventLogs;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: EventLog[] = backendLogs.map((log: any) => {
        // Parse MongoDB _id
        const id = log._id?.$oid || log._id || "";

        // Parse MongoDB timestamp
        let timestamp = "";
        if (log.timestamp?.$date?.$numberLong) {
          timestamp = new Date(
            parseInt(log.timestamp.$date.$numberLong)
          ).toISOString();
        } else if (log.timestamp instanceof Date) {
          timestamp = log.timestamp.toISOString();
        } else if (typeof log.timestamp === "string") {
          timestamp = log.timestamp;
        }

        // Parse operator: {id, name, role} → lấy name
        const operator =
          typeof log.operator === "object" && log.operator !== null
            ? log.operator.name || "Unknown"
            : log.operator || "System";

        return {
          id,
          timestamp,
          // status: (log.status as MonitoringStatus) || "", // Lấy từ backend, fallback "info"
          action: log.action,
          message: log.details || log.message || "",
          operator,
          // service: log.service || "", // Lấy từ backend, fallback "System"
        };
      });
      setMappedLogs(mapped);
    } else {
      setMappedLogs([]);
    }
  }, [data]);

  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Event Logs...</p>
        </div>
      </div>
    );
  }
  if (error) {
    const errMsg =
      typeof error === "string" ? error : "Error loading event logs";
    return (
      <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-red-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-semibold text-red-800">Error loading data</p>
            <p className="text-sm text-red-600">{errMsg}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
              <TableHead className="font-semibold text-gray-700 w-16">
                No
              </TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[100px]">
                Time
              </TableHead>
              {/* <TableHead className="font-semibold">Status</TableHead> */}
              <TableHead className="font-semibold text-gray-700 min-w-[200px]">
                Action
              </TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[300px]">
                Event Log Message
              </TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[100px]">
                Operator
              </TableHead>
              {/* <TableHead className="font-semibold">Service</TableHead> */}
              <TableHead className="text-right font-semibold text-gray-700 w-20">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-red-600"
                >
                  Lỗi khi tải dữ liệu!
                </TableCell>
              </TableRow>
            ) : mappedLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  No logs found.
                </TableCell>
              </TableRow>
            ) : (
              mappedLogs.map((log: EventLog, idx) => (
                <TableRow key={log.id} className="hover:bg-gray-50">
                  <TableCell className="text-left font-medium text-gray-600">
                    {(currentPage - 1) * 10 + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatDate(log.timestamp)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  {/* <TableCell>
                    {log.status === "success" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Success
                      </span>
                    ) : log.status === "info" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Info
                      </span>
                    ) : log.status === "warning" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Error
                      </span>
                    )}
                  </TableCell> */}
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-gray-100 text-xs font-medium">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-70 truncate" title={log.message}>
                      {log.message}
                    </div>
                  </TableCell>
                  <TableCell>{log.operator}</TableCell>
                  {/* <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700">
                      {log.service}
                    </span>
                  </TableCell> */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-100 transition-colors"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedLog(log);
                            setDetailOpen(true);
                          }}
                          className="cursor-pointer hover:bg-blue-50"
                        >
                          <Eye className="mr-2 h-4 w-4 text-blue-600" />
                          <span className="text-gray-700">View detail</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
          {mappedLogs.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-semibold">
                {(currentPage - 1) * 10 + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(currentPage * 10, pagination?.total || 0)}
              </span>{" "}
              of <span className="font-semibold">{pagination?.total || 0}</span>{" "}
              logs
            </>
          ) : (
            <>No logs to display</>
          )}
        </div>
        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
          <PaginationUI
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handleChangePage}
          />
        </div>
      </div>

      <MonitoringDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        log={selectedLog}
      />
    </div>
  );
}
