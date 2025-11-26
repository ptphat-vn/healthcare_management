import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import StepNewPassword from './StepNewPassword'

// Mock framer-motion để bỏ animation trong test
vi.mock('framer-motion', () => ({
  motion: {
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  },
}))

describe('StepNewPassword - Đặt mật khẩu mới', () => {
  const mockSetPassword = vi.fn()
  const mockSetConfirm = vi.fn()
  const mockOnSubmit = vi.fn()
  const mockOnBack = vi.fn()

  const defaultProps = {
    identifier: 'test@example.com',
    password: '',
    setPassword: mockSetPassword,
    confirm: '',
    setConfirm: mockSetConfirm,
    onSubmit: mockOnSubmit,
    onBack: mockOnBack,
    loading: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hiển thị đầy đủ các field và nút', () => {
    render(<StepNewPassword {...defaultProps} />)   
    // Email readonly
    const emailInput = screen.getByDisplayValue('test@example.com')
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('readOnly')
    // New password + confirm password
    expect(
      screen.getByPlaceholderText(/new password/i)
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/confirm password/i)
    ).toBeInTheDocument()

    // Nút Submit + Back
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    expect(screen.getByText(/back/i)).toBeInTheDocument()
  })

  it('gọi setPassword khi nhập mật khẩu mới', async () => {
    render(<StepNewPassword {...defaultProps} />)

    const newPasswordInput = screen.getByPlaceholderText(/new password/i)
    fireEvent.change(newPasswordInput, { target: { value: 'Password1!' } })

    expect(mockSetPassword).toHaveBeenCalledTimes(1)
    expect(mockSetPassword).toHaveBeenCalledWith('Password1!')
  })

  it('gọi setConfirm khi nhập confirm password', async () => {
    render(<StepNewPassword {...defaultProps} />)

    const confirmInput = screen.getByPlaceholderText(/confirm password/i)
    fireEvent.change(confirmInput, { target: { value: 'Password1!' } })

    expect(mockSetConfirm).toHaveBeenCalledTimes(1)
    expect(mockSetConfirm).toHaveBeenCalledWith('Password1!')
  })

  it('gọi onSubmit khi submit form', async () => {
    render(
      <StepNewPassword
        {...defaultProps}
        password="Password1!"
        confirm="Password1!"
      />
    )
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  it('gọi onSubmit khi nhấn Enter trong input', async () => {
    render(
      <StepNewPassword
        {...defaultProps}
        password="Password1!"
        confirm="Password1!"
      /> 
    )
    const newPasswordInput = screen.getByPlaceholderText(/new password/i)
    await userEvent.type(newPasswordInput, '{Enter}')
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  it('gọi onBack khi click nút Back', async () => {
    render(<StepNewPassword {...defaultProps} />)
    const backButton = screen.getByText(/back/i)
    await userEvent.click(backButton)
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })
})
//   TODO: fix this
//   it('hiển thị trạng thái loading khi đang submit', () => {
//     render(<StepNewPassword {...defaultProps} loading={true} />)
//     const submitButton = screen.getByRole('button', { name: /submitting/i })
//     expect(submitButton).toBeDisabled()
//     expect(submitButton).toHaveTextContent('Submitting...')
//   })

//   it('hiển thị nút Submit bình thường khi không loading', () => {
//     render(<StepNewPassword {...defaultProps} loading={false} />)
//     const submitButton = screen.getByRole('button', { name: /submit/i })
//     expect(submitButton).not.toBeDisabled()
//     expect(submitButton).toHaveTextContent('Submit')
//   })
// })