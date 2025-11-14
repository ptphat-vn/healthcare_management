import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Inbox,
} from "lucide-react";
import type { ReagentInventory } from "@/types/reagent.type";

interface ReagentInventoryTableProps {
  data: ReagentInventory[];
}

export default function ReagentInventoryTable({
  data,
}: ReagentInventoryTableProps) {
  // Get status badge
  const getStatusBadge = (
    quantityAvailable: number,
    isExpired: boolean,
    isExpiringSoon: boolean
  ) => {
    if (isExpired) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1 text-xs">
          <XCircle className="w-3 h-3" />
          Expired
        </Badge>
      );
    }

    if (quantityAvailable === 0) {
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-300 flex items-center gap-1 text-xs">
          <XCircle className="w-3 h-3" />
          Out of Stock
        </Badge>
      );
    }

    if (isExpiringSoon) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1 text-xs">
          <Clock className="w-3 h-3" />
          Expiring Soon
        </Badge>
      );
    }

    if (quantityAvailable < 20) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1 text-xs">
          <AlertTriangle className="w-3 h-3" />
          Low Stock
        </Badge>
      );
    }

    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1 text-xs">
        <CheckCircle className="w-3 h-3" />
        In Stock
      </Badge>
    );
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-orange-50 to-amber-50">
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Reagent Name
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Lot Number
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Received
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Used
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Available
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Unit
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Status
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Expiry Date
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Days Left
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Inbox className="w-12 h-12 mb-2" />
                    <p className="text-base sm:text-lg font-medium">
                      No inventory found
                    </p>
                    <p className="text-xs sm:text-sm">
                      Try adjusting your filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={item.vendorSupplyId}
                  className="hover:bg-orange-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-xs sm:text-sm">
                    {item.reagentName}
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs sm:text-sm">
                    {item.lotNumber}
                  </TableCell>
                  <TableCell className="text-gray-900 text-xs sm:text-sm">
                    {item.quantityReceived}
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs sm:text-sm">
                    {item.quantityUsed}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold text-xs sm:text-sm ${
                        item.quantityAvailable === 0
                          ? "text-red-600"
                          : item.quantityAvailable < 20
                          ? "text-orange-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {item.quantityAvailable}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs sm:text-sm">
                    {item.unitOfMeasure}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(
                      item.quantityAvailable,
                      item.isExpired,
                      item.isExpiringSoon
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs sm:text-sm ${
                        item.isExpired
                          ? "text-red-600 font-semibold"
                          : item.isExpiringSoon
                          ? "text-amber-600 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {new Date(item.expirationDate).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.isExpired ? (
                      <span className="text-red-600 font-semibold text-xs sm:text-sm">
                        Expired
                      </span>
                    ) : (
                      <span
                        className={`text-xs sm:text-sm ${
                          item.isExpiringSoon
                            ? "text-amber-600 font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        {item.daysUntilExpiration} days
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
