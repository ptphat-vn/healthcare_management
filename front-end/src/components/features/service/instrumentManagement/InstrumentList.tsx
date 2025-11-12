import { useState } from "react";
import type { InstrumentStatus } from "@/types/instrument.type";
import InstrumentTable from "./InstrumentTable";
import SearchAndFilter from "@/components/ui/searchAndFilter/SearchAndFilter";
import { Loader2 } from "lucide-react";
import { useGetAllInstrumentsQuery } from "@/services/instrumentApi";

export default function InstrumentList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InstrumentStatus | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "updatedAt">(
    "updatedAt"
  );
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch instruments from API
  const { data, isLoading, isFetching } = useGetAllInstrumentsQuery({
    search,
    status,
    isActive,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  const instruments = data?.data?.instruments || [];
  const pagination = data?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus(undefined);
    setIsActive(undefined);
    setSortBy("updatedAt");
    setSortOrder(-1);
    setPage(1);
  };

  // Convert status to number for SearchAndFilter
  const statusValue =
    status === "Active"
      ? 1
      : status === "Maintenance"
      ? 2
      : status === "Inactive"
      ? 0
      : status === "Out of Service"
      ? 3
      : "";

  const isActiveValue = isActive === true ? 1 : isActive === false ? 0 : "";

  const handleStatusChange = (value: number | "") => {
    setStatus(
      value === 1
        ? "Active"
        : value === 2
        ? "Maintenance"
        : value === 0
        ? "Inactive"
        : value === 3
        ? "Out of Service"
        : undefined
    );
    setPage(1);
  };

  const handleIsActiveChange = (value: number | "") => {
    setIsActive(value === 1 ? true : value === 0 ? false : undefined);
    setPage(1);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
        <SearchAndFilter
          searchTerm={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search by name, model, manufacturer..."
          // Status filter
          status={statusValue}
          onStatusChange={handleStatusChange}
          statusOptions={[
            { value: "", label: "All status" },
            { value: "1", label: "Active" },
            { value: "2", label: "Maintenance" },
            { value: "0", label: "Inactive" },
            { value: "3", label: "Out of Service" },
          ]}
          // Custom filter (isActive)
          customFilter={isActiveValue}
          onCustomFilterChange={handleIsActiveChange}
          customFilterPlaceholder="Active state"
          customFilterOptions={[
            { value: "", label: "All states" },
            { value: "1", label: "Active" },
            { value: "0", label: "Inactive" },
          ]}
          // Sort options
          sortOptions={[
            { value: "name", label: "Name" },
            { value: "createdAt", label: "Created" },
            { value: "updatedAt", label: "Updated" },
          ]}
          sortByValue={sortBy}
          onSortByChange={(value) => {
            setSortBy(value as "name" | "createdAt" | "updatedAt");
            setPage(1);
          }}
          sortOrder={sortOrder}
          onSortOrderChange={(value) => {
            setSortOrder(value);
            setPage(1);
          }}
          // Clear filters
          showClearFilters={true}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Loading state */}
      {isLoading || isFetching ? (
        <div className="flex justify-center items-center py-8 sm:py-12 bg-white rounded-lg">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-sm sm:text-base text-gray-600">
            Loading instruments...
          </span>
        </div>
      ) : (
        <InstrumentTable
          instruments={instruments}
          pagination={pagination}
          onPageChange={handlePageChange}
          onDelete={() => {}}
          onUpdate={() => {}}
          onAdd={() => {}}
        />
      )}
    </div>
  );
}
