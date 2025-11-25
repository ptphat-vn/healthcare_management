import "@testing-library/jest-dom/vitest";
import type { ComponentProps, ReactNode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

const {
  mockUseDeleteTestOrderMutation,
  mockToast,
} = vi.hoisted(() => ({
  mockUseDeleteTestOrderMutation: vi.fn(),
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/services/testOrderApi", () => ({
  useDeleteTestOrderMutation: () => mockUseDeleteTestOrderMutation(),
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: ComponentProps<"button"> & { variant?: string }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("lucide-react", () => ({
  AlertTriangle: () => <svg data-testid="alert-icon" />,
}));

const baseOrder = {
  _id: "order-1",
  patientName: "John Doe",
  email: "john@example.com",
  phoneNumber: "0123456789",
  status: "pending" as const,
  createdDate: "2024-01-01T00:00:00.000Z",
  dateOfBirth: "1990-01-01",
  gender: "male" as const,
  address: "123 Street",
};

const renderDialog = (
  props?: Partial<ComponentProps<typeof DeleteConfirmDialog>>,
) => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  const onSuccess = vi.fn();
  const result = render(
    <DeleteConfirmDialog
      open
      order={{ ...baseOrder }}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      {...props}
    />,
  );
  return { onOpenChange, onSuccess, ...result };
};

describe("DeleteConfirmDialog", () => {
  let deleteSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    deleteSpy = vi.fn();
    mockUseDeleteTestOrderMutation.mockReturnValue([deleteSpy, { isLoading: false }]);
  });

  it("returns null when order is null", () => {
    const { container } = render(
      <DeleteConfirmDialog open order={null} onOpenChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders patient details", () => {
    renderDialog();

    expect(
      screen.getByRole("heading", { name: /Delete Test Order/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/0123456789/)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  it("deletes order successfully and closes dialog", async () => {
    const user = userEvent.setup();
    const unwrapSpy = vi.fn().mockResolvedValue({});
    deleteSpy.mockReturnValue({ unwrap: unwrapSpy });
    const { onOpenChange, onSuccess } = renderDialog();

    await user.click(screen.getByRole("button", { name: /Delete Test Order/i }));

    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith("order-1"));
    expect(unwrapSpy).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith(
      "Test order deleted successfully!",
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("shows error toast when deletion fails", async () => {
    const user = userEvent.setup();
    const unwrapSpy = vi.fn().mockRejectedValue({ data: { message: "Failed" } });
    deleteSpy.mockReturnValue({ unwrap: unwrapSpy });
    const { onOpenChange, onSuccess } = renderDialog();

    await user.click(screen.getByRole("button", { name: /Delete Test Order/i }));

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith("Delete failed: Failed"),
    );
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("cancels dialog when cancel button clicked", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderDialog();

    await user.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("disables buttons and shows deleting label while loading", () => {
    mockUseDeleteTestOrderMutation.mockReturnValue([deleteSpy, { isLoading: true }]);
    renderDialog();

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    const deleteBtn = screen.getByRole("button", { name: /Deleting.../i });
    expect(cancelBtn).toBeDisabled();
    expect(deleteBtn).toBeDisabled();
  });
});

