import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/stores/authSlice";
import { baseApi } from "@/services/baseApi";
import RoleManagementPage from "./RoleManagementPage";

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button data-testid="button" onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Plus: ({ size }: { size?: number }) => (
    <span data-testid="plus-icon" data-size={String(size)} />
  ),
  Shield: () => <span data-testid="shield-icon" />,
  X: () => <span data-testid="x-icon" />,
}));

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    user: {
      data: {
        roleCode: "admin",
      },
    },
  })),
}));

// Mock roleApi for RoleList
vi.mock("@/services/roleApi", () => ({
  useGetAllRoleQuery: vi.fn(() => ({
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
  })),
  useDeleteRoleMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useCreateRoleMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useUpdateRoleMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

// Mock AddRoleModal
vi.mock(
  "@/components/features/admin/roleManagement/AddRoleModal/AddRoleModal",
  () => ({
    default: ({
      open,
      onOpenChange,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }) => (
      <div data-testid="add-role-modal" data-open={String(open)}>
        {open && (
          <div>
            <div>Add Role Modal</div>
            <button onClick={() => onOpenChange(false)}>Close</button>
          </div>
        )}
      </div>
    ),
  })
);

// Mock RoleList
vi.mock("@/components/features/admin/roleManagement/RoleList/roleList", () => ({
  default: () => <div data-testid="role-list">RoleList Component</div>,
}));

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

describe("RoleManagementPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render component successfully", () => {
    renderWithProvider(<RoleManagementPage />);

    expect(screen.getByText("Roles Management")).toBeInTheDocument();
    expect(
      screen.getByText("Manage all roles in your system")
    ).toBeInTheDocument();
    expect(screen.getByText("Add New Role")).toBeInTheDocument();
  });

  it("should display correct page title and description", () => {
    renderWithProvider(<RoleManagementPage />);

    const title = screen.getByText("Roles Management");
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe("H1");
    expect(title.className).toContain("text-3xl");
    expect(title.className).toContain("font-bold");

    const description = screen.getByText("Manage all roles in your system");
    expect(description).toBeInTheDocument();
    expect(description.tagName).toBe("P");
    expect(description.className).toContain("text-sm");
  });

  it("should open AddRoleModal when Add New Role button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProvider(<RoleManagementPage />);

    const addButton = screen.getByText("Add New Role");
    expect(addButton).toBeInTheDocument();

    // Modal should be closed initially
    const modal = screen.getByTestId("add-role-modal");
    expect(modal.getAttribute("data-open")).toBe("false");

    // Click the button
    await user.click(addButton);

    // Modal should be open now
    expect(modal.getAttribute("data-open")).toBe("true");
    expect(screen.getByText("Add Role Modal")).toBeInTheDocument();
  });

  it("should render RoleList component", () => {
    renderWithProvider(<RoleManagementPage />);

    expect(screen.getByTestId("role-list")).toBeInTheDocument();
    expect(screen.getByText("RoleList Component")).toBeInTheDocument();
  });
});
