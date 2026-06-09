import { describe, it, expect } from 'vitest';
import { reducer } from '../../context/guideReducer';
import type { GuideState } from '../../context/guideReducer';

const base: GuideState = {
  namespace: 'test',
  progress: {},
  undoProgress: null,
  filter: 'all',
  minimizeCompleted: false,
  highlightModeActive: false,
  highlightColor: 'green',
  highlights: [],
  darkMode: false,
  searchTerm: '',
  toast: null,
};

describe('guideReducer', () => {
  it('INIT merges partial payload and leaves other fields unchanged', () => {
    const next = reducer(base, { type: 'INIT', payload: { darkMode: true, searchTerm: 'fish' } });
    expect(next.darkMode).toBe(true);
    expect(next.searchTerm).toBe('fish');
    expect(next.filter).toBe('all'); // untouched
    expect(next.namespace).toBe('test'); // untouched
  });

  it('TOGGLE_STEP marks an unchecked step as completed', () => {
    const next = reducer(base, { type: 'TOGGLE_STEP', stepId: '1-1' });
    expect(next.progress['1-1']).toBe(true);
  });

  it('TOGGLE_STEP unchecks an already-completed step', () => {
    const state = { ...base, progress: { '1-1': true } };
    const next = reducer(state, { type: 'TOGGLE_STEP', stepId: '1-1' });
    expect(next.progress['1-1']).toBe(false);
  });

  it('TOGGLE_STEP does not mutate other progress entries', () => {
    const state = { ...base, progress: { '1-1': true, '1-2': true } };
    const next = reducer(state, { type: 'TOGGLE_STEP', stepId: '1-1' });
    expect(next.progress['1-2']).toBe(true);
  });

  it('TOGGLE_STEP returns a new progress object (immutability)', () => {
    const next = reducer(base, { type: 'TOGGLE_STEP', stepId: '1-1' });
    expect(next.progress).not.toBe(base.progress);
  });

  it('SET_FILTER updates the filter field', () => {
    const next = reducer(base, { type: 'SET_FILTER', filter: 'completed' });
    expect(next.filter).toBe('completed');
  });

  it('TOGGLE_MINIMIZE flips minimizeCompleted false → true', () => {
    const next = reducer(base, { type: 'TOGGLE_MINIMIZE' });
    expect(next.minimizeCompleted).toBe(true);
  });

  it('TOGGLE_MINIMIZE flips minimizeCompleted true → false', () => {
    const state = { ...base, minimizeCompleted: true };
    const next = reducer(state, { type: 'TOGGLE_MINIMIZE' });
    expect(next.minimizeCompleted).toBe(false);
  });

  it('TOGGLE_HIGHLIGHT_MODE flips highlightModeActive', () => {
    const on = reducer(base, { type: 'TOGGLE_HIGHLIGHT_MODE' });
    expect(on.highlightModeActive).toBe(true);
    const off = reducer(on, { type: 'TOGGLE_HIGHLIGHT_MODE' });
    expect(off.highlightModeActive).toBe(false);
  });

  it('SET_HIGHLIGHT_COLOR updates the highlight color', () => {
    const next = reducer(base, { type: 'SET_HIGHLIGHT_COLOR', color: 'pink' });
    expect(next.highlightColor).toBe('pink');
  });

  it('SET_HIGHLIGHTS replaces the highlights array', () => {
    const entries = [
      { parentId: 'step-1-1', htmlContent: 'hello', color: 'green' as const },
      { parentId: 'step-1-2', htmlContent: 'world', color: 'yellow' as const },
    ];
    const next = reducer(base, { type: 'SET_HIGHLIGHTS', highlights: entries });
    expect(next.highlights).toHaveLength(2);
    expect(next.highlights[0].parentId).toBe('step-1-1');
  });

  it('RESET_PROGRESS clears all progress entries', () => {
    const state = { ...base, progress: { '1-1': true, '2-3': true } };
    const next = reducer(state, { type: 'RESET_PROGRESS' });
    expect(next.progress).toEqual({});
  });

  it('RESET_PROGRESS stashes the previous progress for undo', () => {
    const state = { ...base, progress: { '1-1': true, '2-3': true } };
    const next = reducer(state, { type: 'RESET_PROGRESS' });
    expect(next.undoProgress).toEqual({ '1-1': true, '2-3': true });
  });

  it('TOGGLE_STEP stashes the previous progress for undo', () => {
    const state = { ...base, progress: { '1-1': true } };
    const next = reducer(state, { type: 'TOGGLE_STEP', stepId: '1-2' });
    expect(next.undoProgress).toEqual({ '1-1': true });
  });

  it('SET_PROGRESS replaces progress and stashes the previous one', () => {
    const state = { ...base, progress: { '1-1': true } };
    const next = reducer(state, { type: 'SET_PROGRESS', progress: { '2-1': true, '2-2': true } });
    expect(next.progress).toEqual({ '2-1': true, '2-2': true });
    expect(next.undoProgress).toEqual({ '1-1': true });
  });

  it('UNDO_PROGRESS restores the stashed progress and clears the stash', () => {
    const state = {
      ...base,
      progress: {},
      undoProgress: { '1-1': true },
      toast: { message: 'Progress reset', undoable: true },
    };
    const next = reducer(state, { type: 'UNDO_PROGRESS' });
    expect(next.progress).toEqual({ '1-1': true });
    expect(next.undoProgress).toBeNull();
    expect(next.toast).toBeNull();
  });

  it('UNDO_PROGRESS is a no-op when there is nothing to undo', () => {
    const next = reducer(base, { type: 'UNDO_PROGRESS' });
    expect(next).toBe(base);
  });

  it('TOGGLE_DARK_MODE flips darkMode', () => {
    const dark = reducer(base, { type: 'TOGGLE_DARK_MODE' });
    expect(dark.darkMode).toBe(true);
    const light = reducer(dark, { type: 'TOGGLE_DARK_MODE' });
    expect(light.darkMode).toBe(false);
  });

  it('SET_SEARCH updates searchTerm', () => {
    const next = reducer(base, { type: 'SET_SEARCH', term: 'sailing' });
    expect(next.searchTerm).toBe('sailing');
  });

  it('SHOW_TOAST sets the toast message', () => {
    const next = reducer(base, { type: 'SHOW_TOAST', message: 'Saved!' });
    expect(next.toast).toEqual({ message: 'Saved!', undoable: undefined });
  });

  it('SHOW_TOAST carries the undoable flag', () => {
    const next = reducer(base, { type: 'SHOW_TOAST', message: 'Step 3 completed', undoable: true });
    expect(next.toast).toEqual({ message: 'Step 3 completed', undoable: true });
  });

  it('HIDE_TOAST clears the toast message', () => {
    const state: GuideState = { ...base, toast: { message: 'Saved!' } };
    const next = reducer(state, { type: 'HIDE_TOAST' });
    expect(next.toast).toBeNull();
  });
});
