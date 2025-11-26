import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import InventoryPage from "./InventoryPage";

vi.mock(
  "@/components/features/service/inventoryManagement/ReagentInventory",
  () => ({
    __esModule: true,
    default: () => <div data-testid="reagent-inventory">Reagent</div>,
  })
);

vi.mock(
  "@/components/features/service/inventoryManagement/UsageReagentHistory",
  () => ({
    __esModule: true,
    default: () => (
      <div data-testid="usage-history">Usage Reagent History Content</div>
    ),
  })
);

vi.mock(
  "@/components/features/service/inventoryManagement/VendorSupplyHistory",
  () => ({
    __esModule: true,
    default: () => (
      <div data-testid="vendor-history">Vendor Supply History Content</div>
    ),
  })
);

describe("InventoryPage", () => {
  test("renders default tab content", () => {
    render(<InventoryPage />);

    expect(
      screen.getByRole("heading", { name: /Inventory Management/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Manage reagent inventory/i)).toBeInTheDocument();

    expect(screen.getByTestId("reagent-inventory")).toBeInTheDocument();
    expect(screen.queryByTestId("usage-history")).not.toBeInTheDocument();
    expect(screen.queryByTestId("vendor-history")).not.toBeInTheDocument();
  });

  test("switches to vendor supply tab", async () => {
    const user = userEvent.setup();
    render(<InventoryPage />);

    await user.click(screen.getByRole("tab", { name: /Vendor Supply/i }));

    expect(screen.getByTestId("vendor-history")).toBeInTheDocument();
    expect(screen.queryByTestId("reagent-inventory")).not.toBeInTheDocument();
  });

  test("switches to usage history tab", async () => {
    const user = userEvent.setup();
    render(<InventoryPage />);

    await user.click(screen.getByRole("tab", { name: /Usage History/i }));

    expect(screen.getByTestId("usage-history")).toBeInTheDocument();
    expect(screen.queryByTestId("reagent-inventory")).not.toBeInTheDocument();
  });

  test("returns to inventory tab after visiting others", async () => {
    const user = userEvent.setup();
    render(<InventoryPage />);

    await user.click(screen.getByRole("tab", { name: /Vendor Supply/i }));
    expect(screen.getByTestId("vendor-history")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Reagent Inventory/i }));
    expect(screen.getByTestId("reagent-inventory")).toBeInTheDocument();
    expect(screen.queryByTestId("vendor-history")).not.toBeInTheDocument();
  });

  test("handles invalid initial tab without crashing", () => {
    render(<InventoryPage initialTab="invalid" />);

    expect(screen.queryByTestId("reagent-inventory")).not.toBeInTheDocument();
    expect(screen.queryByTestId("usage-history")).not.toBeInTheDocument();
    expect(screen.queryByTestId("vendor-history")).not.toBeInTheDocument();
  });
});
