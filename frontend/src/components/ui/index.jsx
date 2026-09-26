import { Search } from 'lucide-react';

// Re-export komponen dari file terpisah agar semua import path berjalan benar
export { Modal } from './Modal.jsx';
export { EmptyState } from './EmptyState.jsx';
export { LoadingSkeleton, LoadingCardSkeleton } from './LoadingSkeleton.jsx';
export { Toast } from './Toast.jsx';
export { KpiCard } from './KpiCard.jsx';

// Card — Komponen Wrapper Card Standar
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl p-space-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// Badge — Status Badge dengan Indicator Dot
const statusStyles = {
  aman:     'bg-secondary-container text-on-secondary-container',
  lunas:    'bg-secondary-container text-on-secondary-container',
  menipis:  'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  pending:  'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  habis:    'bg-error text-on-error',
  kritis:   'bg-error-container text-on-error-container',
};

export function Badge({ status, children, pulse = false }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-md text-label-md ${statusStyles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current inline-block ${pulse ? 'animate-pulse' : ''}`} />
      {children}
    </span>
  );
}

// Button — Tombol Multi-Variant
export function Button({ variant = 'primary', icon: Icon, children, className = '', ...props }) {
  const base = 'px-4 py-2.5 rounded-xl font-label-lg text-label-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container shadow-sm hover:shadow',
    secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90 shadow-sm',
    neutral: 'bg-surface-container-high hover:bg-surface-variant text-on-surface',
    danger: 'bg-error text-on-error hover:bg-error/90 shadow-sm hover:shadow',
    disabled: 'bg-surface-dim text-outline cursor-not-allowed',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}

// SearchInput — Input Pencarian dengan Ikon
export function SearchInput({ value, onChange, placeholder = 'Cari...' }) {
  return (
    <div className="relative flex-1 max-w-xl">
      <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
      />
    </div>
  );
}

// FilterPill — Pill Filter Kategori/Status
export function FilterPill({ active, children, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-full font-label-lg text-label-lg whitespace-nowrap shadow-sm transition-all ${
        active ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
