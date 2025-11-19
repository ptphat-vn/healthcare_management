import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useGetVendorSupplyHistoryQuery } from "@/services/reagentApi";
import VendorSupplyStats from "./vendorSupplyHistory/VendorSupplyStats";
import VendorSupplyFilters from "@/components/ui/searchAndFilter/VendorSupplyFilters";
import VendorSupplyTable from "./vendorSupplyHistory/VendorSupplyTable";

export default function VendorSupplyHistory() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Fetch data from API
  const {
    data: supplyResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetVendorSupplyHistoryQuery({
    search: searchTerm || "",
    status: statusFilter !== "all" ? statusFilter : "",
  });

  const supplyData = supplyResponse?.data.vendorSupplies || [];
  console.log(supplyData, "logg");

  // Calculate stats from API data
  const stats = {
    total: supplyData.length,
    received: supplyData.filter((item) => item.status === "Received").length,
    pending: supplyData.filter((item) => item.status === "Pending").length,
    cancelled: supplyData.filter((item) => item.status === "Cancelled").length,
    totalQuantity: supplyData.reduce(
      (sum, item) => sum + item.quantityReceived,
      0
    ),
  };

  // Client-side date filtering
  const filteredData = supplyData.filter((item) => {
    if (dateFilter === "all") return true;

    const itemDate = new Date(item.receiptDate);
    const today = new Date();
    const daysDiff = Math.floor(
      (today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (dateFilter) {
      case "today":
        return daysDiff === 0;
      case "week":
        return daysDiff <= 7;
      case "month":
        return daysDiff <= 30;
      case "year":
        return daysDiff <= 365;
      default:
        return true;
    }
  });

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading vendor supply history...</p>
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
              "Failed to load vendor supply history. Please try again."}
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
      <VendorSupplyStats stats={stats} />

      {/* Filters and Search */}
      <VendorSupplyFilters
        searchTerm={searchTerm}
        onSearch={handleSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        dateFilter={dateFilter}
        onDateFilterChange={handleDateFilterChange}
      />

      {/* Supply Table */}
      <VendorSupplyTable data={filteredData} />
    </div>
  );
}
