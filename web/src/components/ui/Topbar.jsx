function Topbar({ title = 'Academia', subtitle, right }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-bat-yellow-700/40 bg-gotham-900/90 px-6 py-4 backdrop-blur">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl tracking-wide text-bat-yellow-500">{title}</span>
        {subtitle && <span className="hidden text-sm text-gotham-300 sm:inline">{subtitle}</span>}
      </div>
      {right && <div className="flex items-center gap-4">{right}</div>}
    </header>
  );
}

export default Topbar;
