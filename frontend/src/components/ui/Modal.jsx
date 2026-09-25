import { X } from 'lucide-react';

export function Modal({ open, isOpen, onClose, title, subtitle, children }) {
  if (!open && !isOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-surface-container-lowest shadow-2xl overflow-y-auto flex flex-col">
        <div className="p-space-lg bg-surface-container flex items-start justify-between">
          <div>
            <h3 className="font-title-lg text-title-lg text-on-surface font-bold">{title}</h3>
            {subtitle && <span className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</span>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-variant">
            <X size={20} />
          </button>
        </div>
        <div className="p-space-lg flex-1 flex flex-col gap-space-lg">{children}</div>
      </div>
    </div>
  );
}
