import { useGuide } from '../../context/GuideContext';

export default function Toast() {
  const { state, dispatch } = useGuide();
  const canUndo = Boolean(state.toast?.undoable && state.undoProgress);

  return (
    <div
      className={`save-toast${state.toast ? ' show' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span>{state.toast?.message ?? ''}</span>
      {canUndo && (
        <button
          className="toast-undo-btn"
          onClick={() => dispatch({ type: 'UNDO_PROGRESS' })}
        >
          Undo
        </button>
      )}
    </div>
  );
}
