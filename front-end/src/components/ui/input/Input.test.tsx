import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom"; // cho matcher toBeInTheDocument
import Input from "./Input";
import { vi } from "vitest";
describe("Input component", () => {
  test("renders without crashing", () => {
    render(<Input />);
    const inputElement = screen.getByRole("textbox");
    expect(inputElement).toBeInTheDocument();
  });

  test("renders with placeholder", () => {
    render(<Input placeholder="Enter name" />);
    const inputElement = screen.getByPlaceholderText("Enter name");
    expect(inputElement).toBeInTheDocument();
  });

  test("renders label if provided", () => {
    render(<Input label="Full Name" />);
    const labelElement = screen.getByText("Full Name");
    expect(labelElement).toBeInTheDocument();
  });

  test("renders required asterisk if required", () => {
    render(<Input label="Email" required />);
    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass("text-red-500");
  });

  test("renders error message if error prop is set", () => {
    render(<Input error="Invalid input" />);
    const errorElement = screen.getByText("Invalid input");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass("text-red-500");
  });

  test("displays value correctly", () => {
    render(<Input value="Hello" />);
    const inputElement = screen.getByDisplayValue("Hello");
    expect(inputElement).toBeInTheDocument();
  });

  test("fires onChange event correctly", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const inputElement = screen.getByRole("textbox");

    await user.type(inputElement, "abc");

    expect(handleChange).toHaveBeenCalled();
    expect(inputElement).toHaveValue("abc");
  });
});
