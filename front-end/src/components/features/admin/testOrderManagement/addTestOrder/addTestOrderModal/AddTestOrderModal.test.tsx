import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import type { Mock } from "vitest";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AddTestOrderModal from "./AddTestOrderModal";

const {
  mockUseCreateTestOrderMutation,
  mockToast,
} = vi.hoisted(() => ({
  mockUseCreateTestOrderMutation: vi.fn(),
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/services/testOrderApi", () => ({
  useCreateTestOrderMutation: () => mockUseCreateTestOrderMutation(),
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

let lastFormProps: any = null;

vi.mock("../addTestOrderForm/TestOrderAddForm", () => ({
  __esModule: true,
  TestOrderAddForm: (props: any) => {
    lastFormProps = props;
    return <div data-testid="test-order-add-form" />;
  },
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

describe("Modal thêm đơn xét nghiệm", () => {
  let createMutationSpy: ReturnType<typeof vi.fn>;
  let onOpenChange: Mock<(open: boolean) => void>;
  let onSuccess: Mock<() => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    lastFormProps = null;
    createMutationSpy = vi.fn();
    onOpenChange = vi.fn<(open: boolean) => void>();
    onSuccess = vi.fn<() => void>();
    mockUseCreateTestOrderMutation.mockReturnValue([
      createMutationSpy,
      { isLoading: false },
    ]);
  });

  const renderModal = () =>
    render(
      <AddTestOrderModal open onOpenChange={onOpenChange} onSuccess={onSuccess} />,
    );

  it("hiển thị heading và truyền props cho form", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /Add New Test Order/i }),
    ).toBeInTheDocument();
    expect(lastFormProps).toBeDefined();
    expect(lastFormProps.isLoading).toBe(false);
    expect(typeof lastFormProps.onSubmit).toBe("function");
    expect(typeof lastFormProps.onCancel).toBe("function");
  });

  it("báo lỗi khi thiếu hồ sơ y tế", async () => {
    renderModal();

    await lastFormProps.onSubmit("", ["CBC"]);

    expect(mockToast.error).toHaveBeenCalledWith(
      "Please select a medical record",
    );
    expect(createMutationSpy).not.toHaveBeenCalled();
  });

  it("báo lỗi khi không chọn xét nghiệm nào", async () => {
    renderModal();

    await lastFormProps.onSubmit("medical-1", []);

    expect(mockToast.error).toHaveBeenCalledWith(
      "Please select at least one test",
    );
    expect(createMutationSpy).not.toHaveBeenCalled();
  });

  it("submit thành công và đóng modal", async () => {
    const unwrapSpy = vi.fn().mockResolvedValue({ message: "Created" });
    createMutationSpy.mockReturnValue({ unwrap: unwrapSpy });
    renderModal();

    await lastFormProps.onSubmit("medical-1", ["CBC"]);

    expect(createMutationSpy).toHaveBeenCalledWith({
      medicalRecordId: "medical-1",
      requestedTests: ["CBC"],
    });
    expect(unwrapSpy).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith("Created");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("hiển thị lỗi API khi submit thất bại", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const unwrapSpy = vi
      .fn()
      .mockRejectedValue({ data: { message: "Failed" } });
    createMutationSpy.mockReturnValue({ unwrap: unwrapSpy });
    renderModal();

    await lastFormProps.onSubmit("medical-1", ["CBC"]);

    expect(createMutationSpy).toHaveBeenCalled();
    expect(mockToast.error).toHaveBeenCalledWith("Failed");
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("không cho hủy khi đang tải nhưng đóng bình thường", async () => {
    renderModal();
    await lastFormProps.onCancel();
    expect(onOpenChange).toHaveBeenCalledWith(false);

    const loadingMutationSpy = vi.fn();
    mockUseCreateTestOrderMutation.mockReturnValueOnce([
      loadingMutationSpy,
      { isLoading: true },
    ]);
    render(
      <AddTestOrderModal open onOpenChange={onOpenChange} onSuccess={onSuccess} />,
    );

    await lastFormProps.onCancel();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });
});

