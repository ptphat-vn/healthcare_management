import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";
import VideoCallModal from "./VideoCallModal";

const createCallMock = () => {
  const listeners: Record<string, (payload: unknown) => void> = {};

  return {
    on: vi.fn((event: string, cb: (payload: unknown) => void) => {
      listeners[event] = cb;
    }),
    hangup: vi.fn((cb?: (res: unknown) => void) => cb?.({ success: true })),
    trigger(event: string, payload: unknown) {
      listeners[event]?.(payload);
    },
  };
};

const setupMediaMocks = () => {
  const setSrcObject = vi.fn();
  Object.defineProperty(HTMLMediaElement.prototype, "srcObject", {
    set: setSrcObject,
    get: vi.fn(),
    configurable: true,
  });
  return setSrcObject;
};

describe("VideoCallModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("renders recipient name and registers listeners", () => {
    const call = createCallMock();
    const onHangup = vi.fn();

    render(
      <VideoCallModal call={call} onHangup={onHangup} recipientName="Alice" />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(call.on).toHaveBeenCalledWith(
      "addremotestream",
      expect.any(Function)
    );
    expect(call.on).toHaveBeenCalledWith(
      "addlocalstream",
      expect.any(Function)
    );
    expect(call.on).toHaveBeenCalledWith(
      "signalingstate",
      expect.any(Function)
    );
  });

  test("clicking hangup button calls hangup and onHangup", () => {
    const call = createCallMock();
    const onHangup = vi.fn();

    render(
      <VideoCallModal call={call} onHangup={onHangup} recipientName="Bob" />
    );

    fireEvent.click(screen.getByRole("button", { name: /Call End/i }));

    expect(call.hangup).toHaveBeenCalled();
    expect(onHangup).toHaveBeenCalled();
  });

  test("updates media elements when streams are received", () => {
    const call = createCallMock();
    const onHangup = vi.fn();
    const setSrcObject = setupMediaMocks();
    const remoteStream = { id: "remote" } as unknown as MediaStream;
    const localStream = { id: "local" } as unknown as MediaStream;

    render(<VideoCallModal call={call} onHangup={onHangup} />);

    call.trigger("addremotestream", remoteStream);
    call.trigger("addlocalstream", localStream);

    expect(setSrcObject).toHaveBeenCalledWith(remoteStream);
    expect(setSrcObject).toHaveBeenCalledWith(localStream);
  });

  test("signaling end state triggers onHangup after timeout", () => {
    vi.useFakeTimers();
    const call = createCallMock();
    const onHangup = vi.fn();

    render(<VideoCallModal call={call} onHangup={onHangup} />);

    act(() => {
      call.trigger("signalingstate", { reason: "Ended", code: 4 });
    });

    expect(screen.getByText("Ended")).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(onHangup).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
