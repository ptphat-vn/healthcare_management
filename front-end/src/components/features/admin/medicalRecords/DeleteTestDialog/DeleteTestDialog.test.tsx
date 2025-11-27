import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteTestDialog from "./DeleteTestDialog";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from "sonner";

const mockToast = vi.mocked(toast);

describe("DeleteTestDialog", () => {
  const mockTest = {
    id: "1",
    testType: "Blood Test",
    testDate: "2024-01-15",
    status: "Pending" as const,
    priority: "NORMAL" as const,
    performedBy: "Dr. Smith",
    results: "Normal",
  };

  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dialog with test information when open is true and test is provided", () => {
    render(
      <DeleteTestDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        test={mockTest}
      />
    );

    expect(screen.getByText("Delete Test History")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Are you sure you want to delete this test history? This action cannot be undone."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Test ID:")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Test Type:")).toBeInTheDocument();
    expect(screen.getByText("Blood Test")).toBeInTheDocument();
    expect(screen.getByText("Date:")).toBeInTheDocument();
  });

  it("should not render when test is null", () => {
    const { container } = render(
      <DeleteTestDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        test={null}
      />
    );

    expect(screen.queryByText("Delete Test History")).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it("should not display dialog content when open is false", () => {
    render(
      <DeleteTestDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        test={mockTest}
      />
    );

    expect(screen.queryByText("Delete Test History")).not.toBeInTheDocument();
  });

  it("should display correct test information", () => {
    render(
      <DeleteTestDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        test={mockTest}
      />
    );

    // Verify test details are displayed
    expect(screen.getByText("1")).toBeInTheDocument(); // Test ID
    expect(screen.getByText("Blood Test")).toBeInTheDocument(); // Test Type
    // Date is formatted, so check for date format
    const dateText = screen.getByText(/Date:/);
    expect(dateText).toBeInTheDocument();
    // Check that formatted date is present
    const formattedDate = new Date("2024-01-15").toLocaleDateString();
    expect(
      screen.getByText(
        new RegExp(formattedDate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      )
    ).toBeInTheDocument();
  });

  it("should call onOpenChange with false and show success toast when delete button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <DeleteTestDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        test={mockTest}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Test history deleted successfully"
      );
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("should call onOpenChange with false when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <DeleteTestDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        test={mockTest}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnOpenChange).toHaveBeenCalledTimes(1);
  });
});
