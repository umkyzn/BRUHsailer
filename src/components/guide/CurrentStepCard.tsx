import { useMemo, useState, useCallback } from 'react';
import type { ChapterWithSections } from '../../types/guide';
import { useGuide } from '../../context/GuideContext';
import { revealStep } from '../../utils/revealStep';

interface CurrentStepCardProps {
  chapters: ChapterWithSections[];
  allStepIds: string[];
}

// Pinned "where do I pick up?" card: always shows the next unchecked step with
// its own checkbox, so checking off progress mid-game is one click instead of
// scroll → find → check → scroll back.
export default function CurrentStepCard({ chapters, allStepIds }: CurrentStepCardProps) {
  const { state, dispatch, showToast } = useGuide();
  const [collapsed, setCollapsed] = useState(false);

  const next = useMemo(() => {
    const nextId = allStepIds.find((id) => !state.progress[id]);
    if (!nextId) return null;
    for (const { chapter, sections } of chapters) {
      for (const { steps } of sections) {
        for (const { step, stepId } of steps) {
          if (stepId !== nextId) continue;
          const text = step.content.map((c) => c.text).join('').trim();
          return {
            stepId: nextId,
            stepNumber: parseInt(nextId.split('-')[1], 10),
            chapterTitle: chapter.title,
            text: text.length > 90 ? `${text.slice(0, 90)}…` : text,
          };
        }
      }
    }
    return null;
  }, [allStepIds, chapters, state.progress]);

  const completeNext = useCallback(() => {
    if (!next) return;
    dispatch({ type: 'TOGGLE_STEP', stepId: next.stepId });
    showToast(`Step ${next.stepNumber} completed`, { undoable: true });
  }, [next, dispatch, showToast]);

  if (!next) return null;

  if (collapsed) {
    return (
      <button
        className="current-step-pin"
        onClick={() => setCollapsed(false)}
        title="Show next step"
        aria-label="Show next step"
      >
        📍
      </button>
    );
  }

  const jumpToStep = () => revealStep(next.stepId, { pulse: true });

  // The whole card jumps to the step; the checkbox and collapse button stop
  // propagation so completing/minimizing doesn't also scroll the page.
  return (
    <div className="current-step-card" onClick={jumpToStep} title="Jump to this step">
      <div className="current-step-header">
        <span className="current-step-label">Next step</span>
        <button
          className="current-step-collapse"
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed(true);
          }}
          title="Minimize"
          aria-label="Minimize next-step card"
        >
          ✕
        </button>
      </div>
      <div className="current-step-body">
        <label className="current-step-check" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            className="checkbox"
            checked={false}
            onChange={completeNext}
            aria-label={`Mark step ${next.stepNumber} complete`}
          />
          <span className="current-step-number">Step {next.stepNumber}</span>
        </label>
        {/* Keyboard-focusable jump target; stops propagation so the card's
            own click handler doesn't fire the jump a second time. */}
        <button
          className="current-step-text"
          onClick={(e) => {
            e.stopPropagation();
            jumpToStep();
          }}
        >
          {next.text}
        </button>
        <div className="current-step-chapter">{next.chapterTitle}</div>
      </div>
    </div>
  );
}
