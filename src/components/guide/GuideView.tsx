import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import type { GuideData, ChapterWithSections, HighlightEntry } from '../../types/guide';
import { useGuide } from '../../context/GuideContext';
import Chapter from './Chapter';
import FilterBar from './FilterBar';

function clearSearchHighlights(root: HTMLElement) {
  root.querySelectorAll('.search-highlight').forEach((span) => {
    const parent = span.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(span.textContent ?? ''), span);
      (parent as Element).normalize();
    }
  });
}

function highlightSearchTerm(element: HTMLElement, term: string): number {
  const lcTerm = term.toLowerCase();
  let count = 0;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node as Text;
    if (
      text.nodeValue?.toLowerCase().includes(lcTerm) &&
      !(text.parentElement?.classList.contains('search-highlight'))
    ) {
      nodes.push(text);
    }
  }

  for (const textNode of nodes) {
    const val = textNode.nodeValue ?? '';
    const lcVal = val.toLowerCase();
    const frag = document.createDocumentFragment();
    let last = 0;
    let idx: number;
    while ((idx = lcVal.indexOf(lcTerm, last)) !== -1) {
      count++;
      if (idx > last) frag.appendChild(document.createTextNode(val.slice(last, idx)));
      const mark = document.createElement('span');
      mark.className = 'search-highlight';
      mark.textContent = val.slice(idx, idx + lcTerm.length);
      frag.appendChild(mark);
      last = idx + lcTerm.length;
    }
    if (last < val.length) frag.appendChild(document.createTextNode(val.slice(last)));
    textNode.parentNode?.replaceChild(frag, textNode);
  }
  return count;
}

function applyFilter(
  root: HTMLElement,
  filter: string,
  progress: Record<string, boolean>,
  lastCompletedStepId: string | null
) {
  const steps = root.querySelectorAll<HTMLElement>('.step');

  steps.forEach((stepEl) => {
    const id = stepEl.id.replace('step-', '');
    const isCompleted = progress[id] ?? false;
    const isLast = lastCompletedStepId !== null && stepEl.id === `step-${lastCompletedStepId}`;

    let visible: boolean;
    if (filter === 'all') visible = true;
    else if (filter === 'completed') visible = isCompleted || isLast;
    else visible = !isCompleted || isLast; // incomplete

    stepEl.classList.toggle('hidden-by-filter', !visible);
  });

  root.querySelectorAll<HTMLElement>('.guide-section').forEach((section) => {
    const hasVisible = Array.from(section.querySelectorAll('.step')).some(
      (s) => !s.classList.contains('hidden-by-filter')
    );
    section.classList.toggle('hidden-by-filter', !hasVisible);
  });

  root.querySelectorAll<HTMLElement>('.guide-chapter').forEach((chapter) => {
    const hasVisible = Array.from(chapter.querySelectorAll('.guide-section')).some(
      (s) => !s.classList.contains('hidden-by-filter')
    );
    chapter.classList.toggle('hidden-by-filter', !hasVisible);
  });
}

function applyHighlightsToDOM(root: HTMLElement, highlights: HighlightEntry[]) {
  // Remove existing highlight spans first to avoid duplication
  root.querySelectorAll('.highlighted-text').forEach((span) => {
    const parent = span.parentNode;
    if (!parent) return;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
    (parent as Element).normalize();
  });

  for (const h of highlights) {
    const parentEl = document.getElementById(h.parentId);
    if (!parentEl) continue;

    const walker = document.createTreeWalker(parentEl, NodeFilter.SHOW_TEXT);
    let textNode: Node | null;
    while ((textNode = walker.nextNode())) {
      const text = textNode as Text;
      const idx = text.nodeValue?.indexOf(h.htmlContent) ?? -1;
      if (idx === -1) continue;
      if ((text.parentElement as HTMLElement)?.classList?.contains('highlighted-text')) continue;

      try {
        const range = document.createRange();
        range.setStart(text, idx);
        range.setEnd(text, idx + h.htmlContent.length);
        const span = document.createElement('span');
        span.className = `highlighted-text highlight-${h.color}`;
        range.surroundContents(span);
        break;
      } catch {
        // Selection crosses element boundaries — skip
      }
    }
  }
}

function collectHighlightsFromDOM(root: HTMLElement): HighlightEntry[] {
  const result: HighlightEntry[] = [];
  root.querySelectorAll('.highlighted-text').forEach((span) => {
    const parentStep = span.closest('.step') as HTMLElement | null;
    if (!parentStep?.id) return;
    const colorClass = Array.from(span.classList).find((c) => c.startsWith('highlight-'));
    const color = colorClass ? colorClass.replace('highlight-', '') : 'green';
    result.push({
      parentId: parentStep.id,
      htmlContent: span.textContent ?? '',
      color: color as HighlightEntry['color'],
    });
  });
  return result;
}

function mergeAdjacentHighlights(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node: Node | null = walker.currentNode;
  while (node) {
    const el = node as HTMLElement;
    if (el.classList?.contains('highlighted-text')) {
      let next = el.nextSibling;
      while (
        next?.nodeType === Node.ELEMENT_NODE &&
        (next as HTMLElement).classList?.contains('highlighted-text') &&
        (next as HTMLElement).className === el.className
      ) {
        el.textContent += (next as HTMLElement).textContent;
        const toRemove = next;
        next = next.nextSibling;
        toRemove.parentNode?.removeChild(toRemove);
      }
    }
    node = walker.nextNode();
  }
}

function useDebounce(fn: (term: string) => void, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (term: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(term), delay);
    },
    [fn, delay]
  );
}

export function findInitialOpenLocation(
  chapters: ChapterWithSections[],
  lastStepId: string | null
): { chapterIndex: number; sectionIndex: number } {
  if (!lastStepId) return { chapterIndex: 0, sectionIndex: 0 };
  for (const { chapterIndex, sections } of chapters) {
    for (let si = 0; si < sections.length; si++) {
      if (sections[si].steps.some(({ stepId }) => stepId === lastStepId)) {
        return { chapterIndex, sectionIndex: si };
      }
    }
  }
  return { chapterIndex: 0, sectionIndex: 0 };
}

interface GuideViewProps {
  guideData: GuideData;
  chapters: ChapterWithSections[];
  allStepIds: string[];
}

export default function GuideView({ guideData, chapters, allStepIds }: GuideViewProps) {
  const { state, dispatch, showToast } = useGuide();
  const contentRef = useRef<HTMLDivElement>(null);

  const lastCompletedStepId = useMemo(() => {
    for (let i = allStepIds.length - 1; i >= 0; i--) {
      if (state.progress[allStepIds[i]]) return allStepIds[i];
    }
    return null;
  }, [allStepIds, state.progress]);

  const [initialOpenLocation] = useState(() =>
    findInitialOpenLocation(chapters, lastCompletedStepId)
  );

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    applyFilter(root, state.filter, state.progress, lastCompletedStepId);
  }, [state.filter, state.progress, lastCompletedStepId]);

  const runSearch = useCallback(
    (term: string) => {
      const root = contentRef.current;
      if (!root) return;
      clearSearchHighlights(root);

      const steps = root.querySelectorAll<HTMLElement>('.step');

      if (!term) {
        steps.forEach((s) => s.classList.remove('hidden-by-search'));
        root.querySelectorAll('.guide-section, .guide-chapter').forEach((el) =>
          el.classList.remove('hidden-by-search')
        );
        return;
      }

      steps.forEach((stepEl) => {
        const matches = stepEl.innerText.toLowerCase().includes(term.toLowerCase());
        stepEl.classList.toggle('hidden-by-search', !matches);

        if (matches) {
          const desc = stepEl.querySelector<HTMLElement>('.step-description');
          const meta = stepEl.querySelector<HTMLElement>('.step-meta');
          if (desc) highlightSearchTerm(desc, term);
          if (meta) highlightSearchTerm(meta, term);
        }
      });

      root.querySelectorAll<HTMLElement>('.guide-section').forEach((section) => {
        const hasVisible = Array.from(section.querySelectorAll('.step')).some(
          (s) => !(s as HTMLElement).classList.contains('hidden-by-search')
        );
        section.classList.toggle('hidden-by-search', !hasVisible);
        if (hasVisible) {
          section.querySelector('.section-content')?.classList.add('active');
          section.querySelector('.section-header')?.classList.add('active');
        }
      });

      root.querySelectorAll<HTMLElement>('.guide-chapter').forEach((chapter) => {
        const hasVisible = Array.from(chapter.querySelectorAll('.guide-section')).some(
          (s) => !(s as HTMLElement).classList.contains('hidden-by-search')
        );
        chapter.classList.toggle('hidden-by-search', !hasVisible);
        if (hasVisible) {
          chapter.querySelector('.chapter-content')?.classList.add('active');
          chapter.querySelector('.chapter-title')?.classList.add('active');
        }
      });
    },
    []
  );

  const debouncedSearch = useDebounce(runSearch, 750);

  const handleSearchChange = useCallback(
    (term: string) => {
      dispatch({ type: 'SET_SEARCH', term });
      debouncedSearch(term);
    },
    [dispatch, debouncedSearch]
  );

  useEffect(() => {
    const root = contentRef.current;
    if (!root || state.highlights.length === 0) return;
    applyHighlightsToDOM(root, state.highlights);
  }, [state.highlights]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    function onMouseUp() {
      if (!state.highlightModeActive) return;

      const selection = window.getSelection();
      if (!selection?.rangeCount || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      if (!root!.contains(range.commonAncestorContainer)) return;

      let node: Node | null = range.startContainer;
      let stepContent: HTMLElement | null = null;
      while (node && node !== root) {
        if ((node as HTMLElement).classList?.contains('step-content')) {
          stepContent = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
      if (!stepContent) return;

      const color = state.highlightColor;
      const walker = document.createTreeWalker(stepContent, NodeFilter.SHOW_TEXT);
      const intersected: Text[] = [];
      let cur: Node | null;
      while ((cur = walker.nextNode())) {
        const t = cur as Text;
        const intersects =
          typeof range.intersectsNode === 'function'
            ? range.intersectsNode(t)
            : (() => {
                const nr = document.createRange();
                nr.selectNodeContents(t);
                return (
                  range.compareBoundaryPoints(Range.END_TO_START, nr) < 0 &&
                  range.compareBoundaryPoints(Range.START_TO_END, nr) > 0
                );
              })();
        if (intersects) intersected.push(t);
      }

      let didHighlight = false;
      for (const t of intersected) {
        const start = t === range.startContainer ? range.startOffset : 0;
        const end = t === range.endContainer ? range.endOffset : t.nodeValue!.length;
        if (start >= end) continue;

        const frag = document.createDocumentFragment();
        const before = t.nodeValue!.slice(0, start);
        const mid = t.nodeValue!.slice(start, end);
        const after = t.nodeValue!.slice(end);
        if (before) frag.appendChild(document.createTextNode(before));
        if (mid) {
          const span = document.createElement('span');
          span.className = `highlighted-text highlight-${color}`;
          span.textContent = mid;
          frag.appendChild(span);
        }
        if (after) frag.appendChild(document.createTextNode(after));
        t.parentNode?.replaceChild(frag, t);
        didHighlight = true;
      }

      selection.removeAllRanges();
      if (didHighlight) {
        mergeAdjacentHighlights(stepContent);
        const updated = collectHighlightsFromDOM(root!);
        dispatch({ type: 'SET_HIGHLIGHTS', highlights: updated });
      }
    }

    root.addEventListener('mouseup', onMouseUp);
    return () => root.removeEventListener('mouseup', onMouseUp);
  }, [state.highlightModeActive, state.highlightColor, dispatch]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    function onClick(e: MouseEvent) {
      if (!state.highlightModeActive) return;
      const target = e.target as HTMLElement;
      if (!target.classList.contains('highlighted-text')) return;

      const parent = target.parentNode;
      if (!parent) return;
      while (target.firstChild) parent.insertBefore(target.firstChild, target);
      parent.removeChild(target);
      (parent as Element).normalize();

      const updated = collectHighlightsFromDOM(root!);
      dispatch({ type: 'SET_HIGHLIGHTS', highlights: updated });
    }

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [state.highlightModeActive, dispatch]);

  const jumpToLast = useCallback(() => {
    if (!lastCompletedStepId) return;
    const stepEl = document.getElementById(`step-${lastCompletedStepId}`);
    if (!stepEl) return;

    // Expand chapter
    stepEl.closest('.chapter-content')?.classList.add('active');
    stepEl.closest('.guide-chapter')?.querySelector('.chapter-title')?.classList.add('active');
    // Expand section
    stepEl.closest('.section-content')?.classList.add('active');
    stepEl.closest('.guide-section')?.querySelector('.section-header')?.classList.add('active');

    setTimeout(() => stepEl.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [lastCompletedStepId]);

  const removeAllHighlights = useCallback(() => {
    if (!window.confirm('Remove all highlights?')) return;
    const root = contentRef.current;
    if (!root) return;

    root.querySelectorAll('.highlighted-text').forEach((span) => {
      const parent = span.parentNode;
      if (!parent) return;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
      (parent as Element).normalize();
    });

    dispatch({ type: 'SET_HIGHLIGHTS', highlights: [] });
    showToast('Highlights removed');
  }, [dispatch, showToast]);

  return (
    <>
      <FilterBar
        onJumpToLast={jumpToLast}
        onRemoveHighlights={removeAllHighlights}
        onSearchChange={handleSearchChange}
      />
      <div id="guideContent" ref={contentRef}>
        {chapters.map((chapterData) => (
          <Chapter
            key={chapterData.chapterIndex}
            chapterData={chapterData}
            initialOpenSectionIndex={
              chapterData.chapterIndex === initialOpenLocation.chapterIndex
                ? initialOpenLocation.sectionIndex
                : null
            }
          />
        ))}
      </div>
      <div id="lastUpdated" style={{ display: 'none' }}>{guideData.updatedOn}</div>
    </>
  );
}
