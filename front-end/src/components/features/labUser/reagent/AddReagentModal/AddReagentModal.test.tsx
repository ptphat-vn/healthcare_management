import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddReagentModal from "./AddReagentModal";

// Mock Input component to behave like native input
vi.mock("@/components/ui/input", () => ({
  Input: ({ label, error, required: _required, ...props }: any) => (
    <>
      <input
        aria-label={
          label || props["aria-label"] || props.name || props.placeholder
        }
        {...props}
      />
      {error && <span>{error}</span>}
    </>
  ),
}));

// Mock Select components
vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  SelectValue: () => <span data-testid="select-value" />,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children, onSelect }: any) => (
    <div role="option" onClick={() => onSelect?.(value)}>
      {children}
    </div>
  ),
}));

// Mock Label component
vi.mock("@/components/ui/label", () => ({
  Label: ({ children }: any) => <span>{children}</span>,
}));

// Mock Dialog components
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

// Mock services and toast
vi.mock("@/services/reagentApi", () => ({
  useCreateReagentMutation: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useCreateReagentMutation } from "@/services/reagentApi";
import { toast } from "sonner";

const mockUseCreateReagentMutation = vi.mocked(useCreateReagentMutation);
const mockToast = vi.mocked(toast);

describe("AddReagentModal", () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();
  const mockCreateReagent = vi.fn();

  const setup = (props = {}) =>
    render(
      <AddReagentModal
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
        {...props}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreateReagentMutation.mockReturnValue([
      mockCreateReagent,
      { isLoading: false },
    ] as any);
  });

  it("should render dialog with default values", () => {
    setup();

    expect(screen.getByText("Add New Reagent")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /name/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /catalognumber/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /manufacturer/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Usage Per Run (Min-Max-Unit)")).toBeInTheDocument();
  });

  it("should submit form successfully", async () => {
    const user = userEvent.setup();
    const mockUnwrap = vi.fn().mockResolvedValue({});
    mockCreateReagent.mockReturnValue({ unwrap: mockUnwrap });

    setup();

    await user.type(
      screen.getByRole("textbox", { name: /name/i }),
      "Reagent A"
    );
    await user.type(
      screen.getByRole("textbox", { name: /catalognumber/i }),
      "DL-100"
    );
    await user.type(
      screen.getByRole("textbox", { name: /manufacturer/i }),
      "Acme Diagnostics"
    );

    await user.click(screen.getByRole("button", { name: /Add Reagent/i }));

    await waitFor(() => {
      expect(mockCreateReagent).toHaveBeenCalled();
      expect(mockUnwrap).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        "Reagent added successfully"
      );
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("should show error when required fields are missing", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("button", { name: /Add Reagent/i }));

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith(
        "Please fill in all required fields"
      )
    );
    expect(mockCreateReagent).not.toHaveBeenCalled();
  });

  it("should show error when dosage is negative", async () => {
    setup();

    const minInput = screen.getByPlaceholderText("Min");
    fireEvent.change(minInput, { target: { value: "-1" } });

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith("Dosage cannot be negative")
    );
  });

  it("should show error when min dosage is greater than max", async () => {
    const user = userEvent.setup();
    setup();

    // Fill required fields
    await user.type(
      screen.getByRole("textbox", { name: /name/i }),
      "Reagent A"
    );
    await user.type(
      screen.getByRole("textbox", { name: /catalognumber/i }),
      "DL-100"
    );
    await user.type(
      screen.getByRole("textbox", { name: /manufacturer/i }),
      "Acme Diagnostics"
    );

    const minInput = screen.getByPlaceholderText("Min");
    const maxInput = screen.getByPlaceholderText("Max");
    await user.clear(minInput);
    await user.type(minInput, "5");
    await user.clear(maxInput);
    await user.type(maxInput, "2");

    await user.click(screen.getByRole("button", { name: /Add Reagent/i }));

    expect(mockToast.error).toHaveBeenCalledWith(
      "Min dosage cannot be greater than Max"
    );
    expect(mockCreateReagent).not.toHaveBeenCalled();
  });

  it("should show error when API call fails", async () => {
    const user = userEvent.setup();
    const mockUnwrap = vi.fn().mockRejectedValue({
      data: { message: "Server error" },
    });
    mockCreateReagent.mockReturnValue({ unwrap: mockUnwrap });

    setup();

    await user.type(
      screen.getByRole("textbox", { name: /name/i }),
      "Reagent A"
    );
    await user.type(
      screen.getByRole("textbox", { name: /catalognumber/i }),
      "DL-100"
    );
    await user.type(
      screen.getByRole("textbox", { name: /manufacturer/i }),
      "Acme Diagnostics"
    );

    await user.click(screen.getByRole("button", { name: /Add Reagent/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Server error");
    });
  });
});

