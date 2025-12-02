import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import LabManagerDashboard from "./LabManagerDashboard";

// Mock dayjs
vi.mock("dayjs", () => {
  const mockDayjs = vi.fn(() => ({
    format: vi.fn(),
    subtract: vi.fn(),
    isAfter: vi.fn(),
  }));
  const dayjsFn = mockDayjs as typeof mockDayjs & {
    extend: ReturnType<typeof vi.fn>;
    locale: ReturnType<typeof vi.fn>;
  };
  dayjsFn.extend = vi.fn();
  dayjsFn.locale = vi.fn();
  return {
    default: dayjsFn,
  };
});

// Mock dashboard components
vi.mock(
  "@/components/features/manager/dashboardMangement/TotalCardManagement/TotalCardManagement",
  () => ({
    default: () => (
      <div data-testid="total-card-management">TotalCardManagement</div>
    ),
  })
);

vi.mock(
  "@/components/features/manager/dashboardMangement/TrendChartManagement/TrendChartManagement",
  () => ({
    default: () => (
      <div data-testid="trend-chart-management">TrendChartManagement</div>
    ),
  })
);

vi.mock(
  "@/components/features/manager/dashboardMangement/StatusDistributionManagement/StatusDistributionManagement",
  () => ({
    default: () => (
      <div data-testid="status-distribution-management">
        StatusDistributionManagement
      </div>
    ),
  })
);

vi.mock(
  "@/components/features/manager/dashboardMangement/ActivitiesCardManagement/ActivitiesCardManagement",
  () => ({
    default: () => (
      <div data-testid="activities-card-management">
        ActivitiesCardManagement
      </div>
    ),
  })
);

vi.mock(
  "@/components/features/manager/dashboardMangement/StatusCardManagement/StatusCardManagement",
  () => ({
    default: () => (
      <div data-testid="status-card-management">StatusCardManagement</div>
    ),
  })
);

vi.mock(
  "@/components/features/manager/dashboardMangement/SystemAlertsManagement/SystemAlertsManagement",
  () => ({
    default: () => (
      <div data-testid="system-alerts-management">SystemAlertsManagement</div>
    ),
  })
);

// Mock baseApi
vi.mock("@/services/baseApi", () => ({
  useGetProfileQuery: vi.fn(),
}));

import { useGetProfileQuery } from "@/services/baseApi";

const mockUseGetProfileQuery = vi.mocked(useGetProfileQuery);

describe("LabManagerDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render component successfully", () => {
    mockUseGetProfileQuery.mockReturnValue({
      data: {
        data: {
          fullName: "John Doe",
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetProfileQuery>);

    render(<LabManagerDashboard />);

    expect(screen.getByText("Dashboard Lab_Manager")).toBeInTheDocument();
    // Check welcome message parts
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    // Check that welcome back text exists (using getAllByText since it might match multiple elements)
    const welcomeTexts = screen.getAllByText((_content, element) => {
      return element?.textContent?.includes("welcome back") || false;
    });
    expect(welcomeTexts.length).toBeGreaterThan(0);
  });

  it("should display correct dashboard title and welcome message", () => {
    mockUseGetProfileQuery.mockReturnValue({
      data: {
        data: {
          fullName: "Jane Smith",
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetProfileQuery>);

    render(<LabManagerDashboard />);

    const title = screen.getByText("Dashboard Lab_Manager");
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe("H1");
    expect(title.className).toContain("text-3xl");
    expect(title.className).toContain("font-bold");

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    // Check that welcome back text exists
    const welcomeTexts = screen.getAllByText((_content, element) => {
      return element?.textContent?.includes("welcome back") || false;
    });
    expect(welcomeTexts.length).toBeGreaterThan(0);
  });

  it("should render all dashboard components", () => {
    mockUseGetProfileQuery.mockReturnValue({
      data: {
        data: {
          fullName: "User",
        },
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetProfileQuery>);

    render(<LabManagerDashboard />);

    expect(screen.getByTestId("total-card-management")).toBeInTheDocument();
    expect(screen.getByTestId("trend-chart-management")).toBeInTheDocument();
    expect(
      screen.getByTestId("status-distribution-management")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("activities-card-management")
    ).toBeInTheDocument();
    expect(screen.getByTestId("status-card-management")).toBeInTheDocument();
    expect(screen.getByTestId("system-alerts-management")).toBeInTheDocument();
  });

  it("should display default user name when profile data is not available", () => {
    mockUseGetProfileQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useGetProfileQuery>);

    render(<LabManagerDashboard />);

    expect(screen.getByText("User")).toBeInTheDocument();
    // Check that welcome back text exists
    const welcomeTexts = screen.getAllByText((_content, element) => {
      return element?.textContent?.includes("welcome back") || false;
    });
    expect(welcomeTexts.length).toBeGreaterThan(0);
  });
});
