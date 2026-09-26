export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low mt-auto shadow-[0_-2px_10px_rgba(36,28,26,0.03)]">
      <div className="w-full px-margin-desktop py-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
        <div className="flex flex-col md:flex-row items-center gap-space-sm text-center md:text-left">
          <span>Jl. Cita Rasa No. 42, Jakarta</span>
          <span className="hidden md:inline text-outline-variant">•</span>
          <span>Buka: 09:00 - 22:00 WIB</span>
        </div>

      </div>
    </footer>
  );
}
