import { useState } from 'react';
import type { Footnote, ContentItem } from '../../types/guide';
import { renderFormattedItems } from './FormattedText';

interface ChapterNotesProps {
  footnotes: Footnote[];
}

// OSRS skill abbreviations used in the guide's stat summaries -> full names.
const SKILL_NAMES: Record<string, string> = {
  Atk: 'Attack', Str: 'Strength', Def: 'Defence', HP: 'Hitpoints', Range: 'Ranged',
  Pray: 'Prayer', Magic: 'Magic', RC: 'Runecraft', Cons: 'Construction', Agil: 'Agility',
  Herb: 'Herblore', Thiev: 'Thieving', Craft: 'Crafting', Fletch: 'Fletching', Slay: 'Slayer',
  Hunt: 'Hunter', Mining: 'Mining', Smithing: 'Smithing', Fish: 'Fishing', Cook: 'Cooking',
  Firemaking: 'Firemaking', FM: 'Firemaking', WC: 'Woodcutting', Farming: 'Farming', Sailing: 'Sailing',
};

interface StatEntry {
  skill: string;
  level: string;
  note?: string;
}

function fullSkill(abbr: string): string {
  return SKILL_NAMES[abbr] ?? abbr;
}

const STAT_LINE = /^[A-Za-z]+:\s*\d+/;

function isStatLine(text: string): boolean {
  return STAT_LINE.test(text.trim());
}

// A stat line is either a single "Skill: 46 (note)" or a combat line with
// several comma-separated pairs. Pull out each skill/level and any caveat.
function parseStatLine(text: string): StatEntry[] {
  const re = /([A-Za-z]+):\s*(\d+)/g;
  const matches: { skill: string; level: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({ skill: m[1], level: m[2], start: m.index, end: re.lastIndex });
  }
  return matches.map((mt, i) => {
    const next = matches[i + 1];
    let note = text.slice(mt.end, next ? next.start : text.length);
    note = note.replace(/^[,/\s]+/, '').trim();
    // Unwrap a single fully-parenthesised note, e.g. "(more if ...)" -> "more if ..."
    const wrapped = note.match(/^\(([^()]*)\)$/);
    if (wrapped) note = wrapped[1].trim();
    return { skill: mt.skill, level: mt.level, note: note || undefined };
  });
}

type Block =
  | { kind: 'gap'; key: string }
  | { kind: 'line'; key: string; content: ContentItem[] }
  | { kind: 'stats'; key: string; entries: StatEntry[] };

function buildBlocks(footnotes: Footnote[]): Block[] {
  const blocks: Block[] = [];
  let statBuffer: StatEntry[] = [];

  const flushStats = () => {
    if (statBuffer.length) {
      blocks.push({ kind: 'stats', key: `stats-${blocks.length}`, entries: statBuffer });
      statBuffer = [];
    }
  };

  footnotes.forEach((f, i) => {
    const content = f.content ?? [];
    const text = content.map((c) => c.text).join('');
    if (isStatLine(text)) {
      statBuffer.push(...parseStatLine(text));
      return;
    }
    flushStats();
    if (!text.trim()) blocks.push({ kind: 'gap', key: `g-${i}` });
    else blocks.push({ kind: 'line', key: `l-${i}`, content });
  });
  flushStats();

  return blocks;
}

/**
 * Renders a chapter's footnote data as a collapsible "End of Chapter Notes"
 * card. Contiguous "Skill: level" lines are collected into a stats grid with
 * the caveats listed as bullets beneath it; everything else (intro text, link
 * groups separated by blank lines) renders as before.
 */
export default function ChapterNotes({ footnotes }: ChapterNotesProps) {
  const [open, setOpen] = useState(true);
  const blocks = buildBlocks(footnotes);

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
          {blocks.map((block) => {
            if (block.kind === 'gap') {
              return <div key={block.key} className="chapter-notes-gap" aria-hidden="true" />;
            }
            if (block.kind === 'line') {
              return (
                <div key={block.key} className="chapter-notes-line">
                  {renderFormattedItems(block.content)}
                </div>
              );
            }
            // stats block
            const notes = block.entries.filter((e) => e.note);
            return (
              <div key={block.key} className="eoc-stats">
                <div className="eoc-stats-grid">
                  {block.entries.map((e, j) => (
                    <div key={j}>
                      <span className="eoc-stat-skill">{fullSkill(e.skill)}</span>
                      <span className="eoc-stat-level">{e.level}</span>
                    </div>
                  ))}
                </div>
                {notes.length > 0 && (
                  <ul className="eoc-stats-notes">
                    {notes.map((e, j) => (
                      <li key={j}>
                        <strong>{fullSkill(e.skill)}:</strong> {e.note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
