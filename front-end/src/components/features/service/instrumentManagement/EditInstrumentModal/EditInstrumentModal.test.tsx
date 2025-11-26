import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, beforeAll } from "vitest";
import EditInstrumentModal from "./EditInstrumentModal";
import type { Instrument } from "@/types/instrument.type";

// Polyfill ResizeObserver for jsdom (Radix UI uses it)
beforeAll(() => {
  (
    globalThis as Record<string, unknown>
  ).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockUpdateInstrument = vi.hoisted(() => vi.fn());
const mockIsLoading = vi.hoisted(() => ({ value: false }));
const mockToast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

const mockEditInstrumentForm = vi.hoisted(() =>
  vi.fn(
    ({
      onSubmit,
      onCancel,
      isLoading,
    }: {
      onSubmit: (data: unknown) => void;
      onCancel: () => void;
      isLoading: boolean;
    }) => (
      <div>
        <span>Mock Edit Form</span>
        <button onClick={() => onSubmit({ name: "Updated Name" })}>
          Submit Form
        </button>
        <button onClick={onCancel}>Cancel Form</button>
        <div data-testid="loading-flag">{isLoading ? "loading" : "idle"}</div>
      </div>
    )
  )
);

vi.mock("@/services/instrumentApi", () => ({
  useUpdateInstrumentMutation: () => [
    mockUpdateInstrument,
    { isLoading: mockIsLoading.value },
  ],
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

vi.mock("../EditInstrumentForm/EditInstrumentForm", () => ({
  default: mockEditInstrumentForm,
}));

const mockInstrument: Instrument = {
  _id: "inst-1",
  name: "Analyzer X",
  model: "Model A",
  manufacturer: "LabCo",
  serialNumber: "SN123",
  location: "Lab A",
  status: "Active",
  categories: ["Hematology"],
  description: "Test description",
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  createdBy: "user-1",
  lastModifiedBy: "user-1",
};

describe("EditInstrumentModal", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    instrument: mockInstrument,
    onUpdate: vi.fn(),
  };

  const renderModal = (props = {}) => {
    const merged = { ...defaultProps, ...props };
    render(<EditInstrumentModal {...merged} />);
    return merged;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading.value = false;
  });

  test("renders modal with instrument details", () => {
    renderModal();

    expect(screen.getByText("Edit Instrument")).toBeInTheDocument();
    expect(
      screen.getByText(/Update information for instrument/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Analyzer X")).toBeInTheDocument();
    expect(screen.getByText("Mock Edit Form")).toBeInTheDocument();
  });

  test("passes correct default values to form", () => {
    renderModal();

    expect(mockEditInstrumentForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          name: "Analyzer X",
          model: "Model A",
          manufacturer: "LabCo",
          serialNumber: "SN123",
          location: "Lab A",
          description: "Test description",
          status: "Active",
          categories: ["Hematology"],
        },
        isLoading: false,
      }),
      undefined
    );
  });

  test("updates instrument successfully", async () => {
    const updatedInstrument = { ...mockInstrument, name: "Updated Name" };
    const unwrap = vi.fn().mockResolvedValue({ data: updatedInstrument });
    mockUpdateInstrument.mockReturnValueOnce({ unwrap });
    const props = renderModal();
    const user = userEvent.setup();

    await user.click(screen.getByText("Submit Form"));

    expect(mockUpdateInstrument).toHaveBeenCalledWith({
      id: "inst-1",
      name: "Updated Name",
    });
    await waitFor(() =>
      expect(mockToast.success).toHaveBeenCalledWith(
        "Instrument updated successfully!"
      )
    );
    expect(props.onUpdate).toHaveBeenCalledWith(updatedInstrument);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  test("shows error toast when update fails", async () => {
    const unwrap = vi
      .fn()
      .mockRejectedValue({ data: { message: "Update failed" } });
    mockUpdateInstrument.mockReturnValueOnce({ unwrap });
    const props = renderModal();
    const user = userEvent.setup();

    await user.click(screen.getByText("Submit Form"));

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith("Update failed")
    );
    expect(props.onUpdate).not.toHaveBeenCalled();
    expect(props.onOpenChange).not.toHaveBeenCalledWith(false);
  });

  test("calls onOpenChange when Cancel is clicked", async () => {
    const props = renderModal();
    const user = userEvent.setup();

    await user.click(screen.getByText("Cancel Form"));

    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  test("shows loading state when updating", () => {
    mockIsLoading.value = true;
    mockUpdateInstrument.mockReturnValue({ unwrap: vi.fn() });

    renderModal();

    expect(screen.getByTestId("loading-flag")).toHaveTextContent("loading");
    mockIsLoading.value = false;
  });
});
