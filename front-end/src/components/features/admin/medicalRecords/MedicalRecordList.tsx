import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MedicalRecord } from "@/types/medicalRecord.type";
import type { User } from "@/types/user.type";
import EditMedicalRecordModal from "./EditMedicalRecordModal";
import DeleteMedicalRecordModal from "./DeleteMedicalRecordModal";

interface MedicalRecordListProps {
  searchTerm: string;
}

export default function MedicalRecordList({ searchTerm }: MedicalRecordListProps) {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Mock data
  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: "1",
      patientId: "PAT-001",
      patientName: "Nguyen Van A",
      doctorId: "DOC-001",
      doctorName: "Dr. Smith",
      recordType: "consultation",
      title: "Regular Checkup",
      description: "Patient came for regular checkup",
      diagnosis: "Healthy",
      symptoms: ["No symptoms"],
      treatment: "No treatment needed",
      status: "active",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
    {
      id: "2",
      patientId: "PAT-002",
      patientName: "Nguyen Van B",
      doctorId: "DOC-002",
      doctorName: "Dr. Johnson",
      recordType: "examination",
      title: "Fever Examination",
      description: "Patient has high fever",
      diagnosis: "Common cold",
      symptoms: ["Fever", "Cough"],
      treatment: "Rest and medication",
      status: "active",
      createdAt: "2024-01-16",
      updatedAt: "2024-01-16",
    },
    {
      id: "3",
      patientId: "PAT-003",
      patientName: "Tran Thi C",
      doctorId: "DOC-001",
      doctorName: "Dr. Smith",
      recordType: "treatment",
      title: "Blood Pressure Treatment",
      description: "Patient with high blood pressure",
      diagnosis: "Hypertension",
      symptoms: ["High blood pressure", "Headache"],
      treatment: "Medication and lifestyle changes",
      status: "inactive",
      createdAt: "2024-01-17",
      updatedAt: "2024-01-17",
    },
  ]);

  // Mock user data for each patient
  const userByPatientId: Record<string, Pick<User, "fullName" | "email" | "phoneNumber" | "identifyNumber" | "gender" | "dateOfBirth" | "address"> & { bloodGroup?: string }> = {
    "PAT-001": {
      fullName: "Nguyen Van A",
      email: "a@example.com",
      phoneNumber: "0900000001",
      identifyNumber: "012345678",
      gender: "male",
      dateOfBirth: "1989-01-01", // 35 tuổi
      address: "HCM",
      bloodGroup: "O+",
    },
    "PAT-002": {
      fullName: "Nguyen Van B",
      email: "b@example.com",
      phoneNumber: "0900000002",
      identifyNumber: "012345679",
      gender: "female",
      dateOfBirth: "1991-02-02", // 33 tuổi
      address: "HN",
      bloodGroup: "A-",
    },
    "PAT-003": {
      fullName: "Tran Thi C",
      email: "c@example.com",
      phoneNumber: "0900000003",
      identifyNumber: "012345680",
      gender: "female",
      dateOfBirth: "1994-03-03", // 30 tuổi
      address: "DN",
      bloodGroup: "B+",
    },
  };

  // Helper function to calculate age from date of birth
  const calcAge = (dob?: string) => {
    if (!dob) return "-";
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return "-";
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age >= 0 ? String(age) : "-";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleView = (record: MedicalRecord) => {
    console.log("View record:", record);
    navigate(`/admin/medical-records/${record.id}`);
  };

  const handleEdit = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedRecord) return;
    
    setRecords(prev => prev.filter(record => record.id !== selectedRecord.id));
    setIsDeleteModalOpen(false);
    setSelectedRecord(null);
    alert("Medical record deleted successfully!");
  };

  const filteredRecords = records.filter(record =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.recordType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50">
              <TableHead className="font-semibold text-gray-700 text-left">Patient ID</TableHead>
              <TableHead className="font-semibold text-gray-700 text-left">Full Name</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Age</TableHead>
              <TableHead className="font-semibold text-gray-700 text-left">Gender</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Blood Type</TableHead>
              <TableHead className="font-semibold text-gray-700 text-left">Phone Number</TableHead>
              <TableHead className="font-semibold text-gray-700 text-left">Status</TableHead>
              <TableHead className="font-semibold text-gray-700 text-left">Last Test Date</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No medical records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => {
                const user = userByPatientId[record.patientId];
                return (
                  <TableRow key={record.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-left">{record.patientId}</TableCell>
                    <TableCell className="font-medium text-left">{user?.fullName || record.patientName}</TableCell>
                    <TableCell className="text-center">{calcAge(user?.dateOfBirth)}</TableCell>
                    <TableCell className="capitalize text-left">{user?.gender || "-"}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {user?.bloodGroup || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-left">{user?.phoneNumber || "-"}</TableCell>
                    <TableCell className="text-left">{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-left">{record.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleView(record)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(record)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(record)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredRecords.length > 0 && (
        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">1-{filteredRecords.length} of {filteredRecords.length}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditMedicalRecordModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        medicalRecord={selectedRecord}
        onSuccess={() => {
          alert("Medical record updated successfully!");
        }}
      />

      <DeleteMedicalRecordModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        medicalRecord={selectedRecord}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
