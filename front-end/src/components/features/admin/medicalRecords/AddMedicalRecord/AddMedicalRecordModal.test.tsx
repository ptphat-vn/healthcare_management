import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import AddMedicalRecordModal from './AddMedicalRecordModal'
import * as medicalRecordApi from '@/services/medicalRecordApi'
import { toast } from 'sonner'

vi.mock('@/services/medicalRecordApi')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../NewMedicalRecordFrom/NewMedicalRecordForm', () => ({
  NewMedicalRecordForm: ({ onSubmit, isLoading }: any) => (
    <button onClick={() => onSubmit({ userId: 'user123', bloodType: 'A+' })} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Submit'}
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

describe('AddMedicalRecordModal', () => {
  const mockCreate = vi.fn()
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ message: 'Created' }) })
    vi.mocked(medicalRecordApi.useCreateMedicalRecordMutation).mockReturnValue([mockCreate, { isLoading: false }] as any)
  })

  it('CREATE: gọi API khi submit', async () => {
    const user = userEvent.setup()
    render(<AddMedicalRecordModal open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    await user.click(screen.getByText('Submit'))
    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith({ userId: 'user123', bloodType: 'A+' }))
  })

  it('CREATE: hiển thị success và đóng modal', async () => {
    const user = userEvent.setup()
    render(<AddMedicalRecordModal open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    await user.click(screen.getByText('Submit'))
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled()
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('CREATE: hiển thị error khi thất bại', async () => {
    const user = userEvent.setup()
    mockCreate.mockReturnValue({ unwrap: vi.fn().mockRejectedValue({ data: { message: 'Error' } }) })
    render(<AddMedicalRecordModal open={true} onOpenChange={mockOnOpenChange} />)

    await user.click(screen.getByText('Submit'))
    await waitFor(() => expect(toast.error).toHaveBeenCalled())
  })
})