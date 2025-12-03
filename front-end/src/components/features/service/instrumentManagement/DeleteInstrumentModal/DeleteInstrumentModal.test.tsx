import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import DeleteInstrumentModal from "./DeleteInstrumentModal";
import type { Instrument } from "@/types/instrument.type";

const mockDeleteInstrument = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("@/services/instrumentApi", () => ({
  useDeleteInstrumentMutation: () => [
    mockDeleteInstrument,
    { isLoading: false },
  ],
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

const mockInstrument = {
  _id: "inst-1",
  name: "Analyzer X",
  code: "AX-001",
  model: "Model A",
  manufacturer: "LabCo",
  serialNumber: "SN123",
  location: "Lab A",
  status: "Active",
  categories: ["Hematology"],
  description: "Test instrument",
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  createdBy: "user-1",
  lastModifiedBy: "user-1",
} as Instrument & { code: string };

describe("DeleteInstrumentModal", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    instrument: mockInstrument,
    onDelete: vi.fn(),
  };

  const renderModal = (props = {}) => {
    const merged = { ...defaultProps, ...props };
    render(<DeleteInstrumentModal {...merged} />);
    return merged;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders instrument details", () => {
    renderModal();
    expect(screen.getByText("Confirm Delete Instrument")).toBeInTheDocument();
    expect(screen.getByText("Analyzer X")).toBeInTheDocument();
    expect(screen.getByText("SN123")).toBeInTheDocument();
    expect(screen.getByText("Model A")).toBeInTheDocument();
  });

  test("calls onOpenChange when Cancel is clicked", async () => {
    const props = renderModal();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  test("deletes instrument successfully", async () => {
    const unwrap = vi.fn().mockResolvedValue({});
    mockDeleteInstrument.mockReturnValueOnce({ unwrap });
    const props = renderModal();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: /Delete Instrument/i })
    );

    expect(mockDeleteInstrument).toHaveBeenCalledWith("inst-1");
    await waitFor(() =>
      expect(mockToast.success).toHaveBeenCalledWith(
        'Instrument "Analyzer X" has been deleted'
      )
    );
    expect(props.onDelete).toHaveBeenCalledWith("inst-1");
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  test("shows error toast when deletion fails", async () => {
    const unwrap = vi
      .fn()
      .mockRejectedValue({ data: { message: "Delete failed" } });
    mockDeleteInstrument.mockReturnValueOnce({ unwrap });
    const props = renderModal();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: /Delete Instrument/i })
    );

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith("Delete failed")
    );
    expect(props.onDelete).not.toHaveBeenCalled();
    expect(props.onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
