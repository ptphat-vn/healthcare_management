import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusCardManagement from "./StatusCardManagement";
import type { TestOrder } from "@/types/testOrder.type";

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
  BarChart3: () => <span data-testid="bar-chart-icon" />,
}));

// Mock testOrderApi
vi.mock("@/services/testOrderApi", () => ({
  useGetAllTestOrderQuery: vi.fn(),
}));

import { useGetAllTestOrderQuery } from "@/services/testOrderApi";

const mockUseGetAllTestOrderQuery = vi.mocked(useGetAllTestOrderQuery);

describe("StatusCardManagement", () => {
  const mockTestOrders: TestOrder[] = [
    {
      _id: "1",
      patientName: "John Doe",
      dateOfBirth: "1990-01-01",
      gender: "male",
      address: "123 Main St",
      phoneNumber: "1234567890",
      email: "john@example.com",
      status: "pending",
      createdDate: "2024-01-01",
      createdBy: "user1",
      runDate: "2024-01-02",
      runBy: "user2",
      requestedTests: [],
      testResults: [],
      comments: [],
    },
    {
      _id: "2",
      patientName: "Jane Smith",
      dateOfBirth: "1985-05-15",
      gender: "female",
      address: "456 Oak Ave",
      phoneNumber: "0987654321",
      email: "jane@example.com",
      status: "pending",
      createdDate: "2024-01-01",
      createdBy: "user1",
      runDate: "2024-01-02",
      runBy: "user2",
      requestedTests: [],
      testResults: [],
      comments: [],
    },
    {
      _id: "3",
      patientName: "Bob Johnson",
      dateOfBirth: "1992-03-20",
      gender: "male",
      address: "789 Pine Rd",
      phoneNumber: "5555555555",
      email: "bob@example.com",
      status: "reviewed",
      createdDate: "2024-01-01",
      createdBy: "user1",
      runDate: "2024-01-02",
      runBy: "user2",
      requestedTests: [],
      testResults: [],
      comments: [],
    },
    {
      _id: "4",
      patientName: "Alice Brown",
      dateOfBirth: "1988-07-10",
      gender: "female",
      address: "321 Elm St",
      phoneNumber: "1111111111",
      email: "alice@example.com",
      status: "completed",
      createdDate: "2024-01-01",
      createdBy: "user1",
      runDate: "2024-01-02",
      runBy: "user2",
      requestedTests: [],
      testResults: [],
      comments: [],
    },
    {
      _id: "5",
      patientName: "Charlie Wilson",
      dateOfBirth: "1995-11-25",
      gender: "male",
      address: "654 Maple Dr",
      phoneNumber: "2222222222",
      email: "charlie@example.com",
      status: "completed",
      createdDate: "2024-01-01",
      createdBy: "user1",
      runDate: "2024-01-02",
      runBy: "user2",
      requestedTests: [],
      testResults: [],
      comments: [],
    },
    {
      _id: "6",
      patientName: "Diana Prince",
      dateOfBirth: "1991-09-14",
      gender: "female",
      address: "987 Cedar Ln",
      phoneNumber: "3333333333",
      email: "diana@example.com",
      status: "cancelled",
      createdDate: "2024-01-01",
      createdBy: "user1",
      runDate: "2024-01-02",
      runBy: "user2",
      requestedTests: [],
      testResults: [],
      comments: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render component with test data successfully", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    render(<StatusCardManagement />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Detailed Statistics")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart-icon")).toBeInTheDocument();
  });

  it("should display all status types with correct counts", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    render(<StatusCardManagement />);

    // Check that all status types are displayed
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();

    // Check counts: 2 pending, 1 reviewed, 2 completed, 1 cancelled
    const pendingCounts = screen.getAllByText("2");
    const inProgressCounts = screen.getAllByText("1");
    const completedCounts = screen.getAllByText("2");
    const cancelledCounts = screen.getAllByText("1");

    expect(pendingCounts.length).toBeGreaterThan(0);
    expect(inProgressCounts.length).toBeGreaterThan(0);
    expect(completedCounts.length).toBeGreaterThan(0);
    expect(cancelledCounts.length).toBeGreaterThan(0);
  });

  it("should calculate percentages correctly", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    render(<StatusCardManagement />);

    const percentages33 = screen.getAllByText("33.3%");
    const percentages167 = screen.getAllByText("16.7%");

    // Should have 2 instances of 33.3% (Pending and Completed)
    expect(percentages33.length).toBe(2);
    // Should have 2 instances of 16.7% (In Progress and Cancelled)
    expect(percentages167.length).toBe(2);
  });

  it("should render correctly when no tests are available", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: [],
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    render(<StatusCardManagement />);

    // All status types should still be displayed
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();

    // All counts should be 0
    const zeroCounts = screen.getAllByText("0");
    expect(zeroCounts.length).toBeGreaterThanOrEqual(4);

    // All percentages should be 0.0%
    const zeroPercentages = screen.getAllByText("0.0%");
    expect(zeroPercentages.length).toBe(4);
  });

  it("should display correct colors for each status type", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    const { container } = render(<StatusCardManagement />);

    // Check for color indicators (the small colored circles)
    const colorIndicators = container.querySelectorAll(
      '[style*="background-color"]'
    );

    // Should have at least 4 color indicators (one for each status)
    expect(colorIndicators.length).toBeGreaterThanOrEqual(4);

    // Check that specific colors are present
    const styles = Array.from(colorIndicators).map((el) =>
      el.getAttribute("style")
    );
    const hasPendingColor = styles.some(
      (style) =>
        style?.includes("rgb(245, 158, 11)") || style?.includes("#F59E0B")
    );
    const hasInProgressColor = styles.some(
      (style) =>
        style?.includes("rgb(59, 130, 246)") || style?.includes("#3B82F6")
    );
    const hasCompletedColor = styles.some(
      (style) =>
        style?.includes("rgb(16, 185, 129)") || style?.includes("#10B981")
    );
    const hasCancelledColor = styles.some(
      (style) =>
        style?.includes("rgb(239, 68, 68)") || style?.includes("#EF4444")
    );

    expect(hasPendingColor).toBe(true);
    expect(hasInProgressColor).toBe(true);
    expect(hasCompletedColor).toBe(true);
    expect(hasCancelledColor).toBe(true);
  });

  it("should display progress bars with correct widths based on percentages", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    const { container } = render(<StatusCardManagement />);

    // Find all progress bars (divs with width style)
    const progressBars = container.querySelectorAll('[style*="width"]');

    // Should have 4 progress bars (one for each status)
    expect(progressBars.length).toBeGreaterThanOrEqual(4);

    // Check that widths are set correctly (should be percentages)
    const widths = Array.from(progressBars).map((el) =>
      el.getAttribute("style")
    );
    const hasNonZeroWidth = widths.some(
      (style) => style?.includes("width") && !style?.includes("0%")
    );
    expect(hasNonZeroWidth).toBe(true);
  });

  it("should handle loading state gracefully", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    render(<StatusCardManagement />);

    // Component should still render with empty data
    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Detailed Statistics")).toBeInTheDocument();

    // All status types should be displayed with 0 counts
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });
});
