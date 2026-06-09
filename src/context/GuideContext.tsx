import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { reducer } from './guideReducer';
import type { HighlightColor } from '../types/guide';

export type { GuideState, GuideAction } from './guideReducer';

// ─── Context ─────────────────────────────────────────────────────────────────

import type { GuideState, GuideAction } from './guideReducer';

interface GuideContextValue {
  state: GuideState;
  dispatch: React.Dispatch<GuideAction>;
  showToast: (message: string, options?: { undoable?: boolean }) => void;
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

// The original (pre-React) site stored progress keyed by the checkbox id,
// e.g. `check-1-2`, while this version keys by the bare step id `1-2`. Both use
// the same storage key (`guideProgress:<namespace>`) and the same step
// numbering, so existing users already have their progress — it's just under
// the old `check-` prefix. Strip the prefix on load so their checkboxes light
// up again. Newer (already-bare) keys win if both happen to be present.
function loadProgress(key: string): Record<string, boolean> {
  const raw = loadFromStorage<Record<string, boolean>>(key, {});
  const legacy = Object.keys(raw).filter((k) => k.startsWith('check-'));
  if (legacy.length === 0) return raw;

  const migrated: Record<string, boolean> = {};
  for (const k of legacy) migrated[k.slice('check-'.length)] = raw[k];
  for (const [k, v] of Object.entries(raw)) {
    if (!k.startsWith('check-')) migrated[k] = v;
  }
  return migrated;
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface GuideProviderProps {
  namespace: string;
  children: ReactNode;
}

export function GuideProvider({ namespace, children }: GuideProviderProps) {
  const initialState: GuideState = {
    namespace,
    progress: loadProgress(storageKey('guideProgress', namespace)),
    undoProgress: null,
    filter: loadFromStorage<{ filter: 'all' | 'completed' | 'incomplete' }>(
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

  // Auto-dismiss toast (undoable toasts linger longer so Undo is reachable)
  useEffect(() => {
    if (!state.toast) return;
    const delay = state.toast.undoable ? 5000 : 2000;
    const id = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), delay);
    return () => clearTimeout(id);
  }, [state.toast]);

  const showToast = useCallback((message: string, options?: { undoable?: boolean }) => {
    dispatch({ type: 'SHOW_TOAST', message, undoable: options?.undoable });
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
