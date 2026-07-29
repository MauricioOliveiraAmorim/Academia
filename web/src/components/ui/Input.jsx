import { forwardRef } from 'react';
import { cx } from './cx';

const baseClasses =
  'w-full rounded-lg bg-gotham-800 border border-gotham-500 text-gotham-100 placeholder-gotham-300 ' +
  'px-3.5 py-2.5 text-sm transition-colors duration-150 ' +
  'focus:border-bat-yellow-500 focus:ring-2 focus:ring-bat-yellow-500/30';

export const Input = forwardRef(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cx(baseClasses, invalid && 'border-bat-red-500 focus:border-bat-red-500 focus:ring-bat-red-500/30', className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cx(baseClasses, 'resize-none', className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cx(baseClasses, className)} {...props}>
      {children}
    </select>
  );
});

export function Label({ className, children, ...props }) {
  return (
    <label className={cx('mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gotham-300', className)} {...props}>
      {children}
    </label>
  );
}

export default Input;
