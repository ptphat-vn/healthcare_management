import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import MedicalRecordList from "@/components/features/admin/medicalRecords/MedicalRecordList";
import AddMedicalRecordModal from "@/components/features/admin/medicalRecords/AddMedicalRecordModal";

export default function MedicalRecordPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Medical Record</h1>
        
        {/* Search and Action Bar */}
        <div className="flex items-center gap-4 mb-6">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Action, message or operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          {/* Add Medical Record Button */}
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Medical Record
          </Button>
        </div>
      </div>

      {/* Medical Record List */}
      <MedicalRecordList searchTerm={searchTerm} />

      {/* Add Medical Record Modal */}
      <AddMedicalRecordModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => {
          alert("New medical record added successfully!");
        }}
      />
    </div>
  );
}
