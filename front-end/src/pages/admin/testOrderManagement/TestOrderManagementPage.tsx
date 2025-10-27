import { useState } from "react";
import TestOrderList from "@/components/features/admin/testOrderManagement/TestOrderList";
import AddTestOrderModal from "@/components/features/admin/testOrderManagement/AddTestOrderModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TestOrderManagementPage() {
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOrderCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOrderDeleted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-[20px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Test Order Management
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage All Test Order In Your System
          </p>
        </div>

        <div className="flex items-center gap-3 mr-4">
          <Button
            onClick={() => setIsAddOrderModalOpen(true)}
            className="flex items-center gap-2 btn-primary"
          >
            Ư
            <Plus size={18} />
            <span>Add New Test Order</span>
          </Button>
          <AddTestOrderModal
            open={isAddOrderModalOpen}
            onOpenChange={setIsAddOrderModalOpen}
            onSuccess={handleOrderCreated}
          />
        </div>
      </div>

      <TestOrderList key={refreshKey} onOrderDeleted={handleOrderDeleted} />
    </div>
  );
}
