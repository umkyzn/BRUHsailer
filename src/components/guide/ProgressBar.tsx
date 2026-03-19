import { useMemo } from 'react';
import { useGuide } from '../../context/GuideContext';

interface ProgressBarProps {
  totalSteps: number;
}

export default function ProgressBar({ totalSteps }: ProgressBarProps) {
  const { state } = useGuide();

  const pct = useMemo(() => {
    if (totalSteps === 0) return 0;
    const completed = Object.values(state.progress).filter(Boolean).length;
    return Math.round((completed / totalSteps) * 100);
  }, [state.progress, totalSteps]);

  return (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${pct}%` }}>
        <span className="progress-text">{pct}%</span>
      </div>
    </div>
  );
}
