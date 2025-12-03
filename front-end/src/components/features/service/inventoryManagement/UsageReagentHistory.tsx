import { useState, type JSX } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Package, Beaker, Loader2, AlertCircle, XCircle } from "lucide-react";
import PaginationUI from "@/components/ui/pagination/PaginationUI";
import { useGetUsageReagentHistoryQuery } from "@/services/reagentApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UsageReagentHistoryFilters from "@/components/ui/searchAndFilter/UsageReagentHistoryFilters";
import UsageReagentHistoryTable from "./usageHistoryReagent/UsageReagentHistoryTable";
import StatsCards from "./usageHistoryReagent/StatsCards";
import { formatDate } from "@/utils/formatDate";

export default function UsageReagentHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<
    "Used" | "Consumed" | "Wasted" | "Expired" | "Returned"
  >("Used");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: historyResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUsageReagentHistoryQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    action: actionFilter,
  });

  const historyData = historyResponse?.data.usageHistory || [];
  const totalPages = Math.ceil(
    (historyResponse?.data.pagination?.total || 0) / itemsPerPage
  );

  // config action
  const getActionBadge = (action: string) => {
    const actionConfig: Record<
      string,
      { label: string; className: string; icon: JSX.Element }
    > = {
      Used: {
        label: "Used",
        className: "bg-blue-100 text-blue-800 border-blue-300",
        icon: <Package className="w-3 h-3" />,
      },
      Consumed: {
        label: "Consumed",
        className: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: <Package className="w-3 h-3" />,
      },
      Wasted: {
        label: "Wasted",
        className: "bg-red-100 text-red-800 border-red-300",
        icon: <AlertCircle className="w-3 h-3" />,
      },
      Expired: {
        label: "Expired",
        className: "bg-gray-100 text-gray-800 border-gray-300",
        icon: <XCircle className="w-3 h-3" />,
      },
      Returned: {
        label: "Returned",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: <Beaker className="w-3 h-3" />,
      },
    };

    const config = actionConfig[action] || actionConfig.Used;
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // tinh toan so luong action
  const stats = {
    total: historyData.length,
    used: historyData.filter((item) => item.action === "Used").length,
    consumed: historyData.filter((item) => item.action === "Consumed").length,
    wasted: historyData.filter((item) => item.action === "Wasted").length,
    expired: historyData.filter((item) => item.action === "Expired").length,
    returned: historyData.filter((item) => item.action === "Returned").length,
  };

  // ham filter theo ngay thang nam
  const filteredData = historyData.filter((item) => {
    if (dateFilter === "all") return true;

    const itemDate = new Date(item.performedAt);
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

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleActionFilterChange = (value: string) => {
    setActionFilter(
      value as "Used" | "Consumed" | "Wasted" | "Expired" | "Returned"
    );
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading usage history...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(error as { data?: { message?: string } })?.data?.message ||
              "Failed to load usage history. Please try again."}
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
      <StatsCards
        stats={stats}
        totalUsage={historyResponse?.data.pagination?.total || 0}
      />

      <UsageReagentHistoryFilters
        searchTerm={searchTerm}
        onSearch={handleSearch}
        actionFilter={actionFilter}
        onActionFilterChange={handleActionFilterChange}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        // onExport={handleExport}
      />

      <UsageReagentHistoryTable
        data={filteredData}
        getActionBadge={getActionBadge}
        formatDateTime={formatDate}
      />

      {totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationUI
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
