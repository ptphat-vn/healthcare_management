import "@testing-library/jest-dom"
import { vi } from "vitest"
import React from "react"

// Chỉ mock khi đang trong test environment
if (typeof vi !== 'undefined') {
  // Mock Input component chung để test không phải chạm code sản phẩm
  vi.mock('@/components/ui/input/Input', () => {
    const MockInput = React.forwardRef<HTMLInputElement, any>(
      ({ label, required, error, name, id, ...rest }, ref) => {
        const controlId =
          id ?? name ?? `mock-input-${(label ?? 'field').toLowerCase().replace(/\s+/g, '-')}`

        return React.createElement(
          'div',
          null,
          label &&
            React.createElement(
              'label',
              { htmlFor: controlId },
              label,
              required && '*'
            ),
          React.createElement('input', { id: controlId, name, ref, ...rest }),
          error && React.createElement('span', null, error)
        )
      }
    )
    MockInput.displayName = 'MockInput'
    return { default: MockInput }
  })
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
;(globalThis as any).IntersectionObserver = class IntersectionObserver {
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver