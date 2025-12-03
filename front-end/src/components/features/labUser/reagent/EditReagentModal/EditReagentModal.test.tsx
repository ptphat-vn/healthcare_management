import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditReagentModal from "./EditReagentModal";
import type { Reagent } from "@/types/reagent.type";

// Mock UI components
vi.mock("@/components/ui/input", () => ({
  Input: ({ label, error, required: _req, ...props }: any) => (
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

vi.mock("@/components/ui/label", () => ({
  Label: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: () => <span data-testid="select-value" />,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, onSelect, children }: any) => (
    <div role="option" onClick={() => onSelect?.(value)}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

// Mock hooks and utils
vi.mock("@/services/reagentApi", () => ({
  useUpdateReagentMutation: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    user: { data: { roleCode: "lab_user" } },
  })),
}));

vi.mock("@/utils/getRoleButtonClass", () => ({
  getRoleButtonClass: vi.fn(() => "btn-lab-user"),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("lucide-react", () => {
  const Icon = () => <span data-testid="icon" />;
  return {
    Loader2: () => <span data-testid="loader" />,
    Minus: Icon,
    Plus: Icon,
  };
});

import { useUpdateReagentMutation } from "@/services/reagentApi";
import { toast } from "sonner";

const mockUseUpdateReagentMutation = vi.mocked(useUpdateReagentMutation);
const mockToast = vi.mocked(toast);

const reagent: Reagent = {
  _id: "1",
  name: "Reagent A",
  catalogNumber: "DL-100",
  manufacturer: "Acme Diagnostics",
  casNumber: "1234-56-7",
  description: "Initial desc",
  usagePerRun: { min: 1, max: 5, unit: "ml" },
  ratio: "1:10",
  categories: ["Chemical"],
  storageCondition: "2-8°C",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  createdBy: "user-1",
};

describe("EditReagentModal", () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();
  const mockUpdateReagent = vi.fn();

  const renderModal = (props = {}) =>
    render(
      <EditReagentModal
        open
        onOpenChange={onOpenChange}
        reagent={reagent}
        onSuccess={onSuccess}
        {...props}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUpdateReagentMutation.mockReturnValue([
      mockUpdateReagent,
      { isLoading: false },
    ] as any);
  });

  it("should render dialog with reagent values", async () => {
    renderModal();

    expect(screen.getByText("Edit Reagent")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Reagent A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("DL-100")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Acme Diagnostics")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Initial desc")).toBeInTheDocument();
  });

  it("should update values and submit successfully", async () => {
    const user = userEvent.setup();
    const mockUnwrap = vi.fn().mockResolvedValue({});
    mockUpdateReagent.mockReturnValue({ unwrap: mockUnwrap });

    renderModal();

    const nameInput = screen.getByDisplayValue("Reagent A");
    await user.clear(nameInput);
    await user.type(nameInput, "Reagent B");

    const descInput = screen.getByDisplayValue("Initial desc");
    await user.clear(descInput);
    await user.type(descInput, "Updated desc");

    await user.click(screen.getByRole("button", { name: /update reagent/i }));

    await waitFor(() => {
      expect(mockUpdateReagent).toHaveBeenCalled();
      expect(mockUnwrap).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        "Reagent updated successfully"
      );
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("should show error when required fields are missing", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.clear(screen.getByDisplayValue("Reagent A"));
    await user.click(screen.getByRole("button", { name: /update reagent/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Please fill in all required fields"
      );
      expect(mockUpdateReagent).not.toHaveBeenCalled();
    });
  });

  it("should show error when dosage is negative", () => {
    renderModal();
    const minInput = screen.getByPlaceholderText("Min");
    fireEvent.change(minInput, { target: { value: "-1" } });

    expect(mockToast.error).toHaveBeenCalledWith("Dosage cannot be negative");
  });

  it("should show error when min dosage greater than max", async () => {
    const user = userEvent.setup();
    renderModal();

    const minInput = screen.getByPlaceholderText("Min");
    const maxInput = screen.getByPlaceholderText("Max");

    await user.clear(minInput);
    await user.type(minInput, "10");
    await user.clear(maxInput);
    await user.type(maxInput, "5");

    await user.click(screen.getByRole("button", { name: /update reagent/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Min dosage cannot be greater than Max"
      );
      expect(mockUpdateReagent).not.toHaveBeenCalled();
    });
  });

  it("should show error when API fails", async () => {
    const user = userEvent.setup();
    const mockUnwrap = vi
      .fn()
      .mockRejectedValue({ data: { message: "Server error" } });
    mockUpdateReagent.mockReturnValue({ unwrap: mockUnwrap });

    renderModal();

    await user.click(screen.getByRole("button", { name: /update reagent/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Server error");
    });
  });
});
