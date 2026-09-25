# Design System Implementation — Dapur Ina Aina (React + Vite)

## ✅ Status Implementasi

### Selesai
- ✅ `tailwind.config.js` — Token warna, tipografi, spacing lengkap sesuai design.md
- ✅ `index.html` — Google Fonts (Playfair Display, Plus Jakarta Sans)
- ✅ `index.css` — Tailwind directives + print styles
- ✅ **Komponen UI Reusable** (`src/components/ui/`):
  - `Card.jsx` — Wrapper card standar
  - `Badge.jsx` — Status badge dengan pulse animation
  - `Button.jsx` — Multi-variant buttons (primary, secondary, neutral, disabled)
  - `SearchInput.jsx` — Search dengan ikon Lucide
  - `FilterPill.jsx` — Filter pill kategori/status
  - `KpiCard.jsx` — KPI metric card dengan icon holder
  - `Modal.jsx` — Slide-over drawer modal
  - `EmptyState.jsx` — Empty state placeholder
  - `LoadingSkeleton.jsx` — Loading skeleton animations
  - `Toast.jsx` — Toast notifications dengan auto-dismiss
- ✅ **Layout Components** (`src/components/layout/`):
  - `Header.jsx` — Fixed navbar dengan NavLink dinamis (role-based)
  - `Footer.jsx` — Footer dengan connection status badge
- ✅ **API Setup** (`src/api/client.js`):
  - Axios client dengan JWT interceptor
  - Auto-logout pada 401
- ✅ **Data Fetching Hooks** (`src/hooks/useApi.js`):
  - TanStack Query hooks untuk menu, orders, stock, dashboard
  - Auto-refetch untuk realtime orders
- ✅ **App.jsx** — Routing dengan protected routes + Header/Footer
- ✅ **LoginPage.jsx** — Updated dengan design tokens

### Akan Dilakukan Berikutnya (Optional)
- MenuPage — Refactor dengan SearchInput, FilterPill
- CartPage — Styling design tokens
- OrdersPage — Tabel dengan design system
- BillingPage — Receipt preview styling
- StockPage — KPI cards + modal mutasi
- DashboardPage — KPI cards + Chart.js

## 🎨 Design Tokens Tersedia

### Warna Semantik
- **Primary**: `#9f3c16` (aksi utama, harga)
- **Secondary**: `#2c694e` (status aman/lunas)
- **Tertiary**: `#815215` (status menipis/pending)
- **Error**: `#ba1a1a` (status habis/error)
- **Surface**: `#fff8f6` (background halaman)

### Tipografi
- **Display**: `font-display-lg` (3.5rem, bold)
- **Headline**: `font-headline-lg/md` (serif, Playfair)
- **Title**: `font-title-lg/md` (sans-serif, Plus Jakarta)
- **Body**: `font-body-lg/md/sm` (regular text)
- **Label**: `font-label-lg/md` (tombol, uppercase)
- **Currency**: `font-currency-md` (harga)

### Spacing
- `space-xs` (0.25rem), `space-sm` (0.5rem), `space-md` (1rem)
- `space-lg` (1.5rem), `space-xl` (2rem), `space-2xl` (3rem)
- `margin` (1rem), `gutter` (1rem)

## 📝 Cara Pakai Komponen

```jsx
import { Card, Badge, Button, SearchInput, FilterPill, KpiCard, Modal } from '@/components/ui';

// Card
<Card className="p-space-lg">Konten card</Card>

// Badge status
<Badge status="lunas">Lunas</Badge>

// Button
<Button variant="primary" icon={ShoppingCart}>Checkout</Button>

// Search
<SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari..." />

// Filter pill
<FilterPill active={isActive} onClick={() => {}}>Filter</FilterPill>

// KPI Card
<KpiCard label="Total Omset" value="Rp 4.850.000" icon={TrendingUp} trend="+12% hari ini" />

// Modal
<Modal open={open} onClose={onClose} title="Sesuaikan Stok">
  {/* form content */}
</Modal>
```

## 🔗 Import Path

- Komponen UI: `@/components/ui/` atau `../../components/ui/`
- Layout: `@/components/layout/`
- Hooks: `@/hooks/useApi.js`
- API Client: `@/api/client.js`

## 📱 Responsive Breakpoints

Gunakan Tailwind breakpoints standar:
- `md:` — tablet
- `lg:` — desktop

Contoh: `px-margin md:px-margin-tablet lg:px-margin-desktop`

## ✨ Next Steps

1. Refactor halaman existing (Menu, Cart, Orders, Billing, Stock, Dashboard) dengan komponen UI baru
2. Validasi warna & spacing di browser
3. Setup env `.env` untuk API URL
4. Build & test responsive design
