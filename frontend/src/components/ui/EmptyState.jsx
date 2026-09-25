export function EmptyState({ title = 'Data Kosong', description = 'Tidak ada data tersedia' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
        <span className="text-3xl">📭</span>
      </div>
      <h3 className="font-title-lg text-title-lg text-on-surface mb-2">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-sm">
        {description}
      </p>
    </div>
  );
}
