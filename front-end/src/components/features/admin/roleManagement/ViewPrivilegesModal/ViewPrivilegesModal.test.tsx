import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ViewPrivilegesModal from "./ViewPrivilegesModal";
import type { Roles } from "@/types/roles.type";

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

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock("@/utils/formatPrivilege", () => ({
  default: (priv: string) =>
    priv
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
}));

const mockRole: Roles = {
  _id: "role-123",
  name: "Admin Role",
  code: "admin_role",
  description: "Administrator role",
  privileges: ["read_only", "view_role", "create_role", "update_role"],
  createAt: "2024-01-01",
  updateAt: "2024-01-01",
};

describe("ViewPrivilegesModal", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hiển thị modal khi open=true và role không null", () => {
    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  it("không hiển thị modal khi open=false", () => {
    render(
      <ViewPrivilegesModal
        open={false}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("không render khi role=null", () => {
    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={null}
      />
    );
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("hiển thị title 'Role Privileges'", () => {
    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(
      screen.getByRole("heading", { name: "Role Privileges" })
    ).toBeInTheDocument();
  });

  it("hiển thị description với role name", () => {
    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(
      screen.getByText(/View all privileges assigned to Admin Role/i)
    ).toBeInTheDocument();
  });

  it("hiển thị thông tin role name", () => {
    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(screen.getByText("Role Name:")).toBeInTheDocument();
    expect(screen.getByText("Admin Role")).toBeInTheDocument();
  });

  it("hiển thị thông tin role code", () => {
    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(screen.getByText("Role Code:")).toBeInTheDocument();
    expect(screen.getByText("admin_role")).toBeInTheDocument();
  });

  it("hiển thị tổng số privileges", () => {
    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );
    expect(screen.getByText("Total Privileges:")).toBeInTheDocument();
    expect(screen.getByText("4 privilege(s)")).toBeInTheDocument();
  });

  it("hiển thị tất cả privileges trong grid", () => {
    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );

    expect(screen.getByText("Privileges List")).toBeInTheDocument();
    expect(screen.getByText("Read Only")).toBeInTheDocument();
    expect(screen.getByText("View Role")).toBeInTheDocument();
    expect(screen.getByText("Create Role")).toBeInTheDocument();
    expect(screen.getByText("Update Role")).toBeInTheDocument();
  });

  it("hiển thị formatted privileges đúng", () => {
    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={mockRole}
      />
    );

    // Check that privileges are formatted correctly
    expect(screen.getByText("Read Only")).toBeInTheDocument();
    expect(screen.getByText("View Role")).toBeInTheDocument();
    expect(screen.getByText("Create Role")).toBeInTheDocument();
    expect(screen.getByText("Update Role")).toBeInTheDocument();
  });

  it("hiển thị message khi không có privileges", () => {
    const roleWithNoPrivileges: Roles = {
      ...mockRole,
      privileges: [],
    };

    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={roleWithNoPrivileges}
      />
    );

    expect(
      screen.getByText("No privileges assigned to this role")
    ).toBeInTheDocument();
    expect(screen.getByText("0 privilege(s)")).toBeInTheDocument();
  });

  it("hiển thị đúng số lượng privileges khi có 1 privilege", () => {
    const roleWithOnePrivilege: Roles = {
      ...mockRole,
      privileges: ["read_only"],
    };

    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={roleWithOnePrivilege}
      />
    );

    expect(screen.getByText("1 privilege(s)")).toBeInTheDocument();
    expect(screen.getByText("Read Only")).toBeInTheDocument();
  });

  it("hiển thị đúng thông tin role khác", () => {
    const differentRole: Roles = {
      _id: "role-456",
      name: "User Role",
      code: "user_role",
      description: "User description",
      privileges: ["read_only", "view_role"],
      createAt: "2024-02-01",
      updateAt: "2024-02-01",
    };

    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={differentRole}
      />
    );

    expect(screen.getByText("User Role")).toBeInTheDocument();
    expect(screen.getByText("user_role")).toBeInTheDocument();
    expect(screen.getByText("2 privilege(s)")).toBeInTheDocument();
    expect(
      screen.getByText(/View all privileges assigned to User Role/i)
    ).toBeInTheDocument();
  });

  it("hiển thị nhiều privileges đúng", () => {
    const roleWithManyPrivileges: Roles = {
      ...mockRole,
      privileges: [
        "read_only",
        "view_role",
        "create_role",
        "update_role",
        "delete_role",
        "view_config",
      ],
    };

    render(
      <ViewPrivilegesModal
        open={true}
        onOpenChange={mockOnOpenChange}
        role={roleWithManyPrivileges}
      />
    );

    expect(screen.getByText("6 privilege(s)")).toBeInTheDocument();
    expect(screen.getByText("Read Only")).toBeInTheDocument();
    expect(screen.getByText("View Role")).toBeInTheDocument();
    expect(screen.getByText("Create Role")).toBeInTheDocument();
    expect(screen.getByText("Update Role")).toBeInTheDocument();
    expect(screen.getByText("Delete Role")).toBeInTheDocument();
    expect(screen.getByText("View Config")).toBeInTheDocument();
  });
});
