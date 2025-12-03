import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "./ProfilePage";

// Mock baseApi hooks
vi.mock("@/services/baseApi", () => ({
  useGetProfileQuery: vi.fn(),
  useUpdateProfileMutation: vi.fn(),
}));

// Mock userApi hooks
vi.mock("@/services/userApi", () => ({
  useUpdateAvatarMutation: vi.fn(),
}));

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => (
    <span data-testid="badge" className={className}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    className,
    onClick,
  }: {
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <button data-testid="button" className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock EditAdminForm
vi.mock(
  "@/components/features/admin/profileManagement/EditAdminFrom/EditAdminForm",
  () => ({
    EditAdminForm: ({
      defaultValues,
      onClose,
      isLoading,
      onSubmit,
    }: {
      defaultValues: any;
      onClose: () => void;
      isLoading: boolean;
      onSubmit: (data: any) => Promise<void> | void;
    }) => (
      <div data-testid="edit-admin-form">
        <span data-testid="edit-loading">{String(isLoading)}</span>
        <button
          data-testid="edit-submit"
          onClick={async () => {
            await onSubmit(defaultValues);
          }}
        >
          Submit Edit
        </button>
        <button data-testid="edit-close" onClick={onClose}>
          Close
        </button>
      </div>
    ),
  })
);

// Mock utilities
vi.mock("@/utils/formatDate", () => ({
  formatDate: vi.fn(() => "01/01/2000"),
}));

vi.mock("@/utils/getRoleButtonClass", () => ({
  getRoleButtonClass: vi.fn(() => "btn-role"),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock lucide-react icons used directly
vi.mock("lucide-react", () => ({
  User: () => <span data-testid="user-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
  Pencil: () => <span data-testid="pencil-icon" />,
}));

import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/services/baseApi";
import { useUpdateAvatarMutation } from "@/services/userApi";
import { formatDate } from "@/utils/formatDate";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";

const mockUseGetProfileQuery = vi.mocked(useGetProfileQuery);
const mockUseUpdateProfileMutation = vi.mocked(
  useUpdateProfileMutation as unknown as Mock
);
const mockUseUpdateAvatarMutation = vi.mocked(
  useUpdateAvatarMutation as unknown as Mock
);
const mockFormatDate = vi.mocked(formatDate);
const mockGetRoleButtonClass = vi.mocked(getRoleButtonClass);

describe("ProfilePage", () => {
  const baseUser = {
    _id: "1",
    fullName: "John Doe",
    email: "john@example.com",
    phoneNumber: "1234567890",
    identifyNumber: "ID001",
    gender: "male",
    dateOfBirth: "1990-01-01",
    address: "123 Main St",
    roleCode: "admin",
    avatar: "https://example.com/avatar.jpg",
  } as any;

  const mockUpdateProfile = vi.fn();
  const mockUpdateProfileUnwrap = vi.fn();
  const mockUpdateAvatar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdateProfileUnwrap.mockResolvedValue({});
    mockUpdateProfile.mockReturnValue({ unwrap: mockUpdateProfileUnwrap });

    mockUseUpdateProfileMutation.mockReturnValue([
      mockUpdateProfile,
      { isLoading: false },
    ] as unknown as ReturnType<typeof useUpdateProfileMutation>);

    mockUseUpdateAvatarMutation.mockReturnValue([
      mockUpdateAvatar,
      { isLoading: false },
    ] as unknown as ReturnType<typeof useUpdateAvatarMutation>);

    mockFormatDate.mockReturnValue("01/01/2000");
    mockGetRoleButtonClass.mockReturnValue("btn-role");
  });

  it("should show loading state when profile is loading", () => {
    mockUseGetProfileQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as unknown as ReturnType<typeof useGetProfileQuery>);

    render(<ProfilePage />);

    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  it("should show error state when profile is not available", () => {
    mockUseGetProfileQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetProfileQuery>);

    render(<ProfilePage />);

    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
    expect(screen.getByText("Unable to load profile")).toBeInTheDocument();
  });

  it("should render user profile information correctly", () => {
    mockUseGetProfileQuery.mockReturnValue({
      data: { data: baseUser },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetProfileQuery>);

    render(<ProfilePage />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Phone number")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText("Identify Number")).toBeInTheDocument();
    expect(screen.getByText("ID001")).toBeInTheDocument();
    expect(screen.getByText("Date of Birth")).toBeInTheDocument();
    expect(screen.getByText("01/01/2000")).toBeInTheDocument();
    expect(screen.getAllByText("Male").length).toBeGreaterThan(0);
    expect(screen.getByTestId("badge")).toBeInTheDocument();
    expect(mockGetRoleButtonClass).toHaveBeenCalledWith("admin");
  });

  it("should open edit form when Edit button is clicked and submit calls updateProfile", async () => {
    const user = userEvent.setup();

    mockUseGetProfileQuery.mockReturnValue({
      data: { data: baseUser },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetProfileQuery>);

    render(<ProfilePage />);

    const editButton = screen.getByText("Edit");
    expect(editButton).toBeInTheDocument();

    await user.click(editButton);
    expect(screen.getByTestId("edit-admin-form")).toBeInTheDocument();

    const submitButton = screen.getByTestId("edit-submit");
    await user.click(submitButton);

    await vi.waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
      expect(mockUpdateProfileUnwrap).toHaveBeenCalled();
    });
  });
});


