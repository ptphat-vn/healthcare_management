import "@testing-library/jest-dom/vitest";
import type { ComponentProps, ReactNode } from "react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddReagentDialog from "./AddReagentDialog";

const {
  mockUseGetAllReagentsQuery,
  mockUseGetReagentInventoryFIFOQuery,
  mockUseAddReagentToInstrumentMutation,
  mockUseAuth,
  mockGetRoleButtonClass,
  mockToast,
} = vi.hoisted(() => ({
  mockUseGetAllReagentsQuery: vi.fn(),
  mockUseGetReagentInventoryFIFOQuery: vi.fn(),
  mockUseAddReagentToInstrumentMutation: vi.fn(),
  mockUseAuth: vi.fn(),
  mockGetRoleButtonClass: vi.fn(),
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/services/reagentApi", () => ({
  useGetAllReagentsQuery: (...args: unknown[]) =>
    mockUseGetAllReagentsQuery(...args),
  useGetReagentInventoryFIFOQuery: (...args: unknown[]) =>
    mockUseGetReagentInventoryFIFOQuery(...args),
}));

vi.mock("@/services/instrumentApi", () => ({
  useAddReagentToInstrumentMutation: () =>
    mockUseAddReagentToInstrumentMutation(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/utils/getRoleButtonClass", () => ({
  getRoleButtonClass: (role: string | undefined) =>
    mockGetRoleButtonClass(role),
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

vi.mock("lucide-react", () => {
  const Icon = ({ "data-testid": testId }: { "data-testid"?: string }) => (
    <span data-testid={testId || "icon"} />
  );
  return {
    Plus: Icon,
    Loader2: Icon,
    AlertCircle: Icon,
  };
});

vi.mock("@/components/ui/dialog", () => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Dialog: Wrapper,
    DialogTrigger: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    DialogContent: Wrapper,
    DialogDescription: ({ children }: { children: ReactNode }) => (
      <p>{children}</p>
    ),
    DialogFooter: Wrapper,
    DialogHeader: Wrapper,
    DialogTitle: ({ children }: { children: ReactNode }) => (
      <h2>{children}</h2>
    ),
  };
});

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    className,
    ...props
  }: ComponentProps<"button"> & { className?: string }) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: React.forwardRef<HTMLInputElement, ComponentProps<"input">>(
    ({ min, max, step, required, ...rest }, ref) => (
      <input ref={ref} {...rest} />
    ),
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: ComponentProps<"label">) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock("@/components/ui/select", () => {
  const SelectTrigger = ({
    children,
    id,
  }: {
    children: ReactNode;
    id?: string;
  }) => (
    <div data-select-trigger id={id}>
      {children}
    </div>
  );
  SelectTrigger.displayName = "SelectTrigger";

  const SelectValue = ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  );
  SelectValue.displayName = "SelectValue";

  const SelectContent = ({ children }: { children: ReactNode }) => (
    <>{children}</>
  );
  SelectContent.displayName = "SelectContent";

  const SelectItem = ({
    value,
    disabled,
    children,
    className,
  }: {
    value: string;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
  }) => {
    const label =
      typeof children === "string"
        ? children
        : value;
    return (
      <option value={value} disabled={disabled} className={className}>
        {label}
      </option>
    );
  };
  SelectItem.displayName = "SelectItem";

  const isElementWithDisplayName = (
    child: ReactNode,
    name: string,
  ): child is React.ReactElement => {
    return (
      React.isValidElement(child) &&
      (child.type as { displayName?: string }).displayName === name
    );
  };

  const Select = ({
    children,
    value = "",
    onValueChange,
    disabled,
    required,
  }: {
    children: ReactNode;
    value?: string;
    onValueChange: (val: string) => void;
    disabled?: boolean;
    required?: boolean;
  }) => {
    const nodes = React.Children.toArray(children);
    const trigger = nodes.find(
      (child): child is React.ReactElement<{ id?: string }> =>
        isElementWithDisplayName(child, "SelectTrigger"),
    );
    const content = nodes.find(
      (
        child,
      ): child is React.ReactElement<{ children?: ReactNode }> =>
        isElementWithDisplayName(child, "SelectContent"),
    );

    const selectId = trigger?.props?.id;
    const options = content?.props?.children
      ? React.Children.toArray(content.props.children)
      : [];

    return (
      <div>
        {trigger}
        <select
          id={selectId}
          data-testid={
            selectId ? `${selectId}-select` : "shadcn-select"
          }
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          disabled={disabled}
          required={required}
        >
          {options}
        </select>
      </div>
    );
  };

  return {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  };
});

const defaultInventory = [
  {
    lotNumber: "LOT-001",
    quantityAvailable: 10,
    unitOfMeasure: "mL",
    expirationDate: "2025-12-31T00:00:00.000Z",
    isExpiringSoon: false,
  },
  {
    lotNumber: "LOT-002",
    quantityAvailable: 5,
    unitOfMeasure: "mL",
    expirationDate: "2025-06-30T00:00:00.000Z",
    isExpiringSoon: true,
  },
];

const renderDialog = (
  props?: Partial<ComponentProps<typeof AddReagentDialog>>,
) => {
  const onSuccess = props?.onSuccess ?? vi.fn();
  const renderProps = {
    instrumentId: "instrument-1",
    onSuccess,
    ...props,
  } as ComponentProps<typeof AddReagentDialog>;
  const result = render(<AddReagentDialog {...renderProps} />);
  return { onSuccess, ...result };
};

describe("AddReagentDialog", () => {
  let mutationTrigger: ReturnType<typeof vi.fn>;
  let unwrapSpy: ReturnType<typeof vi.fn>;
  let refetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    refetchSpy = vi.fn();
    unwrapSpy = vi.fn().mockResolvedValue({});
    mutationTrigger = vi
      .fn()
      .mockReturnValue({ unwrap: unwrapSpy });
    mockUseAddReagentToInstrumentMutation.mockReturnValue([
      mutationTrigger,
      { isLoading: false },
    ]);
    mockUseAuth.mockReturnValue({
      user: { data: { roleCode: "ROLE_LAB" } },
    });
    mockGetRoleButtonClass.mockReturnValue("lab-btn");
    mockUseGetAllReagentsQuery.mockReturnValue({
      data: {
        data: {
          reagents: [
            { _id: "r1", name: "Reagent Alpha" },
            { _id: "r2", name: "Reagent Beta" },
          ],
        },
      },
      isLoading: false,
    });
    mockUseGetReagentInventoryFIFOQuery.mockReturnValue({
      data: { data: { inventory: defaultInventory } },
      isLoading: false,
      refetch: refetchSpy,
    });
  });

  it(
    "hiển thị nút mở mặc định với style theo vai trò và danh sách thuốc thử",
    () => {
    renderDialog();

    const buttons = screen.getAllByRole("button", {
      name: /Add Reagent/i,
    });
    expect(buttons[0]).toHaveClass("lab-btn");

    const select = screen.getByTestId("reagent-select");
    expect(
      within(select).getByRole("option", { name: "Reagent Alpha" }),
    ).toBeInTheDocument();
    expect(
      within(select).getByRole("option", { name: "Reagent Beta" }),
    ).toBeInTheDocument();
  });

  it("hiển thị tóm tắt tồn kho sau khi chọn thuốc thử", async () => {
    const user = userEvent.setup();
    renderDialog({ trigger: <button>Open</button> });

    await user.selectOptions(
      screen.getByTestId("reagent-select"),
      "r1",
    );

    await waitFor(() =>
      expect(
        screen.getByText(/available across 2 lots/i),
      ).toBeInTheDocument(),
    );
  });

  it("gửi dữ liệu và xử lý luồng thành công", async () => {
    const user = userEvent.setup();
    const { onSuccess } = renderDialog({
      trigger: <button>Open dialog</button>,
    });

    await user.selectOptions(
      screen.getByTestId("reagent-select"),
      "r1",
    );
    await user.selectOptions(
      screen.getByTestId("lotNumber-select"),
      "LOT-001",
    );
    await user.type(
      screen.getByLabelText(/Quantity/i),
      "3",
    );
    await user.type(
      screen.getByLabelText(/Notes/i),
      "Routine run",
    );

    await user.click(
      screen.getByRole("button", { name: /^Add Reagent$/i }),
    );

    await waitFor(() =>
      expect(mutationTrigger).toHaveBeenCalledWith({
        instrumentId: "instrument-1",
        reagentData: {
          reagentId: "r1",
          lotNumber: "LOT-001",
          quantity: 3,
          notes: "Routine run",
        },
      }),
    );
    expect(unwrapSpy).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith(
      "Reagent assigned to instrument successfully",
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it("hiển thị toast báo lỗi khi số lượng không hợp lệ", async () => {
    const user = userEvent.setup();
    renderDialog({ trigger: <button>Open dialog</button> });

    await user.selectOptions(
      screen.getByTestId("reagent-select"),
      "r1",
    );
    await user.type(
      screen.getByLabelText(/Quantity/i),
      "-1",
    );

    await user.click(
      screen.getByRole("button", { name: /^Add Reagent$/i }),
    );

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith(
        "Quantity must be greater than 0",
      ),
    );
    expect(mutationTrigger).not.toHaveBeenCalled();
  });

  it("hiển thị lỗi tồn kho khi mutation thất bại", async () => {
    const user = userEvent.setup();
    const rejection = { data: { message: "category mismatch" } };
    unwrapSpy = vi.fn().mockRejectedValue(rejection);
    mutationTrigger = vi.fn().mockReturnValue({ unwrap: unwrapSpy });
    mockUseAddReagentToInstrumentMutation.mockReturnValue([
      mutationTrigger,
      { isLoading: false },
    ]);

    renderDialog({ trigger: <button>Open dialog</button> });

    await user.selectOptions(
      screen.getByTestId("reagent-select"),
      "r1",
    );
    await user.type(
      screen.getByLabelText(/Quantity/i),
      "2",
    );

    await user.click(
      screen.getByRole("button", { name: /^Add Reagent$/i }),
    );

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith(
        "category mismatch",
      ),
    );
    expect(
      screen.getByText(/category mismatch/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /must have at least one matching category/i,
      ),
    ).toBeInTheDocument();
  });
});


