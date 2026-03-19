import { useRef, useCallback } from 'react';
import { useGuide } from '../../context/GuideContext';
import type { FilterType } from '../../types/guide';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All Steps', value: 'all' },
  { label: 'Completed Steps', value: 'completed' },
  { label: 'Incomplete Steps', value: 'incomplete' },
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

  const handleSearchInput = useCallback(() => {
    onSearchChange(searchRef.current?.value ?? '');
  }, [onSearchChange]);

  return (
    <>
      <div className="utility-buttons">
        <button className="utility-btn" onClick={onJumpToLast}>
          Jump to Last Completed Step
        </button>
        <button
          className={`utility-btn${state.minimizeCompleted ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_MINIMIZE' })}
        >
          Minimize Completed
        </button>
        <button className="utility-btn" onClick={onRemoveHighlights}>
          Remove All Highlights
        </button>
      </div>

      <div className="filter-container">
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
    </>
  );
}
