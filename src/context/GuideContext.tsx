import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { FilterType, HighlightColor, HighlightEntry } from '../types/guide';

// ─── State ──────────────────────────────────────────────────────────────────

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

function reducer(state: GuideState, action: GuideAction): GuideState {
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

// ─── Context ─────────────────────────────────────────────────────────────────

interface GuideContextValue {
  state: GuideState;
  dispatch: React.Dispatch<GuideAction>;
  showToast: (message: string) => void;
}

const GuideContext = createContext<GuideContextValue | null>(null);

// ─── localStorage helpers ────────────────────────────────────────────────────

function storageKey(baseKey: string, namespace: string) {
  return `${baseKey}:${namespace}`;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface GuideProviderProps {
  namespace: string;
  children: ReactNode;
}

export function GuideProvider({ namespace, children }: GuideProviderProps) {
  const initialState: GuideState = {
    namespace,
    progress: loadFromStorage(storageKey('guideProgress', namespace), {}),
    filter: loadFromStorage<{ filter: FilterType }>(
      storageKey('guideFilter', namespace),
      { filter: 'all' }
    ).filter,
    minimizeCompleted: loadFromStorage<{ minimized: boolean }>(
      storageKey('guideFilter', namespace),
      { minimized: false }
    ).minimized,
    highlightModeActive: false,
    highlightColor: (localStorage.getItem('highlightColorPreference') as HighlightColor) ?? 'green',
    highlights: loadFromStorage(storageKey('userHighlights', namespace), []),
    darkMode: (() => {
      const saved = localStorage.getItem('darkMode');
      if (saved === 'true') return true;
      if (saved === 'false') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    })(),
    searchTerm: '',
    toast: null,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist progress
  useEffect(() => {
    localStorage.setItem(storageKey('guideProgress', namespace), JSON.stringify(state.progress));
  }, [state.progress, namespace]);

  // Persist filter state
  useEffect(() => {
    localStorage.setItem(
      storageKey('guideFilter', namespace),
      JSON.stringify({ filter: state.filter, minimized: state.minimizeCompleted })
    );
  }, [state.filter, state.minimizeCompleted, namespace]);

  // Persist highlight color
  useEffect(() => {
    localStorage.setItem('highlightColorPreference', state.highlightColor);
  }, [state.highlightColor]);

  // Persist highlights
  useEffect(() => {
    localStorage.setItem(storageKey('userHighlights', namespace), JSON.stringify(state.highlights));
  }, [state.highlights, namespace]);

  // Persist dark mode + apply body class
  useEffect(() => {
    localStorage.setItem('darkMode', String(state.darkMode));
    document.body.classList.toggle('dark-mode', state.darkMode);
  }, [state.darkMode]);

  // Apply highlight-mode cursor to body
  useEffect(() => {
    document.body.classList.toggle('highlight-mode-active', state.highlightModeActive);
    document.body.classList.toggle('highlight-cursor-active', state.highlightModeActive);
  }, [state.highlightModeActive]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!state.toast) return;
    const id = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2000);
    return () => clearTimeout(id);
  }, [state.toast]);

  const showToast = useCallback((message: string) => {
    dispatch({ type: 'SHOW_TOAST', message });
  }, []);

  return (
    <GuideContext.Provider value={{ state, dispatch, showToast }}>
      {children}
    </GuideContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGuide() {
  const ctx = useContext(GuideContext);
  if (!ctx) throw new Error('useGuide must be used inside GuideProvider');
  return ctx;
}
