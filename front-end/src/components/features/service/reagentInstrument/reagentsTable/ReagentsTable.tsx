import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Trash2, MoreHorizontal } from "lucide-react";
import DeleteReagentDialog from "../deleteReagentDialog/DeleteReagentDialog";


interface Reagent {
  _id: string;
  reagentId: string;
  reagentName: string;
  lotNumber?: string;
  quantity: number;
  unitOfMeasure: string;
  expirationDate: string;
  assignedAt: string;
}

interface ReagentsTableProps {
  instrumentId: string;
  reagents: Reagent[];
  onDelete: (assignmentId: string, reagentName: string) => void;
  isDeleting?: boolean;
}

export default function ReagentsTable({
  instrumentId,
  reagents,
  onDelete,
  isDeleting = false,
}: ReagentsTableProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReagent, setSelectedReagent] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleViewReagent = (assignmentId: string) => {
    navigate(
      `/service/instruments/${instrumentId}/reagents/${assignmentId}`
    );
  };

  const handleDeleteClick = (assignmentId: string, reagentName: string) => {
    setSelectedReagent({ id: assignmentId, name: reagentName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedReagent) {
      onDelete(selectedReagent.id, selectedReagent.name);
      setDeleteDialogOpen(false);
      setSelectedReagent(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <TableHead className="font-semibold text-gray-700 w-16">
                No
              </TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[200px]">
                Reagent Name
              </TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[120px]">
                Lot Number
              </TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[100px]">
                Quantity
              </TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[100px]">
                Unit
              </TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[120px]">
                Expiration Date
              </TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[120px]">
                Assigned Date
              </TableHead>
              <TableHead className="text-center font-semibold text-gray-700 w-32">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reagents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  No reagents assigned to this instrument
                </TableCell>
              </TableRow>
            ) : (
              reagents.map((reagent, index) => (
                <TableRow
                  key={reagent._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-900">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {reagent.reagentName}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {reagent.lotNumber || "N/A"}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {reagent.quantity}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {reagent.unitOfMeasure}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {new Date(reagent.expirationDate).toLocaleDateString(
                      "en-GB"
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {new Date(reagent.assignedAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewReagent(reagent._id)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2 text-blue-600" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(reagent._id, reagent.reagentName)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
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

      {/* Delete Confirmation Dialog */}
      <DeleteReagentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        reagentName={selectedReagent?.name || ""}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
