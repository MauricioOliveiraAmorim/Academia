import Card from './Card';

function Modal({ title, onClose, children, footer, maxWidth = 'max-w-xl' }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <Card className={`w-full ${maxWidth} border-bat-yellow-700/60 p-6 max-h-[90vh] overflow-y-auto`}>
        {title && (
          <h3 className="mb-5 font-display text-2xl tracking-wide text-bat-yellow-500">{title}</h3>
        )}
        {children}
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </Card>
    </div>
  );
}

export default Modal;
