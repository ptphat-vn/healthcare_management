import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ReagentList from "@/components/features/labUser/reagent/ReagentList";
import AddReagentModal from "@/components/features/labUser/reagent/AddReagentModal";

export default function ReagentManagementPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReagentCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleReagentDeleted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-[20px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reagent Management
          </h1>
          <p className="text-gray-600">Manage all reagent in your system.</p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-lab-user"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Reagent
        </Button>
      </div>

      <ReagentList key={refreshKey} onReagentDeleted={handleReagentDeleted} />

      <AddReagentModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={handleReagentCreated}
      />
    </div>
  );
}
