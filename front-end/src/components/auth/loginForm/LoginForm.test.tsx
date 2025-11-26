import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/stores/authSlice";
import LoginForm from "./LoginForm";

// Mock toast - khai báo function bên trong mock
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock mutations
vi.mock("@/services/baseApi", async () => {
  const actual = await vi.importActual<typeof import("@/services/baseApi")>(
    "@/services/baseApi"
  );
  return {
    ...actual,
    useLoginMutation: () => [vi.fn(), { isLoading: false }],
    useLoginGoogleMutation: () => [vi.fn()],
  };
});

// Mock Google OAuth
vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess }: any) => (
    <button onClick={() => onSuccess?.({ credential: "mock-token" })}>
      Google Login Mock
    </button>
  ),
  GoogleOAuthProvider: ({ children }: any) => <div>{children}</div>,
}));

function renderLoginForm() {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </Provider>
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password inputs with labels", () => {
    renderLoginForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderLoginForm();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("renders forgot password and sign up links", () => {
    renderLoginForm();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it("renders Google login button", () => {
    renderLoginForm();
    expect(screen.getByText(/google login mock/i)).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    renderLoginForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText("Email không được bỏ trống")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Password không được bỏ trống")
    ).toBeInTheDocument();
  });

  it("shows validation error for invalid email format", async () => {
    renderLoginForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "invalid-email");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    renderLoginForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "12345");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText("Password tối thiểu phải có 6 kí tự")
    ).toBeInTheDocument();
  });

  it("allows typing in email and password fields", async () => {
    renderLoginForm();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });
  it("shows validation error for email with spaces", async () => {
    renderLoginForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test @example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
  });

  it("shows validation error for email without domain", async () => {
    renderLoginForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
  });

  it("shows validation error for email without @", async () => {
    renderLoginForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "testexample.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
  });

  it("shows validation error for exactly 5 character password", async () => {
    renderLoginForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "12345");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText("Password tối thiểu phải có 6 kí tự")
    ).toBeInTheDocument();
  });

  it("allows exactly 6 character password (boundary test)", async () => {
    renderLoginForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "123456");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Không có lỗi validation nếu đúng 6 ký tự
    expect(
      screen.queryByText("Password tối thiểu phải có 6 kí tự")
    ).not.toBeInTheDocument();
  });

  it("handles multiple validation errors at once", async () => {
    renderLoginForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "invalid");
    await user.type(screen.getByLabelText(/password/i), "123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
    expect(
      await screen.findByText("Password tối thiểu phải có 6 kí tự")
    ).toBeInTheDocument();
  });

  it("clears previous errors when typing valid input", async () => {
    renderLoginForm();
    const user = userEvent.setup();

    // Submit empty form
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(
      await screen.findByText("Email không được bỏ trống")
    ).toBeInTheDocument();

    // Type valid email
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    expect(
      screen.queryByText("Email không được bỏ trống")
    ).not.toBeInTheDocument();
  });
});
