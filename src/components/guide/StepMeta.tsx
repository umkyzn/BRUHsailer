import { memo } from 'react';
import type { StepMetadata } from '../../types/guide';

const SKIP_KEYS = new Set(['total_time', 'skills_quests_met']);

function displayName(key: string): string {
  if (key === 'gp_stack') return 'GP Stack';
  if (key === 'items_needed') return 'Items Needed';
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

interface StepMetaProps {
  metadata?: StepMetadata;
}

const StepMeta = memo(function StepMeta({ metadata }: StepMetaProps) {
  if (!metadata) return null;

  const entries = Object.entries(metadata).filter(
    ([key, val]) => !SKIP_KEYS.has(key) && val !== undefined && val !== ''
  );

  if (entries.length === 0) return null;

  return (
    <div className="step-meta">
      {entries.map(([key, val]) => (
        <div key={key} className="meta-item">
          <strong>{displayName(key)}:</strong>
          <span>{val}</span>
        </div>
      ))}
    </div>
  );
});

export default StepMeta;
