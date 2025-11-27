import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
}));

// Mock AddRoleModal
vi.mock("@/components/features/admin/roleManagement/AddRoleModal", () => ({
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
}));

// Mock RoleList
vi.mock("@/components/features/admin/roleManagement/roleList", () => ({
  default: () => <div data-testid="role-list">RoleList Component</div>,
}));

describe("RoleManagementPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render component successfully", () => {
    render(<RoleManagementPage />);

    expect(screen.getByText("Roles Management")).toBeInTheDocument();
    expect(
      screen.getByText("Manage all roles in your system")
    ).toBeInTheDocument();
    expect(screen.getByText("Add New Role")).toBeInTheDocument();
  });

  it("should display correct page title and description", () => {
    render(<RoleManagementPage />);

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
    render(<RoleManagementPage />);

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
    render(<RoleManagementPage />);

    expect(screen.getByTestId("role-list")).toBeInTheDocument();
    expect(screen.getByText("RoleList Component")).toBeInTheDocument();
  });
});
