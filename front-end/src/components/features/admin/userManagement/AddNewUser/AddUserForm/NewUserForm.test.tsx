import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { NewUserForm } from "./NewUserForm";

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

const typeInto = async (label: RegExp, value: string) => {
  const field = screen.getByLabelText(label);
  await userEvent.clear(field);
  await userEvent.type(field, value);
};

const fillRequiredFields = async () => {
  await typeInto(/Full name/i, "John Doe");
  await typeInto(/Email/i, "john@example.com");
  await typeInto(/Date of Birth/i, "1990-01-01");
  await typeInto(/Phone/i, "0123456789");
  await typeInto(/Identify number/i, "123456789012");
  await typeInto(/Password/i, "supersecret");
};

describe("NewUserForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required fields", () => {
    render(<NewUserForm onSubmit={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Identify number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
  });

  it("shows validation error when gender is not selected", async () => {
    render(<NewUserForm onSubmit={vi.fn()} onClose={vi.fn()} />);

    await fillRequiredFields();
    await userEvent.click(screen.getByRole("button", { name: /Add User/i }));

    await waitFor(() => {
      const messages = screen.getAllByText(/Choose your gender/i);
      expect(messages[messages.length - 1]).toBeInTheDocument();
    });
  });

  it("submits form data when all fields are valid", async () => {
    const handleSubmit = vi.fn();
    render(<NewUserForm onSubmit={handleSubmit} onClose={vi.fn()} />);

    await fillRequiredFields();
    await userEvent.selectOptions(screen.getByRole("combobox"), "male");
    await typeInto(/Address/i, "123 Main St");

    await userEvent.click(screen.getByRole("button", { name: /Add User/i }));

    await waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "John Doe",
          email: "john@example.com",
          dateOfBirth: "1990-01-01",
          phone: "0123456789",
          gender: "male",
          identifyNumber: "123456789012",
          password: "supersecret",
          address: "123 Main St",
        }),
        expect.anything(),
      ),
    );
  });

  it("invokes onClose when Close button is clicked", async () => {
    const handleClose = vi.fn();
    render(<NewUserForm onSubmit={vi.fn()} onClose={handleClose} />);

    await userEvent.click(screen.getByRole("button", { name: /Close/i }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("disables submit button and shows loading state", () => {
    render(<NewUserForm onSubmit={vi.fn()} onClose={vi.fn()} isLoading />);

    const submitButton = screen.getByRole("button", { name: /Creating/i });

    expect(submitButton).toBeDisabled();
  });
});