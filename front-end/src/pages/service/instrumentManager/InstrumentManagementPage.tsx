import { useState } from "react";
import InstrumentList from "@/components/features/service/instrumentManagement/InstrumentList";
import AddInstrumentModal from "@/components/features/service/instrumentManagement/AddInstrumentModal/AddInstrumentModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function InstrumentManagementPage() {
  const [isAddInstrumentModalOpen, setIsAddInstrumentModalOpen] =
    useState(false);

  return (
    <div className="p-6 bg-white min-h-screen rounded-[20px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Instrument Management
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Managing testing equipment in the system
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddInstrumentModalOpen(true)}
            className="flex items-center gap-2 btn-service"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Add new instrument</span>
          </Button>
          <AddInstrumentModal
            open={isAddInstrumentModalOpen}
            onOpenChange={setIsAddInstrumentModalOpen}
          />
        </div>
      </div>

      {/* Danh sách Instrument */}
      <InstrumentList />
    </div>
  );
}
