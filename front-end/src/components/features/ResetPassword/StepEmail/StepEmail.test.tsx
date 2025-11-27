import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import StepEmail from './StepEmail'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  },
}))

describe('StepEmail - Gửi mã OTP', () => {
  const mockSetIdentifier = vi.fn()
  const mockOnSend = vi.fn()
  const mockOnBack = vi.fn()

  const defaultProps = {
    identifier: '',
    setIdentifier: mockSetIdentifier,
    onSend: mockOnSend,
    onBack: mockOnBack,
    loading: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

//   it('hiển thị form nhập email', () => {
//     render(<StepEmail {...defaultProps} />)

//     expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
//     expect(screen.getByPlaceholderText(/example123@gmail.com/i)).toBeInTheDocument()
//     expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument()
//     expect(screen.getByText(/back to sign in/i)).toBeInTheDocument()
//   })

  it('cho phép người dùng nhập email', async () => {
    render(<StepEmail {...defaultProps} />)

    const emailInput = screen.getByLabelText(/email/i)
    
    // Dùng fireEvent.change để thay đổi giá trị input một lần với toàn bộ chuỗi
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    // Kiểm tra rằng setIdentifier được gọi một lần với toàn bộ chuỗi
    expect(mockSetIdentifier).toHaveBeenCalledTimes(1)
    expect(mockSetIdentifier).toHaveBeenCalledWith('test@example.com')
  })

  it('gọi onSend khi submit form với email hợp lệ', async () => {
    render(<StepEmail {...defaultProps}  />)
    
    const sendButton = screen.getByRole('button', { name: /send code/i })
    await userEvent.click(sendButton)

    expect(mockOnSend).toHaveBeenCalledTimes(1)
  })

  it('gọi onSend khi nhấn Enter trong input', async () => {
    render(<StepEmail {...defaultProps} identifier="test@example.com" />)

    const emailInput = screen.getByLabelText(/email/i)
    
    await userEvent.type(emailInput, '{Enter}')

    expect(mockOnSend).toHaveBeenCalledTimes(1)
  })

  it('gọi onBack khi click nút Back', async () => {
    render(<StepEmail {...defaultProps} />)

    const backButton = screen.getByText(/back to sign in/i)
    await userEvent.click(backButton)

    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('hiển thị trạng thái loading khi đang gửi', () => {
    render(<StepEmail {...defaultProps} loading={true} />)

    const sendButton = screen.getByRole('button', { name: /đang gửi/i })
    expect(sendButton).toBeDisabled()
    expect(sendButton).toHaveTextContent('Đang gửi...')
  })

//   it('hiển thị nút Send Code khi không loading', () => {
//     render(<StepEmail {...defaultProps} loading={false} />)

//     const sendButton = screen.getByRole('button', { name: /send code/i })
//     expect(sendButton).not.toBeDisabled()
//     expect(sendButton).toHaveTextContent('Send Code')
//   })

  it('giữ giá trị email khi re-render', () => {
    const { rerender } = render(
      <StepEmail {...defaultProps} identifier="test@example.com" />
    )

    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com')

    rerender(<StepEmail {...defaultProps} identifier="new@example.com" />)

    expect(screen.getByLabelText(/email/i)).toHaveValue('new@example.com')
  })
})