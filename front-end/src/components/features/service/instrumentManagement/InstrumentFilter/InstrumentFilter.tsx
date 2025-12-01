import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, ArrowUpDown } from "lucide-react";
import type { InstrumentStatus, InstrumentMode } from "@/types/instrument.type";

interface InstrumentFilterProps {
  filters: {
    search: string;
    status?: InstrumentStatus;
    mode?: InstrumentMode;
    sortBy: "name" | "code" | "purchaseDate" | "nextMaintenanceDate";
    sortOrder: 1 | -1;
  };
  onFilterChange: (filters: Partial<InstrumentFilterProps["filters"]>) => void;
}

export default function InstrumentFilter({ filters, onFilterChange }: InstrumentFilterProps) {
  const handleClearFilters = () => {
    onFilterChange({
      search: "",
      status: undefined,
      mode: undefined,
      sortBy: "name",
      sortOrder: 1,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, mã, model, hãng SX..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onFilterChange({ status: value === "all" ? undefined : (value as InstrumentStatus) })
            }
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Tình trạng" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tình trạng</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mode Filter */}
        <div>
          <Select
            value={filters.mode || "all"}
            onValueChange={(value) =>
              onFilterChange({ mode: value === "all" ? undefined : (value as InstrumentMode) })
            }
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Mode" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mode</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              onFilterChange({
                sortBy: value as "name" | "code" | "purchaseDate" | "nextMaintenanceDate",
              })
            }
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Tên thiết bị</SelectItem>
              <SelectItem value="code">Mã thiết bị</SelectItem>
              <SelectItem value="purchaseDate">Ngày mua</SelectItem>
              <SelectItem value="nextMaintenanceDate">Ngày bảo trì kế tiếp</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              onFilterChange({ sortOrder: filters.sortOrder === 1 ? -1 : 1 })
            }
          >
            {filters.sortOrder === 1 ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Clear Filters */}
      {(filters.search || filters.status || filters.mode) && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
