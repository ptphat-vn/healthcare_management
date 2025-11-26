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

vi.mock("@/components/ui/input/Input", () => {
  const MockInput = React.forwardRef<HTMLInputElement, any>(
    ({ label, error, required, ...props }, ref) => (
      <label>
        {label}
        {required && "*"}
        <input aria-label={label} ref={ref} {...props} />
        {error && <span>{error}</span>}
      </label>
    ),
  );
  MockInput.displayName = "MockInput";
  return { __esModule: true, default: MockInput };
});

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: { onSelect?: (date?: Date) => void }) => (
    <button data-testid="calendar-button" onClick={() => onSelect?.(new Date("2000-01-01"))}>
      calendar
    </button>
  ),
}));

vi.mock("@/utils/getRoleButtonClass", () => ({
  getRoleButtonClass: () => "btn-primary",
}));

vi.mock("../AddUserForm/NewUserForm", () => ({
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

  it("hiển thị NewUserForm khi modal mở", () => {
    render(<AddUserModal open onOpenChange={vi.fn()} />);
    expect(screen.getByTestId("new-user-form")).toBeInTheDocument();
  });

  it("không hiển thị NewUserForm khi modal đóng", () => {
    render(<AddUserModal open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByTestId("new-user-form")).not.toBeInTheDocument();
  });

  it("gửi dữ liệu, hiển thị toast thành công và đóng modal", async () => {
    const onOpenChange = vi.fn();
    mockUnwrap.mockResolvedValueOnce({ message: "Create User Successfully!!" });

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

    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalledWith("Create User Successfully!!"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByTestId(loadingIndicatorId)).toHaveTextContent("idle");
  });

  it("hiển thị toast lỗi khi gửi thất bại", async () => {
    mockUnwrap.mockRejectedValueOnce({ data: { message: "Tạo người dùng thất bại" } });

    render(<AddUserModal open onOpenChange={vi.fn()} />);

    await userEvent.click(screen.getByTestId(submitButtonId));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Tạo người dùng thất bại"));
  });

  it("đóng modal qua onClose khi không đang loading", async () => {
    const onOpenChange = vi.fn();
    render(<AddUserModal open onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByTestId(closeButtonId));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});