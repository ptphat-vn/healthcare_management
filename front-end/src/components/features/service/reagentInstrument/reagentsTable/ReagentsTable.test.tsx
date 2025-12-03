import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReagentsTable from "./ReagentsTable";
import type {
  ReactNode,
  HTMLAttributes,
  TableHTMLAttributes,
} from "react";

const mockNavigate = vi.fn();
let latestDialogProps: Record<string, unknown> | null = null;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: { children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({
    children,
    ...props
  }: TableHTMLAttributes<HTMLTableElement>) => (
    <table {...props}>{children}</table>
  ),
  TableHeader: ({
    children,
    ...props
  }: HTMLAttributes<HTMLTableSectionElement>) => (
    <thead {...props}>{children}</thead>
  ),
  TableBody: ({
    children,
    ...props
  }: HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody {...props}>{children}</tbody>
  ),
  TableRow: ({
    children,
    ...props
  }: HTMLAttributes<HTMLTableRowElement>) => (
    <tr {...props}>{children}</tr>
  ),
  TableHead: ({
    children,
    ...props
  }: HTMLAttributes<HTMLTableCellElement>) => (
    <th {...props}>{children}</th>
  ),
  TableCell: ({
    children,
    ...props
  }: HTMLAttributes<HTMLTableCellElement>) => (
    <td {...props}>{children}</td>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
  }: {
    children: ReactNode;
    asChild?: boolean;
  }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => {
  const Icon = ({ "data-testid": testId }: { "data-testid"?: string }) => (
    <span data-testid={testId || "icon"} />
  );
  return {
    Eye: Icon,
    Trash2: Icon,
    MoreHorizontal: Icon,
  };
});

vi.mock(
  "@/components/features/service/reagentInstrument/deleteReagentDialog/DeleteReagentDialog",
  () => ({
    default: (props: Record<string, unknown>) => {
      latestDialogProps = props;
      return (
        <div data-testid="delete-dialog" data-open={String(props.open)}>
          <button type="button" onClick={props.onConfirm as () => void}>
            Xác nhận xóa
          </button>
        </div>
      );
    },
  }),
);

const reagentsMock = [
  {
    _id: "assign-1",
    reagentId: "r1",
    reagentName: "Reagent A",
    lotNumber: "LOT-001",
    quantity: 5,
    unitOfMeasure: "mL",
    expirationDate: "2025-02-15T00:00:00.000Z",
    assignedAt: "2024-10-01T00:00:00.000Z",
  },
  {
    _id: "assign-2",
    reagentId: "r2",
    reagentName: "Reagent B",
    lotNumber: "",
    quantity: 2,
    unitOfMeasure: "mL",
    expirationDate: "2025-05-20T00:00:00.000Z",
    assignedAt: "2024-11-10T00:00:00.000Z",
  },
];

const renderTable = (
  props?: Partial<Parameters<typeof ReagentsTable>[0]>,
) => {
  const allProps = {
    instrumentId: "instrument-1",
    reagents: reagentsMock,
    onDelete: vi.fn(),
    isDeleting: false,
    ...props,
  };
  render(<ReagentsTable {...allProps} />);
  return allProps;
};

describe("ReagentsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    latestDialogProps = null;
  });

  it("hiển thị thông báo danh sách trống khi không có thuốc thử", () => {
    renderTable({ reagents: [] });

    expect(
      screen.getByText("No reagents assigned to this instrument"),
    ).toBeInTheDocument();
  });

  it("render dữ liệu thuốc thử và định dạng ngày tháng", () => {
    renderTable();

    const rows = screen.getAllByRole("row").slice(1); // exclude header
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("Reagent A")).toBeInTheDocument();
    expect(within(rows[0]).getByText("LOT-001")).toBeInTheDocument();
    expect(within(rows[0]).getByText("15/02/2025")).toBeInTheDocument();
    expect(within(rows[1]).getByText("N/A")).toBeInTheDocument();
    expect(within(rows[1]).getByText("20/05/2025")).toBeInTheDocument();
  });

  it("điều hướng đến trang chi tiết khi bấm xem chi tiết", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(
      screen.getAllByRole("button", { name: /View Details/ })[0],
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/service/instruments/instrument-1/reagents/assign-1",
    );
  });

  it("mở dialog và gọi onDelete với thông tin đúng khi xác nhận", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderTable();

    await user.click(
      screen.getAllByRole("button", { name: /Delete/ })[0],
    );

    expect(latestDialogProps).not.toBeNull();
    expect(latestDialogProps?.open).toBe(true);
    expect(latestDialogProps?.reagentName).toBe("Reagent A");

    await user.click(screen.getByRole("button", { name: "Xác nhận xóa" }));

    expect(onDelete).toHaveBeenCalledWith("assign-1", "Reagent A");
  });

  it("khóa hành động xóa khi trạng thái đang xóa", () => {
    renderTable({ isDeleting: true });

    const removeButtons = screen.getAllByRole("button", { name: /Delete/ });
    removeButtons.forEach((btn) => expect(btn).toBeDisabled());
  });
});

