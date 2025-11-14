import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useGetReagentInventoryFIFOQuery } from "@/services/reagentApi";
import ReagentInventoryStats from "./reagentInventory/ReagentInventoryStats";

import ReagentInventoryTable from "./reagentInventory/ReagentInventoryTable";
import AddReagentModal from "./reagentInventory/AddReagentModal";
import ReagentInventoryFilters from "@/components/ui/searchAndFilter/ReagentInventoryFilters";
import PaginationUI from "@/components/ui/pagination/PaginationUI";
// import PaginationUI from "@/components/ui/pagination/PaginationUI";

export default function ReagentInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expiryFilter, setExpiryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Fetch data from API with correct params
  const {
    data: inventoryResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetReagentInventoryFIFOQuery({
    page: currentPage,
    limit: itemsPerPage,
    reagentName: searchTerm || undefined,
    includeExpired:
      expiryFilter === "expired"
        ? true
        : expiryFilter === "valid"
        ? false
        : undefined,
    includeExpiringSoon: expiryFilter === "expiring_soon" ? true : undefined,
  });

  const inventoryData = inventoryResponse?.data.inventory || [];
  console.log(inventoryData);

  const totalPages = Math.ceil(
    (inventoryResponse?.data.pagination?.total || 0) / itemsPerPage
  );

  // Calculate stats from API data
  const stats = {
    total: inventoryResponse?.data.pagination?.total || 0,
    inStock:
      inventoryData.filter(
        (item) =>
          item.quantityAvailable > 20 && !item.isExpired && !item.isExpiringSoon
      ).length || 0,
    lowStock:
      inventoryData.filter(
        (item) =>
          item.quantityAvailable > 0 &&
          item.quantityAvailable < 20 &&
          !item.isExpired
      ).length || 0,
    outOfStock:
      inventoryData.filter(
        (item) => item.quantityAvailable === 0 || item.isExpired
      ).length || 0,
    expiringSoon:
      inventoryData.filter((item) => item.isExpiringSoon).length || 0,
  };

  // Client-side status filtering (since API doesn't have status filter)
  const filteredData = inventoryData.filter((item) => {
    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "in_stock") {
        if (
          !(
            item.quantityAvailable > 20 &&
            !item.isExpired &&
            !item.isExpiringSoon
          )
        ) {
          return false;
        }
      } else if (statusFilter === "low_stock") {
        if (
          !(
            item.quantityAvailable > 0 &&
            item.quantityAvailable < 20 &&
            !item.isExpired
          )
        ) {
          return false;
        }
      } else if (statusFilter === "out_of_stock") {
        if (!(item.quantityAvailable === 0 || item.isExpired)) {
          return false;
        }
      } else if (statusFilter === "expiring_soon") {
        if (!item.isExpiringSoon) {
          return false;
        }
      }
    }

    return true;
  });

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleExpiryFilterChange = (value: string) => {
    setExpiryFilter(value);
    setCurrentPage(1);
  };

  // Handle export
  // const handleExport = () => {
  //   // TODO: Implement export functionality
  //   console.log("Exporting inventory data...");
  // };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(error as any)?.data?.message ||
              "Failed to load inventory. Please try again."}
          </AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <ReagentInventoryStats stats={stats} />

      {/* Filters and Search */}
      <ReagentInventoryFilters
        searchTerm={searchTerm}
        onSearch={handleSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        expiryFilter={expiryFilter}
        onExpiryFilterChange={handleExpiryFilterChange}
        // onExport={handleExport}
        onAddBatch={() => setIsAddModalOpen(true)}
      />

      {/* Inventory Table */}
      <ReagentInventoryTable data={filteredData} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationUI
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add Reagent Modal */}
      <AddReagentModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refetch();
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}
