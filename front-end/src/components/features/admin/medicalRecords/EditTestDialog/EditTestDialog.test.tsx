import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditTestDialog from "./EditTestDialog";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from "sonner";

const mockToast = vi.mocked(toast);

describe("EditTestDialog", () => {
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

  it("should render dialog with test data when open is true and test is provided", async () => {
    render(
      <EditTestDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        test={mockTest}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Edit Test Order")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Blood Test")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2024-01-15")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Dr. Smith")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Normal")).toBeInTheDocument();
    });

    // Verify form labels
    expect(screen.getByText(/Test Type/)).toBeInTheDocument();
    expect(screen.getByText(/Test Date/)).toBeInTheDocument();
    expect(screen.getByText(/Status/)).toBeInTheDocument();
    expect(screen.getByText(/Performed By/)).toBeInTheDocument();
    expect(screen.getByText(/Priority/)).toBeInTheDocument();
    expect(screen.getByText(/Results/)).toBeInTheDocument();
  });

  it("should not render when editForm is null", () => {
    render(
      <EditTestDialog open={true} onOpenChange={mockOnOpenChange} test={null} />
    );

    expect(screen.queryByText("Edit Test Order")).not.toBeInTheDocument();
  });

  it("should update form fields when user types", async () => {
    const user = userEvent.setup();

    render(
      <EditTestDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        test={mockTest}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Blood Test")).toBeInTheDocument();
    });

    // Update test type
    const testTypeInput = screen.getByLabelText(/Test Type/);
    await user.clear(testTypeInput);
    await user.type(testTypeInput, "Urine Test");

    expect(screen.getByDisplayValue("Urine Test")).toBeInTheDocument();

    // Update performed by
    const performedByInput = screen.getByLabelText(/Performed By/);
    await user.clear(performedByInput);
    await user.type(performedByInput, "Dr. Johnson");

    expect(screen.getByDisplayValue("Dr. Johnson")).toBeInTheDocument();
  });

  it("should call onOpenChange with false and show success toast when save button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <EditTestDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        test={mockTest}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Update")).toBeInTheDocument();
    });

    const updateButton = screen.getByRole("button", { name: /update/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Test history updated successfully"
      );
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("should call onOpenChange with false when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <EditTestDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        test={mockTest}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnOpenChange).toHaveBeenCalledTimes(1);
  });
});
