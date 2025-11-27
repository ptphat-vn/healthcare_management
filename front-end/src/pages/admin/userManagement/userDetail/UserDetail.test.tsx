import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import UserDetail from "./UserDetail";
import type { User } from "@/types/user.type";

// Mock dependencies
vi.mock("@/services/userApi", () => ({
  useGetDetailUserQuery: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useParams: vi.fn(() => ({ id: "1" })),
  useNavigate: vi.fn(() => vi.fn()),
}));

vi.mock("@/components/ui/button/ButtonBack", () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="button-back">{title}</div>
  ),
}));

import { useGetDetailUserQuery } from "@/services/userApi";
import { useParams } from "react-router-dom";

const mockUseGetDetailUserQuery = vi.mocked(useGetDetailUserQuery);
const mockUseParams = vi.mocked(useParams);

describe("UserDetail", () => {
  const mockUser: User = {
    _id: "1",
    fullName: "John Doe",
    email: "john@example.com",
    phoneNumber: "1234567890",
    identifyNumber: "123456789",
    gender: "male",
    dateOfBirth: "1990-01-15",
    address: "123 Main St",
    roleName: "Admin",
    status: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  } as User;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: "1" });
  });

  it("should render user details with all information when data is loaded", async () => {
    mockUseGetDetailUserQuery.mockReturnValue({
      data: {
        data: mockUser,
      },
      isLoading: false,
      isError: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetDetailUserQuery>);

    render(<UserDetail />);

    await waitFor(() => {
      // Verify header section
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("JD")).toBeInTheDocument(); // Initials

      // Verify contact information
      expect(screen.getByText("Contact Information")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("1234567890")).toBeInTheDocument();
      expect(screen.getByText("123456789")).toBeInTheDocument();

      // Verify personal information
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
      expect(screen.getByText("male")).toBeInTheDocument();

      // Verify system information
      expect(screen.getByText("System Information")).toBeInTheDocument();
      expect(screen.getByText("Created At")).toBeInTheDocument();
      expect(screen.getByText("Updated At")).toBeInTheDocument();
    });
  });

  it("should display loading state when isLoading is true", () => {
    mockUseGetDetailUserQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetDetailUserQuery>);

    render(<UserDetail />);

    expect(
      screen.getByText("Đang tải thông tin người dùng...")
    ).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("should display error message when there is an error", () => {
    mockUseGetDetailUserQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: "Failed to load user" },
    } as unknown as ReturnType<typeof useGetDetailUserQuery>);

    render(<UserDetail />);

    // Error message is displayed as "Error loading user: Failed to load user"
    expect(screen.getByText(/Error loading user:/)).toBeInTheDocument();
    // The full error text should be present
    const errorText = screen.getByText(
      /Error loading user:.*Failed to load user/
    );
    expect(errorText).toBeInTheDocument();
  });

  it("should display 'User not found' when user data is undefined", () => {
    mockUseGetDetailUserQuery.mockReturnValue({
      data: {
        data: undefined,
      },
      isLoading: false,
      isError: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetDetailUserQuery>);

    render(<UserDetail />);

    expect(screen.getByText("User not found.")).toBeInTheDocument();
  });

  it("should display correct status badges for different user statuses", async () => {
    // Test Active status
    const activeUser = { ...mockUser, status: 1 };
    mockUseGetDetailUserQuery.mockReturnValue({
      data: {
        data: activeUser,
      },
      isLoading: false,
      isError: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetDetailUserQuery>);

    const { rerender } = render(<UserDetail />);

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    // Test Banned status
    const bannedUser = { ...mockUser, status: 2 };
    mockUseGetDetailUserQuery.mockReturnValue({
      data: {
        data: bannedUser,
      },
      isLoading: false,
      isError: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetDetailUserQuery>);

    rerender(<UserDetail />);

    await waitFor(() => {
      expect(screen.getByText("Banned")).toBeInTheDocument();
    });

    // Test Inactive status
    const inactiveUser = { ...mockUser, status: 0 };
    mockUseGetDetailUserQuery.mockReturnValue({
      data: {
        data: inactiveUser,
      },
      isLoading: false,
      isError: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetDetailUserQuery>);

    rerender(<UserDetail />);

    await waitFor(() => {
      expect(screen.getByText("Inactive")).toBeInTheDocument();
    });
  });
});
