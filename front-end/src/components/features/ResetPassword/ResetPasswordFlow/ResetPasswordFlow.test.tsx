import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import ResetPasswordFlow from './ResetPasswordFlow'

const mockNavigate = vi.fn()
const mockForgotPasswordMutation = vi.fn()
const mockResetPasswordMutation = vi.fn()
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/services/baseApi', () => ({
  useForgotPasswordMutation: () => [mockForgotPasswordMutation, { isLoading: false }],
  useResetPasswordMutation: () => [mockResetPasswordMutation, { isLoading: false }],
}))

vi.mock('sonner', () => ({
  toast: {
    success: (message?: string) => mockToastSuccess(message),
    error: (message?: string) => mockToastError(message),
  },
}))

vi.mock('framer-motion', () => ({
  motion: {
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

const renderFlow = () =>
  render(
    <MemoryRouter>
      <ResetPasswordFlow />
    </MemoryRouter>
  )

describe('ResetPasswordFlow - Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('chuyển từ step 1 sang step 2 sau khi gửi OTP thành công', async () => {
    mockForgotPasswordMutation.mockReturnValue({
      unwrap: () => Promise.resolve({ message: 'OTP đã được gửi' }),
    })

    renderFlow()

    // Step 1: Nhập email
    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.click(screen.getByRole('button', { name: /send code/i }))

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalled()
    })

    // Kiểm tra chuyển sang step 2
    await waitFor(() => {
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
    })
  })

  it('hiển thị lỗi khi email không hợp lệ', async () => {
    renderFlow()

    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.click(screen.getByRole('button', { name: /send code/i }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Email không hợp lệ')
    })

    expect(mockForgotPasswordMutation).not.toHaveBeenCalled()
  })
})