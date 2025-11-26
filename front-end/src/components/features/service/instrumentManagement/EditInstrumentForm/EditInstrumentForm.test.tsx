import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, beforeAll } from "vitest";
import EditInstrumentForm from "./EditInstrumentForm";

beforeAll(() => {
  (
    globalThis as Record<string, unknown>
  ).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mockUseAuth,
}));

const defaultValues = {
  name: "Analyzer X",
  model: "Model A",
  manufacturer: "LabCo",
  serialNumber: "SN123",
  location: "Lab A",
  status: "Active" as const,
  description: "Test description",
  categories: ["Hematology" as const],
};

describe("EditInstrumentForm", () => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { data: { roleCode: "admin" } },
    });
  });

  const renderForm = (props = {}) => {
    render(
      <EditInstrumentForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        {...props}
      />
    );
  };

  test("renders form with default values", () => {
    renderForm();

    expect(screen.getByDisplayValue("Analyzer X")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Model A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("LabCo")).toBeInTheDocument();
    expect(screen.getByDisplayValue("SN123")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Lab A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();
  });

  test("calls onCancel when Cancel button is clicked", async () => {
    renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });

  test("submits form with updated values", async () => {
    renderForm();
    const user = userEvent.setup();

    const nameInput = screen.getByDisplayValue("Analyzer X");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Analyzer");

    await user.click(
      screen.getByRole("button", { name: /Update Instrument/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Updated Analyzer" }),
        expect.anything()
      );
    });
  });

  test("shows loading state when isLoading is true", () => {
    renderForm({ isLoading: true });

    expect(screen.getByRole("button", { name: /Updating.../i })).toBeDisabled();
  });

  test("shows validation error for empty required field", async () => {
    renderForm();
    const user = userEvent.setup();

    const nameInput = screen.getByDisplayValue("Analyzer X");
    await user.clear(nameInput);

    await user.click(
      screen.getByRole("button", { name: /Update Instrument/i })
    );

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  test("allows toggling categories", async () => {
    renderForm();
    const user = userEvent.setup();

    const biochemistryCheckbox = screen.getByLabelText("Biochemistry");
    await user.click(biochemistryCheckbox);

    await user.click(
      screen.getByRole("button", { name: /Update Instrument/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: expect.arrayContaining(["Hematology", "Biochemistry"]),
        }),
        expect.anything()
      );
    });
  });
});
