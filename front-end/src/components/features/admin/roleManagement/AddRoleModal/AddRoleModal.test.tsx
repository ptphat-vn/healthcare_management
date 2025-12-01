import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import AddRoleModal from "./AddRoleModal";
import type { Roles } from "@/types/roles.type";

const mockCreateRole = vi.fn();
const mockUpdateRole = vi.fn();
const mockUnwrap = vi.fn();

vi.mock("@/services/roleApi", () => ({
  useCreateRoleMutation: () => [mockCreateRole],
  useUpdateRoleMutation: () => [mockUpdateRole],
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { data: { roleCode: "ROLE_ADMIN" } } }),
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
}));

vi.mock("@/components/ui/input", () => ({
  Input: React.forwardRef<
    HTMLInputElement,
    {
      id?: string;
      placeholder?: string;
      disabled?: boolean;
      className?: string;
      [key: string]: unknown;
    }
  >(({ id, placeholder, disabled, className, ...props }, ref) => (
    <input
      id={id as string | undefined}
      ref={ref}
      placeholder={placeholder as string | undefined}
      disabled={disabled as boolean | undefined}
      className={className as string | undefined}
      data-testid={id as string | undefined}
      {...(props as Record<string, unknown>)}
    />
  )),
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
    disabled,
  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      disabled={disabled}
      data-testid="checkbox"
    />
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    type,
    onClick,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    type?: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button
      type={type === "submit" ? "submit" : "button"}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => <label htmlFor={htmlFor}>{children}</label>,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: React.forwardRef<
    HTMLTextAreaElement,
    {
      id?: string;
      placeholder?: string;
      disabled?: boolean;
      [key: string]: unknown;
    }
  >(({ id, placeholder, disabled, ...props }, ref) => (
    <textarea
      id={id as string | undefined}
      ref={ref}
      placeholder={placeholder as string | undefined}
      disabled={disabled as boolean | undefined}
      data-testid={id as string | undefined}
      {...(props as Record<string, unknown>)}
    />
  )),
}));

vi.mock("@/data/data", () => ({
  privilegeList: ["read_only", "view_role", "create_role", "update_role"],
}));

vi.mock("@/utils/formatPrivilege", () => ({
  default: (priv: string) =>
    priv
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
}));

vi.mock("@/utils/getRoleButtonClass", () => ({
  getRoleButtonClass: () => "btn-primary",
}));

const mockRole: Roles = {
  _id: "role-123",
  name: "Test Role",
  code: "test_role",
  description: "Test description",
  privileges: ["read_only", "view_role"],
  createAt: "2024-01-01",
  updateAt: "2024-01-01",
};

describe("AddRoleModal", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateRole.mockReturnValue({ unwrap: mockUnwrap });
    mockUpdateRole.mockReturnValue({ unwrap: mockUnwrap });
  });

  it("hiển thị modal khi open=true", () => {
    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  it("không hiển thị modal khi open=false", () => {
    render(<AddRoleModal open={false} onOpenChange={mockOnOpenChange} />);
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("hiển thị title 'Create New Role' khi ở create mode", () => {
    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByText("Create New Role")).toBeInTheDocument();
  });

  it("hiển thị title 'Edit Role' khi ở edit mode", () => {
    render(
      <AddRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(screen.getByText("Edit Role")).toBeInTheDocument();
  });

  it("populate form với role data khi ở edit mode", () => {
    render(
      <AddRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );

    expect(screen.getByTestId("name")).toHaveValue("Test Role");
    expect(screen.getByTestId("code")).toHaveValue("test_role");
    expect(screen.getByTestId("description")).toHaveValue("Test description");
  });

  it("disable code field khi ở edit mode", () => {
    render(
      <AddRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );

    expect(screen.getByTestId("code")).toBeDisabled();
  });

  it("reset form khi mở modal ở create mode", () => {
    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByTestId("name")).toHaveValue("");
    expect(screen.getByTestId("code")).toHaveValue("");
    expect(screen.getByTestId("description")).toHaveValue("");
  });

  it("CREATE: submit form tạo role mới thành công", async () => {
    const user = userEvent.setup();
    mockUnwrap.mockResolvedValueOnce({
      message: "Role created successfully!",
    });

    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);

    await user.type(screen.getByTestId("name"), "New Role");
    await user.type(screen.getByTestId("code"), "new_role");
    await user.type(screen.getByTestId("description"), "New role description");

    // Select privileges
    const checkboxes = screen.getAllByTestId("checkbox");
    await user.click(checkboxes[0]); // Select first privilege

    const submitButton = screen.getByRole("button", { name: "Create Role" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateRole).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Role created successfully!"
      );
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("UPDATE: submit form update role thành công", async () => {
    const user = userEvent.setup();
    mockUnwrap.mockResolvedValueOnce({
      message: "Role updated successfully!",
    });

    render(
      <AddRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );

    await user.clear(screen.getByTestId("name"));
    await user.type(screen.getByTestId("name"), "Updated Role");

    const submitButton = screen.getByRole("button", { name: "Update Role" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalledWith({
        id: "role-123",
        name: "Updated Role",
        code: "test_role",
        description: "Test description",
        privileges: ["read_only", "view_role"],
      });
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Role updated successfully!"
      );
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("hiển thị error toast khi submit thất bại", async () => {
    const user = userEvent.setup();
    mockUnwrap.mockRejectedValueOnce({
      data: { message: "Failed to create role" },
    });

    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);

    await user.type(screen.getByTestId("name"), "New Role");
    await user.type(screen.getByTestId("code"), "new_role");

    const checkboxes = screen.getAllByTestId("checkbox");
    await user.click(checkboxes[0]);

    const submitButton = screen.getByRole("button", { name: "Create Role" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Failed to create role");
    });
  });

  it("hiển thị validation error khi submit form trống", async () => {
    const user = userEvent.setup();

    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);

    const submitButton = screen.getByRole("button", { name: "Create Role" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Role name is required/i)).toBeInTheDocument();
    });
  });

  it("hiển thị validation error khi không chọn privileges", async () => {
    const user = userEvent.setup();

    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);

    await user.type(screen.getByTestId("name"), "New Role");
    await user.type(screen.getByTestId("code"), "new_role");

    const submitButton = screen.getByRole("button", { name: "Create Role" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Select at least one privilege/i)
      ).toBeInTheDocument();
    });
  });

  it("toggle privilege checkbox hoạt động đúng", async () => {
    const user = userEvent.setup();

    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);

    const checkboxes = screen.getAllByTestId("checkbox");
    expect(checkboxes[0]).not.toBeChecked();

    await user.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();

    await user.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
  });

  it("hiển thị số lượng privileges đã chọn", async () => {
    const user = userEvent.setup();

    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText(/0 of 4 selected/i)).toBeInTheDocument();

    const checkboxes = screen.getAllByTestId("checkbox");
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    expect(screen.getByText(/2 of 4 selected/i)).toBeInTheDocument();
  });

  it("hiển thị loading state khi đang submit", async () => {
    const user = userEvent.setup();
    let resolveUnwrap: (value: { message: string }) => void;
    const promise = new Promise<{ message: string }>((resolve) => {
      resolveUnwrap = resolve;
    });
    mockUnwrap.mockReturnValueOnce(promise);

    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);

    await user.type(screen.getByTestId("name"), "New Role");
    await user.type(screen.getByTestId("code"), "new_role");

    const checkboxes = screen.getAllByTestId("checkbox");
    await user.click(checkboxes[0]);

    const submitButton = screen.getByRole("button", { name: "Create Role" });
    await user.click(submitButton);

    expect(screen.getByText("Creating...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    resolveUnwrap!({ message: "Success" });
    await waitFor(() => {
      expect(screen.queryByText("Creating...")).not.toBeInTheDocument();
    });
  });

  it("đóng modal khi click Cancel button", async () => {
    const user = userEvent.setup();

    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("hiển thị đúng description cho create mode", () => {
    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);
    expect(
      screen.getByText(
        "Define a new role with specific privileges and permissions"
      )
    ).toBeInTheDocument();
  });

  it("hiển thị đúng description cho edit mode", () => {
    render(
      <AddRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(
      screen.getByText("Update role information and privileges")
    ).toBeInTheDocument();
  });

  it("hiển thị tất cả privileges từ privilegeList", () => {
    render(<AddRoleModal open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("Read Only")).toBeInTheDocument();
    expect(screen.getByText("View Role")).toBeInTheDocument();
    // "Create Role" và "Update Role" có thể là privilege label hoặc button
    // Nên kiểm tra bằng getAllByText
    expect(screen.getAllByText("Create Role").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Update Role").length).toBeGreaterThan(0);
  });

  it("preserve selected privileges khi ở edit mode", () => {
    render(
      <AddRoleModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );

    const checkboxes = screen.getAllByTestId("checkbox");
    // mockRole có privileges: ["read_only", "view_role"]
    // Vì privilegeList là ["read_only", "view_role", "create_role", "update_role"]
    // Nên 2 checkbox đầu sẽ được checked
    expect(checkboxes[0]).toBeChecked(); // read_only
    expect(checkboxes[1]).toBeChecked(); // view_role
    expect(checkboxes[2]).not.toBeChecked(); // create_role
    expect(checkboxes[3]).not.toBeChecked(); // update_role
  });
});
