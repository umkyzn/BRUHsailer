import { useState } from 'react';
import type { Footnote } from '../../types/guide';
import { renderFormattedItems } from './FormattedText';

interface ChapterNotesProps {
  footnotes: Footnote[];
}

/**
 * Renders a chapter's footnote data as a collapsible "End of Chapter Notes"
 * card. The data is a sequence of line entries (each ending in a newline);
 * blank entries act as section separators between the stats block and the
 * various link groups.
 */
export default function ChapterNotes({ footnotes }: ChapterNotesProps) {
  const [open, setOpen] = useState(true);

  function toggle() {
    setOpen((o) => !o);
  }

  return (
    <div className={`chapter-notes${open ? ' open' : ''}`}>
      <div
        className="chapter-notes-header"
        onClick={toggle}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <span className="chapter-notes-title">End of Chapter Notes</span>
        <span className="chapter-notes-chevron" aria-hidden="true">
          ▾
        </span>
      </div>

      {open && (
        <div className="chapter-notes-body">
          {footnotes.map((footnote, i) => {
            const text = (footnote.content ?? []).map((c) => c.text).join('');
            // Blank entries are intentional spacers between groups.
            if (!text.trim()) {
              return <div key={i} className="chapter-notes-gap" aria-hidden="true" />;
            }
            return (
              <div key={i} className="chapter-notes-line">
                {renderFormattedItems(footnote.content)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
