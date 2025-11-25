import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import DeleteMedicalRecordModal from './DeleteMedicalRecordModal'

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open && <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}))

const mockRecord = {
  _id: '1',
  patientId: 'P001',
  fullName: 'John Doe',
  gender: 'male' as const,
  dateOfBirth: '1990-01-01',
  phoneNumber: '1234567890',
  email: 'john@example.com',
  address: '123 Main St',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  createdBy: 'admin1',
}

describe('DeleteMedicalRecordModal', () => {
  const mockOnConfirm = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('DELETE: gọi onConfirm khi click Delete', async () => {
    const user = userEvent.setup()
    render(
      <DeleteMedicalRecordModal
        open={true}
        onOpenChange={mockOnOpenChange}
        medicalRecord={mockRecord}
        onConfirm={mockOnConfirm}
      />
    )
    
    await user.click(screen.getByRole('button', { name: /delete medical record/i }))
    expect(mockOnConfirm).toHaveBeenCalled()
  })

  it('DELETE: đóng modal khi click Cancel', async () => {
    const user = userEvent.setup()
    render(
      <DeleteMedicalRecordModal
        open={true}
        onOpenChange={mockOnOpenChange}
        medicalRecord={mockRecord}
        onConfirm={mockOnConfirm}
      />
    )
    
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('DELETE: không render khi medicalRecord null', () => {
    render(
      <DeleteMedicalRecordModal
        open={true}
        onOpenChange={mockOnOpenChange}
        medicalRecord={null}
        onConfirm={mockOnConfirm}
      />
    )
    expect(screen.queryByText(/delete medical record/i)).not.toBeInTheDocument()
  })
})