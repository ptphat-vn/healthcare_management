import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import EditUserModal from "./EditUserModal";
import { type User } from "@/types/user.type";
import { type CreateUserFormData } from "@/schemas/userSchema";

const mockUpdateUser = vi.fn();
const mockUnwrap = vi.fn();

vi.mock("@/services/userApi", () => ({
  useUpdateUserMutation: () => [mockUpdateUser],
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
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog">{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

const submitButtonId = "edit-user-form-submit";
const closeButtonId = "edit-user-form-close";
const loadingIndicatorId = "edit-user-form-loading";

const mockFormData: CreateUserFormData & { roleId?: string; status?: number } = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  dateOfBirth: "1995-05-15",
  phone: "0987654321",
  gender: "female",
  identifyNumber: "987654321000",
  password: "",
  address: "456 Elm St",
  roleId: "role-2",
  status: 2,
};

vi.mock("./EditUserForm", () => ({
  EditUserForm: ({
    onSubmit,
    onClose,
    isLoading,
  }: {
    onSubmit: (data: typeof mockFormData) => void;
    onClose: () => void;
    isLoading: boolean;
  }) => (
    <div data-testid="edit-user-form">
      <button data-testid={submitButtonId} onClick={() => onSubmit(mockFormData)}>
        submit
      </button>
      <button data-testid={closeButtonId} onClick={onClose}>
        close
      </button>
      <span data-testid={loadingIndicatorId}>{isLoading ? "loading" : "idle"}</span>
    </div>
  ),
}));

const user: User = {
  _id: "user-123",
  fullName: "Existing User",
  email: "existing@example.com",
  phoneNumber: "0123456789",
  identifyNumber: "123456789012",
  gender: "male",
  dateOfBirth: "1990-01-01",
  address: "Old Address",
  roleId: "role-1",
  status: 1,
  createdAt: "",
  updatedAt: "",
};

describe("EditUserModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateUser.mockReturnValue({ unwrap: mockUnwrap });
  });

  it("renders EditUserForm when modal is open and user exists", () => {
    render(<EditUserModal open onOpenChange={vi.fn()} user={user} />);
    expect(screen.getByTestId("edit-user-form")).toBeInTheDocument();
  });

  it("does not render EditUserForm when modal closed or user missing", () => {
    const { rerender } = render(
      <EditUserModal open={false} onOpenChange={vi.fn()} user={user} />,
    );
    expect(screen.queryByTestId("edit-user-form")).not.toBeInTheDocument();

    rerender(<EditUserModal open onOpenChange={vi.fn()} user={null} />);
    expect(screen.queryByTestId("edit-user-form")).not.toBeInTheDocument();
  });

  it("submits mapped payload, shows success toast, and closes modal", async () => {
    const onOpenChange = vi.fn();
    mockUnwrap.mockResolvedValueOnce({ message: "Updated" });

    render(<EditUserModal open onOpenChange={onOpenChange} user={user} />);

    await userEvent.click(screen.getByTestId(submitButtonId));

    await waitFor(() =>
      expect(mockUpdateUser).toHaveBeenCalledWith({
        id: user._id,
        fullName: mockFormData.fullName,
        email: mockFormData.email,
        phoneNumber: mockFormData.phone,
        identifyNumber: mockFormData.identifyNumber,
        gender: "female",
        dateOfBirth: mockFormData.dateOfBirth,
        address: mockFormData.address,
        roleId: mockFormData.roleId,
        status: mockFormData.status,
      }),
    );

    await waitFor(() =>
      expect(mockToastSuccess).toHaveBeenCalledWith("Updated"),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByTestId(loadingIndicatorId)).toHaveTextContent("idle");
  });

  it("shows error toast message on failure", async () => {
    mockUnwrap.mockRejectedValueOnce({ data: { message: "Update failed" } });

    render(<EditUserModal open onOpenChange={vi.fn()} user={user} />);

    await userEvent.click(screen.getByTestId(submitButtonId));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith("Update failed"),
    );
  });

  it("invokes onOpenChange(false) when Close clicked and not loading", async () => {
    const onOpenChange = vi.fn();

    render(<EditUserModal open onOpenChange={onOpenChange} user={user} />);

    await userEvent.click(screen.getByTestId(closeButtonId));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

