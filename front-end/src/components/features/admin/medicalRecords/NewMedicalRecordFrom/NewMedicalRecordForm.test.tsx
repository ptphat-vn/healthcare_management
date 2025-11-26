import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import React from 'react'
import { NewMedicalRecordForm } from './NewMedicalRecordForm'
import * as userApi from '@/services/userApi'

const mockUsers = {
  data: {
    user: [
      { _id: 'user1', fullName: 'John Doe', email: 'john@example.com', patientId: 'P001', roleCode: 'patient' },
      { _id: 'user2', fullName: 'Jane Smith', email: 'jane@example.com', patientId: 'P002', roleCode: 'patient' },
    ],
  },
}

vi.mock('@/services/userApi', () => ({ useGetAllUserQuery: vi.fn() }))
vi.mock('@/utils/medicalRecordTransform', () => ({
  transformFormToCreateRequest: vi.fn((data) => data),
}))
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: true, logout: vi.fn() }),
}))
vi.mock('@/services/baseApi', () => ({
  useGetProfileQuery: () => ({ data: null }),
  useLogoutMutation: () => [vi.fn()],
}))

vi.mock('@/components/ui/combobox', () => ({
  Combobox: React.forwardRef<any, any>(({ value, onValueChange, options, placeholder, disabled }, ref) => (
    <div>
      <button
        ref={ref}
        onClick={() => !disabled && onValueChange(options[0]?.value)}
        disabled={disabled}
        data-testid="combobox"
      >
        {value ? options.find((o: any) => o.value === value)?.label : placeholder}
      </button>
    </div>
  )),
}))

vi.mock('@/components/ui/input/Input', () => ({
  default: React.forwardRef<any, any>(({ label, error, ...props }, ref) => (
    <div>
      {label && <label>{label}</label>}
      <input ref={ref} {...props} />
      {error && <span>{error}</span>}
    </div>
  )),
}))

describe('NewMedicalRecordForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(userApi.useGetAllUserQuery).mockReturnValue({
      data: mockUsers,
      isLoading: false,
    } as any)
  })

  it('hiển thị form với tất cả fields', () => {
    render(<NewMedicalRecordForm onSubmit={mockOnSubmit} onClose={mockOnClose} />)

    expect(screen.getByText(/select patient/i)).toBeInTheDocument()
    expect(screen.getAllByText(/blood type/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/allergies/i)).toBeInTheDocument()
    expect(screen.getAllByText(/emergency contact/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/insurance information/i)).toBeInTheDocument()
  })

  it('hiển thị loading khi fetch users', () => {
    vi.mocked(userApi.useGetAllUserQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)

    render(<NewMedicalRecordForm onSubmit={mockOnSubmit} onClose={mockOnClose} />)

    expect(screen.getByText(/loading patients/i)).toBeInTheDocument()
    expect(screen.getByTestId('combobox')).toBeDisabled()
  })

  it('validate userId required khi submit', async () => {
    render(<NewMedicalRecordForm onSubmit={mockOnSubmit} onClose={mockOnClose} />)

    await userEvent.click(screen.getByRole('button', { name: /create medical record/i }))

    await waitFor(() => {
      expect(screen.getByText(/user id is required/i)).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('gọi onSubmit với data đúng khi submit thành công', async () => {
    render(<NewMedicalRecordForm onSubmit={mockOnSubmit} onClose={mockOnClose} />)

    await userEvent.click(screen.getByTestId('combobox'))
    const bloodTypeSelect = document.querySelector('select[name="bloodType"]') as HTMLSelectElement
    await userEvent.selectOptions(bloodTypeSelect, 'A+')
    await userEvent.click(screen.getByRole('button', { name: /create medical record/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
      expect(mockOnSubmit.mock.calls[0][0].userId).toBe('user1')
      expect(mockOnSubmit.mock.calls[0][0].bloodType).toBe('A+')
    })
  })

  it('disable submit button khi isLoading', () => {
    render(<NewMedicalRecordForm onSubmit={mockOnSubmit} onClose={mockOnClose} isLoading={true} />)

    const submitButton = screen.getByRole('button', { name: /creating/i })
    expect(submitButton).toBeDisabled()
  })

  it('gọi onClose khi click nút Cancel', async () => {
    render(<NewMedicalRecordForm onSubmit={mockOnSubmit} onClose={mockOnClose} />)

    const cancelButton = screen.getByText(/cancel/i)
    await userEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
