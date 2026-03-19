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
    showToast('Progress saved');
  }, [dispatch, stepId, showToast]);

  const handleHeaderClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      toggle();
    },
    [toggle]
  );

  const timeDisplay = step.metadata?.total_time ?? '';

  return (
    <div
      className={`step${isCompleted ? ' completed' : ''}`}
      id={`step-${stepId}`}
    >
      <div className="step-header" onClick={handleHeaderClick}>
        <div className="checkbox-container">
          <input
            type="checkbox"
            className="checkbox"
            id={`check-${stepId}`}
            checked={isCompleted}
            onChange={toggle}
          />
          <span className="step-number">Step {stepNumber}</span>
        </div>
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
