import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TestOrderList from "./TestOrderList";

const {
  mockUseGetAllTestOrderQuery,
  mockUseAuth,
  mockNavigate,
} = vi.hoisted(() => ({
  mockUseGetAllTestOrderQuery: vi.fn(),
  mockUseAuth: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock("@/services/testOrderApi", () => ({
  useGetAllTestOrderQuery: (...args: any[]) =>
    mockUseGetAllTestOrderQuery(...args),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("./EditTestOrderModal", () => ({
  __esModule: true,
  default: () => <div data-testid="edit-modal" />,
}));

vi.mock("./DeleteConfirmDialog", () => ({
  __esModule: true,
  default: () => <div data-testid="delete-modal" />,
}));

vi.mock("@/components/ui/searchAndFilter/SearchAndFilter", () => ({
  __esModule: true,
  default: ({ onSearchChange }: { onSearchChange: (value: string) => void }) => (
    <div data-testid="search-filter">
      <button type="button" onClick={() => onSearchChange("query")}>
        trigger-search
      </button>
    </div>
  ),
}));

vi.mock("@/components/ui/pagination/PaginationUI", () => ({
  __esModule: true,
  default: ({
    currentPage,
    totalPages,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div data-testid="pagination-ui">
      pagination-{currentPage}-{totalPages}
    </div>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => {
  const DropdownMenu = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  const DropdownMenuTrigger = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  const DropdownMenuContent = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  const DropdownMenuItem = ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
  return {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
  };
});

describe("TestOrderList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { data: { roleCode: "admin" } },
    });
  });

  it("renders skeleton rows while loading", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<TestOrderList />);

    expect(
      document.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByText(/No test orders found/i),
    ).not.toBeInTheDocument();
  });

  it("shows an error message when the query fails", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: "Server error",
    });

    render(<TestOrderList />);

    expect(
      screen.getByText(/Error loading test orders/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Server error/i)).toBeInTheDocument();
  });

  it("renders empty state when there are no test orders", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: [],
          pagination: { page: 1, limit: 8, total: 0, totalPages: 1 },
        },
      },
      isLoading: false,
      error: null,
    });

    render(<TestOrderList />);

    expect(screen.getByText(/No test orders found/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Try adjusting your search or filter criteria/i),
    ).toBeInTheDocument();
  });

  it("renders rows and navigates to detail when view is clicked", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: { data: { roleCode: "lab" } },
    });
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: [
            {
              _id: "order-1",
              patientName: "John Doe",
              dateOfBirth: "1990-01-01",
              gender: "male",
              address: "123 Street",
              phoneNumber: "0123456789",
              email: "john@example.com",
              status: "completed",
              createdDate: "2024-01-01T00:00:00.000Z",
              createdByUser: { fullName: "Alice Admin", email: "alice@lab.com" },
            },
          ],
          pagination: { page: 1, limit: 8, total: 1, totalPages: 1 },
        },
      },
      isLoading: false,
      error: null,
    });

    render(<TestOrderList />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /View detail/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/lab/test-order/order-1");
  });
});

