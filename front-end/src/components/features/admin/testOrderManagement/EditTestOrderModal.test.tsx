import "@testing-library/jest-dom/vitest";
import type { ComponentProps, ReactNode } from "react";
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditTestOrderModal from "./EditTestOrderModal";

const {
  mockUseUpdateTestOrderMutation,
  mockToast,
  mockUseAuth,
  mockGetRoleButtonClass,
} = vi.hoisted(() => ({
  mockUseUpdateTestOrderMutation: vi.fn(),
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  mockUseAuth: vi.fn(),
  mockGetRoleButtonClass: vi.fn(() => "role-btn"),
}));

vi.mock("@/services/testOrderApi", () => ({
  useUpdateTestOrderMutation: () => mockUseUpdateTestOrderMutation(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/utils/getRoleButtonClass", () => ({
  getRoleButtonClass: mockGetRoleButtonClass,
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock("@/components/ui/input/Input", () => ({
  __esModule: true,
  default: React.forwardRef<HTMLInputElement, ComponentProps<"input"> & { label: string; error?: string }>(
    ({ label, error, ...props }, ref) => (
      <label>
        <span>{label}</span>
        <input ref={ref} aria-label={label} {...props} />
        {error ? <p>{error}</p> : null}
      </label>
    ),
  ),
}));

vi.mock("@/components/ui/select", () => {
  const Select = ({
    children,
    value,
    onValueChange,
  }: {
    children: ReactNode;
    value?: string;
    onValueChange: (val: string) => void;
  }) => (
    <select
      data-testid="gender-select"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      {React.Children.toArray(children).filter(Boolean)}
    </select>
  );

  const SelectTrigger = ({ children }: { children: ReactNode }) => <>{children}</>;
  const SelectValue = () => null;
  const SelectContent = ({ children }: { children: ReactNode }) => <>{children}</>;
  const SelectItem = ({
    value,
    children,
  }: {
    value: string;
    children: ReactNode;
  }) => <option value={value}>{children}</option>;

  return {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  };
});

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: ComponentProps<"button"> & { variant?: string }) => (
    <button {...props}>{children}</button>
  ),
}));

const baseOrder = {
  _id: "order-1",
  patientName: "John Doe",
  dateOfBirth: "1990-01-01",
  gender: "male" as const,
  address: "123 Street",
  phoneNumber: "0123456789",
  email: "john@example.com",
  status: "pending" as const,
  createdDate: "2024-01-01T00:00:00.000Z",
};

const renderModal = (props?: Partial<ComponentProps<typeof EditTestOrderModal>>) => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  const onSuccess = vi.fn();
  const result = render(
    <EditTestOrderModal
      open
      order={baseOrder}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      {...props}
    />,
  );
  return { onOpenChange, onSuccess, ...result };
};

describe("EditTestOrderModal", () => {
  let updateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    updateSpy = vi.fn();
    mockUseUpdateTestOrderMutation.mockReturnValue([updateSpy, { isLoading: false }]);
    mockUseAuth.mockReturnValue({
      user: { data: { roleCode: "ROLE_ADMIN" } },
    });
    mockGetRoleButtonClass.mockReturnValue("role-btn");
  });

  it("returns null when no order is provided", () => {
    const { container } = render(
      <EditTestOrderModal open order={null} onOpenChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders heading and prefilled values", async () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /Edit Test Order/i }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText(/Patient Name/i)).toHaveValue("John Doe"),
    );
    expect(mockGetRoleButtonClass).toHaveBeenCalledWith("ROLE_ADMIN");
    expect(screen.getByRole("button", { name: /Update/i })).toHaveClass("role-btn");
  });

  it("submits updated data successfully", async () => {
    const user = userEvent.setup();
    const unwrapSpy = vi.fn().mockResolvedValue({});
    updateSpy.mockReturnValue({ unwrap: unwrapSpy });
    const { onOpenChange, onSuccess } = renderModal();

    await user.clear(screen.getByLabelText(/Patient Name/i));
    await user.type(screen.getByLabelText(/Patient Name/i), "Jane Smith");
    await user.selectOptions(screen.getByTestId("gender-select"), "female");
    await user.clear(screen.getByLabelText(/Phone Number/i));
    await user.type(screen.getByLabelText(/Phone Number/i), "0987654321");

    await user.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() =>
      expect(updateSpy).toHaveBeenCalledWith({
        id: "order-1",
        patientName: "Jane Smith",
        dateOfBirth: "1990-01-01",
        gender: "female",
        address: "123 Street",
        phoneNumber: "0987654321",
        email: "john@example.com",
      }),
    );
    expect(unwrapSpy).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith(
      "Test order updated successfully!",
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("shows error toast when update fails", async () => {
    const user = userEvent.setup();
    const unwrapSpy = vi.fn().mockRejectedValue({ data: { message: "Failed" } });
    updateSpy.mockReturnValue({ unwrap: unwrapSpy });
    const { onOpenChange, onSuccess } = renderModal();

    await user.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith("Update failed: Failed"));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("cancels editing when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderModal();

    await user.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("disables buttons and shows updating label while loading", () => {
    mockUseUpdateTestOrderMutation.mockReturnValue([updateSpy, { isLoading: true }]);
    renderModal({ order: baseOrder });

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    const updateBtn = screen.getByRole("button", { name: /Updating.../i });
    expect(cancelBtn).toBeDisabled();
    expect(updateBtn).toBeDisabled();
  });
});

