import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SystemAlertsManagement from "./SystemAlertsManagement";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  AlertCircle: () => <span data-testid="alert-circle-icon" />,
  Clock: () => <span data-testid="clock-icon" />,
  TrendingUp: () => <span data-testid="trending-up-icon" />,
}));

describe("SystemAlertsManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render component successfully", () => {
    render(<SystemAlertsManagement />);

    expect(
      screen.getByText("System Alerts (no real data yet :))")
    ).toBeInTheDocument();
    expect(screen.getByText("View All")).toBeInTheDocument();
  });

  it("should display header with title and view all button", () => {
    render(<SystemAlertsManagement />);

    const header = screen.getByText("System Alerts (no real data yet :))");
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe("H3");

    const viewAllButton = screen.getByText("View All");
    expect(viewAllButton).toBeInTheDocument();
    expect(viewAllButton.tagName).toBe("BUTTON");
  });

  it("should display all alert cards with correct content", () => {
    render(<SystemAlertsManagement />);

    // Check first alert (Equipment Maintenance)
    expect(
      screen.getByText("Equipment XYZ-100 needs maintenance")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Has been running continuously for 720 hours")
    ).toBeInTheDocument();
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();

    // Check second alert (Chemical Supply)
    expect(
      screen.getByText("Reagent A chemical is running low")
    ).toBeInTheDocument();
    expect(screen.getByText("15% capacity remaining")).toBeInTheDocument();
    expect(screen.getByText("5 hours ago")).toBeInTheDocument();
  });

  it("should display icons correctly", () => {
    render(<SystemAlertsManagement />);

    // Check header icon
    const headerIcons = screen.getAllByTestId("alert-circle-icon");
    expect(headerIcons.length).toBeGreaterThanOrEqual(1);

    // Check clock icons in alerts
    const clockIcons = screen.getAllByTestId("clock-icon");
    expect(clockIcons.length).toBe(2); // One for each alert

    // Check trending up icon in button
    const trendingUpIcon = screen.getByTestId("trending-up-icon");
    expect(trendingUpIcon).toBeInTheDocument();
  });

  it("should have correct alert card structure and styling", () => {
    const { container } = render(<SystemAlertsManagement />);

    // Check that alert cards are in a grid
    const gridContainer = container.querySelector(
      ".grid.grid-cols-1.md\\:grid-cols-2"
    );
    expect(gridContainer).toBeInTheDocument();

    // Check for alert card containers with gradient backgrounds
    const alertCards = container.querySelectorAll(
      ".bg-gradient-to-r.from-yellow-50, .bg-gradient-to-r.from-amber-50"
    );
    // Should have at least 2 alert cards
    expect(alertCards.length).toBeGreaterThanOrEqual(2);

    // Check for border-left styling
    const borderedCards = container.querySelectorAll(".border-l-4");
    expect(borderedCards.length).toBe(2);
  });

  it("should display equipment maintenance alert with correct details", () => {
    render(<SystemAlertsManagement />);

    const equipmentAlert = screen.getByText(
      "Equipment XYZ-100 needs maintenance"
    );
    expect(equipmentAlert).toBeInTheDocument();
    expect(equipmentAlert.className).toContain("font-semibold");
    expect(equipmentAlert.className).toContain("text-yellow-900");

    const hoursText = screen.getByText(
      "Has been running continuously for 720 hours"
    );
    expect(hoursText).toBeInTheDocument();
    expect(hoursText.className).toContain("text-yellow-700");

    const timeText = screen.getByText("2 hours ago");
    expect(timeText).toBeInTheDocument();
  });

  it("should display chemical supply alert with correct details", () => {
    render(<SystemAlertsManagement />);

    const chemicalAlert = screen.getByText("Reagent A chemical is running low");
    expect(chemicalAlert).toBeInTheDocument();
    expect(chemicalAlert.className).toContain("font-semibold");
    expect(chemicalAlert.className).toContain("text-amber-900");

    const capacityText = screen.getByText("15% capacity remaining");
    expect(capacityText).toBeInTheDocument();
    expect(capacityText.className).toContain("text-amber-700");

    const timeText = screen.getByText("5 hours ago");
    expect(timeText).toBeInTheDocument();
  });

  it("should have interactive button with hover styles", () => {
    render(<SystemAlertsManagement />);

    const viewAllButton = screen.getByText("View All");
    expect(viewAllButton).toBeInTheDocument();
    expect(viewAllButton.className).toContain("hover:text-indigo-700");
    expect(viewAllButton.className).toContain("text-indigo-600");
  });

  it("should render all alert icons in correct positions", () => {
    const { container } = render(<SystemAlertsManagement />);

    // Check that alert icons are present in each alert card
    const alertIcons = container.querySelectorAll(
      '[data-testid="alert-circle-icon"]'
    );
    // Should have at least 3: 1 in header + 2 in alert cards
    expect(alertIcons.length).toBeGreaterThanOrEqual(3);

    // Check that clock icons are in the time sections
    const clockIcons = container.querySelectorAll('[data-testid="clock-icon"]');
    expect(clockIcons.length).toBe(2);
  });
});
