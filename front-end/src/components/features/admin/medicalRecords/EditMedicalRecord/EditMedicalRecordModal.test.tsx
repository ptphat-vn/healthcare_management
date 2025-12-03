import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import EditMedicalRecordModal from './EditMedicalRecordModal'
import * as medicalRecordApi from '@/services/medicalRecordApi'
import { toast } from 'sonner'

vi.mock('@/services/medicalRecordApi')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('./EditMedicalRecordForm', () => ({
  EditMedicalRecordForm: ({ onSubmit, isLoading, defaultValues }: any) => (
    <button onClick={() => onSubmit({ _id: defaultValues._id, fullName: 'Updated' })} disabled={isLoading}>
      {isLoading ? 'Updating...' : 'Update'}
    </button>
  ),
}))
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open && <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}))

const mockRecord = {
  _id: '1',
  patientId: 'P001',
  fullName: 'John Doe',
  dateOfBirth: '1990-01-01',
  gender: 'male' as const,
  phoneNumber: '1234567890',
  email: 'john@example.com',
  address: '123 Main St',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  createdBy: 'admin1',
}

describe('EditMedicalRecordModal', () => {
  const mockUpdate = vi.fn()
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdate.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ message: 'Updated' }) })
    vi.mocked(medicalRecordApi.useUpdateMedicalRecordMutation).mockReturnValue([mockUpdate, { isLoading: false }] as any)
  })

  it('UPDATE: gọi API khi submit', async () => {
    const user = userEvent.setup()
    render(<EditMedicalRecordModal open={true} onOpenChange={mockOnOpenChange} medicalRecord={mockRecord} onSuccess={mockOnSuccess} />)
    
    await user.click(screen.getByText('Update'))
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ _id: '1', fullName: 'Updated' }))
  })

  it('UPDATE: hiển thị success và đóng modal', async () => {
    const user = userEvent.setup()
    render(<EditMedicalRecordModal open={true} onOpenChange={mockOnOpenChange} medicalRecord={mockRecord} onSuccess={mockOnSuccess} />)
    
    await user.click(screen.getByText('Update'))
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled()
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('UPDATE: không gọi API khi medicalRecord null', () => {
    render(<EditMedicalRecordModal open={true} onOpenChange={mockOnOpenChange} medicalRecord={null} />)
    expect(screen.queryByText('Update')).not.toBeInTheDocument()
  })
})