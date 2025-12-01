import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/stores/authSlice";
import { baseApi } from "@/services/baseApi";
import UserList from "./UserList";
import type { User } from "@/types/user.type";

// Mock dependencies
vi.mock("@/services/userApi", () => ({
  useGetAllUserQuery: vi.fn(),
  useDeleteUserMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useUpdateUserMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

// Mock roleApi for EditUserForm
vi.mock("@/services/roleApi", () => ({
  useGetAllRoleQuery: vi.fn(() => ({
    data: {
      data: {
        role: [],
      },
    },
    isLoading: false,
    error: undefined,
  })),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    user: {
      data: {
        roleCode: "admin",
      },
    },
  })),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

// Mock dropdown menu - always show content for testing
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
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

vi.mock(
  "@/components/features/admin/userManagement/EditUser/EditUserModal/EditUserModal",
  () => ({
    default: ({
      open,
      user,
    }: {
      open: boolean;
      user: User | null;
      onOpenChange: (open: boolean) => void;
    }) => {
      if (!open || !user) return null;
      return (
        <div data-testid="edit-user-modal">
          <div>Edit User: {user.fullName}</div>
        </div>
      );
    },
  })
);

vi.mock(
  "@/components/features/admin/userManagement/DeleteUserModal/DeleteUserModal",
  () => ({
    default: ({
      open,
      user,
    }: {
      open: boolean;
      user: User | null;
      onOpenChange: (open: boolean) => void;
    }) => {
      if (!open || !user) return null;
      return (
        <div data-testid="delete-user-modal">
          <div>Delete User: {user.fullName}</div>
        </div>
      );
    },
  })
);

vi.mock("@/components/ui/searchAndFilter/SearchAndFilter", () => ({
  default: ({
    searchTerm,
    onSearchChange,
    status,
    onStatusChange,
    onClearFilters,
  }: {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    status: number | "";
    onStatusChange: (value: number) => void;
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
        data-testid="status-select"
        value={status}
        onChange={(e) => onStatusChange(Number(e.target.value))}
      >
        <option value={1}>Active</option>
        <option value={0}>Inactive</option>
        <option value={2}>Blocked</option>
      </select>
      <button data-testid="clear-filters" onClick={onClearFilters}>
        Clear
      </button>
    </div>
  ),
}));

vi.mock("@/utils/formatDate", () => ({
  formatDate: (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useGetAllUserQuery } from "@/services/userApi";

const mockUseGetAllUserQuery = vi.mocked(useGetAllUserQuery);

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

describe("UserList", () => {
  const mockUsers: User[] = [
    {
      _id: "1",
      fullName: "John Doe",
      email: "john@example.com",
      phoneNumber: "1234567890",
      identifyNumber: "123456789",
      gender: "male",
      dateOfBirth: "1990-01-15",
      roleName: "Admin",
      status: 1,
    } as User,
    {
      _id: "2",
      fullName: "Jane Smith",
      email: "jane@example.com",
      phoneNumber: "0987654321",
      identifyNumber: "987654321",
      gender: "female",
      dateOfBirth: "1992-05-20",
      roleName: "User",
      status: 0,
    } as User,
  ];

  const mockPagination = {
    page: 1,
    limit: 8,
    total: 20,
    totalPages: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render user list with data correctly", async () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
          pagination: mockPagination,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    renderWithProvider(<UserList />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
      // Active and Inactive appear in both select and status badges
      const activeElements = screen.getAllByText("Active");
      expect(activeElements.length).toBeGreaterThan(0);
      const inactiveElements = screen.getAllByText("Inactive");
      expect(inactiveElements.length).toBeGreaterThan(0);
    });

    // Verify table headers
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("Full name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("should display loading skeletons when isLoading is true", () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    const { container } = render(<UserList />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(8);
  });

  it("should display error message when there is an error", () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Failed to load users" },
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    renderWithProvider(<UserList />);

    expect(screen.getByText("Error loading users")).toBeInTheDocument();
    expect(screen.getByText("Failed to load users")).toBeInTheDocument();
  });

  it("should display empty state when no users are found", async () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: [],
          pagination: mockPagination,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    renderWithProvider(<UserList />);

    await waitFor(() => {
      expect(screen.getByText("No users found")).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your search or filter criteria")
      ).toBeInTheDocument();
    });
  });

  it("should call useGetAllUserQuery with correct parameters", () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
          pagination: mockPagination,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    renderWithProvider(<UserList />);

    expect(mockUseGetAllUserQuery).toHaveBeenCalledWith({
      page: 1,
      limit: 8,
      search: "",
      sortBy: undefined,
      sortOrder: -1,
      status: 1,
    });
  });

  it("should open edit modal when edit button is clicked", async () => {
    const user = userEvent.setup();

    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
          pagination: mockPagination,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    renderWithProvider(<UserList />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Find the Edit button in the dropdown menu
    const editButtons = screen.getAllByText("Edit");
    expect(editButtons.length).toBeGreaterThan(0);

    // Click the first Edit button
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("edit-user-modal")).toBeInTheDocument();
      expect(screen.getByText("Edit User: John Doe")).toBeInTheDocument();
    });
  });

  it("should open delete modal when delete button is clicked", async () => {
    const user = userEvent.setup();

    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
          pagination: mockPagination,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    renderWithProvider(<UserList />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Find the Delete button in the dropdown menu
    const deleteButtons = screen.getAllByText("Delete");
    expect(deleteButtons.length).toBeGreaterThan(0);

    // Click the first Delete button
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("delete-user-modal")).toBeInTheDocument();
      expect(screen.getByText("Delete User: John Doe")).toBeInTheDocument();
    });
  });

  it("should display pagination information correctly", async () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
          pagination: mockPagination,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    renderWithProvider(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      // Numbers appear multiple times, use getAllByText
      const ones = screen.getAllByText("1");
      expect(ones.length).toBeGreaterThan(0);
      const eights = screen.getAllByText("8");
      expect(eights.length).toBeGreaterThan(0);
      const twenties = screen.getAllByText("20");
      expect(twenties.length).toBeGreaterThan(0);
      expect(screen.getByText(/users/)).toBeInTheDocument();
    });
  });

  it("should format gender correctly", async () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
          pagination: mockPagination,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    renderWithProvider(<UserList />);

    await waitFor(() => {
      expect(screen.getByText("Male")).toBeInTheDocument();
      expect(screen.getByText("Female")).toBeInTheDocument();
    });
  });

  it("should display correct status badges", async () => {
    const usersWithDifferentStatus: User[] = [
      {
        ...mockUsers[0],
        status: 0, // Inactive
      },
      {
        ...mockUsers[1],
        status: 1, // Active
      },
      {
        ...mockUsers[0],
        _id: "3",
        status: 2, // Blocked
      } as User,
    ];

    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: usersWithDifferentStatus,
          pagination: mockPagination,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    renderWithProvider(<UserList />);

    await waitFor(() => {
      // Status badges appear in table, and also in select options
      const inactiveElements = screen.getAllByText("Inactive");
      expect(inactiveElements.length).toBeGreaterThan(0);
      const activeElements = screen.getAllByText("Active");
      expect(activeElements.length).toBeGreaterThan(0);
      const blockedElements = screen.getAllByText("Blocked");
      expect(blockedElements.length).toBeGreaterThan(0);
    });
  });
});
