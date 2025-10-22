import { useState } from "react";
import TestOrderList from "@/components/features/admin/testOrderManagement/TestOrderList";
import AddTestOrderModal from "@/components/features/admin/testOrderManagement/AddTestOrderModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TestOrderManagementPage() {
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Test Order Management</h1>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddOrderModalOpen(true)}
            className="flex items-center"
          >
            <Plus size={15} />
            <span className="ml-2">Test Order</span>
          </Button>

          <AddTestOrderModal
            open={isAddOrderModalOpen}
            onOpenChange={setIsAddOrderModalOpen}
          />
        </div>
      </div>

      {/* Danh sách Test Orders */}
      <TestOrderList />
    </div>
  );
}
