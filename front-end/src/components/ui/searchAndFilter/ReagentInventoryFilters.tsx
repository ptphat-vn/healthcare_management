import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Clock, Plus } from "lucide-react";

interface ReagentInventoryFiltersProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  expiryFilter: string;
  onExpiryFilterChange: (value: string) => void;
  onAddBatch: () => void;
}

export default function ReagentInventoryFilters({
  searchTerm,
  onSearch,
  statusFilter,
  onStatusFilterChange,
  expiryFilter,
  onExpiryFilterChange,
  onAddBatch,
}: ReagentInventoryFiltersProps) {
  return (
    <div className="bg-white rounded-lg border p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        {/* Search - Takes more space on desktop */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by reagent name or lot number..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 text-sm w-full"
            />
          </div>
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full lg:w-[180px] text-sm">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
          </SelectContent>
        </Select>

        {/* Expiry Filter */}
        <Select value={expiryFilter} onValueChange={onExpiryFilterChange}>
          <SelectTrigger className="w-full lg:w-[180px] text-sm">
            <Clock className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by expiry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="valid">Valid</SelectItem>
            <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        {/* Add Button */}
        <Button
          onClick={onAddBatch}
          className="btn-service w-full lg:w-auto text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Reagent Batch</span>
          <span className="sm:hidden">Add Batch</span>
        </Button>
      </div>
    </div>
  );
}
