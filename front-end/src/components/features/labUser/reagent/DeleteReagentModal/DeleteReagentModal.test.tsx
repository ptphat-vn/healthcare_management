import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteReagentModal from "./DeleteReagentModal";
import type { Reagent } from "@/types/reagent.type";

// Mock Dialog components
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogTitle: ({ children }: React.PropsWithChildren) => <h2>{children}</h2>,
  DialogDescription: ({ children }: React.PropsWithChildren) => <p>{children}</p>,
  DialogFooter: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}));

// Mock service and toast
vi.mock("@/services/reagentApi", () => ({
  useDeleteReagentMutation: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <span data-testid="loader" />,
  AlertTriangle: () => <span data-testid="alert-triangle" />,
}));

import { useDeleteReagentMutation } from "@/services/reagentApi";
import { toast } from "sonner";

const mockUseDeleteReagentMutation = vi.mocked(useDeleteReagentMutation);
const mockToast = vi.mocked(toast);

const reagent: Reagent = {
  _id: "1",
  name: "Reagent A",
  catalogNumber: "DL-100",
  manufacturer: "Acme Diagnostics",
} as Reagent;

describe("DeleteReagentModal", () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();
  const mockDeleteReagent = vi.fn();

  const renderModal = (props = {}) =>
    render(
      <DeleteReagentModal
        open
        onOpenChange={onOpenChange}
        reagent={reagent}
        onSuccess={onSuccess}
        {...props}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeleteReagentMutation.mockReturnValue([
      mockDeleteReagent,
      { isLoading: false },
    ] as unknown as ReturnType<typeof useDeleteReagentMutation>);
  });

  it("should render dialog with reagent information", () => {
    mockDeleteReagent.mockReturnValue({ unwrap: vi.fn() });

    renderModal();

    expect(screen.getByText("Delete Reagent")).toBeInTheDocument();
    expect(screen.getByText("Reagent A")).toBeInTheDocument();
    expect(
      screen.getByText(/Catalog: DL-100 \| Manufacturer: Acme Diagnostics/)
    ).toBeInTheDocument();
  });

  it("should not call delete when reagent is null", async () => {
    const user = userEvent.setup();
    const mockUnwrap = vi.fn();
    mockDeleteReagent.mockReturnValue({ unwrap: mockUnwrap });

    render(
      <DeleteReagentModal
        open
        onOpenChange={onOpenChange}
        reagent={null}
        onSuccess={onSuccess}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    expect(mockDeleteReagent).not.toHaveBeenCalled();
    expect(mockUnwrap).not.toHaveBeenCalled();
  });

  it("should delete reagent and show success toast", async () => {
    const user = userEvent.setup();
    const mockUnwrap = vi.fn().mockResolvedValue({});
    mockDeleteReagent.mockReturnValue({ unwrap: mockUnwrap });

    renderModal();

    await user.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(mockDeleteReagent).toHaveBeenCalledWith("1");
      expect(mockUnwrap).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        "Reagent deleted successfully"
      );
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("should show error toast when delete fails", async () => {
    const user = userEvent.setup();
    const mockError = { data: { message: "Server error" } };
    const mockUnwrap = vi.fn().mockRejectedValue(mockError);
    mockDeleteReagent.mockReturnValue({ unwrap: mockUnwrap });

    renderModal();

    await user.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(mockDeleteReagent).toHaveBeenCalledWith("1");
      expect(mockUnwrap).toHaveBeenCalled();
      expect(mockToast.error).toHaveBeenCalledWith("Server error");
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it("should call onOpenChange with false when cancel is clicked", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
