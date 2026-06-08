import '@testing-library/jest-dom';
import { afterEach, beforeAll, vi } from 'vitest';

beforeAll(() => {
  // jsdom does not implement matchMedia
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
  });

  // jsdom does not implement scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = vi.fn();

  // jsdom does not implement innerText; the search uses it for matching, so
  // fall back to textContent (good enough for the visible-text comparison).
  if (!Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'innerText')) {
    Object.defineProperty(window.HTMLElement.prototype, 'innerText', {
      configurable: true,
      get(this: HTMLElement) {
        return this.textContent ?? '';
      },
    });
  }
});

afterEach(() => {
  localStorage.clear();
  document.body.className = '';
});
