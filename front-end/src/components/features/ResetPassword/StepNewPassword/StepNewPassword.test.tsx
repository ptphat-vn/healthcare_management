import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import StepNewPassword from './StepNewPassword'

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

  const renderComponent = (override = {}) =>
    render(<StepNewPassword {...defaultProps} {...override} />)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Functional behaviour', () => {
    it('gọi setPassword khi người dùng nhập mật khẩu mới', () => {
      renderComponent()
      fireEvent.change(screen.getByPlaceholderText(/new password/i), {
        target: { value: 'Password1!' },
      })
      expect(mockSetPassword).toHaveBeenCalledWith('Password1!')
    })

    it('gọi setConfirm khi nhập confirm password', () => {
      renderComponent()
      fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
        target: { value: 'Password1!' },
      })
      expect(mockSetConfirm).toHaveBeenCalledWith('Password1!')
    })

    it('submit form qua nút Submit khi mật khẩu hợp lệ', async () => {
      renderComponent({ password: 'Password1!', confirm: 'Password1!' })
      await userEvent.click(screen.getByRole('button', { name: /submit/i }))
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })

    it('submit form khi nhấn Enter trong ô nhập', async () => {
      renderComponent({ password: 'Password1!', confirm: 'Password1!' })
      await userEvent.type(screen.getByPlaceholderText(/new password/i), '{Enter}')
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })

    it('gọi onBack khi nhấn nút Back', async () => {
      renderComponent()
      await userEvent.click(screen.getByText(/back/i))
      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    it('disable nút Submit và hiển thị trạng thái loading', () => {
      renderComponent({ loading: true })
      const submitButton = screen.getByRole('button', { name: /submitting/i })
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Submitting...')
    })

    it('enable nút Submit bình thường khi không loading', () => {
      renderComponent({ loading: false })
      const submitButton = screen.getByRole('button', { name: /submit/i })
      expect(submitButton).not.toBeDisabled()
      expect(submitButton).toHaveTextContent('Submit')
    })
  })

  describe('UI structure (sau cùng)', () => {
    it('hiển thị email readonly và các field cần thiết', () => {
      renderComponent()
      expect(screen.getByDisplayValue('test@example.com')).toHaveAttribute('readOnly')
      expect(screen.getByPlaceholderText(/new password/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
      expect(screen.getByText(/back/i)).toBeInTheDocument()
    })
  })
})