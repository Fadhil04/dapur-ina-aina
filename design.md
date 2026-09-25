# Design System — Dapur Ina Aina (React + Vite)

Dokumen ini merangkum design system dari 4 mockup resmi (Menu & Pemesanan Pelanggan, Manajemen Stok & Mutasi, Billing & Pembayaran Kasir, Dashboard Analitik) yang telah diadaptasi untuk stack **React 18/19 + Vite + Tailwind CSS (build step) + Lucide Icons + Chart.js**.

**Cara pakai dokumen ini:** setiap komponen/halaman React (`LoginPage`, `MenuPage`, `CartPage`, `OrdersPage`, `BillingPage`, `StockPage`, `DashboardPage`) WAJIB mengikuti token warna, tipografi, komponen, dan pola layout di bawah ini — bukan style Tailwind default.

> **Asumsi ikon:** dokumen ini memakai **Lucide Icons** (`lucide-react`) sebagai pengganti Material Symbols dari mockup asli, karena lebih idiomatis untuk stack React. Mapping nama ikon Material Symbols → Lucide ada di Bagian 8. Jika ternyata ingin tetap Material Symbols, tinggal impor font-nya di `index.html` dan pakai `<span className="material-symbols-outlined">` seperti biasa — struktur lain di dokumen ini tidak berubah.

---

## 1. Setup Teknis Wajib

### 1.1 `frontend/index.html`
```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dapur Ina Aina</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
</head>
<body class="bg-surface text-on-surface antialiased">
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

### 1.2 `frontend/tailwind.config.js`
Salin persis token dari mockup (jangan improvisasi warna baru):
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#9f3c16",
        "on-primary": "#ffffff",
        "primary-container": "#bf542c",
        "on-primary-container": "#fffbff",
        "primary-fixed": "#ffdbcf",
        "primary-fixed-dim": "#ffb59c",
        "on-primary-fixed": "#390c00",
        "on-primary-fixed-variant": "#822801",
        "inverse-primary": "#ffb59c",

        secondary: "#2c694e",
        "on-secondary": "#ffffff",
        "secondary-container": "#aeeecb",
        "on-secondary-container": "#316e52",
        "secondary-fixed": "#b1f0ce",
        "secondary-fixed-dim": "#95d4b3",
        "on-secondary-fixed": "#002114",
        "on-secondary-fixed-variant": "#0e5138",

        tertiary: "#815215",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#9d6a2c",
        "on-tertiary-container": "#fffbff",
        "tertiary-fixed": "#ffdcbb",
        "tertiary-fixed-dim": "#faba75",
        "on-tertiary-fixed": "#2b1700",
        "on-tertiary-fixed-variant": "#673d00",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        background: "#fff8f6",
        "on-background": "#221a18",
        surface: "#fff8f6",
        "on-surface": "#221a18",
        "surface-variant": "#efdfdb",
        "on-surface-variant": "#57423b",
        "surface-dim": "#e6d7d3",
        "surface-bright": "#fff8f6",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fff1ed",
        "surface-container": "#fbeae7",
        "surface-container-high": "#f5e5e1",
        "surface-container-highest": "#efdfdb",

        outline: "#8a726a",
        "outline-variant": "#dec0b7",
        "inverse-surface": "#372e2c",
        "inverse-on-surface": "#fdedea",
        "surface-tint": "#a23e18",
      },
      borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
      spacing: {
        "space-xs": "0.25rem", "space-sm": "0.5rem", "space-md": "1rem",
        "space-lg": "1.5rem", "space-xl": "2rem", "space-2xl": "3rem",
        margin: "1rem", "margin-tablet": "1.5rem", "margin-desktop": "2.5rem",
        gutter: "1rem", "gutter-tablet": "1.25rem", "gutter-desktop": "1.5rem",
      },
      fontFamily: {
        "display-lg": ["Playfair Display", "serif"],
        "headline-lg": ["Playfair Display", "serif"],
        "headline-lg-mobile": ["Playfair Display", "serif"],
        "headline-md": ["Playfair Display", "serif"],
        "title-lg": ["Plus Jakarta Sans", "sans-serif"],
        "title-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-sm": ["Plus Jakarta Sans", "sans-serif"],
        "label-lg": ["Plus Jakarta Sans", "sans-serif"],
        "label-md": ["Plus Jakarta Sans", "sans-serif"],
        "currency-md": ["Plus Jakarta Sans", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["3.5rem", { lineHeight: "4rem", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["2.25rem", { lineHeight: "2.75rem", fontWeight: "600" }],
        "headline-lg-mobile": ["1.75rem", { lineHeight: "2.25rem", fontWeight: "600" }],
        "headline-md": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        "title-lg": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "700" }],
        "title-md": ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        "body-lg": ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "body-md": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        "body-sm": ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }],
        "label-lg": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.01em", fontWeight: "600" }],
        "label-md": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.04em", fontWeight: "600" }],
        "currency-md": ["1.125rem", { lineHeight: "1.5rem", letterSpacing: "-0.01em", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};
```

### 1.3 `frontend/src/styles/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root { margin: 0; padding: 0; height: 100%; }
  body { overscroll-behavior: none; }
}

::-webkit-scrollbar { display: none; }
```
Import di `main.jsx`: `import './styles/index.css';`

### 1.4 Ikon (Lucide)
```jsx
import { ShoppingBag, Search, Plus, Minus, Check } from 'lucide-react';

<ShoppingBag size={20} className="text-on-surface-variant" />
```
Ukuran default yang dipakai di mockup: **16px** (badge/inline), **18-20px** (tombol/aksi tabel), **24-28px** (KPI card icon holder).

### 1.5 Chart.js Setup
```bash
npm install chart.js react-chartjs-2
```
Warna chart WAJIB pakai token yang sama: bar utama `#9f3c16` (primary), bar highlight hari ini bisa solid, bar lain diberi opacity lebih rendah (lihat 5.7).

---

## 2. Palet Warna Semantik (dipakai di semua komponen)

| Konteks | Token Tailwind |
|---|---|
| Aksi utama (tombol primer, harga, total) | `primary` / `on-primary` |
| Status Aman / Lunas / Tersedia / berhasil | `secondary` / `secondary-container` / `on-secondary-container` |
| Status Menipis / Pending / Menunggu | `tertiary` / `tertiary-fixed` / `on-tertiary-fixed-variant` |
| Status Habis / Kritis / Error / gagal | `error` / `error-container` / `on-error-container` |
| Background halaman | `surface` (`#fff8f6`) |
| Card/panel | `surface-container-lowest` (putih) di atas `surface-container-low` |
| Teks sekunder/caption | `on-surface-variant` |
| Border/divider halus | `outline-variant`, `surface-variant` |

---

## 3. Layout Global (React Components)

### 3.1 `components/layout/Header.jsx`
- `fixed top-0 left-0 right-0 z-50 h-20 bg-surface/90 backdrop-blur-xl shadow-[0_2px_12px_rgba(36,28,26,0.06)]`.
- Isi: logo+nama toko (kiri), `<nav>` dari `react-router-dom` `<NavLink>` (tengah, `hidden lg:flex`), info user (kanan).
- Nav item **dinamis berdasarkan `AuthContext`**:
  - Belum login: `Menu`, `Keranjang`, tombol "Login Kasir/Admin" → `/login`.
  - Role `cashier`: tambah `Pesanan Masuk` (`/orders`), `Dashboard` (`/dashboard`).
  - Role `admin`: tambah semua di atas + `Kelola Stok` (`/stock`).
- Gunakan `<NavLink>` dengan `className={({isActive}) => isActive ? 'bg-primary text-on-primary ...' : 'text-on-surface-variant ...'}` untuk state aktif (persis seperti `aria-current="page"` di mockup dashboard).
- Badge realtime status koneksi backend (opsional): fetch `/api/health` sekali saat mount, tampilkan dot hijau/merah.

### 3.2 Konten Utama (tiap Page component)
```jsx
<main className="w-full pt-20 bg-surface flex-1 min-h-screen">
  <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl flex flex-col gap-space-lg">
    {/* konten halaman */}
  </div>
</main>
```

### 3.3 `components/layout/Footer.jsx`
```jsx
<footer className="w-full bg-surface-container-low mt-auto shadow-[0_-2px_10px_rgba(36,28,26,0.03)]">
  <div className="w-full px-margin-desktop py-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
    <div className="flex flex-col md:flex-row items-center gap-space-sm text-center md:text-left">
      <span>{/* alamat restoran */}</span>
      <span className="hidden md:inline text-outline-variant">•</span>
      <span>{/* jam operasional */}</span>
    </div>
    <ConnectionStatusBadge /> {/* komponen kecil, fetch GET /api/health */}
  </div>
</footer>
```
`ConnectionStatusBadge` mencerminkan status koneksi backend/DB **sungguhan**, bukan teks statis.

### 3.4 `App.jsx` — Struktur Routing
```jsx
<BrowserRouter>
  <Header />
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/menu" element={<MenuPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:id/billing" element={<BillingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/stock" element={<StockPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/menu" replace />} />
  </Routes>
  <Footer />
</BrowserRouter>
```

---

## 4. Komponen UI Reusable (`components/ui/`)

### 4.1 `Card.jsx`
```jsx
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
}
```
Variant panel tabel besar: tambahkan `shadow-[0_4px_20px_rgba(36,28,26,0.05)]`.

### 4.2 `Badge.jsx`
```jsx
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
```

### 4.3 `Button.jsx`
```jsx
export function Button({ variant = 'primary', icon: Icon, children, className = '', ...props }) {
  const base = 'px-4 py-2.5 rounded-xl font-label-lg text-label-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container shadow-sm hover:shadow',
    secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90 shadow-sm',
    neutral: 'bg-surface-container-high hover:bg-surface-variant text-on-surface',
    disabled: 'bg-surface-dim text-outline cursor-not-allowed',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}
```

### 4.4 `SearchInput.jsx`
```jsx
import { Search } from 'lucide-react';

export function SearchInput({ value, onChange, placeholder }) {
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
```

### 4.5 `FilterPill.jsx` (kategori/status)
```jsx
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
```

### 4.6 DataTable pattern
- Gunakan `<table>` biasa (tanpa library eksternal, agar mudah styling manual sesuai mockup) + map data dari TanStack Query.
- Header: `className="bg-surface-container-high/60 text-on-surface-variant font-label-md uppercase tracking-wider"`.
- Baris: `className="hover:bg-surface-container-low/60 transition-colors"`, tanpa border (`divide-y-0`).
- Kolom uang: `font-currency-md text-currency-md text-right`.
- Sertakan komponen `<EmptyState />` dan `<LoadingSkeleton />` untuk state `isLoading`/data kosong dari React Query.

### 4.7 `KpiCard.jsx`
```jsx
export function KpiCard({ label, value, icon: Icon, trend, iconColor = 'primary' }) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{label}</span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-display-lg text-headline-lg text-on-surface">{value}</span>
        </div>
        {trend && (
          <div className="mt-space-md">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/60 text-on-secondary-container font-label-md text-label-md">
              {trend}
            </span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-${iconColor}`}>
        <Icon size={26} />
      </div>
    </Card>
  );
}
```

### 4.8 `Modal.jsx` (slide-over drawer)
```jsx
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
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
```
Dipakai untuk modal "Sesuaikan Stok" di `StockPage`.

### 4.9 Toast Notification
Boleh pakai state global sederhana (Context) atau library ringan (`react-hot-toast`). Styling manual jika tanpa library:
```jsx
<div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-on-surface text-inverse-on-surface px-4 py-3 rounded-2xl shadow-2xl">
  <CheckCircle size={22} className="text-secondary" />
  <div className="flex flex-col">
    <span className="font-label-lg font-bold">{title}</span>
    <span className="font-body-sm text-outline-variant">{message}</span>
  </div>
</div>
```

---

## 5. Spesifikasi Per Halaman (React Pages)

### 5.1 `MenuPage.jsx` — Publik, tanpa login
- Data via `useMenu()` hook (TanStack Query → `GET /api/menu`).
- Layout grid 12 kolom: katalog `lg:col-span-8`, keranjang **sticky** `lg:col-span-4 sticky top-24` (state cart disimpan di **React Context/`CartContext`**, bukan session backend seperti versi EJS — baru dikirim ke backend saat checkout).
- Card menu (`grid md:grid-cols-2`): foto `h-48 object-cover rounded-t-2xl`, badge stok (Badge component: `aman`/`menipis`/`habis`), nama+harga, deskripsi `line-clamp-2`, tombol "+ Tambah ke Keranjang" (disabled jika stok 0).
- Filter kategori pakai `FilterPill`, search pakai `SearchInput` (filter client-side dari data yang sudah di-fetch, atau query param ke backend).

### 5.2 `CartPage.jsx` — Publik
- Ambil isi cart dari `CartContext`.
- Form wajib: **Nama Pelanggan**, **Nomor Meja** (`react-hook-form` disarankan untuk validasi, atau `useState` manual).
- List item cart dengan counter `+/-` (update state context), subtotal per item, total besar.
- Submit → `POST /api/cart/checkout` (React Query `useMutation`), on success: kosongkan cart, tampilkan invoice number, tombol "Kembali ke Menu".

### 5.3 `LoginPage.jsx` — Publik
- Card `max-w-sm mx-auto` di tengah, form `username`/`password`.
- Submit → `POST /api/auth/login` (`useMutation`), simpan `token` dari response ke `AuthContext` (state + `localStorage`), redirect ke `/orders` via `useNavigate()`.
- Error 401 → tampilkan box `bg-error-container text-error rounded-xl p-3`.

### 5.4 `OrdersPage.jsx` — Kasir/Admin (Protected)
- `useOrders()` hook → `GET /api/orders` (dengan `Authorization: Bearer <token>` di axios interceptor), auto-refetch tiap beberapa detik (`refetchInterval` di React Query) supaya pesanan baru dari pelanggan langsung muncul (mendekati "realtime" seperti di mockup Dashboard).
- Tabel: Invoice, Nama Pelanggan, No. Meja, Waktu Masuk, Jumlah Item, Total, Status (`Badge`), Aksi ("Proses Bayar" → `navigate('/orders/:id/billing')`).

### 5.5 `BillingPage.jsx` — Kasir/Admin (Protected)
- Layout grid: panel kiri `lg:col-span-7` (rincian item + form pembayaran), kanan `lg:col-span-5` (preview struk).
- Tab switcher Tunai/Non-Tunai pakai `useState('TUNAI' | 'NON_TUNAI')`.
- Kalkulasi kembalian **real-time** dengan `useMemo`/`useEffect` saat input uang berubah — tidak perlu manipulasi DOM manual seperti versi vanilla JS, cukup state React.
- Preview struk: komponen terpisah `ReceiptPreview.jsx`, styling **monospace**, efek tepi bergerigi (`radial-gradient` inline style seperti mockup), tombol "Cetak 80mm" → `window.print()` dengan CSS `@media print` untuk sembunyikan elemen lain.
- Submit pembayaran → `POST /api/orders/:id/pay` (`useMutation`), invalidate query `orders` & `stock` setelah sukses (`queryClient.invalidateQueries`).

### 5.6 `StockPage.jsx` — Admin only (Protected)
- 4 `KpiCard` (Total Menu, Stok Aman, Stok Menipis, Stok Habis) — dihitung dari data `useStock()` di client atau endpoint agregat terpisah.
- Toolbar: `SearchInput` + `FilterPill` kategori + `<select>` status.
- Tabel inventaris + tombol "Sesuaikan (+/-)" membuka `Modal` (4.8) berisi form mutasi stok (radio TAMBAH/KOREKSI/RUSAK, input qty dengan tombol cepat, preview kalkulasi via `useState`, textarea catatan wajib).
- Submit → `POST /api/stock/update` (`useMutation`), refetch tabel & KPI.
- (Opsional lanjutan) Panel Riwayat Mutasi terpisah di bawah, dari endpoint `GET /api/stock/:id/movements`.

### 5.7 `DashboardPage.jsx` — Kasir/Admin (Protected)
- 4 `KpiCard` ringkasan dari `GET /api/dashboard/summary`.
- **Bar chart 7 hari** pakai `react-chartjs-2`:
```jsx
<Bar
  data={{
    labels: ['Sen','Sel','Rab','Kam','Jum','Sab','Min'],
    datasets: [{
      data: omzetHarian,
      backgroundColor: omzetHarian.map((_, i) => i === todayIndex ? '#9f3c16' : 'rgba(159,60,22,0.5)'),
      borderRadius: 8,
    }],
  }}
  options={{ plugins: { legend: { display: false } }, scales: { y: { grid: { borderDash: [4,4] } } } }}
/>
```
- Panel distribusi metode pembayaran: progress bar horizontal manual (`div` dengan `style={{width: '58%'}}`), bukan chart — sesuai mockup.
- List "Perhatian Stok Menipis" & "Menu Paling Laris" — reuse pola card kecil dari mockup (progress bar tipis `h-1.5` untuk kontribusi).
- Tabel antrean pesanan full-width di bawah (reuse logic mirip `OrdersPage` tapi ringkas).

---

## 6. State Management & Data Fetching

| Kebutuhan | Solusi |
|---|---|
| Data server (menu, orders, stock) | **TanStack Query** — `useQuery`/`useMutation`, auto cache & refetch |
| Auth state (token, user, role) | **React Context** (`AuthContext`) + persist token ke `localStorage` |
| Cart pelanggan (belum checkout) | **React Context** (`CartContext`), in-memory (hilang saat refresh — bisa persist ke `localStorage` jika mau) |
| Form input (login, checkout, mutasi stok) | `useState` biasa untuk form sederhana; `react-hook-form` opsional untuk validasi kompleks |

### 6.1 `api/client.js` (axios + interceptor JWT)
```js
import axios from 'axios';

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;
```

---

## 7. Prinsip Interaksi & Motion
- Transisi standar: `transition-all` / `transition-colors` pada hover/active.
- Tombol primer: `active:scale-[0.98]` untuk feedback tekan.
- Status "live"/realtime: dot kecil `animate-pulse`; status urgent (stok habis, LUNAS baru): `animate-ping` sesekali.
- Hover row tabel: `hover:bg-surface-container-low/60`.
- Loading state tombol: gunakan `disabled={isPending}` dari `useMutation`, ganti isi jadi `<Loader2 className="animate-spin" size={18} />` + teks "Memproses...".
- Loading state halaman/tabel: skeleton sederhana (`animate-pulse bg-surface-container-high rounded`) selama `isLoading`.

---

## 8. Mapping Ikon: Material Symbols (mockup) → Lucide

| Material Symbols | Lucide (`lucide-react`) | Dipakai di |
|---|---|---|
| `shopping_bag` | `ShoppingBag` | Header, cart |
| `search` | `Search` | Search bar |
| `add_shopping_cart` | `ShoppingCart` (+`Plus` jika perlu kombinasi) | Card menu |
| `table_restaurant` / `deck` | `UtensilsCrossed` atau `Table` (custom) | Info meja |
| `person` | `User` | Form nama pelanggan |
| `receipt_long` | `Receipt` | Billing, riwayat |
| `payments` | `Wallet` | Tab pembayaran tunai |
| `qr_code_scanner` | `QrCode` | Tab non-tunai |
| `check_circle` | `CheckCircle` | Sukses/toast |
| `warning` | `AlertTriangle` | Peringatan stok |
| `block` | `Ban` | Status habis |
| `inventory_2` | `Package` | Stok/mutasi tambah |
| `delete` / `remove_shopping_cart` | `Trash2` | Rusak/hapus |
| `tune` | `SlidersHorizontal` | Tombol "Sesuaikan" |
| `history` | `History` | Riwayat mutasi |
| `edit_note` | `PenLine` | Edit |
| `print` | `Printer` | Cetak struk |
| `share` | `Share2` | Bagikan struk |
| `logout` | `LogOut` | Header |
| `trending_up` / `arrow_upward` | `TrendingUp` | KPI trend |
| `pending_actions` | `Clock` | Status pending |
| `military_tech` | `Award` | Menu terlaris |
| `notification_important` | `BellRing` | Alert stok kritis |
| `close` | `X` | Modal close |
| `chevron_left` / `chevron_right` | `ChevronLeft` / `ChevronRight` | Pagination |
| `add` / `remove` | `Plus` / `Minus` | Counter qty |

---

## 9. Ringkasan Mapping Mockup → Komponen React

| Mockup | File React | Route | Akses |
|---|---|---|---|
| Buku Menu & Pemesanan | `pages/MenuPage.jsx` + `pages/CartPage.jsx` | `/menu`, `/cart` | Publik |
| Manajemen Stok & Mutasi | `pages/StockPage.jsx` + `components/ui/Modal.jsx` | `/stock` | Admin |
| Billing & Pembayaran | `pages/BillingPage.jsx` + `components/ReceiptPreview.jsx` | `/orders/:id/billing` | Kasir/Admin |
| Dashboard Analitik | `pages/DashboardPage.jsx` | `/dashboard` | Kasir/Admin |
| (turunan gaya sama) | `pages/LoginPage.jsx`, `pages/OrdersPage.jsx` | `/login`, `/orders` | — |

---

**Catatan untuk AI Agent yang mengimplementasikan:** gunakan token warna & pola komponen di atas apa adanya. Semua badge status, angka KPI, dan data tabel harus berasal dari response API backend (via TanStack Query hooks di Bagian 6), **bukan data dummy** seperti contoh di mockup asli ("Siti Rahma", "Rp 4.850.000", dst).
