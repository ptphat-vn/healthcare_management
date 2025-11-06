import { useState } from "react";
import type { InstrumentStatus } from "@/types/instrument.type";
import InstrumentTable from "./InstrumentTable";
import SearchAndFilter from "@/components/ui/searchAndFilter/SearchAndFilter";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { useGetAllInstrumentsQuery } from "@/services/instrumentApi";

export default function InstrumentList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InstrumentStatus | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "updatedAt">("updatedAt");
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

  // Custom status mapping for SearchAndFilter
  const statusValue = 
    status === "Active" ? "1" 
    : status === "Maintenance" ? "2" 
    : status === "Inactive" ? "0"
    : status === "Out of Service" ? "3"
    : "";

  const isActiveValue = isActive === true ? "1" : isActive === false ? "0" : "";

  const handleStatusChange = (value: number | "") => {
    setStatus(
      value === 1 ? "Active" 
      : value === 2 ? "Maintenance" 
      : value === 0 ? "Inactive"
      : value === 3 ? "Out of Service"
      : undefined
    );
    setPage(1);
  };

  const handleIsActiveChange = (value: number | "") => {
    setIsActive(value === 1 ? true : value === 0 ? false : undefined);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search and main filters */}
          <div className="flex-1">
            <SearchAndFilter
              searchTerm={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              searchPlaceholder="Search by name, model, manufacturer..."
              sortOptions={[
                { value: "name", label: "Instrument name" },
                { value: "createdAt", label: "Created date" },
                { value: "updatedAt", label: "Updated date" },
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
              showClearFilters={false}
            />
          </div>

          {/* Additional filters for Status and IsActive */}
          <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
            <div className="w-full sm:w-40">
              <select
                value={statusValue}
                onChange={(e) => handleStatusChange(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 transition"
              >
                <option value="">All status</option>
                <option value="1">Active</option>
                <option value="2">Maintenance</option>
                <option value="0">Inactive</option>
                <option value="3">Out of Service</option>
              </select>
            </div>
            <div className="w-full sm:w-40">
              <select
                value={isActiveValue}
                onChange={(e) => handleIsActiveChange(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 transition"
              >
                <option value="">All active states</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
            
            {/* Clear Filters Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="cursor-pointer flex items-center gap-2 w-full sm:w-auto rounded-lg border text-blue-600 hover:bg-blue-50 transition"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading || isFetching ? (
        <div className="flex justify-center items-center py-12 bg-white rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading instruments...</span>
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
