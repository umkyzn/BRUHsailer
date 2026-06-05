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
});

afterEach(() => {
  localStorage.clear();
  document.body.className = '';
});
