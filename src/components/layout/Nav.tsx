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
        <a href="/BRUHsailer/#/">Home</a>
        <a href="/BRUHsailer/#/landlubber">Landlubber</a>
        <a
          href="https://docs.google.com/document/d/1CBkFM70SnrW4hJXvHM2F1fYCuBF_fRnEXnTYgRnRkAE"
          target="_blank"
          rel="noreferrer"
        >
          Guide Docs
        </a>
        {updatedOn && <div>Last updated: {updatedOn}</div>}
        <a href="#" onClick={handleReset}>
          Reset Progress
        </a>
      </div>
    </nav>
  );
}
