import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import AddInstrumentModal from "./AddInstrumentModal";

const mockFormData = vi.hoisted(() => ({
  name: "Analyzer 1",
  model: "X100",
  manufacturer: "LabCo",
  serialNumber: "SN-123",
  location: "Lab A",
  description: "Desc",
  status: "active",
  categories: ["chemistry"],
}));

const mockNewInstrumentForm = vi.hoisted(() =>
  vi.fn(
    ({
      onSubmit,
      onClose,
      isLoading,
    }: {
      onSubmit: (data: typeof mockFormData) => void;
      onClose: () => void;
      isLoading: boolean;
    }) => (
      <div>
        <span>Mock Instrument Form</span>
        <button onClick={() => onSubmit(mockFormData)}>Submit Form</button>
        <button onClick={onClose}>Close Form</button>
        <div data-testid="loading-flag">{isLoading ? "loading" : "idle"}</div>
      </div>
    )
  )
);

const mockCreateInstrument = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("@/services/instrumentApi", () => ({
  useCreateInstrumentMutation: () => [mockCreateInstrument],
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

vi.mock("../NewInstrumentForm", () => ({
  NewInstrumentForm: mockNewInstrumentForm,
}));

describe("AddInstrumentModal", () => {
  const renderModal = (
    props?: Partial<{ open: boolean; onOpenChange: (open: boolean) => void }>
  ) => {
    const onOpenChange = props?.onOpenChange ?? vi.fn();
    const open = props?.open ?? true;
    render(<AddInstrumentModal open={open} onOpenChange={onOpenChange} />);
    return { onOpenChange };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders form when modal is open", () => {
    renderModal();
    expect(screen.getByText("Mock Instrument Form")).toBeInTheDocument();
    expect(mockNewInstrumentForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: false,
        onClose: expect.any(Function),
        onSubmit: expect.any(Function),
      }),
      undefined
    );
  });

  test("submits form successfully and closes modal", async () => {
    const unwrap = vi.fn().mockResolvedValue({ message: "Created" });
    mockCreateInstrument.mockReturnValueOnce({ unwrap });
    const { onOpenChange } = renderModal();
    const user = userEvent.setup();

    await user.click(screen.getByText("Submit Form"));

    expect(mockCreateInstrument).toHaveBeenCalledWith(mockFormData);
    expect(unwrap).toHaveBeenCalled();
    await waitFor(() =>
      expect(mockToast.success).toHaveBeenCalledWith("Created")
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("shows error toast when submission fails", async () => {
    const unwrap = vi.fn().mockRejectedValue({ data: { message: "Error" } });
    mockCreateInstrument.mockReturnValueOnce({ unwrap });
    const { onOpenChange } = renderModal();
    const user = userEvent.setup();

    await user.click(screen.getByText("Submit Form"));

    expect(mockCreateInstrument).toHaveBeenCalledWith(mockFormData);
    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith("Error"));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  test("handleClose prevents closing while loading", async () => {
    const unwrap = vi.fn(() => new Promise(() => {}));
    mockCreateInstrument.mockReturnValue({ unwrap });
    const { onOpenChange } = renderModal();
    const user = userEvent.setup();

    await user.click(screen.getByText("Submit Form"));

    // While pending, clicking close shouldn't fire
    await user.click(screen.getByText("Close Form"));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
