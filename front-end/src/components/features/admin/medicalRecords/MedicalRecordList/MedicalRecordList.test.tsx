import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import MedicalRecordList from "./MedicalRecordList";
import * as medicalRecordApi from "@/services/medicalRecordApi";
import * as testOrderApi from "@/services/testOrderApi";
import * as useAuthHook from "@/hooks/useAuth";
import { toast } from "sonner";

vi.mock("@/services/medicalRecordApi");
vi.mock("@/hooks/useAuth");
vi.mock("@/services/testOrderApi");
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

const mockRecords = [
  {
    _id: "1",
    patientId: "P001",
    fullName: "John Doe",
    dateOfBirth: "1990-01-01",
    gender: "male",
    bloodType: "A+",
    phoneNumber: "1234567890",
    email: "john@example.com",
    address: "123 Main St",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    createdBy: "admin1",
    lastTestDate: "2024-02-15",
    lastTestStatus: "completed",
  },
  {
    _id: "2",
    patientId: "P002",
    fullName: "Jane Smith",
    dateOfBirth: "1985-05-15",
    gender: "female",
    bloodType: "B+",
    phoneNumber: "0987654321",
    email: "jane@example.com",
    address: "456 Oak Ave",
    createdAt: "2024-01-02",
    updatedAt: "2024-01-02",
    createdBy: "admin1",
    lastTestDate: "2024-03-10",
    lastTestStatus: "pending",
  },
];

describe("MedicalRecordList", () => {
  const mockRefetch = vi.fn();
  const mockDelete = vi.fn();
  const mockUpdate = vi.fn();

  const renderList = () =>
    render(
      <BrowserRouter>
        <MedicalRecordList />
      </BrowserRouter>
    );

  beforeEach(() => {
    vi.clearAllMocks();
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
    } as any);
    vi.mocked(medicalRecordApi.useDeleteMedicalRecordMutation).mockReturnValue([
      mockDelete,
    ] as any);
    vi.mocked(medicalRecordApi.useUpdateMedicalRecordMutation).mockReturnValue([
      mockUpdate,
      { isLoading: false },
    ] as any);
    vi.mocked(testOrderApi.useGetAllTestOrderQuery).mockReturnValue({
      data: { data: { testOrder: [] } },
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      user: { data: { roleCode: "admin" } },
    } as any);
    mockDelete.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ message: "Deleted" }),
    });
  });

  it("READ: hiển thị đầy đủ thông tin medical records", () => {
    renderList();

    mockRecords.forEach((record) => {
      expect(screen.getByText(record.fullName)).toBeInTheDocument();
      expect(screen.getByText(record.bloodType)).toBeInTheDocument();
      expect(screen.getByText(record.phoneNumber)).toBeInTheDocument();
      expect(screen.getByText(record.email)).toBeInTheDocument();
    });
  });

  it("READ: gọi API với params đúng", () => {
    renderList();
    expect(medicalRecordApi.useGetMedicalRecordsQuery).toHaveBeenCalledWith({
      search: undefined,
      gender: undefined,
      sortBy: "createdAt",
      sortOrder: -1,
      page: 1,
      limit: 8,
    });
  });

  it("DELETE: gọi API khi xác nhận xóa và refresh dữ liệu", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    await user.click(
      screen.getByRole("button", { name: /delete medical record/i })
    );

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith("1"));
    expect(toast.success).toHaveBeenCalledWith(
      "Medical record deleted successfully"
    );
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("DELETE: hiển thị lỗi khi API xóa thất bại", async () => {
    const user = userEvent.setup();
    mockDelete.mockReturnValue({
      unwrap: vi
        .fn()
        .mockRejectedValue({
          data: { message: "Failed to delete medical record" },
        }),
    });

    renderList();
    await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    await user.click(
      screen.getByRole("button", { name: /delete medical record/i })
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to delete medical record"
      )
    );
    expect(mockRefetch).not.toHaveBeenCalled();
  });
});
