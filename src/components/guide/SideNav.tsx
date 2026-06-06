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

  const pct = useMemo(() => {
    if (totalSteps === 0) return 0;
    const completed = Object.values(state.progress).filter(Boolean).length;
    return Math.round((completed / totalSteps) * 100);
  }, [state.progress, totalSteps]);

  const toggleChapter = useCallback((idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const goToChapter = useCallback((chapterIndex: number) => {
    const chapterEl = document.querySelector(`[data-chapter="${chapterIndex}"]`);
    if (!chapterEl) return;
    chapterEl.querySelector('.chapter-content')?.classList.add('active');
    chapterEl.querySelector('.chapter-title')?.classList.add('active');
    expandAndScroll(chapterEl, 50);
  }, []);

  const goToSection = useCallback((chapterIndex: number, sectionId: string) => {
    const chapterEl = document.querySelector(`[data-chapter="${chapterIndex}"]`);
    if (!chapterEl) return;
    chapterEl.querySelector('.chapter-content')?.classList.add('active');
    chapterEl.querySelector('.chapter-title')?.classList.add('active');

    const sectionEl = document.querySelector(`[data-section="${sectionId}"]`);
    if (!sectionEl) return;
    sectionEl.querySelector('.section-content')?.classList.add('active');
    sectionEl.querySelector('.section-header')?.classList.add('active');
    expandAndScroll(sectionEl, 100);
  }, []);

  const goToNotes = useCallback((chapterIndex: number) => {
    const chapterEl = document.querySelector(`[data-chapter="${chapterIndex}"]`);
    if (!chapterEl) return;
    chapterEl.querySelector('.chapter-content')?.classList.add('active');
    chapterEl.querySelector('.chapter-title')?.classList.add('active');
    expandAndScroll(chapterEl.querySelector('.chapter-notes'), 100);
  }, []);

  return (
    <aside className="side-nav">
      <div className="side-nav-title">Contents</div>

      <div className="side-nav-scroll">
        {chapters.map(({ chapter, chapterIndex, sections }) => {
          const isExpanded = expanded.has(chapterIndex);
          return (
            <div key={chapterIndex} className="side-nav-chapter">
              <div
                className={`side-nav-chapter-title${isExpanded ? ' expanded' : ''}`}
                onClick={() => {
                  toggleChapter(chapterIndex);
                  goToChapter(chapterIndex);
                }}
              >
                <span className="side-nav-arrow">{isExpanded ? '▼' : '►'}</span>
                <span>{chapter.title}</span>
              </div>
              {isExpanded && (
                <div className="side-nav-sections">
                  {sections.map(({ section }, si) => {
                    const sectionId = `${chapterIndex + 1}.${si + 1}`;
                    return (
                      <div
                        key={si}
                        className="side-nav-section"
                        onClick={() => goToSection(chapterIndex, sectionId)}
                      >
                        {section.title}
                      </div>
                    );
                  })}
                  {chapter.footnotes && chapter.footnotes.length > 0 && (
                    <div
                      className="side-nav-section side-nav-notes"
                      onClick={() => goToNotes(chapterIndex)}
                    >
                      End of Chapter Notes
                    </div>
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
  );
}
