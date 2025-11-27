import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import ResetPasswordFlow from "./ResetPasswordFlow";

const mockNavigate = vi.fn();
const mockForgotPasswordMutation = vi.fn();
const mockResetPasswordMutation = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/services/baseApi", () => ({
  useForgotPasswordMutation: () => [mockForgotPasswordMutation, { isLoading: false }],
  useResetPasswordMutation: () => [mockResetPasswordMutation, { isLoading: false }],
}));

vi.mock("sonner", () => ({
  toast: {
    success: (msg?: string) => mockToastSuccess(msg),
    error: (msg?: string) => mockToastError(msg),
  },
}));

vi.mock("framer-motion", () => ({
  motion: {
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/components/ui/input-otp", () => ({
  InputOTP: ({ value, onChange, children }: any) => (
    <div>
      <input
        data-testid="otp-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {children}
    </div>
  ),
  InputOTPGroup: ({ children }: any) => <div>{children}</div>,
  InputOTPSlot: ({ index }: any) => <span data-testid={`otp-slot-${index}`} />,
}));

const renderFlow = () =>
  render(
    <MemoryRouter>
      <ResetPasswordFlow />
    </MemoryRouter>
  );

const moveToStepTwo = async (user: ReturnType<typeof userEvent['setup']>, email = 'user@example.com') => {
  const input = screen.getByLabelText(/email/i)
  await user.clear(input)
  await user.type(input, email)
  await user.click(screen.getByRole('button', { name: /send code/i }))
  await waitFor(() => expect(mockForgotPasswordMutation).toHaveBeenCalled())
  await waitFor(() => expect(screen.getByTestId('otp-input')).toBeInTheDocument())
}

const moveToStepThree = async (user: ReturnType<typeof userEvent['setup']>) => {
  await moveToStepTwo(user)
  await user.type(screen.getByTestId('otp-input'), '123456')
  await user.click(screen.getByRole('button', { name: /verify otp/i }))
  await waitFor(() => expect(screen.getByPlaceholderText(/new password/i)).toBeInTheDocument())
}

describe('ResetPasswordFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockForgotPasswordMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ message: 'OTP sent' }),
    })
    mockResetPasswordMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ message: 'Reset success' }),
    })
  })

  it('đi qua đủ 3 bước khi người dùng hoàn thành flow thành công', async () => {
    const user = userEvent.setup()
    renderFlow()

    await moveToStepTwo(user)
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'We have sent you a message with the authentication code'
    )

    await user.type(screen.getByTestId('otp-input'), '123456')
    await user.click(screen.getByRole('button', { name: /verify otp/i }))
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalledWith('Xác thực OTP thành công'))
    expect(screen.getByPlaceholderText(/new password/i)).toBeInTheDocument()
  })

  it('không cho phép verify khi OTP chưa đủ 6 chữ số', async () => {
    const user = userEvent.setup()
    renderFlow()

    await moveToStepTwo(user)
    await user.type(screen.getByTestId('otp-input'), '1234')

    const verifyButton = screen.getByRole('button', { name: /verify otp/i })
    expect(verifyButton).toBeDisabled()
    expect(mockToastError).not.toHaveBeenCalled()
    expect(screen.queryByPlaceholderText(/new password/i)).not.toBeInTheDocument()
  })

  it('gửi yêu cầu đặt lại mật khẩu thành công', async () => {
    const user = userEvent.setup()
    renderFlow()

    await moveToStepThree(user)
    await user.type(screen.getByPlaceholderText(/new password/i), 'Password1!')
    await user.type(screen.getByPlaceholderText(/confirm password/i), 'Password1!')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() =>
      expect(mockResetPasswordMutation).toHaveBeenCalledWith({
        email: 'user@example.com',
        otp: '123456',
        newPassword: 'Password1!',
      })
    )
    expect(mockToastSuccess).toHaveBeenCalledWith('Reset success')
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login')
  })

  it('không gọi API khi mật khẩu xác nhận không khớp', async () => {
    const user = userEvent.setup()
    renderFlow()

    await moveToStepThree(user)
    await user.type(screen.getByPlaceholderText(/new password/i), 'Password1!')
    await user.type(screen.getByPlaceholderText(/confirm password/i), 'Different1!')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(mockToastError).toHaveBeenCalledWith('Mật khẩu xác nhận không khớp')
    expect(mockResetPasswordMutation).not.toHaveBeenCalled()
  })

  it('hiển thị lỗi API khi đặt lại mật khẩu thất bại', async () => {
    const user = userEvent.setup()
    const failedUnwrap = vi.fn().mockRejectedValue({ data: { message: 'Server down' } })
    mockResetPasswordMutation.mockReturnValue({ unwrap: failedUnwrap })

    renderFlow()
    await moveToStepThree(user)
    await user.type(screen.getByPlaceholderText(/new password/i), 'Password1!')
    await user.type(screen.getByPlaceholderText(/confirm password/i), 'Password1!')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Server down'))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('hiển thị lỗi khi API gửi mã OTP thất bại', async () => {
    const user = userEvent.setup()
    const failForgot = vi.fn().mockRejectedValue({ data: { message: 'Email không tồn tại' } })
    mockForgotPasswordMutation.mockReturnValue({ unwrap: failForgot })

    renderFlow()
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'user@example.com')
    await user.click(screen.getByRole('button', { name: /send code/i }))

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Email không tồn tại'))
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
})