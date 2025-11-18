import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Inbox } from "lucide-react";
import type { VendorSupplyHistory } from "@/types/reagent.type";
import type { JSX } from "react";

interface VendorSupplyTableProps {
  data: VendorSupplyHistory[];
}

export default function VendorSupplyTable({ data }: VendorSupplyTableProps) {
  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string; icon: JSX.Element }
    > = {
      Received: {
        label: "Received",
        className: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      Pending: {
        label: "Pending",
        className: "bg-amber-100 text-amber-800 border-amber-300",
        icon: <Clock className="w-3 h-3" />,
      },
      Cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 border-red-300",
        icon: <XCircle className="w-3 h-3" />,
      },
    };

    const config = statusConfig[status] || statusConfig.Received;
    return (
      <Badge className={`${config.className} flex items-center gap-1 text-xs`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-orange-50 to-amber-50">
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Receipt Date
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Reagent Name
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Lot Number
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Quantity
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Vendor
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                PO Number
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Expiry Date
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Storage
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Received By
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                Status
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
                      No vendor supply history found
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
                  key={item._id}
                  className="hover:bg-orange-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-xs sm:text-sm">
                    {formatDate(item.receiptDate)}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <div>
                      <div className="font-semibold">{item.reagentName}</div>
                      <div className="text-gray-500 text-xs">
                        {item.manufacturer}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs sm:text-sm">
                    <Badge variant="outline" className="font-mono text-xs">
                      {item.lotNumber}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                      {item.quantityReceived} {item.unitOfMeasure}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs sm:text-sm">
                    {item.vendorName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {item.purchaseOrderNumber}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <span
                      className={
                        new Date(item.expirationDate) < new Date()
                          ? "text-red-600 font-semibold"
                          : "text-gray-600"
                      }
                    >
                      {formatDate(item.expirationDate)}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs sm:text-sm">
                    {item.initialStorageLocation || "-"}
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs sm:text-sm">
                    {item.receivedByName}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
