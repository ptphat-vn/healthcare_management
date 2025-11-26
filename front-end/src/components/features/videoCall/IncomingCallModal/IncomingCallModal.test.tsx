import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import IncomingCallModal from "./IncomingCallModal";

const mockUseGetBasicUserInfoQuery = vi.fn();

vi.mock("@/services/userApi", () => ({
  useGetBasicUserInfoQuery: (...args: unknown[]) =>
    mockUseGetBasicUserInfoQuery(...args),
}));

type CallMock = {
  fromNumber?: string;
  on: ReturnType<typeof vi.fn>;
  answer: ReturnType<typeof vi.fn>;
  reject: ReturnType<typeof vi.fn>;
  hangup: ReturnType<typeof vi.fn>;
  trigger: (event: string, payload: unknown) => void;
};

const createCallMock = (): CallMock => {
  const listeners: Record<string, (arg: unknown) => void> = {};

  return {
    fromNumber: "123",
    on: vi.fn((event: string, callback: (arg: unknown) => void) => {
      listeners[event] = callback;
    }),
    answer: vi.fn((callback?: (res: unknown) => void) =>
      callback?.({ ok: true })
    ),
    reject: vi.fn((callback?: (res: unknown) => void) =>
      callback?.({ ok: true })
    ),
    hangup: vi.fn((callback?: (res: unknown) => void) =>
      callback?.({ ok: true })
    ),
    trigger(event: string, payload: unknown) {
      listeners[event]?.(payload);
    },
  };
};

const defaultProps = (
  callOverrides?: Partial<ReturnType<typeof createCallMock>>
) => {
  const call = createCallMock();
  Object.assign(call, callOverrides);

  return {
    call,
    onAccept: vi.fn(),
    onReject: vi.fn(),
  };
};

describe("IncomingCallModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetBasicUserInfoQuery.mockReturnValue({
      data: { data: { fullName: "Dr. Strange" } },
    });
  });

  test("renders caller info and default screen", () => {
    const props = defaultProps();

    render(<IncomingCallModal {...props} />);

    expect(
      screen.getByRole("heading", { name: /Cuộc gọi video đến/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Từ:/)).toHaveTextContent("Dr. Strange");
    expect(props.call.on).toHaveBeenCalledWith(
      "addremotestream",
      expect.any(Function)
    );
  });

  test("happy case - accepting call switches to in-call view", async () => {
    const user = userEvent.setup();
    const props = defaultProps();

    render(<IncomingCallModal {...props} />);
    await user.click(screen.getByRole("button", { name: /Trả lời/i }));

    expect(props.call.answer).toHaveBeenCalled();
    expect(props.onAccept).toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /Kết thúc/i })
    ).toBeInTheDocument();
  });

  test("bad case - missing caller info falls back to default", async () => {
    mockUseGetBasicUserInfoQuery.mockReturnValueOnce({});
    const user = userEvent.setup();
    const props = defaultProps({ fromNumber: undefined });

    render(<IncomingCallModal {...props} />);

    expect(screen.getByText(/Người dùng/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Từ chối/i }));

    expect(props.call.reject).toHaveBeenCalled();
    expect(props.onReject).toHaveBeenCalled();
  });

  test("bad case - hangup button triggers call hangup", () => {
    const props = defaultProps();

    render(<IncomingCallModal {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Trả lời/i }));
    fireEvent.click(screen.getByRole("button", { name: /Kết thúc/i }));

    expect(props.call.hangup).toHaveBeenCalled();
    expect(props.onReject).toHaveBeenCalledTimes(1); // from hangup
  });
});
