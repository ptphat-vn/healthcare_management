import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import DeleteRoleModal from "./DeleteRoleModal";
import type { Roles } from "@/types/roles.type";

const mockDeleteRole = vi.fn();
const mockUnwrap = vi.fn();
let mockIsLoading = false;

vi.mock("@/services/roleApi", () => ({
  useDeleteRoleMutation: vi.fn(() => [
    mockDeleteRole,
    { isLoading: mockIsLoading },
  ]),
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    type,
    onClick,
    disabled,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    type?: string;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  }) => (
    <button
      type={type === "submit" ? "submit" : "button"}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

const mockRole: Roles = {
  _id: "role-123",
  name: "Test Role",
  code: "test_role",
  description: "Test description",
  privileges: ["read_only", "view_role", "create_role"],
  createAt: "2024-01-01",
  updateAt: "2024-01-01",
};

describe("DeleteRoleModal", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockDeleteRole.mockReturnValue({ unwrap: mockUnwrap });
  });

  it("hiển thị modal khi open=true và role không null", () => {
    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  it("không hiển thị modal khi open=false", () => {
    render(
      <DeleteRoleModal
        open={false}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("không render khi role=null", () => {
    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={null}
      />
    );
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("hiển thị title 'Delete Role'", () => {
    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(
      screen.getByRole("heading", { name: "Delete Role" })
    ).toBeInTheDocument();
  });

  it("hiển thị description về việc không thể hoàn tác", () => {
    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(
      screen.getByText(
        /Are you sure you want to delete this role\? This action cannot be undone/i
      )
    ).toBeInTheDocument();
  });

  it("hiển thị thông tin role name", () => {
    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(screen.getByText("Role Name:")).toBeInTheDocument();
    expect(screen.getByText("Test Role")).toBeInTheDocument();
  });

  it("hiển thị thông tin role code", () => {
    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(screen.getByText("Role Code:")).toBeInTheDocument();
    expect(screen.getByText("test_role")).toBeInTheDocument();
  });

  it("hiển thị số lượng privileges", () => {
    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(screen.getByText("Privileges:")).toBeInTheDocument();
    expect(screen.getByText("3 privilege(s)")).toBeInTheDocument();
  });

  it("hiển thị warning message", () => {
    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(screen.getByText("Warning:")).toBeInTheDocument();
    expect(
      screen.getByText(
        /All users assigned to this role may be affected. This role will be permanently removed from the system/i
      )
    ).toBeInTheDocument();
  });

  it("DELETE: xóa role thành công và hiển thị toast success", async () => {
    const user = userEvent.setup();
    mockUnwrap.mockResolvedValueOnce({});

    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );

    const deleteButton = screen.getByRole("button", { name: "Delete Role" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteRole).toHaveBeenCalledWith({
        roleId: "role-123",
      });
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Role deleted successfully!"
      );
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("DELETE: hiển thị error toast khi xóa thất bại", async () => {
    const user = userEvent.setup();
    mockUnwrap.mockRejectedValueOnce("Network error");

    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );

    const deleteButton = screen.getByRole("button", { name: "Delete Role" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Failed to delete role: Network error"
      );
    });
  });

  it("đóng modal khi click Cancel button", async () => {
    const user = userEvent.setup();

    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("hiển thị loading state khi đang xóa", () => {
    mockIsLoading = true;

    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );

    expect(screen.getByText("Deleting...")).toBeInTheDocument();

    const deleteButton = screen.getByRole("button", { name: "Deleting..." });
    expect(deleteButton).toBeDisabled();

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    expect(cancelButton).toBeDisabled();
  });

  it("hiển thị đúng số lượng privileges khi role có 0 privileges", () => {
    const roleWithNoPrivileges: Roles = {
      ...mockRole,
      privileges: [],
    };

    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={roleWithNoPrivileges}
      />
    );

    expect(screen.getByText("0 privilege(s)")).toBeInTheDocument();
  });

  it("hiển thị đúng số lượng privileges khi role có 1 privilege", () => {
    const roleWithOnePrivilege: Roles = {
      ...mockRole,
      privileges: ["read_only"],
    };

    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={roleWithOnePrivilege}
      />
    );

    expect(screen.getByText("1 privilege(s)")).toBeInTheDocument();
  });

  it("hiển thị đúng thông tin role khác", () => {
    const differentRole: Roles = {
      _id: "role-456",
      name: "Admin Role",
      code: "admin_role",
      description: "Admin description",
      privileges: ["read_only"],
      createAt: "2024-02-01",
      updateAt: "2024-02-01",
    };

    render(
      <DeleteRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={differentRole}
      />
    );

    expect(screen.getByText("Admin Role")).toBeInTheDocument();
    expect(screen.getByText("admin_role")).toBeInTheDocument();
    expect(screen.getByText("1 privilege(s)")).toBeInTheDocument();
  });
});
