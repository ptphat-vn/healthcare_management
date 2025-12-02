import { Filter, Search, X } from "lucide-react";
import Input from "../input/Input";

import { Button } from "../button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;

  status?: number | "";
  onStatusChange?: (value: number | "") => void;

  // Gender filter for medical records
  gender?: number | "";
  onGenderChange?: (value: number | "") => void;

  sortOptions?: { value: string; label: string }[];
  sortByValue?: string;
  onSortByChange?: (value: string) => void;

  sortOrder?: 1 | -1 | "";
  onSortOrderChange?: (value: 1 | -1) => void;

  filterPlaceholder?: string;
  searchPlaceholder?: string;
  onClearFilters?: () => void;
  showClearFilters?: boolean;
}

export default function SearchAndFilter({
  searchTerm,
  onSearchChange,
  status = "",
  onStatusChange,
  gender = "",
  onGenderChange,
  sortOptions = [],
  sortByValue = "",
  onSortByChange,
  sortOrder = -1,
  onSortOrderChange,
  searchPlaceholder = "Search...",
  onClearFilters,
  showClearFilters = false,
}: SearchAndFilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 items-stretch w-full">
      {/* Search box */}
      <div className="flex-1 min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) =>
              onSearchChange((e.target as HTMLInputElement).value)
            }
            className="pl-10 w-full py-2 rounded-lg border focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
      </div>

      {/* Filter group */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 items-stretch w-full sm:w-auto">
        {/* Gender filter */}
        {gender !== "" && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-5 w-5 text-blue-400" />
            <Select
              value={String(gender ?? "")}
              onValueChange={(v) =>
                onGenderChange && onGenderChange(v === "" ? "" : Number(v))
              }
            >
              <SelectTrigger className="w-full sm:w-40 rounded-lg border focus:ring-2 focus:ring-blue-200 transition">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Male</SelectItem>
                <SelectItem value="0">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status */}
        {status !== "" && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-5 w-5 text-blue-400" />
            <Select
              value={String(status ?? "")}
              onValueChange={(v) =>
                onStatusChange && onStatusChange(v === "" ? "" : Number(v))
              }
            >
              <SelectTrigger className="w-full sm:w-40 rounded-lg border focus:ring-2 focus:ring-blue-200 transition">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="0">Inactive</SelectItem>
                <SelectItem value="2">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* sortBy */}
        <div className="w-full sm:w-auto">
          <Select
            value={sortByValue ?? ""}
            onValueChange={(v) => onSortByChange && onSortByChange(v)}
          >
            <SelectTrigger className="w-full sm:w-44 rounded-lg border focus:ring-2 focus:ring-blue-200 transition">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* sortOrder */}
        <div className="w-full sm:w-auto">
          <Select
            value={String(sortOrder ?? "")}
            onValueChange={(v) =>
              onSortOrderChange &&
              onSortOrderChange(v === "" ? -1 : (Number(v) as 1 | -1))
            }
          >
            <SelectTrigger className="w-full sm:w-30 rounded-lg border focus:ring-2 focus:ring-blue-200 transition">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Increment</SelectItem>
              <SelectItem value="-1">Decrement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* clear */}
        {showClearFilters &&
          onClearFilters &&
          (searchTerm ||
            String(status) !== "" ||
            String(gender) !== "" ||
            sortByValue ||
            sortOrder) && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className=" cursor-pointer flex items-center gap-2 w-full sm:w-auto rounded-lg border text-blue-600 hover:bg-blue-50 transition"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
      </div>
    </div>
  );
}
