import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Calendar } from "lucide-react";
// import { Button } from "@/components/ui/button";

interface UsageReagentHistoryFiltersProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  actionFilter: string;
  onActionFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  // onExport: () => void;
}

export default function UsageReagentHistoryFilters({
  searchTerm,
  onSearch,
  actionFilter,
  onActionFilterChange,
  dateFilter,
  onDateFilterChange,
}: // onExport,
UsageReagentHistoryFiltersProps) {
  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by reagent, lot number, or user..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={actionFilter} onValueChange={onActionFilterChange}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="Used">Used</SelectItem>
            <SelectItem value="Consumed">Consumed</SelectItem>
            <SelectItem value="Wasted">Wasted</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
            <SelectItem value="Returned">Returned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
        {/* <Button variant="outline" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button> */}
      </div>
    </div>
  );
}
