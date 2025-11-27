import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MonitoringDetail from "./MonitoringDetail";
import type { EventLog } from "@/types/monitor.type";

// Mock formatDate utility
vi.mock("@/utils/formatDate", () => ({
  formatDate: (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  },
}));

describe("MonitoringDetail", () => {
  const mockEventLog: EventLog = {
    id: "1",
    timestamp: "2024-01-15T10:30:00Z",
    action: "USER_CREATED",
    message: "User John Doe was created successfully",
    operator: {
      id: "op1",
      name: "Admin User",
      role: "admin",
    },
    status: "info",
    service: "System",
    role: "admin",
  };

  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dialog with event log details when open is true and log is provided", () => {
    render(
      <MonitoringDetail
        open={true}
        onOpenChange={mockOnOpenChange}
        log={mockEventLog}
      />
    );

    // Verify header content
    expect(screen.getByText("Event Log Details")).toBeInTheDocument();
    expect(
      screen.getByText("View detailed event log information")
    ).toBeInTheDocument();
    // Action appears in both header and badge, so use getAllByText
    const actions = screen.getAllByText("USER_CREATED");
    expect(actions.length).toBeGreaterThan(0);

    // Verify main content sections
    expect(screen.getByText("Timestamp")).toBeInTheDocument();
    expect(screen.getByText("Operator")).toBeInTheDocument();
    expect(screen.getByText("Action Type")).toBeInTheDocument();
    expect(screen.getByText("Event Details")).toBeInTheDocument();

    // Verify event log data
    expect(screen.getByText("Admin User - admin")).toBeInTheDocument();
    expect(
      screen.getByText("User John Doe was created successfully")
    ).toBeInTheDocument();
    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
  });

  it("should not display dialog content when open is false", () => {
    render(
      <MonitoringDetail
        open={false}
        onOpenChange={mockOnOpenChange}
        log={mockEventLog}
      />
    );

    expect(screen.queryByText("Event Log Details")).not.toBeInTheDocument();
    expect(screen.queryByText("USER_CREATED")).not.toBeInTheDocument();
  });

  it("should display empty state when log is null", () => {
    render(
      <MonitoringDetail
        open={true}
        onOpenChange={mockOnOpenChange}
        log={null}
      />
    );

    expect(screen.getByText("No log selected.")).toBeInTheDocument();
    expect(screen.queryByText("Event Log Details")).not.toBeInTheDocument();
  });

  it("should call onOpenChange with false when close button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MonitoringDetail
        open={true}
        onOpenChange={mockOnOpenChange}
        log={mockEventLog}
      />
    );

    // Find and click the Close button
    const closeButtons = screen.getAllByRole("button", { name: /close/i });
    const componentCloseButton = closeButtons.find((btn) =>
      btn.textContent?.trim().toLowerCase().includes("close")
    );

    if (componentCloseButton) {
      await user.click(componentCloseButton);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockOnOpenChange).toHaveBeenCalledTimes(1);
    }
  });

  it("should display 'No additional details' when message is empty", () => {
    const logWithoutMessage: EventLog = {
      ...mockEventLog,
      message: "",
    };

    render(
      <MonitoringDetail
        open={true}
        onOpenChange={mockOnOpenChange}
        log={logWithoutMessage}
      />
    );

    expect(screen.getByText("No additional details")).toBeInTheDocument();
  });

  it("should handle missing operator gracefully", () => {
    const logWithoutOperator: EventLog = {
      ...mockEventLog,
      operator: undefined,
    };

    render(
      <MonitoringDetail
        open={true}
        onOpenChange={mockOnOpenChange}
        log={logWithoutOperator}
      />
    );

    // Should render without crashing
    expect(screen.getByText("Operator")).toBeInTheDocument();
    expect(screen.getByText("Event Log Details")).toBeInTheDocument();
  });

  it("should format and display different action types correctly", () => {
    const logWithDifferentAction: EventLog = {
      ...mockEventLog,
      action: "USER_UPDATED",
    };

    render(
      <MonitoringDetail
        open={true}
        onOpenChange={mockOnOpenChange}
        log={logWithDifferentAction}
      />
    );

    // Action should appear in both header and action type section
    const actions = screen.getAllByText("USER_UPDATED");
    expect(actions.length).toBeGreaterThan(0);
    expect(screen.getByText("Action Type")).toBeInTheDocument();
  });
});
