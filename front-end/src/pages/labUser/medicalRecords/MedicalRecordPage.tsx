import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import LabUserMedicalRecordList from "@/components/features/labUser/medicalRecords/LabUserMedicalRecordList";
import AddMedicalRecordModal from "@/components/features/admin/medicalRecords/AddMedicalRecordModal";

export default function MedicalRecordPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-[20px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Record</h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage all medical records in your system.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 btn-primary"
          >
            <Plus size={18} />
            <span>Add New Medical Record</span>
          </Button>
        </div>
      </div>

      <LabUserMedicalRecordList key={refreshKey} />

      <AddMedicalRecordModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
