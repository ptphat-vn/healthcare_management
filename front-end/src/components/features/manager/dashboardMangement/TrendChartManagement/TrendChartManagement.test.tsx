import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TrendChartManagement from "./TrendChartManagement";
import type { User } from "@/types/user.type";
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
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  BarChart3: () => <span data-testid="bar-chart-icon" />,
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
  AreaChart: ({
    data,
    children,
  }: {
    data?: Array<{
      date: string;
      users: number;
      tests: number;
      completed: number;
    }>;
    children?: React.ReactNode;
  }) => (
    <div data-testid="area-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Area: ({
    dataKey,
    name,
    stroke,
    fill,
  }: {
    dataKey?: string;
    name?: string;
    stroke?: string;
    fill?: string;
  }) => (
    <div
      data-testid="area"
      data-key={dataKey}
      data-name={name}
      data-stroke={stroke}
      data-fill={fill}
    />
  ),
  XAxis: ({ dataKey }: { dataKey?: string }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ contentStyle }: { contentStyle?: Record<string, any> }) => (
    <div data-testid="tooltip" data-style={JSON.stringify(contentStyle)} />
  ),
  Legend: () => <div data-testid="legend" />,
}));

// Mock dayjs
vi.mock("dayjs", () => {
  const mockFormat = vi.fn((format: string) => {
    if (format === "DD/MM") return "01/01";
    if (format === "YYYY-MM-DD") return "2024-01-01";
    return "2024-01-01";
  });

  const mockSubtract = vi.fn(() => ({
    format: mockFormat,
  }));

  const mockDayjs = vi.fn((_date?: string) => ({
    format: mockFormat,
    subtract: mockSubtract,
  }));

  // Mock dayjs() without arguments
  const dayjsFn = (date?: string) => {
    if (!date) {
      return {
        format: mockFormat,
        subtract: mockSubtract,
      };
    }
    return mockDayjs(date);
  };

  dayjsFn.subtract = mockSubtract;
  dayjsFn.format = mockFormat;

  return {
    default: dayjsFn,
  };
});

// Mock API hooks
vi.mock("@/services/userApi", () => ({
  useGetAllUserQuery: vi.fn(),
}));

vi.mock("@/services/testOrderApi", () => ({
  useGetAllTestOrderQuery: vi.fn(),
}));

import { useGetAllUserQuery } from "@/services/userApi";
import { useGetAllTestOrderQuery } from "@/services/testOrderApi";

const mockUseGetAllUserQuery = vi.mocked(useGetAllUserQuery);
const mockUseGetAllTestOrderQuery = vi.mocked(useGetAllTestOrderQuery);

describe("TrendChartManagement", () => {
  const mockUsers: User[] = [
    {
      _id: "1",
      fullName: "John Doe",
      email: "john@example.com",
      phoneNumber: "1234567890",
      identifyNumber: "ID001",
      gender: "male",
      dateOfBirth: "1990-01-01",
      status: 1,
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-01-01T10:00:00Z",
    },
    {
      _id: "2",
      fullName: "Jane Smith",
      email: "jane@example.com",
      phoneNumber: "0987654321",
      identifyNumber: "ID002",
      gender: "female",
      dateOfBirth: "1985-05-15",
      status: 1,
      createdAt: "2024-01-02T10:00:00Z",
      updatedAt: "2024-01-02T10:00:00Z",
    },
  ];

  const mockTestOrders: TestOrder[] = [
    {
      _id: "1",
      patientName: "John Doe",
      dateOfBirth: "1990-01-01",
      gender: "male",
      address: "123 Main St",
      phoneNumber: "1234567890",
      email: "john@example.com",
      status: "completed",
      createdDate: "2024-01-01T10:00:00Z",
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
      createdDate: "2024-01-02T10:00:00Z",
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

  it("should render component successfully", () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    render(<TrendChartManagement />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("7-Day Trend")).toBeInTheDocument();
    expect(screen.getByText("User and test statistics")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart-icon")).toBeInTheDocument();
  });

  it("should display chart with data", () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    render(<TrendChartManagement />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("should render area components with correct names", () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    render(<TrendChartManagement />);

    const areas = screen.getAllByTestId("area");
    expect(areas.length).toBe(2);

    // Check Users area
    const usersArea = areas.find(
      (area) => area.getAttribute("data-name") === "Users"
    );
    expect(usersArea).toBeInTheDocument();
    expect(usersArea?.getAttribute("data-key")).toBe("users");

    // Check Tests area
    const testsArea = areas.find(
      (area) => area.getAttribute("data-name") === "Tests"
    );
    expect(testsArea).toBeInTheDocument();
    expect(testsArea?.getAttribute("data-key")).toBe("tests");
  });

  it("should handle empty data gracefully", () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: [],
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: [],
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    render(<TrendChartManagement />);

    // Component should still render
    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("7-Day Trend")).toBeInTheDocument();
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();

    // Chart should have data (even if empty)
    const areaChart = screen.getByTestId("area-chart");
    const chartData = areaChart.getAttribute("data-chart-data");
    expect(chartData).toBeTruthy();
  });
});
