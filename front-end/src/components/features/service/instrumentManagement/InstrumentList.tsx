import { useState, useMemo } from "react";
import { fakeInstruments } from "@/data/instrumentData";
import type { Instrument, InstrumentStatus, InstrumentMode } from "@/types/instrument.type";
import InstrumentTable from "./InstrumentTable";
import SearchAndFilter from "@/components/ui/searchAndFilter/SearchAndFilter";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function InstrumentList() {
  const [instruments, setInstruments] = useState<Instrument[]>(fakeInstruments);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InstrumentStatus | undefined>(undefined);
  const [mode, setMode] = useState<InstrumentMode | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"name" | "code" | "purchaseDate" | "nextMaintenanceDate">("name");
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);
  const limit = 8;

  // Filter and sort instruments
  const filteredInstruments = useMemo(() => {
    let result = [...instruments];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (inst) =>
          inst.name.toLowerCase().includes(searchLower) ||
          inst.code.toLowerCase().includes(searchLower) ||
          inst.model.toLowerCase().includes(searchLower) ||
          inst.manufacturer.toLowerCase().includes(searchLower) ||
          inst.responsiblePerson?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (status) {
      result = result.filter((inst) => inst.status === status);
    }

    // Mode filter
    if (mode) {
      result = result.filter((inst) => inst.mode === mode);
    }

    // Sort
    result.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === "purchaseDate" || sortBy === "nextMaintenanceDate") {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      } else {
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 1 ? -1 : 1;
      if (aValue > bValue) return sortOrder === 1 ? 1 : -1;
      return 0;
    });

    return result;
  }, [instruments, search, status, mode, sortBy, sortOrder]);

  // Pagination
  const totalItems = filteredInstruments.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedInstruments = filteredInstruments.slice(startIndex, endIndex);

  const pagination = {
    page,
    limit,
    total: totalItems,
    totalPages,
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus(undefined);
    setMode(undefined);
    setSortBy("name");
    setSortOrder(-1);
    setPage(1);
  };

  const handleDelete = (id: string) => {
    setInstruments((prev) => prev.filter((inst) => inst._id !== id));
  };

  const handleUpdate = (updatedInstrument: Instrument) => {
    setInstruments((prev) =>
      prev.map((inst) => (inst._id === updatedInstrument._id ? updatedInstrument : inst))
    );
  };

  const handleAdd = (newInstrument: Instrument) => {
    setInstruments((prev) => [newInstrument, ...prev]);
  };

  // Custom status/mode mapping for SearchAndFilter
  const statusValue = status === "active" ? "1" : status === "maintenance" ? "2" : status === "inactive" ? "0" : "";
  const modeValue = mode === "ready" ? "1" : mode === "maintenance" ? "2" : mode === "inactive" ? "0" : "";

  const handleStatusChange = (value: number | "") => {
    setStatus(value === 1 ? "active" : value === 2 ? "maintenance" : value === 0 ? "inactive" : undefined);
    setPage(1);
  };

  const handleModeChange = (value: number | "") => {
    setMode(value === 1 ? "ready" : value === 2 ? "maintenance" : value === 0 ? "inactive" : undefined);
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
              searchPlaceholder="Search by name, code, model, manufacturer..."
              sortOptions={[
                { value: "name", label: "Instrument name" },
                { value: "code", label: "Instrument code" },
                { value: "purchaseDate", label: "Purchase date" },
                { value: "nextMaintenanceDate", label: "Next maintenance" },
              ]}
              sortByValue={sortBy}
              onSortByChange={(value) => {
                setSortBy(value as "name" | "code" | "purchaseDate" | "nextMaintenanceDate");
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

          {/* Additional filters for Status and Mode */}
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
              </select>
            </div>
            <div className="w-full sm:w-40">
              <select
                value={modeValue}
                onChange={(e) => handleModeChange(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 transition"
              >
                <option value="">All modes</option>
                <option value="1">Ready</option>
                <option value="2">Maintenance</option>
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

      <InstrumentTable
        instruments={paginatedInstruments}
        pagination={pagination}
        onPageChange={handlePageChange}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        onAdd={handleAdd}
      />
    </div>
  );
}
