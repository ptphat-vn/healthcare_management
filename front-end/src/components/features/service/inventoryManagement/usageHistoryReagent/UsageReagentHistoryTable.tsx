import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Inbox } from "lucide-react";
import { type JSX } from "react";
import type { UsageReagentHistory } from "@/types/reagent.type";
interface UsageReagentHistoryTableProps {
  data: UsageReagentHistory[];
  getActionBadge: (action: string) => JSX.Element;
  formatDateTime: (dateString: string) => string;
}

export default function UsageReagentHistoryTable({
  data,
  getActionBadge,
  formatDateTime,
}: UsageReagentHistoryTableProps) {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-orange-50 to-amber-50">
            <TableHead className="font-semibold">Date & Time</TableHead>
            <TableHead className="font-semibold">Reagent Name</TableHead>
            <TableHead className="font-semibold">Quantity</TableHead>
            <TableHead className="font-semibold">Action</TableHead>
            <TableHead className="font-semibold">Lot Number</TableHead>
            <TableHead className="font-semibold">Performed By</TableHead>
            <TableHead className="font-semibold">Instrument</TableHead>
            {/* <TableHead className="font-semibold">Notes</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Inbox className="w-12 h-12 mb-2" />
                  <p className="text-lg font-medium">No usage history found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={item._id}
                className="hover:bg-orange-50/50 transition-colors"
              >
                <TableCell className="font-medium">
                  {formatDateTime(item.performedAt)}
                </TableCell>
                <TableCell className="font-medium">
                  {item.reagentName}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-gray-900">
                    {item.quantity} {item.unit}
                  </span>
                </TableCell>
                <TableCell>{getActionBadge(item.action)}</TableCell>
                <TableCell className="text-gray-600">
                  {item.batchLotNumber}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {item.performedByName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {item.instrumentName || "N/A"}
                </TableCell>

                {/* <TableCell className="text-gray-600 max-w-xs truncate">
                  {item.notes || "-"}
                </TableCell> */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
