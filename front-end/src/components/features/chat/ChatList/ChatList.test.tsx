import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ChatList from './ChatList.tsx'
import { toast } from 'sonner'

const mockUseAuth = vi.fn()
const mockUseConversations = vi.fn()
const mockUseChatPeers = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))
vi.mock('../../../../hooks/useConversations', () => ({
  useConversations: (...args: unknown[]) => mockUseConversations(...args),
}))
vi.mock('../../../../hooks/useChatPeers', () => ({
  useChatPeers: (...args: unknown[]) => mockUseChatPeers(...args),
}))

vi.mock('@/components/ui/combobox', () => ({
  Combobox: ({ value, onValueChange, placeholder, disabled }: any) => (
    <input
      data-testid='chat-combobox'
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, size, ...props }: any) => (
    <button data-testid={size === 'icon' ? 'send-button' : 'button'} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid='conversation-card' {...props}>
      {children}
    </div>
  ),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('ChatList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { data: { _id: 'current-user' } } })
    mockUseConversations.mockReturnValue({
      conversations: [],
      save: vi.fn(),
      update: vi.fn(),
    })
    mockUseChatPeers.mockReturnValue({
      users: [],
      isLoading: false,
      targetLabel: 'bệnh nhân',
      isPatient: false,
      isDoctor: true,
    })
  })

  it('START_CHAT: lưu cuộc trò chuyện và callback khi chọn người hợp lệ', async () => {
    const saveSpy = vi.fn()
    mockUseConversations.mockReturnValue({
      conversations: [],
      save: saveSpy,
      update: vi.fn(),
    })

    const targetUser = {
      _id: 'patient-1',
      fullName: 'Patient One',
      avatar: 'avatar.png',
      email: 'patient@example.com',
      roleCode: 'patient',
    }
    mockUseChatPeers.mockReturnValue({
      users: [targetUser],
      isLoading: false,
      targetLabel: 'bệnh nhân',
      isPatient: false,
      isDoctor: true,
    })

    const onSelectChat = vi.fn()
    const user = userEvent.setup()
    render(<ChatList onSelectChat={onSelectChat} />)

    await user.type(screen.getByTestId('chat-combobox'), targetUser._id)
    await user.click(screen.getByTestId('send-button'))

    await waitFor(() => expect(saveSpy).toHaveBeenCalled())
    expect(onSelectChat).toHaveBeenCalledWith(
      targetUser._id,
      targetUser.fullName,
      targetUser.avatar
    )
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining(targetUser.fullName)
    )
    expect(screen.getByTestId('chat-combobox')).toHaveValue('')
  })

  it('VALIDATION: chặn việc mở chat với chính mình', async () => {
    const saveSpy = vi.fn()
    mockUseConversations.mockReturnValue({
      conversations: [],
      save: saveSpy,
      update: vi.fn(),
    })

    const user = userEvent.setup()
    render(<ChatList onSelectChat={vi.fn()} />)

    await user.type(screen.getByTestId('chat-combobox'), 'current-user')
    await user.click(screen.getByTestId('send-button'))

    expect(saveSpy).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Không thể chat với chính mình')
  })

  it('VALIDATION: yêu cầu chọn user hợp lệ (không nhận chuỗi trống)', async () => {
    const saveSpy = vi.fn()
    mockUseConversations.mockReturnValue({
      conversations: [],
      save: saveSpy,
      update: vi.fn(),
    })

    const user = userEvent.setup()
    render(<ChatList onSelectChat={vi.fn()} />)

    await user.type(screen.getByTestId('chat-combobox'), '   ')
    await user.click(screen.getByTestId('send-button'))

    expect(saveSpy).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Vui lòng chọn bệnh nhân để chat')
  })

  it('UI: hiển thị danh sách hội thoại và cho phép chọn', async () => {
    const onSelectChat = vi.fn()
    const conversations = [
      {
        userId: 'patient-1',
        userName: 'Patient One',
        avatar: '',
        roleCode: 'patient',
      },
    ]
    mockUseConversations.mockReturnValue({
      conversations,
      save: vi.fn(),
      update: vi.fn(),
    })

    render(<ChatList onSelectChat={onSelectChat} selectedUserId='patient-1' />)

    const card = screen.getByTestId('conversation-card')
    expect(card.className).toContain('bg-blue-50')
    await userEvent.click(card)
    expect(onSelectChat).toHaveBeenCalledWith('patient-1', 'Patient One', '')
  })
})