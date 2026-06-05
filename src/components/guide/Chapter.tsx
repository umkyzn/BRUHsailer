import { useState, memo } from 'react';
import type { ChapterWithSections } from '../../types/guide';
import Section from './Section';
import FormattedText from './FormattedText';

interface ChapterProps {
  chapterData: ChapterWithSections;
  /** Index of the section that should start open, or null if this chapter starts collapsed */
  initialOpenSectionIndex: number | null;
}

function Chapter({ chapterData, initialOpenSectionIndex }: ChapterProps) {
  const { chapter, sections, chapterIndex } = chapterData;
  const [isOpen, setIsOpen] = useState(initialOpenSectionIndex !== null);

  return (
    <div className="guide-chapter" data-chapter={chapterIndex}>
      <h2
        className={`chapter-title${isOpen ? ' active' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
      >
        {chapter.titleFormatted ? (
          <FormattedText content={chapter.titleFormatted} />
        ) : (
          chapter.title
        )}
      </h2>
      <div className={`chapter-content${isOpen ? ' active' : ''}`}>
        {sections.map(({ section, steps }, si) => (
          <Section
            key={si}
            section={section}
            steps={steps}
            sectionId={`${chapterIndex + 1}.${si + 1}`}
            initiallyOpen={si === initialOpenSectionIndex}
          />
        ))}
        {chapter.footnotes && chapter.footnotes.length > 0 && (
          <div className="guide-section footnotes-section">
            <div
              className="section-header footnotes-header"
              style={{ cursor: 'default' }}
            >
              <h2 className="section-title">End of chapter notes</h2>
            </div>
            <div className="section-content active">
              {chapter.footnotes.map((footnote, fi) => (
                <FormattedText key={fi} content={footnote.content} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(Chapter);
