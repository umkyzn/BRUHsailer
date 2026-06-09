import type { FilterType, HighlightColor, HighlightEntry } from '../types/guide';

// ─── State ───────────────────────────────────────────────────────────────────

export interface ToastState {
  message: string;
  /** When true the toast renders an Undo button that restores `undoProgress`. */
  undoable?: boolean;
}

export interface GuideState {
  namespace: string;
  progress: Record<string, boolean>;
  /** Snapshot of `progress` taken before the last destructive change (toggle,
      reset, import), so the toast's Undo button can restore it. */
  undoProgress: Record<string, boolean> | null;
  filter: FilterType;
  minimizeCompleted: boolean;
  highlightModeActive: boolean;
  highlightColor: HighlightColor;
  highlights: HighlightEntry[];
  darkMode: boolean;
  searchTerm: string;
  toast: ToastState | null;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type GuideAction =
  | { type: 'INIT'; payload: Partial<GuideState> }
  | { type: 'TOGGLE_STEP'; stepId: string }
  | { type: 'SET_PROGRESS'; progress: Record<string, boolean> }
  | { type: 'UNDO_PROGRESS' }
  | { type: 'SET_FILTER'; filter: FilterType }
  | { type: 'TOGGLE_MINIMIZE' }
  | { type: 'TOGGLE_HIGHLIGHT_MODE' }
  | { type: 'SET_HIGHLIGHT_COLOR'; color: HighlightColor }
  | { type: 'SET_HIGHLIGHTS'; highlights: HighlightEntry[] }
  | { type: 'RESET_PROGRESS' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_SEARCH'; term: string }
  | { type: 'SHOW_TOAST'; message: string; undoable?: boolean }
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
        undoProgress: state.progress,
        progress: { ...state.progress, [action.stepId]: next },
      };
    }

    case 'SET_PROGRESS':
      return {
        ...state,
        undoProgress: state.progress,
        progress: action.progress,
      };

    case 'UNDO_PROGRESS': {
      if (!state.undoProgress) return state;
      return {
        ...state,
        progress: state.undoProgress,
        undoProgress: null,
        toast: null,
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
      return { ...state, undoProgress: state.progress, progress: {} };

    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };

    case 'SET_SEARCH':
      return { ...state, searchTerm: action.term };

    case 'SHOW_TOAST':
      return { ...state, toast: { message: action.message, undoable: action.undoable } };

    case 'HIDE_TOAST':
      return { ...state, toast: null };

    default:
      return state;
  }
}
