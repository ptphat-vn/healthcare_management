import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import MedicalRecordList from './MedicalRecordList'
import * as medicalRecordApi from '@/services/medicalRecordApi'
import * as useAuthHook from '@/hooks/useAuth'
import { toast } from 'sonner'

vi.mock('@/services/medicalRecordApi')
vi.mock('@/hooks/useAuth')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

const mockRecords = [
  {
    _id: '1',
    patientId: 'P001',
    fullName: 'John Doe',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    bloodType: 'A+',
    phoneNumber: '1234567890',
    email: 'john@example.com',
    address: '123 Main St',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'admin1',
    lastTestDate: '2024-02-15',
    lastTestStatus: 'completed',
  },
  {
    _id: '2',
    patientId: 'P002',
    fullName: 'Jane Smith',
    dateOfBirth: '1985-05-15',
    gender: 'female',
    bloodType: 'B+',
    phoneNumber: '0987654321',
    email: 'jane@example.com',
    address: '456 Oak Ave',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
    createdBy: 'admin1',
    lastTestDate: '2024-03-10',
    lastTestStatus: 'pending',
  },
]

describe('MedicalRecordList', () => {
  const mockRefetch = vi.fn()
  const mockDelete = vi.fn()
  const mockUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(medicalRecordApi.useGetMedicalRecordsQuery).mockReturnValue({
      data: {
        data: {
          patient: mockRecords,
          pagination: { page: 1, limit: 8, total: 2, totalPages: 1 },
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any)
    vi.mocked(medicalRecordApi.useDeleteMedicalRecordMutation).mockReturnValue([mockDelete] as any)
    vi.mocked(medicalRecordApi.useUpdateMedicalRecordMutation).mockReturnValue([mockUpdate, { isLoading: false }] as any)
    vi.mocked(useAuthHook.useAuth).mockReturnValue({ user: { data: { roleCode: 'admin' } } } as any)
  })

  it('READ: hiển thị đầy đủ thông tin medical records', () => {
    render(<BrowserRouter><MedicalRecordList /></BrowserRouter>)

    const checkRecord = (record: typeof mockRecords[number]) => {
      expect(screen.getByText(record.fullName)).toBeInTheDocument()
      expect(screen.getAllByText(new Date(record.dateOfBirth).toLocaleDateString())[0]).toBeInTheDocument()
      expect(screen.getByText(record.gender)).toBeInTheDocument()
      expect(screen.getByText(record.bloodType)).toBeInTheDocument()
      expect(screen.getByText(record.phoneNumber)).toBeInTheDocument()
      expect(screen.getByText(record.email)).toBeInTheDocument()
      if (record.lastTestDate) {
        expect(screen.getByText(new Date(record.lastTestDate).toLocaleDateString())).toBeInTheDocument()
      }
      if (record.lastTestStatus) {
        expect(screen.getByText(record.lastTestStatus)).toBeInTheDocument()
      }
    }

    mockRecords.forEach(checkRecord)
  })

  it('READ: gọi API với params đúng', () => {
    render(<BrowserRouter><MedicalRecordList /></BrowserRouter>)
    expect(medicalRecordApi.useGetMedicalRecordsQuery).toHaveBeenCalledWith({
      search: undefined,
      gender: undefined,
      sortBy: 'createdAt',
      sortOrder: -1,
      page: 1,
      limit: 8,
    })
  })

//   it('DELETE: gọi delete API khi confirm', async () => {
//     const user = userEvent.setup()
//     mockDelete.mockResolvedValue({ unwrap: vi.fn().mockResolvedValue({ message: 'Deleted' }) })
//     render(<BrowserRouter><MedicalRecordList /></BrowserRouter>)
    
//     const deleteBtn = screen.getAllByText(/delete/i)[0]
//     await user.click(deleteBtn)
    
//     await waitFor(() => {
//       const confirmBtn = screen.getByRole('button', { name: /delete medical record/i })
//       expect(confirmBtn).toBeInTheDocument()
//     })
    
//     await user.click(screen.getByRole('button', { name: /delete medical record/i }))
//     await waitFor(() => expect(mockDelete).toHaveBeenCalled())
//   })

//   it('DELETE: hiển thị success message', async () => {
//     const user = userEvent.setup()
//     mockDelete.mockResolvedValue({ unwrap: vi.fn().mockResolvedValue({ message: 'Deleted' }) })
//     render(<BrowserRouter><MedicalRecordList /></BrowserRouter>)
    
//     await user.click(screen.getAllByText(/delete/i)[0])
//     await waitFor(() => screen.getByRole('button', { name: /delete medical record/i }))
//     await user.click(screen.getByRole('button', { name: /delete medical record/i }))
    
//     await waitFor(() => expect(toast.success).toHaveBeenCalled())
//   })
})