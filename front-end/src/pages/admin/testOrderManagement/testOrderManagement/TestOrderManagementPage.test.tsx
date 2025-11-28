import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TestOrderManagementPage from "./TestOrderManagementPage";

const {
  mockUseAuth,
  mockGetRoleButtonClass,
  mockTestOrderList,
  mockAddTestOrderModal,
} = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockGetRoleButtonClass: vi.fn(() => "role-based-class"),
  mockTestOrderList: vi.fn(),
  mockAddTestOrderModal: vi.fn(),
}));

let lastAddModalProps: any;
let lastTestOrderListProps: any;

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/utils/getRoleButtonClass", () => ({
  getRoleButtonClass: mockGetRoleButtonClass,
}));

vi.mock(
  "@/components/features/admin/testOrderManagement/testOrderList/TestOrderList",
  () => ({
    __esModule: true,
    default: (props: any) => {
      lastTestOrderListProps = props;
      mockTestOrderList(props);
      return <div data-testid="test-order-list">TestOrderList</div>;
    },
  }),
);

vi.mock(
  "@/components/features/admin/testOrderManagement/addTestOrder/addTestOrderModal/AddTestOrderModal",
  () => ({
    __esModule: true,
    default: (props: any) => {
      lastAddModalProps = props;
      mockAddTestOrderModal(props);
      if (!props.open) return null;
      return <div data-testid="add-order-modal">AddTestOrderModal</div>;
    },
  }),
);

describe("Trang Quản lý đơn xét nghiệm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { data: { roleCode: "ROLE_ADMIN" } },
    });
  });

  it("hiển thị tiêu đề và nút thêm với style theo vai trò", () => {
    render(<TestOrderManagementPage />);

    expect(
      screen.getByRole("heading", {
        name: /Test Order Management|Quản lý đơn xét nghiệm/i,
      }),
    ).toBeInTheDocument();
    const addButton = screen.getByRole("button", {
      name: /Add New Test Order|Thêm đơn xét nghiệm mới/i,
    });
    expect(addButton).toHaveClass("role-based-class");
    expect(mockGetRoleButtonClass).toHaveBeenCalledWith("ROLE_ADMIN");
  });

  it("mở modal thêm đơn khi bấm nút thêm", async () => {
    render(<TestOrderManagementPage />);
    expect(lastAddModalProps.open).toBe(false);

    await userEvent.click(
      screen.getByRole("button", {
        name: /Add New Test Order|Thêm đơn xét nghiệm mới/i,
      }),
    );

    expect(lastAddModalProps.open).toBe(true);
    expect(mockAddTestOrderModal).toHaveBeenCalledTimes(2);
  });

  it("đóng modal khi gọi onOpenChange(false)", async () => {
    render(<TestOrderManagementPage />);

    await userEvent.click(
      screen.getByRole("button", {
        name: /Add New Test Order|Thêm đơn xét nghiệm mới/i,
      }),
    );
    expect(lastAddModalProps.open).toBe(true);

    await act(async () => {
      lastAddModalProps.onOpenChange(false);
    });

    expect(lastAddModalProps.open).toBe(false);
    expect(mockAddTestOrderModal).toHaveBeenCalledTimes(3);
  });

  it("tải lại danh sách khi tạo đơn mới", async () => {
    render(<TestOrderManagementPage />);
    const initialCalls = mockTestOrderList.mock.calls.length;

    await act(async () => {
      lastAddModalProps.onSuccess();
    });

    await waitFor(() =>
      expect(mockTestOrderList).toHaveBeenCalledTimes(initialCalls + 1),
    );
  });

  it("tải lại danh sách khi xóa đơn", async () => {
    render(<TestOrderManagementPage />);
    const initialCalls = mockTestOrderList.mock.calls.length;

    await act(async () => {
      lastTestOrderListProps.onOrderDeleted();
    });

    await waitFor(() =>
      expect(mockTestOrderList).toHaveBeenCalledTimes(initialCalls + 1),
    );
  });
});

