import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GuideView from '../../components/guide/GuideView';
import { mockGuideData, buildChapters } from '../fixtures/guideData';
import { renderWithGuide } from '../utils/renderHelpers';

const { chapters, allStepIds } = buildChapters();

function renderGuideView(namespace = 'test') {
  return renderWithGuide(
    <GuideView guideData={mockGuideData} chapters={chapters} allStepIds={allStepIds} />,
    { namespace }
  );
}

describe('GuideView filter integration', () => {
  it('"All Steps" filter: all step elements exist in the DOM', () => {
    renderGuideView();
    const steps = document.querySelectorAll('.step');
    expect(steps.length).toBe(8); // 2 chapters × 2 sections × 2 steps
  });

  it('"Completed" filter: incomplete steps get hidden-by-filter class', async () => {
    const user = userEvent.setup();
    // Pre-complete step 1-1
    localStorage.setItem('guideProgress:test', JSON.stringify({ '1-1': true }));
    renderGuideView();

    await user.click(screen.getByText('Completed'));

    await waitFor(() => {
      const step11 = document.getElementById('step-1-1');
      const step12 = document.getElementById('step-1-2');
      expect(step11).not.toHaveClass('hidden-by-filter');
      expect(step12).toHaveClass('hidden-by-filter');
    });
  });

  it('"Incomplete" filter: completed steps get hidden-by-filter class', async () => {
    const user = userEvent.setup();
    // Complete both 1-1 and 1-2 so that 1-1 is NOT the last completed step
    // (last = 1-2, which stays visible; 1-1 should be hidden by the incomplete filter)
    localStorage.setItem('guideProgress:test', JSON.stringify({ '1-1': true, '1-2': true }));
    renderGuideView();

    await user.click(screen.getByText('Incomplete'));

    await waitFor(() => {
      const step11 = document.getElementById('step-1-1');
      const step12 = document.getElementById('step-1-2'); // last completed — stays visible
      const step13 = document.getElementById('step-1-3'); // incomplete — stays visible
      expect(step11).toHaveClass('hidden-by-filter');
      expect(step12).not.toHaveClass('hidden-by-filter');
      expect(step13).not.toHaveClass('hidden-by-filter');
    });
  });

  it('switching back to "All" removes hidden-by-filter from all steps', async () => {
    const user = userEvent.setup();
    localStorage.setItem('guideProgress:test', JSON.stringify({ '1-1': true }));
    renderGuideView();

    await user.click(screen.getByText('Completed'));
    await user.click(screen.getByText('All'));

    await waitFor(() => {
      document.querySelectorAll('.step').forEach((step) => {
        expect(step).not.toHaveClass('hidden-by-filter');
      });
    });
  });

  it('"Minimize Completed" hides step content for completed steps', async () => {
    const user = userEvent.setup();
    localStorage.setItem('guideProgress:test', JSON.stringify({ '1-1': true }));
    renderGuideView();

    const minimizeBtn = screen.getByText('Minimize Completed');
    await user.click(minimizeBtn);

    await waitFor(() => {
      const step11Content = document.querySelector('#step-1-1 .step-content');
      expect(step11Content).toHaveClass('hidden-by-completion');
    });
  });

  it('"Incomplete" filter: last completed step is kept visible', async () => {
    const user = userEvent.setup();
    // Only step 1-2 completed (last completed = 1-2)
    localStorage.setItem('guideProgress:test', JSON.stringify({ '1-2': true }));
    renderGuideView();

    await user.click(screen.getByText('Incomplete'));

    await waitFor(() => {
      // Last completed step is always kept visible in incomplete filter
      const step12 = document.getElementById('step-1-2');
      expect(step12).not.toHaveClass('hidden-by-filter');
    });
  });
});
