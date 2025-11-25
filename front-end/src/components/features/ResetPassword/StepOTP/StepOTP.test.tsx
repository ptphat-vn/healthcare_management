import { render, screen  } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import StepOTP from './StepOTP'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))
// Mock InputOTP components
vi.mock('@/components/ui/input-otp', () => ({
  InputOTP: ({ children, value, onChange, maxLength }: any) => (
    <div data-testid="input-otp">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, maxLength)
          onChange(val)
        }}
        maxLength={maxLength}
        data-testid="otp-input"
      />
      {children}
    </div>
  ),
  InputOTPGroup: ({ children }: any) => <div data-testid="otp-group">{children}</div>,
  InputOTPSlot: ({ index }: any) => <span data-testid={`otp-slot-${index}`} />,
}))

describe('StepOTP - Xác thực mã OTP', () => {
  const mockSetOtp = vi.fn()
  const mockOnVerify = vi.fn()
  const mockOnResend = vi.fn()
  const mockOnBack = vi.fn()
  const defaultProps = {
    otp: '',
    setOtp: mockSetOtp,
    onVerify: mockOnVerify,
    onResend: mockOnResend,
    onBack: mockOnBack,
    loading: false,
  }
  beforeEach(() => {
    vi.clearAllMocks()
  })
//   it('hiển thị form nhập OTP', () => {
//     render(<StepOTP {...defaultProps} />)

//     expect(screen.getByText(/nhập mã xác thực/i)).toBeInTheDocument()
//     expect(screen.getByText(/chúng tôi đã gửi mã xác thực/i)).toBeInTheDocument()
//     expect(screen.getByTestId('input-otp')).toBeInTheDocument()
//     expect(screen.getByRole('button', { name: /verify otp/i })).toBeInTheDocument()
//     expect(screen.getByText(/resend code/i)).toBeInTheDocument()
//   })
  it('cho phép nhập OTP', async () => {
    render(<StepOTP {...defaultProps} />)
    const otpInput = screen.getByTestId('otp-input')
    await userEvent.type(otpInput, '123456')
    expect(mockSetOtp).toHaveBeenCalled()
  })

  it('chỉ cho phép nhập số', async () => {
    render(<StepOTP {...defaultProps} />)

    const otpInput = screen.getByTestId('otp-input')
    await userEvent.type(otpInput, 'abc123def456')
    // Chỉ số được gọi
    expect(mockSetOtp).toHaveBeenCalledWith(expect.stringMatching(/^\d+$/))
  })
  it('giới hạn OTP tối đa 6 ký tự', async () => {
    render(<StepOTP {...defaultProps} />)
    const otpInput = screen.getByTestId('otp-input')
    await userEvent.type(otpInput, '1234567890')
    // Chỉ 6 ký tự đầu được xử lý
    const calls = mockSetOtp.mock.calls
    const lastCall = calls[calls.length - 1]
    expect(lastCall[0].length).toBeLessThanOrEqual(6)
  })

  it('disable nút Verify khi OTP chưa đủ 6 số', () => {
    render(<StepOTP {...defaultProps} otp="12345" />)

    const verifyButton = screen.getByRole('button', { name: /verify otp/i })
    expect(verifyButton).toBeDisabled()
  })

  it('enable nút Verify khi OTP đủ 6 số', () => {
    render(<StepOTP {...defaultProps} otp="123456" />)
    const verifyButton = screen.getByRole('button', { name: /verify otp/i })
    expect(verifyButton).not.toBeDisabled()
  })

  it('gọi onVerify khi submit form với OTP hợp lệ', async () => {
    render(<StepOTP {...defaultProps} otp="123456" />)
    const verifyButton = screen.getByRole('button', { name: /verify otp/i })
    await userEvent.click(verifyButton)
    expect(mockOnVerify).toHaveBeenCalledTimes(1)
  })

  it('gọi onResend khi click nút Resend', async () => {
    render(<StepOTP {...defaultProps} />)
    const resendButton = screen.getByText(/resend code/i)
    await userEvent.click(resendButton)
    expect(mockOnResend).toHaveBeenCalledTimes(1)
  })

  it('gọi onBack khi click nút Back', async () => {
    render(<StepOTP {...defaultProps} />)
    const backButton = screen.getByLabelText(/back/i)
    await userEvent.click(backButton)
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

//   it('hiển thị trạng thái loading khi đang verify', () => {
//     render(<StepOTP {...defaultProps} otp="123456" loading={true} />)

//     const verifyButton = screen.getByRole('button', { name: /verifying/i })
//     expect(verifyButton).toBeDisabled()
//     expect(verifyButton).toHaveTextContent('Verifying...')
//   })

  it('disable nút Verify khi đang loading', () => {
    render(<StepOTP {...defaultProps} otp="123456" loading={true} />)
    const verifyButton = screen.getByRole('button', { name: /verifying/i })
    expect(verifyButton).toBeDisabled()
  })
})