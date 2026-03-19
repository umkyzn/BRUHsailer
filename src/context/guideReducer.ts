import type { FilterType, HighlightColor, HighlightEntry } from '../types/guide';

// ─── State ───────────────────────────────────────────────────────────────────

export interface GuideState {
  namespace: string;
  progress: Record<string, boolean>;
  filter: FilterType;
  minimizeCompleted: boolean;
  highlightModeActive: boolean;
  highlightColor: HighlightColor;
  highlights: HighlightEntry[];
  darkMode: boolean;
  searchTerm: string;
  toast: string | null;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type GuideAction =
  | { type: 'INIT'; payload: Partial<GuideState> }
  | { type: 'TOGGLE_STEP'; stepId: string }
  | { type: 'SET_FILTER'; filter: FilterType }
  | { type: 'TOGGLE_MINIMIZE' }
  | { type: 'TOGGLE_HIGHLIGHT_MODE' }
  | { type: 'SET_HIGHLIGHT_COLOR'; color: HighlightColor }
  | { type: 'SET_HIGHLIGHTS'; highlights: HighlightEntry[] }
  | { type: 'RESET_PROGRESS' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_SEARCH'; term: string }
  | { type: 'SHOW_TOAST'; message: string }
  | { type: 'HIDE_TOAST' };

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function reducer(state: GuideState, action: GuideAction): GuideState {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload };

    case 'TOGGLE_STEP': {
      const next = !state.progress[action.stepId];
      return {
        ...state,
        progress: { ...state.progress, [action.stepId]: next },
      };
    }

    case 'SET_FILTER':
      return { ...state, filter: action.filter };

    case 'TOGGLE_MINIMIZE':
      return { ...state, minimizeCompleted: !state.minimizeCompleted };

    case 'TOGGLE_HIGHLIGHT_MODE':
      return { ...state, highlightModeActive: !state.highlightModeActive };

    case 'SET_HIGHLIGHT_COLOR':
      return { ...state, highlightColor: action.color };

    case 'SET_HIGHLIGHTS':
      return { ...state, highlights: action.highlights };

    case 'RESET_PROGRESS':
      return { ...state, progress: {} };

    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };

    case 'SET_SEARCH':
      return { ...state, searchTerm: action.term };

    case 'SHOW_TOAST':
      return { ...state, toast: action.message };

    case 'HIDE_TOAST':
      return { ...state, toast: null };

    default:
      return state;
  }
}
