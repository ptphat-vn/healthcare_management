import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteReagentDialog from "./DeleteReagentDialog";
import type { ReactNode } from "react";

vi.mock("@/components/ui/alert-dialog", () => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );

  const Button = ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );

  return {
    AlertDialog: ({
      children,
      open,
    }: {
      children: ReactNode;
      open: boolean;
    }) => <div data-testid="alert-dialog" data-open={open}>{children}</div>,
    AlertDialogContent: Wrapper,
    AlertDialogDescription: Wrapper,
    AlertDialogFooter: Wrapper,
    AlertDialogHeader: Wrapper,
    AlertDialogTitle: ({ children }: { children: ReactNode }) => (
      <h2>{children}</h2>
    ),
    AlertDialogCancel: Button,
    AlertDialogAction: Button,
  };
});

vi.mock("lucide-react", () => {
  const Icon = ({ "data-testid": testId }: { "data-testid"?: string }) => (
    <span data-testid={testId || "icon"} />
  );

  return {
    Loader2: Icon,
    AlertTriangle: Icon,
  };
});

const renderDialog = (props?: Partial<Parameters<typeof DeleteReagentDialog>[0]>) => {
  const allProps = {
    open: true,
    onOpenChange: vi.fn(),
    reagentName: "Reagent X",
    onConfirm: vi.fn(),
    isDeleting: false,
    ...props,
  };
  render(<DeleteReagentDialog {...allProps} />);
  return allProps;
};

describe("DeleteReagentDialog", () => {
  it("hiển thị cảnh báo với tên thuốc thử được truyền vào", () => {
    renderDialog({ reagentName: "Reagent Alpha" });

    expect(
      screen.getByText("Remove Reagent from Instrument"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/"Reagent Alpha"/),
    ).toBeInTheDocument();
    expect(screen.getByTestId("alert-dialog")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  it("gọi callback xác nhận khi người dùng đồng ý xóa", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(
      screen.getByRole("button", { name: "Remove Reagent" }),
    );

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("khóa nút và hiển thị trạng thái loading khi đang xóa", async () => {
    renderDialog({ isDeleting: true });

    expect(
      screen.getByRole("button", { name: /Removing.../ }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Cancel" }),
    ).toBeDisabled();
  });
});

