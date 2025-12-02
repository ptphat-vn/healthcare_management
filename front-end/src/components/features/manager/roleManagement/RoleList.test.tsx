import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/stores/authSlice";
import { baseApi } from "@/services/baseApi";
import RoleList from "./RoleList";
import type { Roles } from "@/types/roles.type";

// Mock UI components
vi.mock("@/components/ui/alert", () => ({
  Alert: ({
    children,
    variant,
    className,
  }: {
    children?: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <div data-testid="alert" data-variant={variant} className={className}>
      {children}
    </div>
  ),
  AlertTitle: ({ children }: { children?: React.ReactNode }) => (
    <h3 data-testid="alert-title">{children}</h3>
  ),
  AlertDescription: ({ children }: { children?: React.ReactNode }) => (
    <p data-testid="alert-description">{children}</p>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    variant,
  }: {
    children?: React.ReactNode;
    variant?: string;
  }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant,
    size,
    className,
    onClick,
    "aria-label": ariaLabel,
  }: {
    children?: React.ReactNode;
    variant?: string;
    size?: string;
    className?: string;
    onClick?: () => void;
    "aria-label"?: string;
  }) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
  }: {
    children?: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({
    children,
    align,
    className,
  }: {
    children?: React.ReactNode;
    align?: string;
    className?: string;
  }) => (
    <div
      data-testid="dropdown-content"
      data-align={align}
      className={className}
    >
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <div
      data-testid="dropdown-item"
      onClick={onClick}
      className={className}
      role="menuitem"
    >
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/pagination/PaginationUI", () => ({
  default: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div data-testid="pagination">
      <button
        data-testid="prev-page"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
      >
        Prev
      </button>
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <button
        data-testid="next-page"
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
      >
        Next
      </button>
    </div>
  ),
}));

vi.mock("@/components/ui/searchAndFilter/SearchAndFilter", () => ({
  default: ({
    searchTerm,
    onSearchChange,
    sortOptions,
    sortByValue,
    sortOrder,
    onSortByChange,
    onSortOrderChange,
    onClearFilters,
  }: {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortOptions: Array<{ value: string; label: string }>;
    sortByValue: string;
    sortOrder: number | undefined;
    onSortByChange: (value: string) => void;
    onSortOrderChange: (value: string | number) => void;
    onClearFilters: () => void;
  }) => (
    <div data-testid="search-and-filter">
      <input
        data-testid="search-input"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search"
      />
      <select
        data-testid="sort-by-select"
        value={sortByValue}
        onChange={(e) => onSortByChange(e.target.value)}
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button data-testid="clear-filters" onClick={onClearFilters}>
        Clear
      </button>
    </div>
  ),
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({ children }: { children?: React.ReactNode }) => (
    <table data-testid="table">{children}</table>
  ),
  TableHeader: ({ children }: { children?: React.ReactNode }) => (
    <thead data-testid="table-header">{children}</thead>
  ),
  TableBody: ({ children }: { children?: React.ReactNode }) => (
    <tbody data-testid="table-body">{children}</tbody>
  ),
  TableRow: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => (
    <tr data-testid="table-row" className={className}>
      {children}
    </tr>
  ),
  TableHead: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => (
    <th data-testid="table-head" className={className}>
      {children}
    </th>
  ),
  TableCell: ({
    children,
    colSpan,
    className,
  }: {
    children?: React.ReactNode;
    colSpan?: number;
    className?: string;
  }) => (
    <td data-testid="table-cell" colSpan={colSpan} className={className}>
      {children}
    </td>
  ),
}));

// Mock modals
vi.mock("@/components/features/admin/roleManagement/AddRoleModal", () => ({
  default: ({
    open,
    onOpenChange,
    role,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Roles | null;
  }) => (
    <div data-testid="add-role-modal" data-open={String(open)}>
      {open && (
        <div>
          <div data-testid="edit-role-name">
            {role ? role.name : "New Role"}
          </div>
          <button onClick={() => onOpenChange(false)}>Close</button>
        </div>
      )}
    </div>
  ),
}));

vi.mock("@/components/features/admin/roleManagement/DeleteRoleModal", () => ({
  default: ({
    open,
    onOpenChange,
    role,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Roles | null;
  }) => (
    <div data-testid="delete-role-modal" data-open={String(open)}>
      {open && (
        <div>
          <div data-testid="delete-role-name">
            {role ? role.name : "No role"}
          </div>
          <button onClick={() => onOpenChange(false)}>Close</button>
        </div>
      )}
    </div>
  ),
}));

// Mock utils
vi.mock("@/utils/formatPrivilege", () => ({
  default: (priv: string) =>
    priv
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Edit: () => <span data-testid="edit-icon" />,
  MoreHorizontal: () => <span data-testid="more-horizontal-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
  X: () => <span data-testid="x-icon" />,
  Shield: () => <span data-testid="shield-icon" />,
  Inbox: () => <span data-testid="inbox-icon" />,
}));

// Mock roleApi
vi.mock("@/services/roleApi", () => ({
  useGetAllRoleQuery: vi.fn(),
  useDeleteRoleMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useCreateRoleMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useUpdateRoleMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

import { useGetAllRoleQuery } from "@/services/roleApi";

const mockUseGetAllRoleQuery = vi.mocked(useGetAllRoleQuery);

function renderWithProvider(component: React.ReactElement) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

  return render(<Provider store={store}>{component}</Provider>);
}

describe("RoleList", () => {
  const mockRoles: Roles[] = [
    {
      _id: "1",
      name: "Admin",
      code: "admin",
      description: "Administrator role with full access",
      privileges: ["user_management", "role_management", "system_config"],
      createAt: "2024-01-01T00:00:00Z",
      updateAt: "2024-01-01T00:00:00Z",
    },
    {
      _id: "2",
      name: "Manager",
      code: "manager",
      description: "Manager role with limited access",
      privileges: ["user_view", "report_view"],
      createAt: "2024-01-02T00:00:00Z",
      updateAt: "2024-01-02T00:00:00Z",
    },
    {
      _id: "3",
      name: "User",
      code: "user",
      description: "Regular user role",
      privileges: ["profile_view", "profile_edit"],
      createAt: "2024-01-03T00:00:00Z",
      updateAt: "2024-01-03T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render component with roles successfully", async () => {
    mockUseGetAllRoleQuery.mockReturnValue({
      data: {
        data: {
          role: mockRoles,
          pagination: {
            page: 1,
            limit: 8,
            total: 3,
            totalPages: 1,
          },
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllRoleQuery>);

    renderWithProvider(<RoleList />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
    // Use getAllByText since role names appear in both name and code columns
    const adminTexts = screen.getAllByText("Admin");
    expect(adminTexts.length).toBeGreaterThan(0);
    const managerTexts = screen.getAllByText("Manager");
    expect(managerTexts.length).toBeGreaterThan(0);
    const userTexts = screen.getAllByText("User");
    expect(userTexts.length).toBeGreaterThan(0);
  });

  it("should display empty state when no roles are found", async () => {
    mockUseGetAllRoleQuery.mockReturnValue({
      data: {
        data: {
          role: [],
          pagination: {
            page: 1,
            limit: 8,
            total: 0,
            totalPages: 0,
          },
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllRoleQuery>);

    renderWithProvider(<RoleList />);

    await waitFor(() => {
      expect(screen.getByText("No roles found")).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your search or filter criteria")
      ).toBeInTheDocument();
    });
  });

  it("should handle edit and delete actions", async () => {
    const user = userEvent.setup();

    mockUseGetAllRoleQuery.mockReturnValue({
      data: {
        data: {
          role: [mockRoles[0]],
          pagination: {
            page: 1,
            limit: 8,
            total: 1,
            totalPages: 1,
          },
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllRoleQuery>);

    renderWithProvider(<RoleList />);

    // Check that Admin role is rendered (appears in both name and code columns)
    const adminTexts = screen.getAllByText("Admin");
    expect(adminTexts.length).toBeGreaterThan(0);

    // Find and click the actions button (MoreHorizontal icon)
    const actionButtons = screen.getAllByTestId("more-horizontal-icon");
    expect(actionButtons.length).toBeGreaterThan(0);

    // Find edit and delete menu items
    const editItems = screen.getAllByText("Edit");
    const deleteItems = screen.getAllByText("Delete");

    expect(editItems.length).toBeGreaterThan(0);
    expect(deleteItems.length).toBeGreaterThan(0);
  });

  it("should display error message when API fails", () => {
    mockUseGetAllRoleQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Failed to load roles" },
    } as unknown as ReturnType<typeof useGetAllRoleQuery>);

    renderWithProvider(<RoleList />);

    expect(screen.getByTestId("alert")).toBeInTheDocument();
    expect(screen.getByText("Error loading roles")).toBeInTheDocument();
    expect(screen.getByText("Failed to load roles")).toBeInTheDocument();
  });
});
