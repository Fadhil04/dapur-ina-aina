import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const toastTypes = {
  success: { icon: CheckCircle, bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
  error: { icon: AlertCircle, bg: 'bg-error-container', text: 'text-on-error-container' },
  info: { icon: Info, bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
};

export function Toast({ title, message, type = 'info', onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const Icon = toastTypes[type]?.icon || Info;
  const config = toastTypes[type] || toastTypes.info;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${config.bg} ${config.text} px-4 py-3 rounded-xl shadow-lg max-w-sm`}>
      <Icon size={22} className="flex-shrink-0" />
      <div className="flex flex-col">
        <span className="font-label-lg font-bold">{title}</span>
        {message && <span className="font-body-sm opacity-90">{message}</span>}
      </div>
      <button 
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="p-1 hover:opacity-70 transition-opacity flex-shrink-0"
      >
        <X size={18} />
      </button>
    </div>
  );
}
