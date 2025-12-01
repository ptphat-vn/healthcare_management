import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import InstrumentFilter from "./InstrumentFilter";
import type { InstrumentStatus, InstrumentMode } from "@/types/instrument.type";

type FilterProps = {
  search: string;
  status?: InstrumentStatus;
  mode?: InstrumentMode;
  sortBy: "name" | "code" | "purchaseDate" | "nextMaintenanceDate";
  sortOrder: 1 | -1;
};

describe("InstrumentFilter", () => {
  const mockOnFilterChange = vi.fn();
  const defaultFilters: FilterProps = {
    search: "",
    sortBy: "name",
    sortOrder: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderFilter = (filters = defaultFilters) => {
    return render(
      <InstrumentFilter filters={filters} onFilterChange={mockOnFilterChange} />
    );
  };

  describe("Rendering", () => {
    test("renders all filter components", () => {
      renderFilter();

      // Search input
      expect(
        screen.getByPlaceholderText("Tìm kiếm theo tên, mã, model, hãng SX...")
      ).toBeInTheDocument();

      expect(screen.getByText("Tất cả tình trạng")).toBeInTheDocument();

      expect(screen.getByText("Tất cả mode")).toBeInTheDocument();

      expect(screen.getByText("Tên thiết bị")).toBeInTheDocument();
    });

    test("renders with initial search value", () => {
      renderFilter({ ...defaultFilters, search: "test search" });
      const searchInput = screen.getByPlaceholderText(
        "Tìm kiếm theo tên, mã, model, hãng SX..."
      );
      expect(searchInput).toHaveValue("test search");
    });

    test("renders sort order button with ascending icon", () => {
      renderFilter({ ...defaultFilters, sortOrder: 1 });
      const sortButton = screen.getByRole("button", { name: "↑" });
      expect(sortButton).toBeInTheDocument();
    });

    test("renders sort order button with descending icon", () => {
      renderFilter({ ...defaultFilters, sortOrder: -1 });
      const sortButton = screen.getByRole("button", { name: "↓" });
      expect(sortButton).toBeInTheDocument();
    });

    test("does not render clear filters button when no filters are active", () => {
      renderFilter();
      expect(
        screen.queryByRole("button", { name: /Xóa bộ lọc/i })
      ).not.toBeInTheDocument();
    });

    test("renders clear filters button when search is active", () => {
      renderFilter({ ...defaultFilters, search: "test" });
      expect(
        screen.getByRole("button", { name: /Xóa bộ lọc/i })
      ).toBeInTheDocument();
    });

    test("renders clear filters button when status is active", () => {
      renderFilter({ ...defaultFilters, status: "Active" as InstrumentStatus });
      expect(
        screen.getByRole("button", { name: /Xóa bộ lọc/i })
      ).toBeInTheDocument();
    });

    test("renders clear filters button when mode is active", () => {
      renderFilter({ ...defaultFilters, mode: "ready" as InstrumentMode });
      expect(
        screen.getByRole("button", { name: /Xóa bộ lọc/i })
      ).toBeInTheDocument();
    });
  });

  describe("Search functionality", () => {
    test("calls onFilterChange when search input changes", async () => {
      const user = userEvent.setup();
      renderFilter();

      const searchInput = screen.getByPlaceholderText(
        "Tìm kiếm theo tên, mã, model, hãng SX..."
      );

      await user.type(searchInput, "analyzer");

      expect(mockOnFilterChange).toHaveBeenCalled();
      expect(mockOnFilterChange.mock.calls.length).toBe(8);

      expect(mockOnFilterChange.mock.calls[0][0]).toEqual({ search: "a" });
      expect(mockOnFilterChange.mock.calls[7][0]).toEqual({ search: "r" });
    });

    test("updates search value correctly", async () => {
      const user = userEvent.setup();
      renderFilter({ ...defaultFilters, search: "initial" });

      const searchInput = screen.getByPlaceholderText(
        "Tìm kiếm theo tên, mã, model, hãng SX..."
      );

      await user.clear(searchInput);
      await user.type(searchInput, "new search");

      expect(mockOnFilterChange).toHaveBeenCalled();
    });
  });

  describe("Sort functionality", () => {
    test("calls onFilterChange when sort order button is clicked", async () => {
      const user = userEvent.setup();
      renderFilter({ ...defaultFilters, sortOrder: 1 });

      const sortOrderButton = screen.getByRole("button", { name: "↑" });
      await user.click(sortOrderButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({ sortOrder: -1 });
    });

    test("toggles sort order from descending to ascending", async () => {
      const user = userEvent.setup();
      renderFilter({ ...defaultFilters, sortOrder: -1 });

      const sortOrderButton = screen.getByRole("button", { name: "↓" });
      await user.click(sortOrderButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({ sortOrder: 1 });
    });
  });

  describe("Clear filters", () => {
    test("calls onFilterChange with reset values when clear button is clicked", async () => {
      const user = userEvent.setup();
      renderFilter({
        ...defaultFilters,
        search: "test",
        status: "Active" as InstrumentStatus,
        mode: "ready" as InstrumentMode,
      });

      const clearButton = screen.getByRole("button", { name: /Xóa bộ lọc/i });
      await user.click(clearButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        search: "",
        status: undefined,
        mode: undefined,
        sortBy: "name",
        sortOrder: 1,
      });
    });

    test("clear button resets all filters to default", async () => {
      const user = userEvent.setup();
      renderFilter({
        ...defaultFilters,
        search: "search term",
        status: "Inactive" as InstrumentStatus,
        mode: "maintenance" as InstrumentMode,
        sortBy: "code",
        sortOrder: -1,
      });

      const clearButton = screen.getByRole("button", { name: /Xóa bộ lọc/i });
      await user.click(clearButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        search: "",
        status: undefined,
        mode: undefined,
        sortBy: "name",
        sortOrder: 1,
      });
    });
  });

  describe("Filter combinations", () => {
    test("handles multiple active filters simultaneously", () => {
      renderFilter({
        ...defaultFilters,
        search: "analyzer",
        status: "Active" as InstrumentStatus,
        mode: "ready" as InstrumentMode,
        sortBy: "purchaseDate",
        sortOrder: -1,
      });

      expect(
        screen.getByPlaceholderText("Tìm kiếm theo tên, mã, model, hãng SX...")
      ).toHaveValue("analyzer");
      expect(
        screen.getByRole("button", { name: /Xóa bộ lọc/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "↓" })).toBeInTheDocument();
    });

    test("clear button appears when any filter is active", () => {
      const { rerender } = renderFilter({ ...defaultFilters, search: "test" });
      expect(
        screen.getByRole("button", { name: /Xóa bộ lọc/i })
      ).toBeInTheDocument();

      rerender(
        <InstrumentFilter
          filters={{ ...defaultFilters, status: "Active" as InstrumentStatus }}
          onFilterChange={mockOnFilterChange}
        />
      );
      expect(
        screen.getByRole("button", { name: /Xóa bộ lọc/i })
      ).toBeInTheDocument();

      rerender(
        <InstrumentFilter
          filters={{ ...defaultFilters, mode: "ready" as InstrumentMode }}
          onFilterChange={mockOnFilterChange}
        />
      );
      expect(
        screen.getByRole("button", { name: /Xóa bộ lọc/i })
      ).toBeInTheDocument();
    });
  });
});
