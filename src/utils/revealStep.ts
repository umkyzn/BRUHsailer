// Expand the chapter + section containing a step, then scroll to it.
// Chapter/Section open state lives in DOM classes (matching how the side nav
// and Jump-to-Last already drive expansion from outside the component tree).
export function revealStep(stepId: string, options: { pulse?: boolean } = {}) {
  const stepEl = document.getElementById(`step-${stepId}`);
  if (!stepEl) return;

  stepEl.closest('.chapter-content')?.classList.add('active');
  stepEl.closest('.guide-chapter')?.querySelector('.chapter-title')?.classList.add('active');
  stepEl.closest('.section-content')?.classList.add('active');
  stepEl.closest('.guide-section')?.querySelector('.section-header')?.classList.add('active');

  setTimeout(() => {
    stepEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (options.pulse) {
      stepEl.classList.add('highlight');
      setTimeout(() => stepEl.classList.remove('highlight'), 2100);
    }
  }, 100);
}
