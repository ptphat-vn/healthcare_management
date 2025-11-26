import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaginationUI from "./PaginationUI";
import { vi } from "vitest";

describe("PaginationUI Component", () => {
  test("renders nothing when totalPages < 1", () => {
    const { container } = render(
      <PaginationUI currentPage={1} totalPages={0} onPageChange={() => {}} />
    );

    expect(container.firstChild).toBeNull();
  });

  test("renders pages correctly when totalPages <= 5", () => {
    render(
      <PaginationUI currentPage={1} totalPages={5} onPageChange={() => {}} />
    );

    // Pages: 1 2 3 4 5
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(i)).toBeInTheDocument();
    }

    // No ellipsis
    expect(screen.queryByText("...")).not.toBeInTheDocument();
  });

  test("renders correct pages with ellipsis (beginning)", () => {
    render(
      <PaginationUI currentPage={1} totalPages={10} onPageChange={() => {}} />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  test("renders correct pages with ellipsis (end)", () => {
    render(
      <PaginationUI currentPage={10} totalPages={10} onPageChange={() => {}} />
    );

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  test("calls onPageChange when clicking page number", async () => {
    const user = userEvent.setup();
    const mockFn = vi.fn();

    render(
      <PaginationUI currentPage={1} totalPages={5} onPageChange={mockFn} />
    );

    await user.click(screen.getByText("3"));

    expect(mockFn).toHaveBeenCalledWith(3);
  });

  test("Previous button disabled on first page", async () => {
    const user = userEvent.setup();
    const mockFn = vi.fn();

    render(
      <PaginationUI currentPage={1} totalPages={5} onPageChange={mockFn} />
    );

    const prevButton = screen.getByRole("button", { name: /previous/i });

    // Expect disabled style: pointer-events-none opacity-50
    expect(prevButton).toHaveClass("opacity-50");

    await user.click(prevButton);

    expect(mockFn).not.toHaveBeenCalled();
  });

  test("Next button disabled on last page", async () => {
    const user = userEvent.setup();
    const mockFn = vi.fn();

    render(
      <PaginationUI currentPage={5} totalPages={5} onPageChange={mockFn} />
    );

    const nextButton = screen.getByRole("button", { name: /next/i });

    expect(nextButton).toHaveClass("opacity-50");

    await user.click(nextButton);

    expect(mockFn).not.toHaveBeenCalled();
  });

  test("clicking next moves to next page", async () => {
    const user = userEvent.setup();
    const mockFn = vi.fn();

    render(
      <PaginationUI currentPage={2} totalPages={5} onPageChange={mockFn} />
    );

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(mockFn).toHaveBeenCalledWith(3);
  });

  test("clicking previous moves to previous page", async () => {
    const user = userEvent.setup();
    const mockFn = vi.fn();

    render(
      <PaginationUI currentPage={3} totalPages={5} onPageChange={mockFn} />
    );

    await user.click(screen.getByRole("button", { name: /previous/i }));

    expect(mockFn).toHaveBeenCalledWith(2);
  });

  test("active page is highlighted", () => {
    render(
      <PaginationUI currentPage={2} totalPages={5} onPageChange={() => {}} />
    );

    const activePage = screen.getByText("2");

    expect(activePage).toHaveAttribute("aria-current", "page");
  });
});
