import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Inbox } from "lucide-react";
import type { Instrument } from "@/types/instrument.type";
import { useState } from "react";
import PaginationUI from "@/components/ui/pagination/PaginationUI";
import EditInstrumentModal from "./EditInstrumentModal/EditInstrumentModal";
import DeleteInstrumentModal from "./DeleteInstrumentModal/DeleteInstrumentModal";
import { useNavigate } from "react-router-dom";

interface InstrumentTableProps {
  instruments: Instrument[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onUpdate: (instrument: Instrument) => void;
  onAdd: (instrument: Instrument) => void;
}

export default function InstrumentTable({
  instruments,
  pagination,
  onPageChange,
  onDelete,
  onUpdate,
}: InstrumentTableProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);
  const navigate = useNavigate();
  const handleEdit = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setEditModalOpen(true);
  };

  const handleDelete = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setDeleteModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: "bg-green-100 text-green-800",
      Inactive: "bg-gray-100 text-gray-800",
      Maintenance: "bg-yellow-100 text-yellow-800",
      "Out of Service": "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                <TableHead className="font-semibold text-gray-700 w-16">
                  No
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[200px]">
                  Instrument Name
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[140px]">
                  Model
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[140px]">
                  Serial Number
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[140px]">
                  Location
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[120px]">
                  Status
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700 w-20">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instruments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Inbox size={48} className="mb-4" />
                      <p className="text-lg font-medium">
                        No instruments found
                      </p>
                      <p className="text-sm">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                instruments.map((instrument, index) => (
                  <TableRow
                    key={instrument._id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="text-start font-medium text-gray-600">
                      {((pagination?.page || 1) - 1) *
                        (pagination?.limit || 10) +
                        index +
                        1}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      <div
                        className="max-w-[200px] truncate"
                        title={instrument.name}
                      >
                        {instrument.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {instrument.model || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {instrument.serialNumber || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {instrument.location || "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(instrument.status)}</TableCell>
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
                        <DropdownMenuContent align="end" className="w-56">
                          {/* Instrument Actions */}
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/service/instruments/${instrument._id}`)
                            }
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Eye className="mr-2 h-4 w-4 text-blue-600" />
                            <span className="text-gray-700">View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(instrument)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Edit className="mr-2 h-4 w-4 text-green-600" />
                            <span className="text-gray-700">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(instrument)}
                            className="cursor-pointer hover:bg-red-50 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>

                          {/* Separator */}
                          <div className="my-1 h-px bg-gray-200" />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
          {instruments.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-semibold">
                {((pagination?.page || 1) - 1) * (pagination?.limit || 8) + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(
                  (pagination?.page || 1) * (pagination?.limit || 8),
                  pagination?.total || 0
                )}
              </span>{" "}
              of <span className="font-semibold">{pagination?.total || 0}</span>{" "}
              instruments
            </>
          ) : (
            <>No instruments to display</>
          )}
        </div>
        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
          <PaginationUI
            currentPage={pagination?.page || 1}
            totalPages={pagination?.totalPages || 1}
            onPageChange={onPageChange}
          />
        </div>
      </div>

      {/* Modals */}
      {selectedInstrument && (
        <>
          <EditInstrumentModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            instrument={selectedInstrument}
            onUpdate={onUpdate}
          />
          <DeleteInstrumentModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            instrument={selectedInstrument}
            onDelete={onDelete}
          />
        </>
      )}
    </>
  );
}
