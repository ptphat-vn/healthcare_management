import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TestOrderDetailPage from "./TestOrderDetailPage";

const {
  mockNavigate,
  mockUseParams,
  mockGetDetailTestOrderQuery,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUseParams: vi.fn(),
  mockGetDetailTestOrderQuery: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

vi.mock("@/services/testOrderApi", () => ({
  useGetDetailTestOrderQuery: (args: any) =>
    mockGetDetailTestOrderQuery(args),
}));

vi.mock(
  "@/components/features/admin/testOrderManagement/testOrderDetail/PatientInfoSection",
  () => ({
    __esModule: true,
    default: ({ order }: { order: any }) => (
      <div data-testid="patient-info">Patient: {order.patient?.name}</div>
    ),
  }),
);

vi.mock(
  "@/components/features/admin/testOrderManagement/testOrderDetail/OrderInfoSection",
  () => ({
    __esModule: true,
    default: ({ order }: { order: any }) => (
      <div data-testid="order-info">Status: {order.status}</div>
    ),
  }),
);

vi.mock(
  "@/components/features/admin/testOrderManagement/testOrderDetail/TestResultsSection",
  () => ({
    __esModule: true,
    default: ({ testResults }: { testResults: any[] }) => (
      <div data-testid="test-results">Results: {testResults.length}</div>
    ),
  }),
);

vi.mock(
  "@/components/features/admin/testOrderManagement/testOrderDetail/CommentsSection",
  () => ({
    __esModule: true,
    default: ({ comments }: { comments: any[] }) => (
      <div data-testid="comments">Comments: {comments.length}</div>
    ),
  }),
);

const buildOrder = () => ({
  _id: "order-123",
  patient: { name: "John Doe" },
  status: "pending",
  testResults: [{ id: 1 }, { id: 2 }],
  comments: [{ id: 1 }],
});

describe("Trang chi tiết đơn xét nghiệm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ orderId: "order-123" });
    mockGetDetailTestOrderQuery.mockReturnValue({
      data: { data: buildOrder() },
      isLoading: false,
      error: null,
    });
  });

  it("hiển thị trạng thái tải khi đang lấy dữ liệu", () => {
    mockGetDetailTestOrderQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<TestOrderDetailPage />);

    expect(
      screen.getByText(/Loading test order details/i),
    ).toBeInTheDocument();
  });

  it("hiển thị lỗi và quay lại khi bấm nút", async () => {
    mockGetDetailTestOrderQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("boom"),
    });

    render(<TestOrderDetailPage />);

    expect(screen.getByText(/Order Not Found/i)).toBeInTheDocument();

    await userEvent.click(
      screen.getAllByRole("button", { name: /Back to Test Orders/i })[0],
    );
    expect(mockNavigate).toHaveBeenCalledWith("/admin/test-order");
  });

  it("displays overview tab with order information", () => {
    render(<TestOrderDetailPage />);

    expect(
      screen.getByRole("heading", { name: /Test Order Details/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("patient-info")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("order-info")).toHaveTextContent("pending");
  });

  it("allows switching tab to view test results", async () => {
    render(<TestOrderDetailPage />);

    await userEvent.click(
      screen.getByRole("button", { name: /Test Results \(2\)/i }),
    );
    expect(screen.getByTestId("test-results")).toHaveTextContent("2");
  });

  it("quay lại khi bấm nút ở tiêu đề", async () => {
    render(<TestOrderDetailPage />);

    await userEvent.click(
      screen.getByRole("button", { name: /Back to Test Orders/i }),
    );

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});

