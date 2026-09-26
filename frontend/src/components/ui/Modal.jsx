import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Modal({
  open,
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  variant = 'centered',
  maxWidth = 'max-w-md',
  showCloseButton = true,
}) {
  const visible = open || isOpen;

  // Handle ESC key to dismiss modal comfortably
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!visible) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [visible]);

  if (!visible) return null;

  // Drawer variant (slides from the right)
  if (variant === 'drawer') {
    const drawerContent = (
      <div className="fixed inset-0 z-[9999] flex justify-end">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />
        <div className="relative w-full max-w-lg bg-surface-container-lowest shadow-2xl overflow-y-auto flex flex-col z-10 animate-in slide-in-from-right duration-200">
          {(title || showCloseButton) && (
            <div className="p-space-lg bg-surface-container flex items-start justify-between border-b border-outline-variant/60">
              <div>
                {title && <h3 className="font-title-lg text-title-lg text-on-surface font-bold">{title}</h3>}
                {subtitle && <span className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</span>}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-variant transition-colors"
                  title="Tutup"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          <div className="p-space-lg flex-1 flex flex-col gap-space-lg">{children}</div>
        </div>
      </div>
    );

    return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : drawerContent;
  }

  // Centered dialog (default) — rendered via Portal directly to body
  const dialogContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200 my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="px-6 py-4 bg-surface-container/60 flex items-center justify-between border-b border-outline-variant/60">
            <div>
              {title && <h3 className="font-title-lg text-title-lg text-on-surface font-bold">{title}</h3>}
              {subtitle && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
                title="Tutup"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="p-6 flex flex-col gap-space-md">{children}</div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(dialogContent, document.body) : dialogContent;
}
