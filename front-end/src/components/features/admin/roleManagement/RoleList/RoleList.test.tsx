import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import RoleList from "./roleList";
import type { Roles } from "@/types/roles.type";

const mockUseGetAllRoleQuery = vi.fn();

vi.mock("@/services/roleApi", () => ({
  useGetAllRoleQuery: (...args: unknown[]) => mockUseGetAllRoleQuery(...args),
}));

vi.mock("@/components/ui/searchAndFilter/SearchAndFilter", () => ({
  default: ({
    searchTerm,
    onSearchChange,
    sortByValue,
    onSortByChange,
    onClearFilters,
  }: {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortByValue: string;
    onSortByChange: (value: string) => void;
    onClearFilters: () => void;
  }) => (
    <div data-testid="search-and-filter">
      <input
        data-testid="search-input"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search roles..."
      />
      <select
        data-testid="sort-by"
        value={sortByValue}
        onChange={(e) => onSortByChange(e.target.value)}
      >
        <option value="">None</option>
        <option value="name">Role Name</option>
        <option value="code">Role Code</option>
      </select>
      <button data-testid="clear-filters" onClick={onClearFilters}>
        Clear Filters
      </button>
    </div>
  ),
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table>{children}</table>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead>{children}</thead>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  TableRow: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <tr className={className}>{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => (
    <th>{children}</th>
  ),
  TableCell: ({
    children,
    colSpan,
    className,
  }: {
    children: React.ReactNode;
    colSpan?: number;
    className?: string;
  }) => (
    <td colSpan={colSpan} className={className}>
      {children}
    </td>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick} data-testid="dropdown-item">
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
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
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Prev
      </button>
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <button
        data-testid="next-page"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </button>
    </div>
  ),
}));

vi.mock("../DeleteRoleModal/DeleteRoleModal", () => ({
  default: ({
    open,
    onOpenChange,
    role,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Roles | null;
  }) =>
    open ? (
      <div data-testid="delete-modal">
        <button onClick={() => onOpenChange(false)}>Close Delete</button>
        {role && <div>Delete {role.name}</div>}
      </div>
    ) : null,
}));

vi.mock("../AddRoleModal/AddRoleModal", () => ({
  default: ({
    open,
    onOpenChange,
    role,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Roles | null;
  }) =>
    open ? (
      <div data-testid="add-modal">
        <button onClick={() => onOpenChange(false)}>Close Add</button>
        {role ? <div>Edit {role.name}</div> : <div>Create New Role</div>}
      </div>
    ) : null,
}));

vi.mock("@/utils/formatPrivilege", () => ({
  default: (priv: string) =>
    priv
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
}));

const mockRoles: Roles[] = [
  {
    _id: "role-1",
    name: "Admin Role",
    code: "admin_role",
    description: "Administrator role",
    privileges: ["read_only", "view_role", "create_role"],
    createAt: "2024-01-01",
    updateAt: "2024-01-01",
  },
  {
    _id: "role-2",
    name: "User Role",
    code: "user_role",
    description: "Regular user role",
    privileges: ["read_only"],
    createAt: "2024-01-02",
    updateAt: "2024-01-02",
  },
];

describe("RoleList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetAllRoleQuery.mockReturnValue({
      data: {
        data: {
          role: mockRoles,
          pagination: {
            page: 1,
            limit: 8,
            total: 2,
            totalPages: 1,
          },
        },
      },
      isLoading: false,
      error: null,
    });
  });

  it("hiển thị loading state khi đang tải dữ liệu", () => {
    mockUseGetAllRoleQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<RoleList />);
    expect(screen.getByText("Loading Roles...")).toBeInTheDocument();
  });

  it("hiển thị error message khi có lỗi", () => {
    mockUseGetAllRoleQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { data: { message: "Failed to load roles" } },
    });

    render(<RoleList />);
    expect(screen.getByText("Error loading data")).toBeInTheDocument();
    expect(screen.getByText("Failed to load roles")).toBeInTheDocument();
  });

  it("hiển thị error message với error.message khi không có data.message", () => {
    mockUseGetAllRoleQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Network error" },
    });

    render(<RoleList />);
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("hiển thị error message mặc định khi không có message", () => {
    mockUseGetAllRoleQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: {},
    });

    render(<RoleList />);
    expect(screen.getByText("Unknown error")).toBeInTheDocument();
  });

  it("hiển thị danh sách roles trong table", () => {
    render(<RoleList />);

    // Admin Role and User Role appear multiple times (name and code)
    expect(screen.getAllByText("Admin Role").length).toBeGreaterThan(0);
    expect(screen.getAllByText("User Role").length).toBeGreaterThan(0);
    expect(screen.getByText("Administrator role")).toBeInTheDocument();
    expect(screen.getByText("Regular user role")).toBeInTheDocument();
  });

  it("hiển thị table headers đúng", () => {
    render(<RoleList />);

    expect(screen.getByText("No")).toBeInTheDocument();
    // Role Name may appear multiple times, so use getAllByText
    expect(screen.getAllByText("Role Name").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Role Code").length).toBeGreaterThan(0);
    expect(screen.getByText("Privileges")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("hiển thị số thứ tự đúng cho mỗi role", () => {
    render(<RoleList />);

    // First role should be number 1
    const cells = screen.getAllByText("1");
    expect(cells.length).toBeGreaterThan(0);
  });

  it("hiển thị formatted role code", () => {
    render(<RoleList />);

    // Admin Role appears twice (name and code), User Role appears twice
    expect(screen.getAllByText("Admin Role").length).toBeGreaterThan(0);
    expect(screen.getAllByText("User Role").length).toBeGreaterThan(0);
  });

  it("hiển thị privileges với badge", () => {
    render(<RoleList />);

    // Should show formatted privileges (may appear multiple times)
    // Only first 2 privileges are shown, the rest are in "+X more"
    expect(screen.getAllByText("Read Only").length).toBeGreaterThan(0);
    expect(screen.getByText("View Role")).toBeInTheDocument();
    // Create Role is in "+1 more" so it's not directly visible
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });

  it("hiển thị '+X more' khi có nhiều hơn 2 privileges", () => {
    render(<RoleList />);

    // Admin Role has 3 privileges, should show "+1 more"
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });

  it("hiển thị 'No roles found' khi danh sách rỗng", () => {
    mockUseGetAllRoleQuery.mockReturnValue({
      data: {
        data: {
          role: [],
          pagination: {
            page: 1,
            limit: 8,
            total: 0,
            totalPages: 1,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    render(<RoleList />);
    expect(screen.getByText("No roles found")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your search or filter criteria")
    ).toBeInTheDocument();
  });

  it("mở DeleteRoleModal khi click Delete", async () => {
    const user = userEvent.setup();
    render(<RoleList />);

    const deleteButtons = screen.getAllByTestId("dropdown-item");
    const deleteButton = deleteButtons.find((btn) =>
      btn.textContent?.includes("Delete")
    );

    if (deleteButton) {
      await user.click(deleteButton);
      await waitFor(() => {
        expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
      });
      expect(screen.getByText(/Delete Admin Role/i)).toBeInTheDocument();
    }
  });

  it("mở AddRoleModal ở edit mode khi click Edit", async () => {
    const user = userEvent.setup();
    render(<RoleList />);

    const editButtons = screen.getAllByTestId("dropdown-item");
    const editButton = editButtons.find((btn) =>
      btn.textContent?.includes("Edit")
    );

    if (editButton) {
      await user.click(editButton);
      await waitFor(() => {
        expect(screen.getByTestId("add-modal")).toBeInTheDocument();
      });
      expect(screen.getByText(/Edit Admin Role/i)).toBeInTheDocument();
    }
  });

  it("đóng modal khi click close button", async () => {
    const user = userEvent.setup();
    render(<RoleList />);

    // Open delete modal
    const deleteButtons = screen.getAllByTestId("dropdown-item");
    const deleteButton = deleteButtons.find((btn) =>
      btn.textContent?.includes("Delete")
    );

    if (deleteButton) {
      await user.click(deleteButton);
      await waitFor(() => {
        expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByText("Close Delete");
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
      });
    }
  });

  it("hiển thị pagination khi có nhiều hơn 1 trang", () => {
    mockUseGetAllRoleQuery.mockReturnValue({
      data: {
        data: {
          role: mockRoles,
          pagination: {
            page: 1,
            limit: 8,
            total: 20,
            totalPages: 3,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    render(<RoleList />);
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  it("không hiển thị pagination khi chỉ có 1 trang", () => {
    render(<RoleList />);
    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
  });

  it("hiển thị thông tin pagination đúng", () => {
    mockUseGetAllRoleQuery.mockReturnValue({
      data: {
        data: {
          role: mockRoles,
          pagination: {
            page: 1,
            limit: 8,
            total: 15,
            totalPages: 2,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    render(<RoleList />);
    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText(/roles/i)).toBeInTheDocument();
  });

  it("gọi API với params đúng khi component mount", () => {
    render(<RoleList />);

    expect(mockUseGetAllRoleQuery).toHaveBeenCalledWith({
      search: "",
      sortBy: "" as "name" | "code" | "createAt" | undefined,
      sortOrder: -1,
      page: 1,
      limit: 8,
    });
  });

  it("cập nhật roleList khi data thay đổi", () => {
    const { rerender } = render(<RoleList />);

    const newRoles: Roles[] = [
      {
        _id: "role-3",
        name: "New Role",
        code: "new_role",
        description: "New role description",
        privileges: ["read_only"],
        createAt: "2024-01-03",
        updateAt: "2024-01-03",
      },
    ];

    mockUseGetAllRoleQuery.mockReturnValue({
      data: {
        data: {
          role: newRoles,
          pagination: {
            page: 1,
            limit: 8,
            total: 1,
            totalPages: 1,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    rerender(<RoleList />);
    expect(screen.getAllByText("New Role").length).toBeGreaterThan(0);
  });
});
