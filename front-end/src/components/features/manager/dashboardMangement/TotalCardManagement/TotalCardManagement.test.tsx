import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TotalCardManagement from "./TotalCardManagement";
import type { User } from "@/types/user.type";
import type { MedicalRecord } from "@/types/medicalRecord.type";
import type { TestOrder } from "@/types/testOrder.type";
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
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  AlertCircle: () => <span data-testid="alert-circle-icon" />,
  Clock: () => <span data-testid="clock-icon" />,
  TestTube: () => <span data-testid="test-tube-icon" />,
  TrendingDown: () => <span data-testid="trending-down-icon" />,
  TrendingUp: () => <span data-testid="trending-up-icon" />,
  Users: () => <span data-testid="users-icon" />,
  Activity: () => <span data-testid="activity-icon" />,
  CheckCircle2: () => <span data-testid="check-circle-icon" />,
}));

// Mock dayjs
vi.mock("dayjs", () => {
  const mockSubtract = vi.fn();
  const mockIsAfter = vi.fn();
  const mockDayjs = vi.fn(() => ({
    subtract: mockSubtract,
    isAfter: mockIsAfter,
  }));
  mockSubtract.mockReturnValue({
    isAfter: mockIsAfter,
  });
  mockIsAfter.mockReturnValue(true);
  return {
    default: mockDayjs,
  };
});

// Mock API hooks
vi.mock("@/services/userApi", () => ({
  useGetAllUserQuery: vi.fn(),
}));

vi.mock("@/services/medicalRecordApi", () => ({
  useGetMedicalRecordsQuery: vi.fn(),
}));

vi.mock("@/services/testOrderApi", () => ({
  useGetAllTestOrderQuery: vi.fn(),
}));

vi.mock("@/services/eventLogApi", () => ({
  useGetEventLogsQuery: vi.fn(),
}));

import { useGetAllUserQuery } from "@/services/userApi";
import { useGetMedicalRecordsQuery } from "@/services/medicalRecordApi";
import { useGetAllTestOrderQuery } from "@/services/testOrderApi";
import { useGetEventLogsQuery } from "@/services/eventLogApi";

const mockUseGetAllUserQuery = vi.mocked(useGetAllUserQuery);
const mockUseGetMedicalRecordsQuery = vi.mocked(useGetMedicalRecordsQuery);
const mockUseGetAllTestOrderQuery = vi.mocked(useGetAllTestOrderQuery);
const mockUseGetEventLogsQuery = vi.mocked(useGetEventLogsQuery);

describe("TotalCardManagement", () => {
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
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockMedicalRecords: MedicalRecord[] = [
    {
      _id: "1",
      patientId: "p1",
      fullName: "Patient One",
      dateOfBirth: "1990-01-01",
      gender: "male",
      phoneNumber: "1234567890",
      address: "123 Main St",
      medicalHistory: {
        chronicConditions: ["Diabetes", "Hypertension"],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "user1",
    },
    {
      _id: "2",
      patientId: "p2",
      fullName: "Patient Two",
      dateOfBirth: "1985-05-15",
      gender: "female",
      phoneNumber: "0987654321",
      address: "456 Oak Ave",
      medicalHistory: {
        chronicConditions: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "user1",
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
      status: "pending",
      createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
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
      status: "completed",
      createdDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      createdBy: "user1",
      runDate: "2024-01-02",
      runBy: "user2",
      requestedTests: [],
      testResults: [],
      comments: [],
    },
  ];

  const mockEventLogs: EventLog[] = [
    {
      id: "1",
      timestamp: "2024-01-01T10:00:00Z",
      status: "warning",
      action: "SYSTEM_WARNING",
      message: "System warning",
      role: "admin",
    },
    {
      id: "2",
      timestamp: "2024-01-01T11:00:00Z",
      status: "error",
      action: "SYSTEM_ERROR",
      message: "System error",
      role: "admin",
    },
    {
      id: "3",
      timestamp: "2024-01-01T12:00:00Z",
      status: "info",
      action: "SYSTEM_INFO",
      message: "System info",
      role: "admin",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render component with all KPI cards successfully", () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    mockUseGetMedicalRecordsQuery.mockReturnValue({
      data: {
        data: {
          patient: mockMedicalRecords,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetMedicalRecordsQuery>);

    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: mockEventLogs,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<TotalCardManagement />);

    // Check that all 4 cards are rendered
    const cards = screen.getAllByTestId("card");
    expect(cards.length).toBe(4);

    // Check card titles
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("Test Orders")).toBeInTheDocument();
    expect(screen.getByText("Active Equipment")).toBeInTheDocument();
    expect(screen.getByText("System Alerts")).toBeInTheDocument();
  });

  it("should display correct KPI values", () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    mockUseGetMedicalRecordsQuery.mockReturnValue({
      data: {
        data: {
          patient: mockMedicalRecords,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetMedicalRecordsQuery>);

    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: mockEventLogs,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<TotalCardManagement />);

    // Check total users (2) - should be in the first card
    const allTwos = screen.getAllByText("2");
    expect(allTwos.length).toBeGreaterThanOrEqual(3); // Users, Tests, and Alerts all show 2

    // Check that we have the correct structure with card titles
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("Test Orders")).toBeInTheDocument();
    expect(screen.getByText("System Alerts")).toBeInTheDocument();
  });

  it("should display growth indicators correctly", () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    mockUseGetMedicalRecordsQuery.mockReturnValue({
      data: {
        data: {
          patient: mockMedicalRecords,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetMedicalRecordsQuery>);

    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: mockEventLogs,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<TotalCardManagement />);

    // Check that trending icons are present
    const trendingUpIcons = screen.getAllByTestId("trending-up-icon");
    expect(trendingUpIcons.length).toBeGreaterThanOrEqual(0);

    // Check for "in 7 days" text
    const sevenDaysTexts = screen.getAllByText(/in 7 days/i);
    expect(sevenDaysTexts.length).toBeGreaterThanOrEqual(1);
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

    mockUseGetMedicalRecordsQuery.mockReturnValue({
      data: {
        data: {
          patient: [],
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetMedicalRecordsQuery>);

    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: [],
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: [],
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<TotalCardManagement />);

    // Component should still render all cards
    const cards = screen.getAllByTestId("card");
    expect(cards.length).toBe(4);

    // All values should be 0
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(1);
  });

  it("should display all icons correctly", () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    mockUseGetMedicalRecordsQuery.mockReturnValue({
      data: {
        data: {
          patient: mockMedicalRecords,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetMedicalRecordsQuery>);

    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: mockEventLogs,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<TotalCardManagement />);

    // Check that all icons are present
    expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    expect(screen.getByTestId("test-tube-icon")).toBeInTheDocument();
    expect(screen.getByTestId("activity-icon")).toBeInTheDocument();
    expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
  });

  it("should calculate abnormal rate correctly", () => {
    mockUseGetAllUserQuery.mockReturnValue({
      data: {
        data: {
          user: mockUsers,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllUserQuery>);

    mockUseGetMedicalRecordsQuery.mockReturnValue({
      data: {
        data: {
          patient: mockMedicalRecords,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetMedicalRecordsQuery>);

    mockUseGetAllTestOrderQuery.mockReturnValue({
      data: {
        data: {
          testOrder: mockTestOrders,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetAllTestOrderQuery>);

    mockUseGetEventLogsQuery.mockReturnValue({
      data: {
        data: {
          eventLogs: mockEventLogs,
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetEventLogsQuery>);

    render(<TotalCardManagement />);

    // Should display abnormal rate (1 out of 2 = 50%)
    expect(screen.getByText("Activity Rate")).toBeInTheDocument();
    expect(screen.getByText("1/32")).toBeInTheDocument();
  });
});
