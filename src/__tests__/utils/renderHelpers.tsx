import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { GuideProvider } from '../../context/GuideContext';

interface RenderWithGuideOptions extends Omit<RenderOptions, 'wrapper'> {
  namespace?: string;
}

export function renderWithGuide(
  ui: ReactElement,
  { namespace = 'test', ...options }: RenderWithGuideOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <GuideProvider namespace={namespace}>{children}</GuideProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...options });
}
