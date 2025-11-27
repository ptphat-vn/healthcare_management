import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MonitoringServicePage from "./MonitoringServicePage";

// Mock MonitoringList component
vi.mock(
  "@/components/features/admin/monitoringSevice/MonitoringList/MonitoringList",
  () => ({
    default: () => (
      <div data-testid="monitoring-list">MonitoringList Component</div>
    ),
  })
);

describe("MonitoringServicePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render component successfully", () => {
    render(<MonitoringServicePage />);

    expect(screen.getByText("Event Log Management")).toBeInTheDocument();
    expect(
      screen.getByText("Manage all event logs in your system.")
    ).toBeInTheDocument();
  });

  it("should display correct page title and description", () => {
    render(<MonitoringServicePage />);

    const title = screen.getByText("Event Log Management");
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe("H1");
    expect(title.className).toContain("text-3xl");
    expect(title.className).toContain("font-bold");

    const description = screen.getByText(
      "Manage all event logs in your system."
    );
    expect(description).toBeInTheDocument();
    expect(description.tagName).toBe("P");
    expect(description.className).toContain("text-sm");
  });

  it("should render MonitoringList component", () => {
    render(<MonitoringServicePage />);

    expect(screen.getByTestId("monitoring-list")).toBeInTheDocument();
    expect(screen.getByText("MonitoringList Component")).toBeInTheDocument();
  });

  it("should have correct page structure and styling", () => {
    const { container } = render(<MonitoringServicePage />);

    // Check main container
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv.className).toContain("p-4");
    expect(mainDiv.className).toContain("bg-white");
    expect(mainDiv.className).toContain("min-h-screen");
    expect(mainDiv.className).toContain("rounded-[20px]");

    // Check header section
    const headerSection = container.querySelector(".flex.flex-col.mb-5");
    expect(headerSection).toBeInTheDocument();
  });
});
