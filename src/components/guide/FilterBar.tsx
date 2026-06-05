import { useRef, useCallback, useState } from 'react';
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
  const [minimized, setMinimized] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInput = useCallback(() => {
    onSearchChange(searchRef.current?.value ?? '');
  }, [onSearchChange]);

  function showPicker() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setPickerVisible(true);
  }

  function hidePicker() {
    leaveTimer.current = setTimeout(() => setPickerVisible(false), 350);
  }

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
      <div className="control-panel">
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
    );
  }

  return (
    <div className="control-panel">
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
          <button
            className="utility-btn"
            onClick={() => setMinimized(true)}
            title="Minimize filters"
          >
            ▲ Hide
          </button>
        </div>
      </div>

      <div className="control-row control-row--utilities">
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
  );
}
