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
import { MoreHorizontal, Edit, Trash2, Eye, Activity, Inbox } from "lucide-react";
import type { Instrument } from "@/types/instrument.type";
import { useState } from "react";
import { formatDate } from "@/utils/formatDate";
import PaginationUI from "@/components/ui/pagination/PaginationUI";
import EditInstrumentModal from "./EditInstrumentModal";
import DeleteInstrumentModal from "./DeleteInstrumentModal";
import ViewInstrumentModal from "./ViewInstrumentModal";
import ChangeModeModal from "./ChangeModeModal";

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
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [changeModeModalOpen, setChangeModeModalOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);

  const handleEdit = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setEditModalOpen(true);
  };

  const handleDelete = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setDeleteModalOpen(true);
  };

  const handleView = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setViewModalOpen(true);
  };

  const handleChangeMode = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setChangeModeModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      maintenance: "bg-yellow-100 text-yellow-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const getModeBadge = (mode: string) => {
    const styles = {
      ready: "bg-blue-100 text-blue-800",
      maintenance: "bg-orange-100 text-orange-800",
      inactive: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[mode as keyof typeof styles]}`}>
        {mode}
      </span>
    );
  };

  const getReagentLevelColor = (level?: number) => {
    if (!level) return "text-gray-400";
    if (level >= 70) return "text-green-600";
    if (level >= 40) return "text-yellow-600";
    return "text-red-600";
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
                  Instrument name
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[120px]">
                  Instrument code
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[120px]">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[110px]">
                  Mode
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[110px] text-center">
                  Reagent
                </TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[140px]">
                  Next maintenance
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700 w-20">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instruments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Inbox size={16} />
                      <p className="text-lg font-medium">No instruments found</p>
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
                      {((pagination?.page || 1) - 1) * (pagination?.limit || 8) + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{instrument.name}</TableCell>
                    <TableCell className="text-gray-600">{instrument.code}</TableCell>
                    <TableCell>{getStatusBadge(instrument.status)}</TableCell>
                    <TableCell>{getModeBadge(instrument.mode)}</TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold ${getReagentLevelColor(instrument.reagentLevel)}`}>
                        {instrument.reagentLevel || 0}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {instrument.nextMaintenanceDate ? formatDate(instrument.nextMaintenanceDate) : "-"}
                    </TableCell>
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
                            onClick={() => handleView(instrument)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Eye className="mr-2 h-4 w-4 text-blue-600" />
                            <span className="text-gray-700">Xem chi tiết</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleChangeMode(instrument)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Activity className="mr-2 h-4 w-4 text-purple-600" />
                            <span className="text-gray-700">Đổi mode</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(instrument)}
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            <Edit className="mr-2 h-4 w-4 text-green-600" />
                            <span className="text-gray-700">Chỉnh sửa</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(instrument)}
                            className="cursor-pointer hover:bg-red-50 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Xóa</span>
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
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
          {instruments.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-semibold">{((pagination?.page || 1) - 1) * (pagination?.limit || 8) + 1}</span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min((pagination?.page || 1) * (pagination?.limit || 8), pagination?.total || 0)}
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
          <ViewInstrumentModal
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
            instrument={selectedInstrument}
          />
          <ChangeModeModal
            open={changeModeModalOpen}
            onOpenChange={setChangeModeModalOpen}
            instrument={selectedInstrument}
            onUpdate={onUpdate}
          />
        </>
      )}
    </>
  );
}
