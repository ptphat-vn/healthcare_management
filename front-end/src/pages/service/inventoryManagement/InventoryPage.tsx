import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, History, TruckIcon } from "lucide-react";
import ReagentInventory from "@/components/features/service/inventoryManagement/ReagentInventory";
import UsageReagentHistory from "../../../components/features/service/inventoryManagement/UsageReagentHistory";
import VendorSupplyHistory from "@/components/features/service/inventoryManagement/VendorSupplyHistory";

type InventoryPageProps = {
  initialTab?: string;
};

export default function InventoryPage({
  initialTab = "inventory",
}: InventoryPageProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  return (
    <div className="p-4 sm:p-6 lg:p-4 bg-white min-h-screen rounded-[20px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        {/* Page Header */}
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 mb-3">
            Manage reagent inventory and track usage history
          </p>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full sm:max-w-3xl h-auto sm:h-11 mb-6 gap-2 sm:gap-0 p-1 bg-gray-100">
              <TabsTrigger
                value="inventory"
                className="flex items-center justify-center gap-2 h-10 sm:h-auto text-sm sm:text-base data-[state=active]:bg-linear-to-r data-[state=active]:from-orange-600 data-[state=active]:to-amber-600 data-[state=active]:text-white transition-all rounded-md"
              >
                <Package className="w-4 h-4" />
                <span>Reagent Inventory</span>
              </TabsTrigger>

              <TabsTrigger
                value="history-vendor-supply"
                className="flex items-center justify-center gap-2 h-10 sm:h-auto text-sm sm:text-base data-[state=active]:bg-linear-to-r data-[state=active]:from-orange-600 data-[state=active]:to-amber-600 data-[state=active]:text-white transition-all rounded-md"
              >
                <TruckIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Vendor Supply History</span>
                <span className="sm:hidden">Vendor Supply</span>
              </TabsTrigger>

              <TabsTrigger
                value="history"
                className="flex items-center justify-center gap-2 h-10 sm:h-auto text-sm sm:text-base data-[state=active]:bg-linear-to-r data-[state=active]:from-orange-600 data-[state=active]:to-amber-600 data-[state=active]:text-white transition-all rounded-md"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Usage Reagent History</span>
                <span className="sm:hidden">Usage History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="mt-0">
              <ReagentInventory />
            </TabsContent>

            <TabsContent value="history-vendor-supply" className="mt-0">
              <VendorSupplyHistory />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <UsageReagentHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
