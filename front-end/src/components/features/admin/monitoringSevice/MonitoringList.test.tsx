import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock baseApi để tránh lỗi import.meta.env
jest.mock("@/services/baseApi", () => ({
  baseApi: {
    reducerPath: "baseApi",
    reducer: jest.fn(),
    middleware: jest.fn(),
  },
}));

// Mock eventLogApi
jest.mock("@/services/eventLogApi", () => ({
  useGetEventLogsQuery: jest.fn(),
}));

// Mock formatPrivilege - export default
jest.mock("@/utils/formatPrivilege", () => ({
  __esModule: true,
  default: jest.fn((val: string) => `FMT-${val}`),
}));

// Mock dayjs - Return default export
jest.mock("dayjs", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    format: jest.fn((fmt: string) => {
      if (fmt === "DD/MM/YYYY") return "01/01/2023";
      if (fmt === "h:mm:ss A") return "12:00:00 PM";
      return "";
    }),
  })),
}));

// Mock MonitoringDetail component
jest.mock("./MonitoringDetail", () => ({
  __esModule: true,
  default: ({ open, log }: { open: boolean; log: { id: string } | null }) =>
    open ? <div data-testid="monitoring-detail">Detail: {log?.id}</div> : null,
}));


// IMPORTS - Sau khi mock
import MonitoringList from "./MonitoringList";
import { useGetEventLogsQuery } from "@/services/eventLogApi";

const mockQuery = useGetEventLogsQuery as jest.Mock;

interface MockLog {
  _id: string;
  operator: { name: string } | null;
  action: string;
  details: string;
  timestamp: string;
  role: string;
  message?: string;
}

describe("MonitoringList Component", () => {
  beforeEach(() => {
    // Clear mock call history nhưng giữ mock implementation
    mockQuery.mockClear();
  });

  const mockResponse = (eventLogs: MockLog[] = [], total = 0) => ({
    data: {
      data: {
        eventLogs,
        pagination: { totalPages: Math.ceil(total / 10) || 1, total },
      },
    },
    isLoading: false,
    error: null,
  });

  describe("Loading State", () => {
    it("displays loading skeleton", () => {
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<MonitoringList />);

      const skeletons = document.querySelectorAll('[class*="h-4"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Empty & Error States", () => {
    it("shows empty message when no data", () => {
      mockQuery.mockReturnValue(mockResponse());

      render(<MonitoringList />);

      expect(screen.getByText("No logs found.")).toBeInTheDocument();
    });

    it("shows error message on query failure", () => {
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: {},
      });

      render(<MonitoringList />);

      expect(screen.getByText("Error loading data!")).toBeInTheDocument();
    });
  });

  describe("Data Display", () => {
    const sampleLog = {
      _id: "1",
      timestamp: "2023-01-01T12:00:00Z",
      details: "Test log message",
      operator: { name: "John Doe" },
      action: "CREATE_USER",
      role: "admin",
    };

    it("renders log data correctly", () => {
      mockQuery.mockReturnValue(mockResponse([sampleLog], 1));

      render(<MonitoringList />);

      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/FMT-CREATE_USER/)).toBeInTheDocument();
      expect(screen.getByText(/Test log message/)).toBeInTheDocument();
      expect(screen.getByText("01/01/2023")).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    it("passes correct query params on mount", () => {
      mockQuery.mockReturnValue(mockResponse());

      render(<MonitoringList />);

      expect(mockQuery).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it("displays correct row numbers", () => {
      const logs = [
        {
          _id: "1",
          operator: { name: "User1" },
          action: "A1",
          details: "M1",
          timestamp: "",
          role: "",
        },
        {
          _id: "2",
          operator: { name: "User2" },
          action: "A2",
          details: "M2",
          timestamp: "",
          role: "",
        },
      ];
      mockQuery.mockReturnValue(mockResponse(logs, 25));

      render(<MonitoringList />);

      expect(screen.getByText(/User1/)).toBeInTheDocument();
      expect(screen.getByText(/User2/)).toBeInTheDocument();
    });

    it("displays pagination info text correctly", () => {
      const logs = [
        {
          _id: "1",
          operator: { name: "U1" },
          action: "A1",
          details: "M1",
          timestamp: "",
          role: "",
        },
      ];
      mockQuery.mockReturnValue(mockResponse(logs, 25));

      const { container } = render(<MonitoringList />);

      // Find the pagination info div
      const paginationInfo = container.querySelector(".text-sm.text-gray-600");
      expect(paginationInfo).toBeInTheDocument();
      expect(paginationInfo).toHaveTextContent(/Showing/);
      expect(paginationInfo).toHaveTextContent(/25/);
      expect(paginationInfo).toHaveTextContent(/logs/);
    });

    it("calculates correct row numbers based on current page", () => {
      // Test với page 1
      const page1Logs = [
        {
          _id: "1",
          operator: { name: "User1" },
          action: "ACTION",
          details: "Details",
          timestamp: "",
          role: "user",
        },
        {
          _id: "2",
          operator: { name: "User2" },
          action: "ACTION",
          details: "Details",
          timestamp: "",
          role: "user",
        },
      ];

      mockQuery.mockReturnValue(mockResponse(page1Logs, 25));

      render(<MonitoringList />);

      // Page 1: Row numbers should be 1, 2
      const cells = screen.getAllByRole("cell");
      expect(cells[0]).toHaveTextContent("1");

      // Verify users are rendered
      expect(screen.getByText("User1")).toBeInTheDocument();
      expect(screen.getByText("User2")).toBeInTheDocument();
    });

    it("renders pagination component with correct props", () => {
      mockQuery.mockReturnValue(mockResponse([], 50));

      render(<MonitoringList />);

      // Verify pagination controls are rendered
      expect(screen.getByLabelText(/Go to next page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Go to previous page/i)).toBeInTheDocument();

      // Verify current page indicator
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  describe("Modal Interaction", () => {
    it("opens detail modal when clicking View detail", async () => {
      const user = userEvent.setup();
      const log = {
        _id: "123",
        operator: { name: "Test User" },
        action: "TEST_ACTION",
        details: "Test details",
        timestamp: "2023-01-01",
        role: "admin",
      };

      mockQuery.mockReturnValue(mockResponse([log], 1));

      render(<MonitoringList />);

      // Click dropdown trigger
      const actionsButton = screen.getByLabelText("Actions");
      await user.click(actionsButton);

      // Click View detail
      const viewButton = await screen.findByText(/View detail/i);
      await user.click(viewButton);

      // Modal should open
      await waitFor(() => {
        expect(screen.getByTestId("monitoring-detail")).toBeInTheDocument();
      });
    });

    it("displays correct log in modal", async () => {
      const user = userEvent.setup();
      const log = {
        _id: "456",
        operator: { name: "John" },
        action: "CREATE",
        details: "Created item",
        timestamp: "2023-01-01",
        role: "admin",
      };

      mockQuery.mockReturnValue(mockResponse([log], 1));

      render(<MonitoringList />);

      const actionsButton = screen.getByLabelText("Actions");
      await user.click(actionsButton);

      const viewButton = await screen.findByText(/View detail/i);
      await user.click(viewButton);

      await waitFor(() => {
        const modal = screen.getByTestId("monitoring-detail");
        expect(modal).toHaveTextContent("Detail: 456");
      });
    });
  });

  describe("Data Transformation", () => {
    it("formats raw API data correctly", () => {
      const rawLog = {
        _id: "raw-1",
        timestamp: "2023-01-01T10:00:00Z",
        action: "USER_LOGIN",
        details: "User logged in",
        operator: { name: "Admin User" },
        role: "admin",
      };

      mockQuery.mockReturnValue(mockResponse([rawLog], 1));

      render(<MonitoringList />);

      expect(screen.getByText("Admin User")).toBeInTheDocument();
      expect(screen.getByText("FMT-USER_LOGIN")).toBeInTheDocument();
      expect(screen.getByText("User logged in")).toBeInTheDocument();
    });

    it("handles missing fields with fallback values", () => {
      const incompleteLog = {
        _id: "incomplete-1",
        timestamp: "",
        action: "",
        details: "",
        message: "Fallback message",
        operator: null,
        role: "",
      };

      mockQuery.mockReturnValue(mockResponse([incompleteLog], 1));

      render(<MonitoringList />);

      // Component uses details || message, so should show fallback
      expect(screen.getByText("Fallback message")).toBeInTheDocument();

      // Empty action should show formatted empty string
      expect(screen.getByText("FMT-")).toBeInTheDocument();
    });

    it("handles null operator gracefully", () => {
      const logWithoutOperator = {
        _id: "sys-1",
        timestamp: "2023-01-01",
        action: "SYSTEM_ACTION",
        details: "System action",
        operator: null,
        role: "system",
      };

      mockQuery.mockReturnValue(mockResponse([logWithoutOperator], 1));

      render(<MonitoringList />);

      // Verify log is rendered
      expect(screen.getByText("System action")).toBeInTheDocument();
      expect(screen.getByText("FMT-SYSTEM_ACTION")).toBeInTheDocument();

      // Table should have 6 columns (No, Time, Action, Message, Operator, Actions)
      const headerCells = screen.getAllByRole("columnheader");
      expect(headerCells).toHaveLength(6);
    });
  });

  describe("Table Headers", () => {
    it("displays all table headers", () => {
      mockQuery.mockReturnValue(mockResponse());

      render(<MonitoringList />);

      expect(screen.getByText("No")).toBeInTheDocument();
      expect(screen.getByText("Time")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
      expect(screen.getByText("Event Log Message")).toBeInTheDocument();
      expect(screen.getByText("Operator")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });
});
