import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteUserModal from "./DeleteUserModal";
import type { User } from "@/types/user.type";

// Mock dependencies
vi.mock("@/services/userApi", () => ({
  useDeleteUserMutation: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useDeleteUserMutation } from "@/services/userApi";
import { toast } from "sonner";

const mockUseDeleteUserMutation = vi.mocked(useDeleteUserMutation);
const mockToast = vi.mocked(toast);

describe("DeleteUserModal", () => {
  const mockUser: User = {
    _id: "1",
    fullName: "John Doe",
    email: "john@example.com",
    phoneNumber: "1234567890",
    identifyNumber: "123456789",
    gender: "male",
    dateOfBirth: "1990-01-15",
    roleName: "Admin",
    status: 1,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  } as User;

  const mockOnOpenChange = vi.fn();
  const mockDeleteUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteUser.mockReturnValue({
      unwrap: vi.fn(),
    });
    mockUseDeleteUserMutation.mockReturnValue([
      mockDeleteUser,
      { isLoading: false },
    ] as any);
  });

  it("should render dialog with user information when open is true and user is provided", () => {
    render(
      <DeleteUserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
      />
    );

    // "Delete User" appears in both title and button, so use getAllByText
    const deleteUserTexts = screen.getAllByText("Delete User");
    expect(deleteUserTexts.length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
  });

  it("should not render when user is null", () => {
    const { container } = render(
      <DeleteUserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={null}
      />
    );

    expect(screen.queryByText("Delete User")).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it("should not display dialog content when open is false", () => {
    render(
      <DeleteUserModal
        open={false}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
      />
    );

    expect(screen.queryByText("Delete User")).not.toBeInTheDocument();
  });

  it("should display user details correctly", () => {
    render(
      <DeleteUserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
      />
    );

    expect(screen.getByText("Full Name:")).toBeInTheDocument();
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("Phone:")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
  });

  it("should display warning message", () => {
    render(
      <DeleteUserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
      />
    );

    expect(screen.getByText("Warning:")).toBeInTheDocument();
    expect(
      screen.getByText(
        "All data associated with this user will be permanently deleted from the system."
      )
    ).toBeInTheDocument();
  });

  it("should call onOpenChange with false when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <DeleteUserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnOpenChange).toHaveBeenCalledTimes(1);
  });

  it("should delete user and show success toast when delete button is clicked", async () => {
    const user = userEvent.setup();
    const mockUnwrap = vi.fn().mockResolvedValue(undefined);

    mockDeleteUser.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(
      <DeleteUserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete user/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith("1");
      expect(mockUnwrap).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockToast.success).toHaveBeenCalledWith("Delete successfully !!");
    });
  });

  it("should show error toast when delete fails", async () => {
    const user = userEvent.setup();
    const mockError = new Error("Delete failed");
    const mockUnwrap = vi.fn().mockRejectedValue(mockError);

    mockDeleteUser.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(
      <DeleteUserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete user/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith("1");
      expect(mockUnwrap).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Delete failed!" + mockError
      );
      // Should not close modal on error
      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });
  });

  it("should display loading state and disable buttons when deleting", () => {
    mockUseDeleteUserMutation.mockReturnValue([
      mockDeleteUser,
      { isLoading: true },
    ] as any);

    render(
      <DeleteUserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /deleting/i });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toBeDisabled();
  });

  it("should display correct button text when not loading", () => {
    mockUseDeleteUserMutation.mockReturnValue([
      mockDeleteUser,
      { isLoading: false },
    ] as any);

    render(
      <DeleteUserModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
      />
    );

    expect(screen.getByRole("button", { name: /delete user/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /deleting/i })).not.toBeInTheDocument();
  });
});

