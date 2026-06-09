import { useRef, useCallback, useState, useEffect } from 'react';
import { useGuide } from '../../context/GuideContext';
import type { FilterType, HighlightColor, HighlightEntry } from '../../types/guide';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Incomplete', value: 'incomplete' },
];

const HIGHLIGHT_COLORS: { color: HighlightColor; bg: string }[] = [
  { color: 'green', bg: 'greenyellow' },
  { color: 'yellow', bg: 'yellow' },
  { color: 'blue', bg: 'lightblue' },
  { color: 'pink', bg: 'lightpink' },
  { color: 'red', bg: 'lightcoral' },
  { color: 'purple', bg: 'plum' },
];

const HIGHLIGHT_COLOR_SET = new Set<string>(HIGHLIGHT_COLORS.map((c) => c.color));

interface ExportPayload {
  version: 1;
  namespace: string;
  exportedAt: string;
  progress: Record<string, boolean>;
  highlights: HighlightEntry[];
}

function parseImportPayload(raw: string): Pick<ExportPayload, 'progress' | 'highlights'> | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) return null;
  const obj = data as Record<string, unknown>;

  const progress = obj.progress;
  if (typeof progress !== 'object' || progress === null || Array.isArray(progress)) return null;
  for (const v of Object.values(progress as Record<string, unknown>)) {
    if (typeof v !== 'boolean') return null;
  }

  const highlights: HighlightEntry[] = [];
  if (Array.isArray(obj.highlights)) {
    for (const h of obj.highlights) {
      if (
        typeof h === 'object' &&
        h !== null &&
        typeof (h as HighlightEntry).parentId === 'string' &&
        typeof (h as HighlightEntry).htmlContent === 'string' &&
        HIGHLIGHT_COLOR_SET.has((h as HighlightEntry).color)
      ) {
        highlights.push(h as HighlightEntry);
      }
    }
  }

  return { progress: progress as Record<string, boolean>, highlights };
}

interface FilterBarProps {
  onJumpToLast: () => void;
  onJumpToNext: () => void;
  onRemoveHighlights: () => void;
  onSearchChange: (term: string) => void;
  /** Steps matching the active search, or null when no search is active. */
  matchCount: number | null;
}

export default function FilterBar({
  onJumpToLast,
  onJumpToNext,
  onRemoveHighlights,
  onSearchChange,
  matchCount,
}: FilterBarProps) {
  const { state, dispatch, showToast } = useGuide();
  const searchRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const utilsRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const pickerWrapperRef = useRef<HTMLDivElement>(null);
  const [minimized, setMinimized] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  // `stuck` = the panel has scrolled up to its sticky position and is now
  // floating over the content; we condense it to a slim frosted toolbar.
  const [stuck, setStuck] = useState(false);
  // While stuck, the secondary "tools" row is tucked away behind a toggle.
  const [toolsOpen, setToolsOpen] = useState(false);
  // Measured height of the utilities row, reserved when it collapses so the
  // page doesn't reflow (which would bounce the scroll position).
  const [reservedHeight, setReservedHeight] = useState(0);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInput = useCallback(() => {
    onSearchChange(searchRef.current?.value ?? '');
  }, [onSearchChange]);

  // Keyboard shortcuts: "/" focuses search, Esc clears it. Cheap wins for a
  // tool that's alt-tabbed to mid-game.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'Escape') {
        const input = searchRef.current;
        if (!input) return;
        if (input.value) {
          input.value = '';
          onSearchChange('');
        }
        input.blur();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onSearchChange]);

  // Detect when the panel becomes stuck via a zero-height sentinel just above
  // it: once the sentinel scrolls past the sticky offset, the panel is stuck.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-9px 0px 0px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Re-collapse the tools drawer whenever we scroll back to the top.
  useEffect(() => {
    if (!stuck) setToolsOpen(false);
  }, [stuck]);

  // Measure the utilities row while it's visible (i.e. not stuck) so we know
  // how much space to reserve when it collapses. Keep the last value while
  // stuck (the row is display:none then and would measure as 0).
  useEffect(() => {
    if (stuck || toolsOpen) return;
    function measure() {
      const el = utilsRef.current;
      if (el) setReservedHeight(el.offsetHeight);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [stuck, toolsOpen]);

  // Close the color picker on any outside tap/click (hover never fires on touch).
  useEffect(() => {
    if (!pickerVisible) return;
    function onPointerDown(e: PointerEvent) {
      if (!pickerWrapperRef.current?.contains(e.target as Node)) {
        setPickerVisible(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [pickerVisible]);

  function showPicker() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setPickerVisible(true);
  }

  function hidePicker() {
    leaveTimer.current = setTimeout(() => setPickerVisible(false), 350);
  }

  const handleExport = useCallback(() => {
    const payload: ExportPayload = {
      version: 1,
      namespace: state.namespace,
      exportedAt: new Date().toISOString(),
      progress: state.progress,
      highlights: state.highlights,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bruhsailer-progress-${state.namespace}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Progress exported');
  }, [state.namespace, state.progress, state.highlights, showToast]);

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // allow re-importing the same file
      if (!file) return;

      const parsed = parseImportPayload(await file.text());
      if (!parsed) {
        showToast('Import failed: not a valid progress file');
        return;
      }
      dispatch({ type: 'SET_PROGRESS', progress: parsed.progress });
      if (parsed.highlights.length > 0) {
        dispatch({ type: 'SET_HIGHLIGHTS', highlights: parsed.highlights });
      }
      showToast('Progress imported', { undoable: true });
    },
    [dispatch, showToast]
  );

  const handleReset = useCallback(() => {
    if (!window.confirm('Reset all progress?')) return;
    dispatch({ type: 'RESET_PROGRESS' });
    showToast('Progress reset', { undoable: true });
  }, [dispatch, showToast]);

  const panelClass = ['control-panel', stuck && 'is-stuck', toolsOpen && 'tools-open']
    .filter(Boolean)
    .join(' ');

  const themeToggle = (
    <button
      className="dark-mode-toggle"
      onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
      title="Toggle light / dark theme"
      aria-label="Toggle light / dark theme"
    >
      🌓
    </button>
  );

  if (minimized) {
    return (
      <>
        <div ref={sentinelRef} className="control-sentinel" aria-hidden="true" />
        <div className={panelClass}>
          <div className="control-row">
            <span className="control-label">Filters</span>
            <div className="control-section">
              {themeToggle}
              <button
                className="utility-btn"
                onClick={() => setMinimized(false)}
                title="Expand filters"
              >
                ▼ Show
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div ref={sentinelRef} className="control-sentinel" aria-hidden="true" />
      <div
        className={panelClass}
        style={stuck && !toolsOpen ? { marginBottom: reservedHeight + 15 } : undefined}
      >
        <div className="control-row">
          <div className="control-section">
            <span className="control-label">Show:</span>
            <div className="filter-buttons">
              {FILTERS.map(({ label, value }) => (
                <button
                  key={value}
                  className={`filter-btn${state.filter === value ? ' active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_FILTER', filter: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="search-section">
            <span className="control-label">Search:</span>
            <div className="search-container">
              <input
                ref={searchRef}
                type="text"
                id="searchInput"
                placeholder="Search steps...  ( / )"
                onInput={handleSearchInput}
                onPaste={handleSearchInput}
                onCut={handleSearchInput}
              />
              {matchCount !== null && (
                <span className="search-match-count" role="status">
                  {matchCount === 0
                    ? 'No matches'
                    : `${matchCount} step${matchCount === 1 ? '' : 's'} match`}
                </span>
              )}
            </div>
          </div>
          <div className="control-section control-section--panel">
            {themeToggle}
            {/* Only shown while stuck (see CSS): reveals the tools row */}
            <button
              className={`utility-btn tools-toggle${toolsOpen ? ' active' : ''}`}
              onClick={() => setToolsOpen((o) => !o)}
              title={toolsOpen ? 'Hide tools' : 'Show tools'}
              aria-expanded={toolsOpen}
              aria-label="Toggle tools"
            >
              ⋯
            </button>
            {/* Only shown while NOT stuck (see CSS) */}
            <button
              className="utility-btn minimize-btn"
              onClick={() => setMinimized(true)}
              title="Minimize filters"
            >
              ▲ Hide
            </button>
          </div>
        </div>

        <div className="control-row control-row--utilities" ref={utilsRef}>
          <button className="utility-btn" onClick={onJumpToNext} title="Scroll to the next unchecked step">
            Jump to Next
          </button>
          <button className="utility-btn" onClick={onJumpToLast} title="Scroll to the last completed step">
            Jump to Last
          </button>
          <button
            className={`utility-btn${state.minimizeCompleted ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_MINIMIZE' })}
          >
            Minimize Completed
          </button>
          <button className="utility-btn" onClick={onRemoveHighlights}>
            Remove Highlights
          </button>
          <div
            className="highlight-control-wrapper"
            ref={pickerWrapperRef}
            onMouseEnter={showPicker}
            onMouseLeave={hidePicker}
          >
            <button
              className={`utility-btn${state.highlightModeActive ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_HIGHLIGHT_MODE' })}
              title="Toggle highlight mode"
              aria-pressed={state.highlightModeActive}
            >
              🖍️ Highlight
            </button>
            {/* Tap target for touch devices, where hover never fires */}
            <button
              className="utility-btn picker-toggle"
              onClick={() => setPickerVisible((v) => !v)}
              title="Choose highlight color"
              aria-label="Choose highlight color"
              aria-expanded={pickerVisible}
              aria-haspopup="true"
            >
              ▾
            </button>
            <div
              className={`highlight-color-picker${pickerVisible ? ' visible' : ''}`}
              onMouseEnter={showPicker}
              onMouseLeave={hidePicker}
            >
              {HIGHLIGHT_COLORS.map(({ color, bg }) => (
                <button
                  key={color}
                  className={`color-picker-btn${state.highlightColor === color ? ' active' : ''}`}
                  style={{ backgroundColor: bg }}
                  onClick={() => dispatch({ type: 'SET_HIGHLIGHT_COLOR', color })}
                  title={color}
                  aria-label={`Highlight color: ${color}`}
                  aria-pressed={state.highlightColor === color}
                />
              ))}
            </div>
          </div>

          {/* Progress data tools — export/import live here (not localStorage-only),
              and Reset moved out of the nav so a destructive action no longer
              masquerades as navigation. */}
          <div className="progress-tools">
            <button
              className="utility-btn"
              onClick={handleExport}
              title="Download your progress and highlights as a JSON file"
            >
              ⬇ Export
            </button>
            <button
              className="utility-btn"
              onClick={() => importInputRef.current?.click()}
              title="Restore progress from an exported JSON file"
            >
              ⬆ Import
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
              aria-hidden="true"
              tabIndex={-1}
            />
            <button
              className="utility-btn utility-btn--danger"
              onClick={handleReset}
              title="Clear all progress (undoable for a few seconds)"
            >
              Reset Progress
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
