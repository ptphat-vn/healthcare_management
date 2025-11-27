import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusDistributionManagement from "./StatusDistributionManagement";
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

// Mock recharts components
vi.mock("recharts", () => ({
  ResponsiveContainer: ({
    children,
    width,
    height,
  }: {
    children?: React.ReactNode;
    width?: string;
    height?: number;
  }) => (
    <div
      data-testid="responsive-container"
      style={{ width, height: `${height}px` }}
    >
      {children}
    </div>
  ),
  PieChart: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({
    data,
    label,
    children,
  }: {
    data?: Array<{ name: string; value: number; color: string }>;
    label?: (props: { name: string; percent: number }) => string;
    children?: React.ReactNode;
  }) => (
    <div data-testid="pie" data-pie-data={JSON.stringify(data)}>
      {data?.map((item, index) => (
        <div key={index} data-testid={`pie-segment-${item.name}`}>
          {label && label({ name: item.name, percent: item.value / 100 })}
        </div>
      ))}
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill?: string }) => (
    <div data-testid="cell" data-fill={fill} />
  ),
  Tooltip: ({ content }: { content?: React.ComponentType<any> }) => (
    <div data-testid="tooltip">
      {content && <div data-testid="custom-tooltip">{content}</div>}
    </div>
  ),
}));

// Mock testOrderApi
vi.mock("@/services/testOrderApi", () => ({
  useGetAllTestOrderQuery: vi.fn(),
}));

import { useGetAllTestOrderQuery } from "@/services/testOrderApi";

const mockUseGetAllTestOrderQuery = vi.mocked(useGetAllTestOrderQuery);

describe("StatusDistributionManagement", () => {
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

    render(<StatusDistributionManagement />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Status Distribution")).toBeInTheDocument();
    expect(screen.getByText("Test order distribution")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("should display all status types in the pie chart", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    render(<StatusDistributionManagement />);

    // Check that pie chart is rendered with data
    const pie = screen.getByTestId("pie");
    expect(pie).toBeInTheDocument();

    // Check that all status segments are present
    expect(screen.getByTestId("pie-segment-Pending")).toBeInTheDocument();
    expect(screen.getByTestId("pie-segment-In Progress")).toBeInTheDocument();
    expect(screen.getByTestId("pie-segment-Completed")).toBeInTheDocument();
    expect(screen.getByTestId("pie-segment-Cancelled")).toBeInTheDocument();
  });

  it("should calculate status counts correctly", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    const { container } = render(<StatusDistributionManagement />);

    // Get the pie data attribute
    const pie = screen.getByTestId("pie");
    const pieDataAttr = pie.getAttribute("data-pie-data");
    expect(pieDataAttr).toBeTruthy();

    if (pieDataAttr) {
      const pieData = JSON.parse(pieDataAttr);
      // Should have 4 status types
      expect(pieData).toHaveLength(4);

      // Check counts: 2 pending, 1 reviewed, 2 completed, 1 cancelled
      const pendingData = pieData.find((item: any) => item.name === "Pending");
      const inProgressData = pieData.find(
        (item: any) => item.name === "In Progress"
      );
      const completedData = pieData.find(
        (item: any) => item.name === "Completed"
      );
      const cancelledData = pieData.find(
        (item: any) => item.name === "Cancelled"
      );

      expect(pendingData.value).toBe(2);
      expect(inProgressData.value).toBe(1);
      expect(completedData.value).toBe(2);
      expect(cancelledData.value).toBe(1);
    }
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

    render(<StatusDistributionManagement />);

    // Component should still render
    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Status Distribution")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();

    // All status types should still be present with 0 values
    const pie = screen.getByTestId("pie");
    const pieDataAttr = pie.getAttribute("data-pie-data");
    if (pieDataAttr) {
      const pieData = JSON.parse(pieDataAttr);
      expect(pieData).toHaveLength(4);
      pieData.forEach((item: any) => {
        expect(item.value).toBe(0);
      });
    }
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

    render(<StatusDistributionManagement />);

    // Check that cells with correct colors are rendered
    const cells = screen.getAllByTestId("cell");
    expect(cells.length).toBe(4);

    // Check for specific colors
    const fills = cells.map((cell) => cell.getAttribute("data-fill"));
    expect(fills).toContain("#F59E0B"); // Pending
    expect(fills).toContain("#3B82F6"); // In Progress
    expect(fills).toContain("#10B981"); // Completed
    expect(fills).toContain("#EF4444"); // Cancelled
  });

  it("should render tooltip component", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    render(<StatusDistributionManagement />);

    // Check that tooltip is rendered
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("should handle loading state gracefully", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    render(<StatusDistributionManagement />);

    // Component should still render
    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Status Distribution")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();

    // Pie chart should render with empty data
    const pie = screen.getByTestId("pie");
    expect(pie).toBeInTheDocument();
  });

  it("should calculate total correctly for each status", () => {
    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    const { container } = render(<StatusDistributionManagement />);

    const pie = screen.getByTestId("pie");
    const pieDataAttr = pie.getAttribute("data-pie-data");
    if (pieDataAttr) {
      const pieData = JSON.parse(pieDataAttr);
      // Total should be 6 (2+1+2+1)
      const total = pieData.reduce(
        (sum: number, item: any) => sum + item.value,
        0
      );
      expect(total).toBe(6);

      // Each item should have a total property
      pieData.forEach((item: any) => {
        expect(item.total).toBe(6);
      });
    }
  });
});
