import { useGuide } from '../../context/GuideContext';

interface NavProps {
  updatedOn: string;
}

export default function Nav({ updatedOn }: NavProps) {
  const { dispatch, showToast } = useGuide();

  function handleReset(e: React.MouseEvent) {
    e.preventDefault();
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      dispatch({ type: 'RESET_PROGRESS' });
      showToast('Progress reset');
    }
  }

  return (
    <nav>
      <div className="nav-content">
        {/* Mirrors the side-nav rail so the links line up with the guide column */}
        <div className="rail-spacer" aria-hidden="true" />
        <div className="nav-inner">
          <a href="/BRUHsailer/#/">Home</a>
          <a href="/BRUHsailer/#/landlubber">Landlubber</a>
          <a
            href="https://docs.google.com/document/d/1CBkFM70SnrW4hJXvHM2F1fYCuBF_fRnEXnTYgRnRkAE"
            target="_blank"
            rel="noreferrer"
          >
            Guide Docs
          </a>
          {updatedOn && <div className="nav-updated">Last updated: {updatedOn}</div>}
          <a href="#" onClick={handleReset}>
            Reset Progress
          </a>
        </div>
      </div>
    </nav>
  );
}
