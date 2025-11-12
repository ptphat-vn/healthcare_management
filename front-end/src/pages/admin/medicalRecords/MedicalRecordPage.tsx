import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MedicalRecordList from "@/components/features/admin/medicalRecords/MedicalRecordList";
import AddMedicalRecordModal from "@/components/features/admin/medicalRecords/AddMedicalRecordModal";

export default function MedicalRecordPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    // Trigger refresh by updating key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="p-6 bg-white min-h-screen rounded-[20px]">
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

      {/* Medical Record List */}
      <MedicalRecordList key={refreshKey} />

      {/* Add Medical Record Modal */}
      <AddMedicalRecordModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
