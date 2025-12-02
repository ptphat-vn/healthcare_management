import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditAdminForm } from "./EditAdminForm";
import type { User } from "@/types/user.type";

// Mock input component
vi.mock("@/components/ui/input/Input", () => ({
  default: ({ label, error, ...props }: any) => (
    <label>
      {label}
      <input data-label={label} aria-label={label} {...props} />
      {error && <span>{error}</span>}
    </label>
  ),
}));

// Mock calendar related components
vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: any) => (
    <div data-testid="calendar">
      <button onClick={() => onSelect(new Date("1990-01-15"))}>Pick</button>
    </div>
  ),
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/utils/getRoleButtonClass", () => ({
  getRoleButtonClass: vi.fn(() => "btn-class"),
}));

const defaultUser = {
  _id: "1",
  fullName: "John Doe",
  email: "john@example.com",
  phoneNumber: "1234567890",
  identifyNumber: "123456789",
  gender: "male",
  dateOfBirth: "1990-01-15",
  address: "123 Main St",
  roleCode: "admin",
} as User;

describe("EditAdminForm", () => {
  const onSubmit = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (props = {}) =>
    render(
      <EditAdminForm
        onSubmit={onSubmit}
        onClose={onClose}
        isLoading={false}
        defaultValues={defaultUser}
        {...props}
      />
    );

  it("should render form with default values", () => {
    renderForm();

    expect(screen.getByLabelText("Full name")).toHaveValue("John Doe");
    expect(screen.getByLabelText("Email")).toHaveValue("john@example.com");
    expect(screen.getByLabelText("Phone")).toHaveValue("1234567890");
    expect(screen.getByLabelText("Identify number")).toHaveValue("123456789");
    const genderSelect = screen.getByRole("combobox");
    expect(genderSelect).toHaveValue("male");
  });

  it("should update fields and submit the form", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.clear(screen.getByLabelText("Full name"));
    await user.type(screen.getByLabelText("Full name"), "Jane Smith");

    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "jane@example.com");

    const genderSelect = screen.getByRole("combobox");
    await user.selectOptions(genderSelect, "female");

    await user.click(screen.getByRole("button", { name: /update user/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "Jane Smith",
          email: "jane@example.com",
          gender: "female",
          password: "",
        })
      );
    });
  });

  it("should display validation errors when required fields are empty", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.clear(screen.getByLabelText("Full name"));
    await user.click(screen.getByRole("button", { name: /update user/i }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("should call onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    renderForm();

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should show loading state on submit button when isLoading is true", () => {
    renderForm({ isLoading: true });

    expect(screen.getByRole("button", { name: /updating/i })).toBeDisabled();
  });
});
