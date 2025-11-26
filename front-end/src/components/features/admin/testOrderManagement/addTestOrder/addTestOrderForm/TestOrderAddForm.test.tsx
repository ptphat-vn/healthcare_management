import "@testing-library/jest-dom/vitest";
import type { ComponentProps } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestOrderAddForm } from "./TestOrderAddForm";

const { mockUseGetMedicalRecordsQuery } = vi.hoisted(() => ({
  mockUseGetMedicalRecordsQuery: vi.fn(),
}));

vi.mock("@/services/medicalRecordApi", () => ({
  useGetMedicalRecordsQuery: () => mockUseGetMedicalRecordsQuery(),
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
    id,
  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    id: string;
  }) => (
    <input
      type="checkbox"
      data-testid={id}
      checked={checked}
      onChange={(event) => onCheckedChange(event.target.checked)}
    />
  ),
}));

vi.mock("@/types/request.type", async () => {
  const actual = await vi.importActual<typeof import("@/types/request.type")>(
    "@/types/request.type",
  );
  return {
    ...actual,
    requestedTests: ["CBC", "Lipid Panel"],
  };
});

describe("Form thêm đơn xét nghiệm", () => {
  const basePatients = [
    { _id: "rec-1", fullName: "Alice" },
    { _id: "rec-2", fullName: "Bob" },
  ];

  const renderForm = (
    overrideProps: Partial<ComponentProps<typeof TestOrderAddForm>> = {},
  ) => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(
      <TestOrderAddForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        {...overrideProps}
      />,
    );
    return { onSubmit, onCancel };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hiển thị trạng thái tải khi đang lấy hồ sơ", () => {
    mockUseGetMedicalRecordsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    });

    renderForm();

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("hiển thị lỗi khi lấy hồ sơ thất bại", () => {
    mockUseGetMedicalRecordsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: "error",
    });

    renderForm();

    expect(
      screen.getByText(/Error loading medical records/i),
    ).toBeInTheDocument();
  });

  it("gửi đúng hồ sơ và xét nghiệm đã chọn", async () => {
    const user = userEvent.setup();
    mockUseGetMedicalRecordsQuery.mockReturnValue({
      data: { data: { patient: basePatients } },
      isLoading: false,
      error: undefined,
    });

    const { onSubmit } = renderForm();

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "rec-2");

    const checkbox = screen.getByTestId("test-checkbox-0");
    await user.click(checkbox);

    await user.click(screen.getByRole("button", { name: /Save/i }));

    expect(onSubmit).toHaveBeenCalledWith("rec-2", ["CBC"]);
  });

  it("gọi handler hủy khi bấm Cancel", async () => {
    const user = userEvent.setup();
    mockUseGetMedicalRecordsQuery.mockReturnValue({
      data: { data: { patient: basePatients } },
      isLoading: false,
      error: undefined,
    });

    const { onCancel } = renderForm();

    await user.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("khóa nút và hiển thị Saving khi đang submit", () => {
    mockUseGetMedicalRecordsQuery.mockReturnValue({
      data: { data: { patient: basePatients } },
      isLoading: false,
      error: undefined,
    });

    renderForm({ isLoading: true });

    const saveButton = screen.getByRole("button", { name: /Saving.../i });
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});

