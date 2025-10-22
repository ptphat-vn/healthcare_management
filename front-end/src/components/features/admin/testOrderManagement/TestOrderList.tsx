import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import EditTestOrderModal from "./EditTestOrderModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

export interface TestOrder {
  id: string;
  patientName: string;
  patientDob: string;
  age: number;
  gender: "Male" | "Female";
  testType: string;
  priority: "NORMAL" | "URGENT";
  createdBy: string;
  createdOn: string;
  status: "Complete" | "In Progress" | "Pending" | "Review";
}

// Fake data
const fakeTestOrders: TestOrder[] = [
  {
    id: "TO-001234",
    patientName: "John Doe",
    patientDob: "1985-03-15",
    age: 49,
    gender: "Male",
    testType: "Complete Blood Count",
    priority: "NORMAL",
    createdBy: "Dr. Smith",
    createdOn: "9/10/2025",
    status: "Complete",
  },
  {
    id: "TO-001235",
    patientName: "Jane Smith",
    patientDob: "1985-03-15",
    age: 49,
    gender: "Female",
    testType: "Lipid Panel",
    priority: "URGENT",
    createdBy: "Dr.Wilson",
    createdOn: "9/11/2025",
    status: "In Progress",
  },
  {
    id: "TO-001236",
    patientName: "John Doe",
    patientDob: "1985-03-15",
    age: 49,
    gender: "Male",
    testType: "Thyroid Function",
    priority: "NORMAL",
    createdBy: "Dr. Smith",
    createdOn: "9/9/2025",
    status: "Pending",
  },
  {
    id: "TO-001237",
    patientName: "Jane Smith",
    patientDob: "1985-03-15",
    age: 49,
    gender: "Female",
    testType: "Thyroid Function",
    priority: "URGENT",
    createdBy: "Dr.Wilson",
    createdOn: "9/12/2025",
    status: "Review",
  },
  {
    id: "TO-001238",
    patientName: "Michael Johnson",
    patientDob: "1990-07-22",
    age: 35,
    gender: "Male",
    testType: "Liver Function Test",
    priority: "NORMAL",
    createdBy: "Dr. Brown",
    createdOn: "9/13/2025",
    status: "Complete",
  },
  {
    id: "TO-001239",
    patientName: "Emily Davis",
    patientDob: "1992-11-08",
    age: 33,
    gender: "Female",
    testType: "Kidney Function Panel",
    priority: "URGENT",
    createdBy: "Dr. Lee",
    createdOn: "9/14/2025",
    status: "In Progress",
  },
  {
    id: "TO-001240",
    patientName: "Robert Wilson",
    patientDob: "1978-05-30",
    age: 47,
    gender: "Male",
    testType: "Glucose Test",
    priority: "NORMAL",
    createdBy: "Dr. Martinez",
    createdOn: "9/15/2025",
    status: "Pending",
  },
  {
    id: "TO-001241",
    patientName: "Sarah Brown",
    patientDob: "1988-09-12",
    age: 37,
    gender: "Female",
    testType: "Hemoglobin A1C",
    priority: "NORMAL",
    createdBy: "Dr. Smith",
    createdOn: "9/16/2025",
    status: "Complete",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Complete":
      return "bg-green-100 text-green-700";
    case "In Progress":
      return "bg-red-100 text-red-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Review":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return "text-red-600 font-semibold";
    case "NORMAL":
      return "text-green-600 font-semibold";
    default:
      return "text-gray-600";
  }
};

export default function TestOrderList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [testOrders] = useState<TestOrder[]>(fakeTestOrders);
  const [editingOrder, setEditingOrder] = useState<TestOrder | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<TestOrder | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredOrders = testOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.testType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = (order: TestOrder) => {
    navigate(`/admin/test-order/${order.id}`);
  };

  const handleEdit = (order: TestOrder) => {
    setEditingOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDelete = (order: TestOrder) => {
    setDeletingOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingOrder) {
      // TODO: Implement actual delete API call
      toast.success(`Test order ${deletingOrder.id} deleted successfully`);
      setDeletingOrder(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Action, message or operator,..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-gray-50 border-gray-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50 hover:bg-blue-50">
                  <TableHead className="font-semibold text-gray-900">Order ID</TableHead>
                  <TableHead className="font-semibold text-gray-900">Patient</TableHead>
                  <TableHead className="font-semibold text-gray-900">Age</TableHead>
                  <TableHead className="font-semibold text-gray-900">Gender</TableHead>
                  <TableHead className="font-semibold text-gray-900">Test Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">Priority</TableHead>
                  <TableHead className="font-semibold text-gray-900">Created By</TableHead>
                  <TableHead className="font-semibold text-gray-900">Created on</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Không tìm thấy đơn xét nghiệm nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{order.patientName}</div>
                          <div className="text-sm text-gray-500">{order.patientDob}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.age}</TableCell>
                      <TableCell>{order.gender}</TableCell>
                      <TableCell>{order.testType}</TableCell>
                      <TableCell>
                        <span className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </span>
                      </TableCell>
                      <TableCell>{order.createdBy}</TableCell>
                      <TableCell>{order.createdOn}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleView(order)}
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(order)}
                                className="cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(order)}
                                className="cursor-pointer text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <EditTestOrderModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        order={editingOrder}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        order={deletingOrder}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
