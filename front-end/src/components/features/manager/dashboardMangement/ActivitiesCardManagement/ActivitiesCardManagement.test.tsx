import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActivitiesCardManagement from "./ActivitiesCardManagement";
import type { EventLog } from "@/types/monitor.type";

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => (
    <h2 data-testid="card-title" className={className}>
      {children}
    </h2>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Clock: () => <span data-testid="clock-icon" />,
  Activity: () => <span data-testid="activity-icon" />,
  CheckCircle2: () => <span data-testid="check-circle-icon" />,
  XCircle: () => <span data-testid="x-circle-icon" />,
  AlertCircle: () => <span data-testid="alert-circle-icon" />,
  ArrowRight: () => <span data-testid="arrow-right-icon" />,
}));

// Mock dayjs
const mockFromNow = vi.fn();
vi.mock("dayjs", () => {
  const mockDayjs = vi.fn(() => ({
    fromNow: () => mockFromNow(),
    format: vi.fn(),
  }));
  const mockDayjsWithMethods = mockDayjs as typeof mockDayjs & {
    extend: ReturnType<typeof vi.fn>;
    locale: ReturnType<typeof vi.fn>;
  };
  mockDayjsWithMethods.extend = vi.fn();
  mockDayjsWithMethods.locale = vi.fn();
  return { default: mockDayjsWithMethods };
});

// Mock eventLogApi
vi.mock("@/services/eventLogApi", () => ({
  useGetEventLogsQuery: vi.fn(),
}));

import { useGetEventLogsQuery } from "@/services/eventLogApi";

const mockUseGetEventLogsQuery = vi.mocked(useGetEventLogsQuery);

describe("ActivitiesCardManagement", () => {
  const mockEventLogs: EventLog[] = [
    {
      id: "1",
      timestamp: "2024-01-01T10:00:00Z",
      status: "error",
      action: "USER_DELETED",
      message: "User deleted",
      operator: {
        id: "op1",
        name: "John Doe",
        role: "admin",
      },
      role: "admin",
    },
    {
      id: "2",
      timestamp: "2024-01-01T09:00:00Z",
      status: "warning",
      action: "LOGIN_FAILED",
      message: "Login failed",
      operator: {
        id: "op2",
        name: "Jane Smith",
        role: "user",
      },
      role: "user",
    },
    {
      id: "3",
      timestamp: "2024-01-01T08:00:00Z",
      status: "info",
      action: "USER_CREATED",
      message: "User created",
      operator: {
        id: "op3",
        name: "Bob Johnson",
        role: "manager",
      },
      role: "manager",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFromNow.mockReturnValue("2 hours ago");

    // Mock window.location
    delete (window as { location?: Location }).location;
    (window as any).location = { href: "" } as Location;
  });

  it("should render component with activities successfully", () => {
    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: mockEventLogs,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<ActivitiesCardManagement />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Recent Activities")).toBeInTheDocument();
    expect(screen.getByText("USER_DELETED")).toBeInTheDocument();
    expect(screen.getByText("by John Doe")).toBeInTheDocument();
    expect(screen.getByText("USER_CREATED")).toBeInTheDocument();
    expect(screen.getByText("by Bob Johnson")).toBeInTheDocument();
  });

  it("should render empty state when no activities are available", () => {
    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: [],
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<ActivitiesCardManagement />);

    expect(screen.getByTestId("activity-icon")).toBeInTheDocument();
    expect(screen.getByText("No recent activities")).toBeInTheDocument();
    expect(screen.queryByText("USER_DELETED")).not.toBeInTheDocument();
  });

  it("should display correct status icons for different status types", () => {
    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: mockEventLogs,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<ActivitiesCardManagement />);

    // Check that all three types of icons are rendered
    // Error status should show XCircle icon
    expect(screen.getByTestId("x-circle-icon")).toBeInTheDocument();

    // Warning status should show AlertCircle icon
    expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();

    // Info status should show CheckCircle2 icon
    expect(screen.getByTestId("check-circle-icon")).toBeInTheDocument();
  });

  it("should format time correctly using dayjs relativeTime", () => {
    mockFromNow.mockReturnValue("5 minutes ago");

    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: [mockEventLogs[0]],
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<ActivitiesCardManagement />);

    expect(screen.getByText("5 minutes ago")).toBeInTheDocument();
    expect(mockFromNow).toHaveBeenCalled();
  });

  it("should navigate to event log page when 'View Details' button is clicked", async () => {
    const user = userEvent.setup();

    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: mockEventLogs,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<ActivitiesCardManagement />);

    const viewDetailsButton = screen.getByText("View Details");
    expect(viewDetailsButton).toBeInTheDocument();

    await user.click(viewDetailsButton);

    expect(window.location.href).toBe("/lab_manager/event-log");
  });
});
