import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import VideoCallButton from "./VideoCallButton";

const mockUseStringee = vi.hoisted(() => vi.fn());
const { mockCallInstance, StringeeCall2Mock } = vi.hoisted(() => {
  const callInstance = {
    makeCall: vi.fn((cb?: (res: { r: number }) => void) => cb?.({ r: 0 })),
  };

  return {
    mockCallInstance: callInstance,
    StringeeCall2Mock: vi.fn(function MockCall() {
      return callInstance;
    }),
  };
});

vi.mock("@/contexts/StringeeContext", () => ({
  useStringee: () => mockUseStringee(),
}));

vi.mock("../VideoCallModal/VideoCallModal", () => ({
  __esModule: true,
  default: ({ onHangup }: { onHangup: () => void }) => (
    <div data-testid="video-call-modal">
      <button onClick={onHangup}>Close Modal</button>
    </div>
  ),
}));

vi.mock("stringee", () => ({
  StringeeCall2: StringeeCall2Mock,
}));

const defaultProps = {
  currentUserId: "user-1",
  friendId: "user-2",
  friendName: "Alice",
};

describe("VideoCallButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCallInstance.makeCall.mockClear();
    StringeeCall2Mock.mockClear();
    mockUseStringee.mockReturnValue({
      client: {},
      isConnected: true,
    });
  });

  test("disables button when not connected", async () => {
    const user = userEvent.setup();
    mockUseStringee.mockReturnValueOnce({
      client: {},
      isConnected: false,
    });

    render(<VideoCallButton {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    await user.click(button);
    expect(StringeeCall2Mock).not.toHaveBeenCalled();
  });

  test("starts video call when connected", async () => {
    const user = userEvent.setup();
    render(<VideoCallButton {...defaultProps} />);

    await user.click(screen.getByRole("button"));

    expect(StringeeCall2Mock).toHaveBeenCalledWith(
      expect.any(Object),
      defaultProps.currentUserId,
      defaultProps.friendId,
      true
    );
    expect(mockCallInstance.makeCall).toHaveBeenCalled();
    expect(screen.getByTestId("video-call-modal")).toBeInTheDocument();
  });

  test("closing modal triggers hangup handler", async () => {
    const user = userEvent.setup();
    render(<VideoCallButton {...defaultProps} />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByTestId("video-call-modal")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Close Modal/i }));

    expect(screen.queryByTestId("video-call-modal")).not.toBeInTheDocument();
  });

  test("does not initiate call when missing friendId", async () => {
    const user = userEvent.setup();
    render(<VideoCallButton {...defaultProps} friendId="" />);

    await user.click(screen.getByRole("button"));

    expect(StringeeCall2Mock).not.toHaveBeenCalled();
  });
});
