import { useState, memo } from 'react';
import type { StepWithId } from '../../types/guide';
import type { GuideSection } from '../../types/guide';
import Step from './Step';

interface SectionProps {
  section: GuideSection;
  steps: StepWithId[];
  sectionId: string;
  isFootnotes?: boolean;
}

function Section({ section, steps, sectionId, isFootnotes = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`guide-section${isFootnotes ? ' footnotes-section' : ''}`}
      data-section={sectionId}
    >
      <div
        className={`section-header${isOpen ? ' active' : ''}${isFootnotes ? ' footnotes-header' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
      >
        <h2 className="section-title">{section.title}</h2>
        <span className="section-time" />
      </div>
      <div className={`section-content${isOpen ? ' active' : ''}`}>
        {steps.map(({ step, stepId }) => {
          // stepId format: "{chapterNum}-{stepCountInChapter}"
          const stepNumber = parseInt(stepId.split('-')[1], 10);
          return <Step key={stepId} step={step} stepId={stepId} stepNumber={stepNumber} />;
        })}
      </div>
    </div>
  );
}

export default memo(Section);
