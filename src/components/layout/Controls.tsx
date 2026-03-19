import { useState, useRef } from 'react';
import { useGuide } from '../../context/GuideContext';
import type { HighlightColor } from '../../types/guide';

const COLORS: { color: HighlightColor; bg: string }[] = [
  { color: 'green', bg: 'greenyellow' },
  { color: 'yellow', bg: 'yellow' },
  { color: 'blue', bg: 'lightblue' },
  { color: 'pink', bg: 'lightpink' },
];

export default function Controls() {
  const { state, dispatch } = useGuide();
  const [pickerVisible, setPickerVisible] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showPicker() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setPickerVisible(true);
  }

  function hidePicker() {
    leaveTimer.current = setTimeout(() => setPickerVisible(false), 350);
  }

  return (
    <div className="top-right-controls">
      <div
        className="highlight-control-wrapper"
        onMouseEnter={showPicker}
        onMouseLeave={hidePicker}
      >
        <button
          className={`highlight-toggle${state.highlightModeActive ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_HIGHLIGHT_MODE' })}
          title="Toggle highlight mode"
        >
          🖍️
        </button>
        <div
          className={`highlight-color-picker${pickerVisible ? ' visible' : ''}`}
          onMouseEnter={showPicker}
          onMouseLeave={hidePicker}
        >
          {COLORS.map(({ color, bg }) => (
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
      <button
        className="dark-mode-toggle"
        onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
        title="Toggle dark mode"
      >
        🌓
      </button>
    </div>
  );
}
