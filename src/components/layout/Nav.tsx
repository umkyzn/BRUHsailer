interface NavProps {
  updatedOn: string;
}

// Reset Progress used to live here styled like a nav link; it moved into the
// FilterBar tools row so a destructive action no longer looks like navigation.
export default function Nav({ updatedOn }: NavProps) {
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
        </div>
      </div>
    </nav>
  );
}
