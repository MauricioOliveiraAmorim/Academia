import { cx } from './cx';

const TONES = {
  neutral: 'bg-gotham-700 text-gotham-200',
  gold: 'bg-bat-yellow-500/15 text-bat-yellow-400 border border-bat-yellow-700/50',
  success: 'bg-bat-green-500/15 text-bat-green-500 border border-bat-green-600/50',
  danger: 'bg-bat-red-500/15 text-bat-red-500 border border-bat-red-600/50',
};

function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
