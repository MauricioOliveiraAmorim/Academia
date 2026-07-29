import { cx } from './cx';

const VARIANTS = {
  primary:
    'bg-bat-yellow-500 text-gotham-950 hover:bg-bat-yellow-400 focus-visible:ring-bat-yellow-300',
  secondary:
    'bg-gotham-700 text-gotham-100 border border-gotham-500 hover:bg-gotham-600 focus-visible:ring-gotham-300',
  danger:
    'bg-bat-red-500 text-white hover:bg-bat-red-600 focus-visible:ring-bat-red-500',
  success:
    'bg-bat-green-500 text-white hover:bg-bat-green-600 focus-visible:ring-bat-green-500',
  ghost:
    'bg-transparent text-bat-yellow-500 border border-bat-yellow-700 hover:bg-bat-yellow-500/10 focus-visible:ring-bat-yellow-300',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

function Button({ variant = 'primary', size = 'md', className, children, ...props }) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-wide',
        'transition-colors duration-150 cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gotham-950',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
