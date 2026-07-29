import { cx } from './cx';

function Card({ className, children, ...props }) {
  return (
    <div
      className={cx(
        'rounded-xl border border-gotham-700 bg-gotham-850 shadow-lg shadow-black/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
