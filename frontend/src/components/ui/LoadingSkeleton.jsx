export function LoadingSkeleton({ rows = 5, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-surface-container-low rounded-xl h-16 animate-pulse" />
      ))}
    </div>
  );
}

export function LoadingCardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm animate-pulse h-48" />
      ))}
    </div>
  );
}
