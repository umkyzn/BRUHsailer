export default function Header() {
  return (
    <header>
      <div className="header-content">
        {/* Mirrors the side-nav rail so the title centers over the guide column */}
        <div className="rail-spacer" aria-hidden="true" />
        <div className="header-inner">
          <h1>BRUHsailer</h1>
          <h3 className="subtitle">An ironman guide by So Iron BRUH and ParasailerOSRS</h3>
        </div>
      </div>
    </header>
  );
}
