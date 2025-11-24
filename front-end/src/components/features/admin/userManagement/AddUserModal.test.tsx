import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import AddUserModal from "./AddUserModal";
import { type CreateUserFormData } from "@/schemas/userSchema";

const mockCreateUser = vi.fn();
const mockUnwrap = vi.fn();

vi.mock("@/services/userApi", () => ({
  useCreateUserMutation: () => [mockCreateUser],
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

const mockFormData: CreateUserFormData = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  dateOfBirth: "1995-05-15",
  phone: "0987654321",
  gender: "female",
  identifyNumber: "987654321000",
  password: "password123",
  address: "456 Elm St",
};

const submitButtonId = "new-user-form-submit";
const closeButtonId = "new-user-form-close";
const loadingIndicatorId = "new-user-form-loading";

vi.mock("./NewUserForm", () => ({
  NewUserForm: ({
    onSubmit,
    onClose,
    isLoading,
  }: {
    onSubmit: (data: CreateUserFormData) => void;
    onClose: () => void;
    isLoading: boolean;
  }) => (
    <div data-testid="new-user-form">
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

describe("AddUserModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateUser.mockReturnValue({ unwrap: mockUnwrap });
  });

  it("renders NewUserForm when modal is open", () => {
    render(<AddUserModal open onOpenChange={vi.fn()} />);
    expect(screen.getByTestId("new-user-form")).toBeInTheDocument();
  });

  it("does not render NewUserForm when modal is closed", () => {
    render(<AddUserModal open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByTestId("new-user-form")).not.toBeInTheDocument();
  });

  it("submits data, shows success toast, and closes modal", async () => {
    const onOpenChange = vi.fn();
    mockUnwrap.mockResolvedValueOnce({ message: "Created" });

    render(<AddUserModal open onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByTestId(submitButtonId));

    await waitFor(() =>
      expect(mockCreateUser).toHaveBeenCalledWith({
        fullName: mockFormData.fullName,
        email: mockFormData.email,
        phoneNumber: mockFormData.phone,
        identifyNumber: mockFormData.identifyNumber,
        gender: mockFormData.gender,
        dateOfBirth: mockFormData.dateOfBirth,
        password: mockFormData.password,
        address: mockFormData.address,
      }),
    );

    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalledWith("Created"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByTestId(loadingIndicatorId)).toHaveTextContent("idle");
  });

  it("shows error toast when submission fails", async () => {
    mockUnwrap.mockRejectedValueOnce({ data: { message: "failed" } });

    render(<AddUserModal open onOpenChange={vi.fn()} />);

    await userEvent.click(screen.getByTestId(submitButtonId));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("failed"));
  });

  it("closes via onClose when not loading", async () => {
    const onOpenChange = vi.fn();
    render(<AddUserModal open onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByTestId(closeButtonId));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});