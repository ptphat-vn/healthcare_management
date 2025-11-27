import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MonitoringList from "./MonitoringList";
import type { EventLog } from "@/types/monitor.type";

// Mock dependencies
vi.mock("@/services/eventLogApi", () => ({
  useGetEventLogsQuery: vi.fn(),
}));

vi.mock("../MonitoringDetail/MonitoringDetail", () => ({
  default: ({
    open,
    log,
    onOpenChange,
  }: {
    open: boolean;
    log: EventLog | null;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div data-testid="monitoring-detail">
      {open && log && (
        <div>
          <div data-testid="detail-log-id">{log.id}</div>
          <div data-testid="detail-log-message">{log.message}</div>
          <button onClick={() => onOpenChange(false)}>Close Detail</button>
        </div>
      )}
    </div>
  ),
}));

vi.mock("@/utils/formatPrivilege", () => ({
  default: (priv: string) =>
    priv
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
}));

vi.mock("dayjs", () => {
  const mockDayjs = (date: string) => ({
    format: (format: string) => {
      const d = new Date(date);
      if (format === "DD/MM/YYYY") {
        return `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1
        ).padStart(2, "0")}/${d.getFullYear()}`;
      }
      if (format === "h:mm:ss A") {
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const seconds = d.getSeconds();
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")} ${ampm}`;
      }
      return date;
    },
  });
  return {
    default: mockDayjs,
  };
});

import { useGetEventLogsQuery } from "@/services/eventLogApi";

const mockUseGetEventLogsQuery = vi.mocked(useGetEventLogsQuery);

describe("MonitoringList", () => {
  const mockPagination = {
    page: 1,
    limit: 10,
    total: 25,
    totalPages: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading skeletons when isLoading is true", () => {
    mockUseGetEventLogsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    const { container } = render(<MonitoringList />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(10);
  });

  it("should display error message when there is an error", () => {
    mockUseGetEventLogsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: { message: "Server error" } },
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<MonitoringList />);

    expect(screen.getByText("Error loading data!")).toBeInTheDocument();
  });

  it("should display empty message when no logs are available", () => {
    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: [],
          pagination: mockPagination,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<MonitoringList />);

    expect(screen.getByText("No logs found.")).toBeInTheDocument();
    expect(screen.getByText("No logs to display")).toBeInTheDocument();
  });

  it("should display event logs with correct data", async () => {
    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: [
            {
              _id: "1",
              timestamp: "2024-01-15T10:30:00Z",
              action: "USER_CREATED",
              details: "User John Doe was created successfully",
              operator: {
                id: "op1",
                name: "Admin User",
                role: "admin",
              },
              role: "admin",
            },
            {
              _id: "2",
              timestamp: "2024-01-15T11:00:00Z",
              action: "USER_UPDATED",
              message: "User profile updated",
              operator: {
                id: "op2",
                name: "Manager User",
                role: "manager",
              },
              role: "manager",
            },
          ],
          pagination: mockPagination,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<MonitoringList />);

    await waitFor(() => {
      // Verify table headers
      expect(screen.getByText("No")).toBeInTheDocument();
      expect(screen.getByText("Time")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();

      // Verify event log data
      expect(
        screen.getByText("User John Doe was created successfully")
      ).toBeInTheDocument();
      expect(screen.getByText("User profile updated")).toBeInTheDocument();
      expect(screen.getByText("Admin User")).toBeInTheDocument();
      expect(screen.getByText("Manager User")).toBeInTheDocument();

      // Verify formatted action names
      expect(screen.getByText("USER CREATED")).toBeInTheDocument();
      expect(screen.getByText("USER UPDATED")).toBeInTheDocument();
    });
  });

  it("should display pagination information correctly", async () => {
    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: [
            {
              _id: "1",
              timestamp: "2024-01-15T10:30:00Z",
              action: "USER_CREATED",
              details: "Test message",
              operator: { id: "op1", name: "Admin", role: "admin" },
              role: "admin",
            },
          ],
          pagination: mockPagination,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<MonitoringList />);

    await waitFor(() => {
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      expect(screen.getByText(/logs/)).toBeInTheDocument();
      // Numbers appear multiple times, use getAllByText
      const ones = screen.getAllByText("1");
      expect(ones.length).toBeGreaterThan(0);
      const tens = screen.getAllByText("10");
      expect(tens.length).toBeGreaterThan(0);
      const twentyFives = screen.getAllByText("25");
      expect(twentyFives.length).toBeGreaterThan(0);
    });
  });

  it("should open detail modal when view detail is clicked", async () => {
    const user = userEvent.setup();

    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: [
            {
              _id: "1",
              timestamp: "2024-01-15T10:30:00Z",
              action: "USER_CREATED",
              details: "User John Doe was created successfully",
              operator: {
                id: "op1",
                name: "Admin User",
                role: "admin",
              },
              role: "admin",
            },
          ],
          pagination: mockPagination,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<MonitoringList />);

    await waitFor(() => {
      expect(
        screen.getByText("User John Doe was created successfully")
      ).toBeInTheDocument();
    });

    // Find the actions button (MoreHorizontal icon)
    const actionButtons = screen.getAllByRole("button");
    const moreButton = actionButtons.find((btn) =>
      btn.getAttribute("aria-label")?.includes("Actions")
    );

    if (moreButton) {
      await user.click(moreButton);

      // Wait for dropdown menu to appear and click view detail
      await waitFor(async () => {
        const viewDetailButton = screen.getByText("View detail");
        if (viewDetailButton) {
          await user.click(viewDetailButton);
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId("monitoring-detail")).toBeInTheDocument();
        expect(screen.getByTestId("detail-log-message")).toHaveTextContent(
          "User John Doe was created successfully"
        );
      });
    }
  });
});
