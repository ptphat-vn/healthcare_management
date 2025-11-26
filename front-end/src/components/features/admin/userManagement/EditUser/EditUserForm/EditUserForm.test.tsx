import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { EditUserForm } from "./EditUserForm";
import { type User } from "@/types/user.type";
import { type CreateUserFormData } from "@/schemas/userSchema";

const mockRoles = [{ _id: "role-1", name: "Admin" }];

vi.mock("@/services/roleApi", () => ({
  useGetAllRoleQuery: () => ({
    data: { data: { role: mockRoles } },
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { data: { roleCode: "ROLE_ADMIN" } } }),
}));

vi.mock("@/utils/getRoleButtonClass", () => ({
  getRoleButtonClass: () => "btn-primary",
}));

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

const defaultUser: User = {
  _id: "user-1",
  fullName: "John Doe",
  email: "john@example.com",
  phoneNumber: "0123456789",
  identifyNumber: "123456789012",
  gender: "male",
  dateOfBirth: "1990-01-01",
  address: "123 Main St",
  roleId: "role-1",
  status: 1,
  createdAt: "",
  updatedAt: "",
};

describe("EditUserForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (props?: Partial<React.ComponentProps<typeof EditUserForm>>) =>
    render(
      <EditUserForm
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        isLoading={false}
        defaultValues={defaultUser}
        {...props}
      />,
    );

  it("điền sẵn các trường với giá trị mặc định sau khi roles được tải", async () => {
    renderForm();

    await waitFor(() =>
      expect(screen.getByDisplayValue(defaultUser.fullName)).toBeInTheDocument(),
    );

    expect(screen.getByDisplayValue(defaultUser.email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(defaultUser.phoneNumber)).toBeInTheDocument();
    expect(screen.getByText("01/01/1990")).toBeInTheDocument();
  });

  it("gửi dữ liệu đã cập nhật với mật khẩu rỗng", async () => {
    const handleSubmit = vi.fn();
    renderForm({ onSubmit: handleSubmit });

    await waitFor(() =>
      expect(screen.getByDisplayValue(defaultUser.fullName)).toBeInTheDocument(),
    );

    await userEvent.clear(screen.getByLabelText(/Full name/i));
    await userEvent.type(screen.getByLabelText(/Full name/i), "Jane Doe");

    await userEvent.click(screen.getByRole("button", { name: /Update User/i }));

    await waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining<CreateUserFormData & { roleId: string; status: number; password: string }>({
          fullName: "Jane Doe",
          email: defaultUser.email,
          phone: defaultUser.phoneNumber,
          identifyNumber: defaultUser.identifyNumber,
          gender: defaultUser.gender as "male" | "female",
          dateOfBirth: defaultUser.dateOfBirth,
          address: defaultUser.address,
          roleId: defaultUser.roleId ?? "",
          status: defaultUser.status ?? 1,
          password: "",
        }),
      ),
    );
  });

  it("gọi onClose khi nhấn nút Close", async () => {
    const handleClose = vi.fn();
    renderForm({ onClose: handleClose });

    await waitFor(() =>
      expect(screen.getByDisplayValue(defaultUser.fullName)).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: /Close/i }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("vô hiệu hóa nút submit và hiển thị trạng thái loading", () => {
    renderForm({ isLoading: true });

    const submitButton = screen.getByRole("button", { name: /Updating.../i });

    expect(submitButton).toBeDisabled();
  });
});

