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
import dayjs from "dayjs";
import type { EventLog } from "../../../../../types/monitor.type";
import MonitoringDetail from "../MonitoringDetail/MonitoringDetail";
import { useGetEventLogsQuery } from "@/services/eventLogApi";
import PaginationUI from "@/components/ui/pagination/PaginationUI";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import formatPrivilege from "@/utils/formatPrivilege";
import { Skeleton } from "@/components/ui/skeleton";

export default function MonitoringList() {
  const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data, isLoading, error } = useGetEventLogsQuery({
    page: currentPage,
    limit: 10,
  });

  useEffect(() => {
    if (!data?.data?.eventLogs) {
      setEventLogs([]);
      return;
    }

    const formattedEventLogs: EventLog[] = data.data.eventLogs.map(
      (rawLog: any) => ({
        id: rawLog._id || "",
        timestamp: rawLog.timestamp || "",
        action: rawLog.action || "",
        message: rawLog.details || rawLog.message || "",
        operator: rawLog.operator || "System",
        status: "info",
        service: "System",
        role: rawLog.role,
      })
    );

    setEventLogs(formattedEventLogs);
  }, [data]);

  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

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
              <TableHead className="font-semibold text-gray-700 min-w-[200px]">
                Action
              </TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[300px]">
                Event Log Message
              </TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[100px]">
                Operator
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-700 w-20">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-red-600"
                >
                  Error loading data!
                </TableCell>
              </TableRow>
            ) : eventLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  No logs found.
                </TableCell>
              </TableRow>
            ) : (
              eventLogs.map((log: EventLog, idx) => (
                <TableRow key={log.id} className="hover:bg-gray-50">
                  <TableCell className="text-left font-medium text-gray-600">
                    {(currentPage - 1) * 10 + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {dayjs(log.timestamp).format("DD/MM/YYYY")}
                    </div>
                    <div className="text-xs text-gray-500">
                      {dayjs(log.timestamp).format("h:mm:ss A")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-gray-100 text-xs font-medium">
                      {formatPrivilege(log.action)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-70 truncate" title={log.message}>
                      {log.message}
                    </div>
                  </TableCell>
                  <TableCell>{log.operator?.name}</TableCell>
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
                      <DropdownMenuContent
                        align="end"
                        className="w-44 bg-white border border-gray-200 shadow-lg rounded-md"
                      >
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
          {eventLogs.length > 0 ? (
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
