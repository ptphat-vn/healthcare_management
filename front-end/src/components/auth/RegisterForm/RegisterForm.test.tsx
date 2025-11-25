import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import React from 'react'
import RegisterForm from './RegisterForm.tsx'

// Mock Input để không cần thay đổi component thật
vi.mock('../ui/input/Input', () => {
  const MockInput = React.forwardRef<HTMLInputElement, any>(
    ({ label, required, error, name, id, ...rest }: any, ref: any) => {
      const controlId = id ?? name ?? `input-${(label ?? 'field').toLowerCase().replace(/\s+/g, '-')}`
      
      return (
        <div>
          {label && (
            <label htmlFor={controlId}>
              {label}
              {required && ' *'}
            </label>
          )}
          <input id={controlId} name={name} ref={ref} {...rest} />
          {error && <span>{error}</span>}
        </div>
      )
    }
  )
  MockInput.displayName = 'MockInput'
  return { default: MockInput }
})

const mockDispatch = vi.fn()
const mockNavigate = vi.fn()
const mockRegisterMutation = vi.fn()
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

// Mock setAuth action creator
vi.mock('@/stores/authSlice', () => ({
  setAuth: (payload: any) => ({
    type: 'auth/setAuth',
    payload,
  }),
}))

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/services/baseApi', () => ({
  useRegisterMutation: () => [mockRegisterMutation, { isLoading: false }],
}))

vi.mock('sonner', () => ({
  toast: {
    success: (message?: string) => mockToastSuccess(message),
    error: (message?: string) => mockToastError(message),
  },
}))

const renderForm = () =>
  render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  )

const fillValidForm = async () => {
  await userEvent.type(screen.getByLabelText(/full name/i), 'Nguyen Van LenLen')
  await userEvent.type(screen.getByLabelText(/email/i), 'test123456789@example.com')
  await userEvent.type(screen.getByLabelText(/phone number/i), '0123466789')
  await userEvent.type(screen.getByLabelText(/identify number/i), '012345678901')
  await userEvent.type(screen.getByLabelText(/address/i), '123 Test Street')
  await userEvent.type(screen.getByLabelText(/^password\s*\*?$/i), 'Password1!')
  await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password1!')
  
  // Set value trực tiếp cho input type="date"
  const dateInput = screen.getByLabelText(/date of birth/i) as HTMLInputElement
  await userEvent.clear(dateInput)
  await userEvent.type(dateInput, '2000-01-01')
  
  await userEvent.selectOptions(screen.getByLabelText(/gender/i), 'male')
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock để mỗi test có mock riêng
    mockRegisterMutation.mockReturnValue({
      unwrap: () => Promise.resolve({})
    })
  })

  it('hiển thị lỗi validate khi bỏ trống trường bắt buộc', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /register/i }))
    expect(await screen.findByText(/email không đúng/i)).toBeInTheDocument()
    expect(mockRegisterMutation).not.toHaveBeenCalled()
  })

  it('gọi API và chuyển hướng khi đăng ký thành công', async () => {
    // Mock để trả về object có unwrap() method
    mockRegisterMutation.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: { accessToken: 'a', refreshToken: 'r' },
          message: 'Đăng ký thành công',
        }),
    })

    renderForm()
    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(mockRegisterMutation).toHaveBeenCalledWith({
        fullName: 'Nguyen Van LenLen',
        email: 'test123456789@example.com',
        phoneNumber: '0123466789',
        identifyNumber: '012345678901',
        dateOfBirth: '2000-01-01',
        password: 'Password1!',
        gender: 'male',
      })
    })

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'auth/setAuth',
        payload: { accessToken: 'a', refreshToken: 'r' },
      })
    })
    
    expect(mockToastSuccess).toHaveBeenCalledWith('Đăng ký thành công')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('hiển thị toast lỗi khi đăng ký thất bại', async () => {
    // Mock để trả về object có unwrap() method reject với error
    mockRegisterMutation.mockReturnValue({
      unwrap: () => {
        const error: any = {
          status: 400,
          data: { message: 'Email đã tồn tại' }
        }
        return Promise.reject(error)
      },
    })

    renderForm()
    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Email đã tồn tại')
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})