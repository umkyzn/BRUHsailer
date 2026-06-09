import { memo, useCallback } from 'react';
import type { Step as StepType } from '../../types/guide';
import { useGuide } from '../../context/GuideContext';
import FormattedText from './FormattedText';
import StepMeta from './StepMeta';

// Memoized inner body — stable reference means text nodes (and DOM mutations
// like highlight spans / search highlight spans) survive parent re-renders
// triggered by progress/filter/search state changes.
const StepBody = memo(function StepBody({ step }: { step: StepType }) {
  return (
    <>
      <div className="step-description">
        <FormattedText content={step.content} />
        {step.nestedContent?.map((nested, i) => (
          <div key={i} className={`nested-content level-${nested.level}`}>
            <FormattedText content={nested.content} />
          </div>
        ))}
      </div>
      <StepMeta metadata={step.metadata} />
    </>
  );
});

interface StepProps {
  step: StepType;
  stepId: string;
  stepNumber: number;
}

function Step({ step, stepId, stepNumber }: StepProps) {
  const { state, dispatch, showToast } = useGuide();
  const isCompleted = state.progress[stepId] ?? false;
  const isMinimized = state.minimizeCompleted && isCompleted;

  const toggle = useCallback(() => {
    dispatch({ type: 'TOGGLE_STEP', stepId });
    showToast(
      isCompleted ? `Step ${stepNumber} marked incomplete` : `Step ${stepNumber} completed`,
      { undoable: true }
    );
  }, [dispatch, stepId, showToast, isCompleted, stepNumber]);

  const timeDisplay = step.metadata?.total_time ?? '';

  return (
    <div
      className={`step${isCompleted ? ' completed' : ''}`}
      id={`step-${stepId}`}
    >
      {/* Only the checkbox + label toggle completion — the rest of the header
          is inert so scroll/selection mis-clicks can't silently flip progress. */}
      <div className="step-header">
        <label className="checkbox-container" htmlFor={`check-${stepId}`}>
          <input
            type="checkbox"
            className="checkbox"
            id={`check-${stepId}`}
            checked={isCompleted}
            onChange={toggle}
          />
          <span className="step-number">Step {stepNumber}</span>
        </label>
        <span className="step-time">{timeDisplay ? `Time: ${timeDisplay}` : ''}</span>
      </div>
      {/* step-content wrapper lives here (outside memo) so minimize class updates reactively.
          StepBody is memoized so its text nodes are stable for DOM highlight mutations. */}
      <div className={`step-content${isMinimized ? ' hidden-by-completion' : ''}`}>
        <StepBody step={step} />
      </div>
    </div>
  );
}

export default memo(Step);
