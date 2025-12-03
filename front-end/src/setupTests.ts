import "@testing-library/jest-dom";
import { vi } from "vitest";
import { forwardRef, createElement } from "react";

vi.mock("lucide-react", () => {
  const Icon = forwardRef<HTMLSpanElement, { "data-testid"?: string }>(
    ({ "data-testid": testId = "icon", ...rest }, ref) =>
      createElement("span", { "data-testid": testId, ref, ...rest }),
  );

  const handler: ProxyHandler<Record<string, unknown>> = {
    get: (_target, prop) => {
      if (prop === "__esModule") {
        return true;
      }
      if (prop === "LucideIcon") {
        return Icon;
      }
      return Icon;
    },
    has: () => true,
    ownKeys: () => [],
    getOwnPropertyDescriptor: () => ({
      configurable: true,
      enumerable: true,
      writable: true,
      value: Icon,
    }),
  };

  return new Proxy({}, handler);
});

const mockLogout = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { data: { roleCode: "ADMIN" } },
    logout: mockLogout,
  }),
}));
