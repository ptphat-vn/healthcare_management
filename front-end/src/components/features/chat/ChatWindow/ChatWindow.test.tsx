import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ChatWindow from "./ChatWindow";
import { toast } from "sonner";

const mockUseAuth = vi.fn();
const mockUseConversations = vi.fn();
const mockUseSocketConnection = vi.fn();
const mockUseGetConversationQuery = vi.fn();
const mockUseSendMessageMutation = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));
vi.mock("../../../../hooks/useConversations", () => ({
  useConversations: (...args: unknown[]) => mockUseConversations(...args),
}));
vi.mock("../../../../hooks/useSocketConnection", () => ({
  useSocketConnection: (...args: unknown[]) => mockUseSocketConnection(...args),
}));
vi.mock("@/services/chatApi", () => ({
  useGetConversationQuery: (...args: unknown[]) =>
    mockUseGetConversationQuery(...args),
  useSendMessageMutation: () => mockUseSendMessageMutation(),
}));
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, size, ...props }: any) => (
    <button
      data-testid={size === "icon" ? "send-button" : "button"}
      {...props}
    >
      {children}
    </button>
  ),
}));
vi.mock("@/components/ui/input", () => ({
  Input: ({ value, onChange, onKeyPress, ...props }: any) => (
    <input
      data-testid="message-input"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyPress}
      {...props}
    />
  ), 
}));
vi.mock("@/components/ui/loading/LoadingSpinner", () => ({
  default: ({ message }: any) => (
    <div data-testid="loading">{message}</div>
  ),
}));
vi.mock("@/components/ui/emoji/EmojiPickerButton", () => ({
  default: ({ onEmojiSelect }: any) => (
    <button
      data-testid="emoji-button"
      type="button"
      onClick={() => onEmojiSelect("😊")}
    >
      Emoji
    </button>
  ),
}));
vi.mock("../videoCall/VideoCallButton", () => ({
  default: () => <div data-testid="video-button" />,
}));
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe("ChatWindow", () => {
  const baseProps = {
    otherUserId: "friend-1",
    otherUserName: "Bác sĩ Tư vấn",
  };

  const mockMutationSuccess = () => {
    const responseMessage = {
      _id: "msg-2",
      content: "Hello",
      senderId: "current-user",
      receiverId: "friend-1",
      createdAt: new Date().toISOString(),
    }
    const unwrap = vi.fn().mockResolvedValue({ data: responseMessage })
    const mutate = vi.fn().mockReturnValue({ unwrap })
    mockUseSendMessageMutation.mockReturnValue([mutate, { isLoading: false }])
    return { mutate, responseMessage }
  }

  beforeEach(() => {
    vi.clearAllMocks();
    
    Element.prototype.scrollIntoView = vi.fn();
    
    mockUseAuth.mockReturnValue({ user: { data: { _id: "current-user" } } });
    mockUseConversations.mockReturnValue({
      conversations: [],
      save: vi.fn(),
      update: vi.fn(),
    });
    mockUseSocketConnection.mockReturnValue({ isConnected: true });
    mockUseGetConversationQuery.mockReturnValue({
      data: { data: { messages: [] } },
      isLoading: false,
      error: undefined,
    });
    mockMutationSuccess()
  });

  it("LOAD: hiển thị lịch sử chat trả về từ API", async () => {
    mockUseGetConversationQuery.mockReturnValue({
      data: {
        data: {
          messages: [
            {
              _id: "msg-1",
              content: "Xin chào",
              senderId: "friend-1",
              receiverId: "current-user",
              createdAt: "2024-01-01T10:00:00.000Z",
            },
          ],
        },
      },
      isLoading: false,
      error: undefined,
    });

    render(<ChatWindow {...baseProps} />);
    await waitFor(() => expect(screen.getByText("Xin chào")).toBeInTheDocument());
  });

  it("SEND: gửi tin nhắn mới và cập nhật danh sách", async () => {
    const updateSpy = vi.fn();
    mockUseConversations.mockReturnValue({
      conversations: [],
      save: vi.fn(),
      update: updateSpy,
    });
    const { mutate } = mockMutationSuccess()

    const user = userEvent.setup();
    render(<ChatWindow {...baseProps} />);

    await user.type(screen.getByTestId("message-input"), "Hello");
    await user.click(screen.getByTestId("send-button"));

    expect(mutate).toHaveBeenCalledWith({
      userId: "friend-1",
      message: { content: "Hello" },
    });
    await waitFor(() => expect(screen.getByText("Hello")).toBeInTheDocument());
    await waitFor(() =>
      expect(updateSpy).toHaveBeenCalledWith(
        "friend-1",
        expect.objectContaining({
          lastMessage: "Hello",
          lastMessageTime: expect.any(Date),
        })
      )
    );
    expect(screen.getByTestId("message-input")).toHaveValue("");
  });

  it("UI: hiển thị trạng thái kết nối realtime", () => {
    mockUseSocketConnection.mockReturnValue({ isConnected: false });

    render(<ChatWindow {...baseProps} />);
    expect(screen.getByText("Đang kết nối...")).toBeInTheDocument();
  });

  it('ERROR: hiển thị toast khi tải cuộc trò chuyện thất bại', () => {
    mockUseGetConversationQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network'),
    })

    render(<ChatWindow {...baseProps} />)
    expect(toast.error).toHaveBeenCalledWith('Không thể tải cuộc trò chuyện')
  })

  it('SEND: khôi phục input và báo lỗi khi gửi thất bại', async () => {
    const rejectUnwrap = vi.fn().mockRejectedValue({ data: { message: 'Server down' } })
    const mutate = vi.fn().mockReturnValue({ unwrap: rejectUnwrap })
    mockUseSendMessageMutation.mockReturnValue([mutate, { isLoading: false }])

    const user = userEvent.setup()
    render(<ChatWindow {...baseProps} />)

    await user.type(screen.getByTestId('message-input'), 'Hello')
    await user.click(screen.getByTestId('send-button'))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Server down'))
    expect(screen.getByTestId('message-input')).toHaveValue('Hello')
  })
});