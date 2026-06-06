import { useRef, useCallback, useState, useEffect } from 'react';
import { useGuide } from '../../context/GuideContext';
import type { FilterType, HighlightColor } from '../../types/guide';

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

interface FilterBarProps {
  onJumpToLast: () => void;
  onRemoveHighlights: () => void;
  onSearchChange: (term: string) => void;
}

export default function FilterBar({
  onJumpToLast,
  onRemoveHighlights,
  onSearchChange,
}: FilterBarProps) {
  const { state, dispatch } = useGuide();
  const searchRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const utilsRef = useRef<HTMLDivElement>(null);
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

  function showPicker() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setPickerVisible(true);
  }

  function hidePicker() {
    leaveTimer.current = setTimeout(() => setPickerVisible(false), 350);
  }

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
                placeholder="Search steps..."
                onInput={handleSearchInput}
                onPaste={handleSearchInput}
                onCut={handleSearchInput}
              />
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
          <button className="utility-btn" onClick={onJumpToLast}>
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
            onMouseEnter={showPicker}
            onMouseLeave={hidePicker}
          >
            <button
              className={`utility-btn${state.highlightModeActive ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_HIGHLIGHT_MODE' })}
              title="Toggle highlight mode"
            >
              🖍️ Highlight
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
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
