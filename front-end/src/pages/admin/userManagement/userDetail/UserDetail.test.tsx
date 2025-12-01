import { render, screen } from "@testing-library/react";
import UserDetail from "./UserDetail";
import { vi } from "vitest";

const mockUseParams = vi.hoisted(() => vi.fn());
const mockUseGetDetailUserQuery = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useParams: mockUseParams,
  };
});

vi.mock("@/services/userApi", () => ({
  useGetDetailUserQuery: (...args: unknown[]) =>
    mockUseGetDetailUserQuery(...args),
}));

vi.mock("@/components/ui/button/ButtonBack", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => (
    <div data-testid="button-back">{title}</div>
  ),
}));

const createQueryState = (overrides?: Record<string, unknown>) => ({
  data: undefined,
  isLoading: false,
  isError: false,
  error: undefined,
  ...overrides,
});

describe("UserDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: "user-1" });
  });

  test("renders loading state", () => {
    mockUseGetDetailUserQuery.mockReturnValue(
      createQueryState({ isLoading: true })
    );

    render(<UserDetail />);

    expect(
      screen.getByText("Đang tải thông tin người dùng...")
    ).toBeInTheDocument();
  });

  test("renders error state", () => {
    mockUseGetDetailUserQuery.mockReturnValue(
      createQueryState({
        isError: true,
        error: { data: { message: "Something went wrong" } },
      })
    );

    render(<UserDetail />);

    expect(
      screen.getByText(/Error loading user: Something went wrong/)
    ).toBeInTheDocument();
  });

  test("renders message when user not found", () => {
    mockUseGetDetailUserQuery.mockReturnValue(createQueryState());

    render(<UserDetail />);

    expect(screen.getByText(/User not found/)).toBeInTheDocument();
  });

  test("renders user details when data is present", () => {
    const userData = {
      _id: "user-1",
      fullName: "John Doe",
      roleName: "Admin",
      email: "john@example.com",
      phoneNumber: "0123456789",
      identifyNumber: "123456789",
      gender: "male",
      dateOfBirth: "1990-05-10T00:00:00.000Z",
      address: "123 Main St",
      status: 1,
      createdAt: "2024-01-01T12:00:00.000Z",
      updatedAt: "2024-02-01T12:00:00.000Z",
    };

    mockUseGetDetailUserQuery.mockReturnValue(
      createQueryState({ data: { data: userData } })
    );

    render(<UserDetail />);

    expect(mockUseGetDetailUserQuery).toHaveBeenCalledWith(
      { id: "user-1" },
      { skip: false }
    );
    expect(screen.getByTestId("button-back")).toHaveTextContent("User List");
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("0123456789")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  test("shows banned badge when status is 2", () => {
    const userData = {
      _id: "user-2",
      fullName: "Jane Smith",
      roleName: "Operator",
      email: "jane@example.com",
      phoneNumber: "0987654321",
      status: 2,
    };

    mockUseParams.mockReturnValue({ id: "user-2" });
    mockUseGetDetailUserQuery.mockReturnValue(
      createQueryState({ data: { data: userData } })
    );

    render(<UserDetail />);

    expect(screen.getByText("Banned")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });
});
