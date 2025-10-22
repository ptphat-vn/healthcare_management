import { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import type { EventLog } from "../../../../types/monitor.type";
import MonitoringDetail from "./MonitoringDetail";

export default function MonitoringList() {

  //Data giả á
  const logs: EventLog[] = [
    {
      id: "1",
      timestamp: new Date().toISOString(),
      status: "success",
      action: "USER_CREATED",
      message: "Created user john.doe@example.com",
      operator: "Admin",
      service: "AuthService",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: "warning",
      action: "PASSWORD_RESET",
      message: "Password reset requested for jane@example.com",
      operator: "System",
      service: "AuthService",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: "error",
      action: "LOGIN_FAILED",
      message: "Failed login from 10.0.0.1",
      operator: undefined,
      service: "WebGateway",
    },
  ];
  const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Time</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
              <TableHead className="font-semibold">Event Log Message</TableHead>
              <TableHead className="font-semibold">Operator</TableHead>
              <TableHead className="font-semibold">Service</TableHead>
              <TableHead className="text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="font-medium">
                      {formatDate(log.timestamp)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-gray-100 text-xs font-medium">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell>{log.operator}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700">
                      {log.service}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedLog(log);
                        setDetailOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <MonitoringDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        log={selectedLog}
      />
    </div>
  );
}
