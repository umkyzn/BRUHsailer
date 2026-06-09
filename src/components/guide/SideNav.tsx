import { useState, useCallback, useMemo } from 'react';
import type { ChapterWithSections } from '../../types/guide';
import { useGuide } from '../../context/GuideContext';

interface SideNavProps {
  chapters: ChapterWithSections[];
  totalSteps: number;
}

function expandAndScroll(el: Element | null, delay = 0) {
  if (!el) return;
  const fn = () => el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (delay) setTimeout(fn, delay);
  else fn();
}

export default function SideNav({ chapters, totalSteps }: SideNavProps) {
  const { state } = useGuide();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  // Below 900px the rail becomes a slide-in drawer behind a floating toggle.
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pct = useMemo(() => {
    if (totalSteps === 0) return 0;
    const completed = Object.values(state.progress).filter(Boolean).length;
    return Math.round((completed / totalSteps) * 100);
  }, [state.progress, totalSteps]);

  // Per-chapter completed/total counts for the nav rows.
  const chapterCounts = useMemo(
    () =>
      chapters.map(({ sections }) => {
        let total = 0;
        let completed = 0;
        for (const { steps } of sections) {
          for (const { stepId } of steps) {
            total++;
            if (state.progress[stepId]) completed++;
          }
        }
        return { total, completed };
      }),
    [chapters, state.progress]
  );

  const toggleChapter = useCallback((idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const goToChapter = useCallback((chapterIndex: number) => {
    const chapterEl = document.querySelector(`[data-chapter="${chapterIndex}"]`);
    if (!chapterEl) return;
    chapterEl.querySelector('.chapter-content')?.classList.add('active');
    chapterEl.querySelector('.chapter-title')?.classList.add('active');
    expandAndScroll(chapterEl, 50);
  }, []);

  const goToSection = useCallback(
    (chapterIndex: number, sectionId: string) => {
      const chapterEl = document.querySelector(`[data-chapter="${chapterIndex}"]`);
      if (!chapterEl) return;
      chapterEl.querySelector('.chapter-content')?.classList.add('active');
      chapterEl.querySelector('.chapter-title')?.classList.add('active');

      const sectionEl = document.querySelector(`[data-section="${sectionId}"]`);
      if (!sectionEl) return;
      sectionEl.querySelector('.section-content')?.classList.add('active');
      sectionEl.querySelector('.section-header')?.classList.add('active');
      expandAndScroll(sectionEl, 100);
      closeDrawer();
    },
    [closeDrawer]
  );

  const goToNotes = useCallback(
    (chapterIndex: number) => {
      const chapterEl = document.querySelector(`[data-chapter="${chapterIndex}"]`);
      if (!chapterEl) return;
      chapterEl.querySelector('.chapter-content')?.classList.add('active');
      chapterEl.querySelector('.chapter-title')?.classList.add('active');
      expandAndScroll(chapterEl.querySelector('.chapter-notes'), 100);
      closeDrawer();
    },
    [closeDrawer]
  );

  return (
    <>
      <button
        className="side-nav-drawer-toggle"
        onClick={() => setDrawerOpen((o) => !o)}
        aria-expanded={drawerOpen}
        aria-label={drawerOpen ? 'Close contents' : 'Open contents'}
      >
        ☰ Contents
      </button>
      {drawerOpen && <div className="side-nav-backdrop" onClick={closeDrawer} />}

      <aside className={`side-nav${drawerOpen ? ' drawer-open' : ''}`}>
        <div className="side-nav-title">Contents</div>

        <div className="side-nav-scroll">
          {chapters.map(({ chapter, chapterIndex, sections }) => {
            const isExpanded = expanded.has(chapterIndex);
            const { total, completed } = chapterCounts[chapterIndex];
            const chapterDone = total > 0 && completed === total;
            return (
              <div key={chapterIndex} className="side-nav-chapter">
                <button
                  className={`side-nav-chapter-title${isExpanded ? ' expanded' : ''}`}
                  aria-expanded={isExpanded}
                  onClick={() => {
                    toggleChapter(chapterIndex);
                    goToChapter(chapterIndex);
                  }}
                >
                  <span className="side-nav-arrow" aria-hidden="true">
                    {isExpanded ? '▼' : '►'}
                  </span>
                  <span className="side-nav-chapter-text">{chapter.title}</span>
                  <span
                    className={`side-nav-count${chapterDone ? ' done' : ''}`}
                    title={`${completed} of ${total} steps completed`}
                  >
                    {chapterDone ? '✓' : `${completed}/${total}`}
                  </span>
                </button>
                {isExpanded && (
                  <div className="side-nav-sections">
                    {sections.map(({ section }, si) => {
                      const sectionId = `${chapterIndex + 1}.${si + 1}`;
                      return (
                        <button
                          key={si}
                          className="side-nav-section"
                          onClick={() => goToSection(chapterIndex, sectionId)}
                        >
                          {section.title}
                        </button>
                      );
                    })}
                    {chapter.footnotes && chapter.footnotes.length > 0 && (
                      <button
                        className="side-nav-section side-nav-notes"
                        onClick={() => goToNotes(chapterIndex)}
                      >
                        End of Chapter Notes
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="side-nav-footer">
          <div className="side-nav-bar-track">
            <div className="side-nav-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="side-nav-bar-label">{pct}% complete</span>
        </div>
      </aside>
    </>
  );
}
