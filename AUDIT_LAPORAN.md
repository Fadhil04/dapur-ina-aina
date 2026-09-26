# 🔍 LAPORAN AUDIT MENYELURUH — Dapur Ina Aina
**Tanggal Audit:** 26 September 2026
**Stack:** React + Vite (Frontend) | Express.js + PostgreSQL (Backend)

---

## A. RINGKASAN EKSEKUTIF

Berikut 10 temuan paling kritis, diurutkan dari yang paling berbahaya:

1. 🔴 **[BUG KRITIS] Pembayaran non-tunai selalu gagal 500 Error** — Constraint DB `payment_check` mensyaratkan `cash_received IS NOT NULL` untuk TUNAI. Saat ini ada kode yang masih mencoba memasukkan nilai ke `card_type` sebagai enum padahal kolom itu sudah menjadi `VARCHAR`.

2. 🔴 **[BUG KRITIS] Import path ambigu `components/ui`** — Ada dua path: `components/ui.js` (barrel lengkap) dan `components/ui/index.jsx` (hanya 5 komponen). Vite memprioritaskan folder, menyebabkan `Modal`, `Toast`, `EmptyState` tidak ditemukan → halaman crash.

3. 🔴 **[BUG KRITIS] Nama user selalu kosong di Header** — JWT menyimpan `name_user` tapi `Header.jsx` mengakses `user.name` (undefined).

4. 🔴 **[KEAMANAN] Tidak ada rate limiting di endpoint login** — Rate limit global 300 req/15 menit tidak cukup — attacker bisa mencoba 300 password dalam 15 menit.

5. 🔴 **[KEAMANAN] `SESSION_SECRET` menggunakan nilai placeholder** — `.env` menggunakan `ganti_dengan_string_acak_yang_panjang` yang mudah ditebak jika tidak diganti.

6. 🟡 **[BUG] Dashboard "Menu Terlaris" selalu "—"** — `dashboardController.js` tidak menghitung `top_menu` dan `revenue_growth` yang diharapkan frontend.

7. 🟡 **[INKONSISTENSI DESAIN] `StockPage.jsx` menggunakan design system berbeda** — Menggunakan `text-gray-500`, `bg-white` biasa, bukan design tokens kustom (`text-on-surface`, `bg-surface`).

8. 🟡 **[UX] Tidak ada konfirmasi sebelum nonaktifkan menu** — Tombol hapus langsung mengeksekusi tanpa dialog konfirmasi.

9. 🟢 **[PERFORMA] N+1 Query di `orderModel.findById`** — 3 query sequential untuk billing page yang bisa dijadikan lebih efisien.

10. 🟢 **[UX] Tidak ada fitur pencarian di halaman Orders** — Kasir harus scroll manual untuk mencari pesanan tertentu.

---

## B. TABEL TEMUAN

| No | Area | Temuan | Keparahan | Dampak ke Pengguna |
|---|---|---|---|---|
| 1 | Kode | Pembayaran DEBIT/KREDIT/QRIS gagal 500 — sisa kode mencoba insert `card_type` sebagai enum padahal kolom sudah VARCHAR; juga `cash_received` tidak dikirim benar untuk non-TUNAI | **Kritis** | Kasir tidak bisa proses pembayaran non-tunai |
| 2 | Kode | Import path ambigu `../../components/ui` — Vite resolve ke folder `ui/index.jsx` yang tidak ekspor `Modal`, `Toast`, `EmptyState`, `LoadingCardSkeleton` | **Kritis** | Halaman Buat Pesanan, Billing, Login crash total |
| 3 | Kode | Header.jsx baris 103: `user.name` tapi JWT payload berisi `name_user` | **Kritis** | Nama pengguna selalu kosong di header |
| 4 | Keamanan | Endpoint `/auth/login` tidak ada rate limiting khusus — hanya rate limit global 300/15 menit | **Tinggi** | Rentan brute-force password kasir/admin |
| 5 | Keamanan | `SESSION_SECRET` di `.env.example` masih nilai placeholder | **Tinggi** | Session bisa diprediksi jika tidak diganti di produksi |
| 6 | Kode | `dashboardController.js` tidak menghitung `top_menu` dan `revenue_growth` yang ditampilkan frontend | **Tinggi** | KPI Card "Menu Terlaris" selalu "—" |
| 7 | UI | `StockPage.jsx` pakai design system berbeda: `text-gray-500`, `bg-white`, `border-gray-200` vs halaman lain | **Sedang** | Halaman Stok terlihat seperti aplikasi berbeda |
| 8 | UX | Tidak ada konfirmasi sebelum nonaktifkan menu di StockPage | **Sedang** | Admin bisa tidak sengaja hapus menu aktif |
| 9 | Performa | N+1 Query di `orderModel.findById` — 3 query sequential: order, items, payment | **Sedang** | Halaman billing lambat di traffic tinggi |
| 10 | UX | Tidak ada fitur pencarian di halaman Orders | **Sedang** | Kasir harus scroll untuk cari pesanan tertentu |
| 11 | UI | `StockPage` modal `MenuModal` dan `AdjustModal` menggunakan `bg-white` hardcoded | **Rendah** | Modal tidak mengikuti tema aplikasi |
| 12 | Kode | `formatRupiah()` dan `formatDate()` didefinisikan ulang di 5+ file | **Rendah** | Duplikasi kode, sulit di-maintain |
| 13 | Kode | `generateInvoiceNumber()` menggunakan `Math.random()` — bukan UUID/sequence resmi | **Rendah** | Sangat jarang, tapi bisa duplikat invoice di traffic ekstrem |
| 14 | Performa | Tidak ada caching di endpoint dashboard — setiap request hit DB | **Sedang** | Dashboard lambat saat banyak pengguna bersamaan |
| 15 | UX | Pesan error hanya teks merah tanpa ikon atau animasi yang menonjol | **Rendah** | User mungkin tidak langsung melihat error |
| 16 | Kode | Tidak ada unit test / integration test sama sekali di seluruh project | **Sedang** | Bug regression tidak terdeteksi otomatis |
| 17 | Keamanan | Error handler tidak dikonfigurasi untuk hide stack trace di production | **Sedang** | Stack trace bisa bocor info internal ke attacker |
| 18 | UI | Pagination belum diimplementasikan di UI Orders — load semua pesanan sekaligus | **Sedang** | UI lambat jika ada ratusan pesanan |
| 19 | UX | Tidak ada notifikasi/suara saat pesanan baru masuk (hanya polling 5 detik) | **Rendah** | Kasir bisa melewatkan pesanan masuk |
| 20 | Kode | `backend/.env` mengandung password DB (`DB_PASSWORD=123`) yang sangat lemah | **Tinggi** | Risiko keamanan jika server terekspos |

---

## C. RENCANA PERBAIKAN DETAIL (STEP-BY-STEP)

---

### PERBAIKAN #1: Fix Pembayaran Non-Tunai (Error 500)

**Mengapa ini penting:**
Setiap pembayaran DEBIT/KREDIT/QRIS gagal dengan HTTP 500. Kasir tidak bisa menyelesaikan transaksi non-tunai.

**File yang terdampak:**
- `backend/src/controllers/paymentController.js` (baris 8-14 dan 85-94)
- `backend/src/models/paymentModel.js`

**Root cause dari log error:**
```
error: invalid input value for enum card_type_enum: "QRIS"
  → Ada kode yang memasukkan string ke kolom card_type yang dianggap enum

error: payment_check constraint violation
  → cash_received dikirim NULL untuk TUNAI, padahal constraint mensyaratkan NOT NULL
```

**Schema DB yang sebenarnya (hasil audit):**
- `payment_method`: enum `(TUNAI, DEBIT, KREDIT, QRIS)` ✅
- `card_type`: `VARCHAR` (bukan enum) ✅
- Constraint: `IF payment_method = 'TUNAI' THEN cash_received IS NOT NULL AND cash_received >= amount_paid`

**Langkah eksekusi:**

1. Buka `backend/src/controllers/paymentController.js`
2. Ganti `paySchema` (baris 8-14) menjadi versi yang lebih simpel (hapus field yang tidak dipakai):

```js
// SESUDAH — ganti paySchema:
const paySchema = z.object({
  payment_method: z.enum(['TUNAI', 'DEBIT', 'KREDIT', 'QRIS'], {
    errorMap: () => ({ message: 'Metode pembayaran tidak valid' }),
  }),
  amount_paid: z.coerce.number().positive('Nominal bayar harus lebih dari 0'),
});
```

3. Di fungsi `processPayment`, ganti blok `Payment.create(...)` (baris 85-94):

```js
// SESUDAH — ganti Payment.create(...):
await Payment.create({
  id_order:      orderId,
  payment_method,
  amount_paid:   order.total_amount,
  cash_received: payment_method === 'TUNAI' ? Number(amount_paid) : null,
  change_amount: changeAmount,
}, client);
```

4. Buka `backend/src/models/paymentModel.js`
5. Ganti seluruh isi fungsi `create` agar tidak include `card_type`:

```js
async create(
  { id_order, payment_method, amount_paid, cash_received = null, change_amount = null },
  client = pool
) {
  const { rows } = await client.query(
    `INSERT INTO payment
       (id_order, payment_method, amount_paid, cash_received, change_amount)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id_order, payment_method, amount_paid, cash_received, change_amount]
  );
  return rows[0];
},
```

**Kriteria selesai:**
- Bayar dengan DEBIT → response `{ success: true }`, status pesanan jadi LUNAS, tidak ada error 500
- Bayar dengan QRIS → sama
- Bayar dengan TUNAI → tetap berfungsi normal dengan kembalian
- Log backend tidak menunjukkan error constraint atau enum

**Perkiraan effort:** Kecil (30 menit)
**Prioritas:** 🔴 KRITIS — kerjakan pertama

---

### PERBAIKAN #2: Fix Nama User Kosong di Header

**Mengapa ini penting:**
Header menampilkan nama kosong karena `user.name` tidak ada — JWT menyimpan `name_user`.

**File yang terdampak:**
- `frontend/src/components/layout/Header.jsx` (baris 103)

**Langkah eksekusi:**

1. Buka `frontend/src/components/layout/Header.jsx`
2. Cari baris 103: `<span className="text-on-surface-variant">{user.name}</span>`
3. Ganti dengan: `<span className="text-on-surface-variant">{user.name_user}</span>`

**Kriteria selesai:**
- Login sebagai admin → header menampilkan "Administrator • 👑 Admin"
- Login sebagai kasir → header menampilkan "Kasir Satu • 💳 Kasir"

**Perkiraan effort:** Sangat kecil (5 menit)
**Prioritas:** 🔴 KRITIS

---

### PERBAIKAN #3: Fix Dashboard "Menu Terlaris" Selalu "—"

**Mengapa ini penting:**
`dashboardController.js` tidak menghitung `top_menu` dan `revenue_growth` yang ditampilkan frontend, sehingga informasi analitik tidak akurat.

**File yang terdampak:**
- `backend/src/controllers/dashboardController.js` (fungsi `getStats`, baris 4-35)

**Langkah eksekusi:**

1. Buka `backend/src/controllers/dashboardController.js`
2. Di dalam fungsi `getStats`, setelah `lowStockResult`, tambahkan dua query baru:

```js
// Tambahkan setelah lowStockResult:
const topMenuResult = await pool.query(`
  SELECT mi.name_menu, SUM(oi.quantity) AS sold_qty
  FROM order_item oi
  JOIN menu_item mi ON mi.id_menu_item = oi.id_menu_item
  JOIN orders o ON o.id_order = oi.id_order
  WHERE o.status = 'LUNAS'
    AND o.created_at::date = CURRENT_DATE
  GROUP BY mi.name_menu
  ORDER BY sold_qty DESC
  LIMIT 1
`);

const growthResult = await pool.query(`
  SELECT
    COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE
      THEN total_amount ELSE 0 END), 0) AS today,
    COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE - 1
      THEN total_amount ELSE 0 END), 0) AS yesterday
  FROM orders
  WHERE status = 'LUNAS'
    AND created_at::date >= CURRENT_DATE - 1
`);

const todayRev     = parseFloat(growthResult.rows[0].today);
const yesterdayRev = parseFloat(growthResult.rows[0].yesterday);
const revenueGrowth = yesterdayRev > 0
  ? Math.round(((todayRev - yesterdayRev) / yesterdayRev) * 100)
  : null;
```

3. Di bagian `res.json(...)`, tambahkan dua field baru ke `data`:

```js
res.json({
  success: true,
  data: {
    pending_count:   parseInt(stats.pending_count),
    lunas_count:     parseInt(stats.lunas_count),
    revenue_today:   parseFloat(stats.revenue_today),
    low_stock:       lowStockResult.rows,
    top_menu:        topMenuResult.rows[0] || null,   // ← TAMBAHKAN
    revenue_growth:  revenueGrowth,                   // ← TAMBAHKAN
  },
});
```

**Kriteria selesai:**
- Dashboard menampilkan nama menu terlaris hari ini (bukan "—")
- Jika ada penjualan kemarin, muncul persentase pertumbuhan (misal "+15%")
- Jika belum ada penjualan hari ini, `top_menu` null, KPI Card menampilkan "—"

**Perkiraan effort:** Kecil (1 jam)
**Prioritas:** 🟡 Tinggi

---

### PERBAIKAN #4: Rate Limiting Khusus di Endpoint Login

**Mengapa ini penting:**
Tanpa rate limiting khusus, attacker bisa mencoba 300 kombinasi password dalam 15 menit dari 1 IP.

**File yang terdampak:**
- `backend/src/routes/authRoutes.js` (baris 8)

**Langkah eksekusi:**

1. Buka `backend/src/routes/authRoutes.js`
2. Di baris paling atas (setelah import), tambahkan:

```js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5,                    // maksimal 5 percobaan login per IP
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

3. Tambahkan `loginLimiter` sebagai middleware di route login:

```js
// SEBELUM:
router.post('/login', validate(authController.loginSchema), authController.login);

// SESUDAH:
router.post('/login', loginLimiter, validate(authController.loginSchema), authController.login);
```

**Kriteria selesai:**
- Login berhasil 1-5 kali → berfungsi normal
- Percobaan ke-6 dari IP yang sama dalam 15 menit → HTTP 429 dengan pesan error
- Setelah 15 menit → bisa login lagi

**Perkiraan effort:** Kecil (30 menit)
**Prioritas:** 🔴 SEGERA

---

### PERBAIKAN #5: Konsistensi Design System di StockPage

**Mengapa ini penting:**
`StockPage.jsx` menggunakan Tailwind class biasa sementara semua halaman lain menggunakan design tokens kustom. Halaman Stok terlihat seperti aplikasi berbeda.

**File yang terdampak:**
- `frontend/src/pages/admin/StockPage.jsx` (seluruh file)

**Langkah eksekusi — Ganti semua class CSS berikut:**

| Class Lama (Tailwind biasa) | Class Baru (Design Token) |
|---|---|
| `bg-white` | `bg-surface-container-lowest` |
| `text-gray-800` | `text-on-surface` |
| `text-gray-500` | `text-on-surface-variant` |
| `text-gray-600` | `text-on-surface-variant` |
| `border-gray-200` | `border-outline-variant` |
| `text-red-500` | `text-error` |
| `text-red-400` | `text-error` |
| `bg-red-50` | `bg-error-container` |
| `bg-gray-50` | `bg-surface-container-low` |
| `hover:bg-gray-50` | `hover:bg-surface-container-low` |
| `focus:ring-orange-400` | `focus:ring-primary/40` |
| `bg-orange-500` | `bg-primary` |
| `hover:bg-orange-600` | `hover:bg-primary-container` |
| `text-white` (tombol primary) | `text-on-primary` |
| `text-xs` | `font-label-md text-label-md` |
| `text-sm` | `font-body-md text-body-md` |
| `divide-gray-100` | `divide-outline-variant` |
| `font-medium` | `font-label-lg` |

Untuk header tabel (baris 184):
```jsx
// SEBELUM:
<tr className="bg-gray-50 text-xs text-gray-500 uppercase">

// SESUDAH:
<tr className="bg-surface-container-high/60 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant">
```

Untuk highlight stok rendah (baris 194):
```jsx
// SEBELUM:
<tr className={`bg-white hover:bg-gray-50 ... ${item.stock <= 5 ? 'bg-red-50 hover:bg-red-50' : ''}`}>

// SESUDAH:
<tr className={`hover:bg-surface-container-low/60 transition-colors ${item.stock <= 5 ? 'bg-error-container/20' : ''}`}>
```

**Kriteria selesai:**
- Halaman Stok memiliki warna, tipografi, dan border yang sama dengan halaman Orders dan Dashboard
- Modal tambah/edit menu mengikuti tema yang sama

**Perkiraan effort:** Sedang (2 jam)
**Prioritas:** 🟡 Jangka pendek

---

### PERBAIKAN #6: Ekstrak Fungsi Duplikat ke Utility File

**Mengapa ini penting:**
`formatRupiah()` dan `formatDate()` didefinisikan ulang di 5+ file. Jika format perlu diubah, harus edit banyak file.

**File yang terdampak:**
- Buat baru: `frontend/src/utils/format.js`
- Edit: `BillingPage.jsx`, `CreateOrderPage.jsx`, `StockPage.jsx`, `DashboardPage.jsx`, `OrderTable.jsx`, `StockHistoryPage.jsx`

**Langkah eksekusi:**

1. Buat file baru `frontend/src/utils/format.js` dengan isi:

```js
// frontend/src/utils/format.js

export function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n ?? 0);
}

export function formatDate(d) {
  return new Date(d).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
```

2. Di setiap file berikut, **hapus** definisi lokal `formatRupiah` / `formatDate`, lalu **tambahkan** import:

```js
import { formatRupiah, formatDate } from '../../utils/format';
// (sesuaikan path relatif tergantung lokasi file)
```

File yang perlu diupdate:
- `pages/admin/BillingPage.jsx` → hapus baris 9-15
- `pages/admin/CreateOrderPage.jsx` → hapus baris 9-11
- `pages/admin/StockPage.jsx` → hapus baris 10-12
- `pages/admin/DashboardPage.jsx` → hapus baris 12-14
- `components/admin/OrderTable.jsx` → hapus baris 5-7
- `pages/admin/StockHistoryPage.jsx` → hapus baris 13-15

**Kriteria selesai:**
- Hanya ada 1 definisi `formatRupiah` di seluruh project
- Semua halaman masih menampilkan harga dengan format IDR yang benar
- Tidak ada error import

**Perkiraan effort:** Kecil (1 jam)
**Prioritas:** 🟢 Jangka menengah

---

### PERBAIKAN #7: Konfirmasi Sebelum Nonaktifkan Menu

**Mengapa ini penting:**
Admin bisa tidak sengaja menonaktifkan menu yang sedang aktif karena tidak ada dialog konfirmasi.

**File yang terdampak:**
- `frontend/src/pages/admin/StockPage.jsx`

**Langkah eksekusi:**

1. Di `StockPage.jsx`, di dalam komponen `StockPage`, tambahkan fungsi `handleDelete` setelah fungsi `handleSaved`:

```jsx
const handleDelete = async (item) => {
  const confirmed = window.confirm(
    `Nonaktifkan menu "${item.name_menu}"?\n\nMenu yang dinonaktifkan tidak akan tampil di katalog pelanggan.`
  );
  if (!confirmed) return;
  try {
    await menuService.deactivate(item.id_menu_item);
    qc.invalidateQueries({ queryKey: ['stock'] });
    qc.invalidateQueries({ queryKey: ['menu'] });
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menonaktifkan menu.');
  }
};
```

2. Di baris import atas, tambahkan `Trash2` ke import dari lucide-react:

```js
import { Plus, Edit2, ArrowUpDown, History, Trash2 } from 'lucide-react'
```

3. Di kolom Aksi tabel (setelah tombol History, baris 210-212), tambahkan tombol hapus:

```jsx
<button
  onClick={() => handleDelete(item)}
  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors"
  title="Nonaktifkan Menu"
>
  <Trash2 size={14} />
</button>
```

**Kriteria selesai:**
- Klik tombol Trash → muncul dialog konfirmasi browser dengan nama menu
- Klik "OK" → menu dinonaktifkan, tabel refresh, menu tidak tampil lagi
- Klik "Cancel" → tidak ada perubahan

**Perkiraan effort:** Kecil (45 menit)
**Prioritas:** 🟡 Jangka pendek

---

### PERBAIKAN #8: Optimasi Query N+1 di `orderModel.findById`

**Mengapa ini penting:**
Setiap kali billing dibuka, ada 3 query sequential ke DB. Ini bisa dipercepat.

**File yang terdampak:**
- `backend/src/models/orderModel.js` (fungsi `findById`, baris 71-94)

**Langkah eksekusi:**

1. Ganti fungsi `findById` (baris 71-94) dengan:

```js
async findById(id, client = pool) {
  // JOIN order + payment sekaligus (2 query menjadi lebih efisien)
  const orderResult = await client.query(
    `SELECT
       o.id_order, o.invoice_number, o.customer_name, o.table_number,
       o.status, o.total_amount, o.created_at, o.updated_at,
       u.name_user AS kasir,
       p.id_payment,
       p.payment_method AS pay_method,
       p.amount_paid AS pay_amount,
       p.cash_received,
       p.change_amount,
       p.last_four,
       p.reference_no,
       p.paid_at
     FROM orders o
     LEFT JOIN users u ON u.id_user = o.id_user
     LEFT JOIN payment p ON p.id_order = o.id_order
     WHERE o.id_order = $1`,
    [id]
  );
  const row = orderResult.rows[0];
  if (!row) return null;

  // Pisahkan data payment dari data order
  const order = {
    id_order:       row.id_order,
    invoice_number: row.invoice_number,
    customer_name:  row.customer_name,
    table_number:   row.table_number,
    status:         row.status,
    total_amount:   row.total_amount,
    created_at:     row.created_at,
    updated_at:     row.updated_at,
    kasir:          row.kasir,
    payment: row.id_payment ? {
      id_payment:     row.id_payment,
      payment_method: row.pay_method,
      amount_paid:    row.pay_amount,
      cash_received:  row.cash_received,
      change_amount:  row.change_amount,
      last_four:      row.last_four,
      reference_no:   row.reference_no,
      paid_at:        row.paid_at,
    } : null,
  };

  // Ambil items (query terpisah karena 1-to-many)
  const itemResult = await client.query(
    'SELECT * FROM order_item WHERE id_order = $1',
    [id]
  );
  order.items = itemResult.rows;

  return order;
},
```

**Kriteria selesai:**
- Halaman billing tetap menampilkan semua data yang sama (invoice, pelanggan, items, payment)
- Di log backend saat billing dibuka, hanya muncul 2 query (bukan 3)

**Perkiraan effort:** Sedang (2 jam)
**Prioritas:** 🟢 Jangka menengah

---

### PERBAIKAN #9: Tambah Fitur Pencarian di Halaman Orders

**Mengapa ini penting:**
Kasir harus scroll manual untuk mencari pesanan. Di jam sibuk dengan banyak pesanan, ini membuang waktu.

**File yang terdampak:**
- `backend/src/models/orderModel.js` (fungsi `findAll`)
- `frontend/src/pages/admin/OrdersPage.jsx`

**Langkah eksekusi:**

**Backend — tambah filter search:**

1. Buka `backend/src/models/orderModel.js`, fungsi `findAll`
2. Tambahkan parameter `search` di signature: `async findAll({ status, page = 1, limit = 15, search } = {})`
3. Setelah blok `if (status) {...}`, tambahkan:

```js
if (search) {
  whereParams.push(`%${search}%`);
  whereClause += ` AND (o.customer_name ILIKE $${whereParams.length} OR o.invoice_number ILIKE $${whereParams.length})`;
}
```

4. Di `orderController.js` fungsi `listOrders`, ambil parameter `search`:

```js
const { status, page = 1, limit = 15, search } = req.query;
// ... lalu teruskan ke model:
const result = await Order.findAll({
  status: status && status !== 'ALL' ? status : undefined,
  page: parseInt(page),
  limit: parseInt(limit),
  search: search || undefined,
});
```

**Frontend — tambah SearchInput:**

5. Di `OrdersPage.jsx`, tambahkan state search:

```jsx
const [search, setSearch] = useState('');
```

6. Update `queryKey` dan `queryFn`:

```jsx
queryKey: ['orders', tab, search],
queryFn: () => orderService.getAll({
  status: tab !== 'ALL' ? tab : undefined,
  search: search || undefined,
}),
```

7. Tambahkan SearchInput di antara header dan tab filter:

```jsx
<SearchInput
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Cari nama pelanggan atau nomor invoice..."
/>
```

Import `SearchInput` dari `'../../components/ui'` (sudah tersedia).

**Kriteria selesai:**
- Ketik "budi" → hanya tampil pesanan atas nama "Budi"
- Ketik "INV-2026" → hanya tampil pesanan dengan invoice mengandung "INV-2026"
- Hapus teks pencarian → semua pesanan tampil kembali
- Pencarian tidak case-sensitive

**Perkiraan effort:** Sedang (2-3 jam)
**Prioritas:** 🟡 Jangka pendek

---

### PERBAIKAN #10: Peringatan SESSION_SECRET di .env.example

**Mengapa ini penting:**
Developer baru bisa copy-paste nilai placeholder ke production, membuat session dapat diprediksi.

**File yang terdampak:**
- `backend/.env.example`
- `RANGKUMAN_PROJEK.md` (bagian instalasi, baris 546-556)

**Langkah eksekusi:**

1. Buka `backend/.env.example`
2. Ganti:
```
SESSION_SECRET=ganti_dengan_string_acak_yang_panjang
```
Dengan:
```
# WAJIB DIGANTI! Generate dengan command berikut, lalu salin outputnya:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
SESSION_SECRET=GANTI_DENGAN_OUTPUT_COMMAND_DI_ATAS

# WAJIB DIGANTI! Sama seperti SESSION_SECRET:
JWT_SECRET=GANTI_DENGAN_OUTPUT_COMMAND_DI_ATAS
```

3. Di `RANGKUMAN_PROJEK.md`, bagian "Konfigurasi Environment", tambahkan blok peringatan:

```markdown
> ⚠️ **KEAMANAN PENTING:** Jangan gunakan nilai default. Generate secret yang aman:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```
> Salin hasilnya ke `SESSION_SECRET` dan `JWT_SECRET` di file `.env`
```

**Kriteria selesai:**
- `.env.example` memiliki instruksi jelas cara generate secret
- Nilai placeholder `ganti_dengan_...` sudah diganti dengan instruksi yang lebih eksplisit

**Perkiraan effort:** Sangat kecil (15 menit)
**Prioritas:** 🔴 Segera

---

## D. ROADMAP PRIORITAS

### 🔴 SEGERA (Kritis — Harus dikerjakan sekarang, sebelum go-live)

| No | Perbaikan | Estimasi | Dependen pada |
|---|---|---|---|
| #1 | Fix pembayaran non-tunai error 500 | 30 menit | - |
| #2 | Fix nama user kosong di Header | 5 menit | - |
| #4 | Rate limiting endpoint login | 30 menit | - |
| #10 | Warning SESSION_SECRET di .env | 15 menit | - |

**Total estimasi: ~1.5 jam**

---

### 🟡 JANGKA PENDEK (1–2 Minggu)

| No | Perbaikan | Estimasi | Dependen pada |
|---|---|---|---|
| #3 | Fix dashboard "Menu Terlaris" | 1 jam | - |
| #5 | Konsistensi design system StockPage | 2 jam | - |
| #7 | Konfirmasi sebelum hapus menu | 45 menit | - |
| #9 | Fitur pencarian di Orders | 2-3 jam | - |

**Total estimasi: ~7 jam**

---

### 🟢 JANGKA MENENGAH (1–3 Bulan)

| No | Perbaikan | Estimasi |
|---|---|---|
| #6 | Ekstrak formatRupiah ke utility | 1 jam |
| #8 | Optimasi N+1 query billing | 2 jam |
| — | Tambah unit test payment controller | 1 minggu |
| — | Caching Redis untuk dashboard stats | 1 minggu |
| — | Pagination UI di halaman Orders | 4 jam |
| — | Error handler hide stack trace di production | 1 jam |

---

### ⚪ NICE-TO-HAVE (Backlog)

| Fitur | Deskripsi |
|---|---|
| Notifikasi real-time | Suara/notifikasi saat pesanan baru masuk (WebSocket) |
| Invoice PDF | Export transaksi ke PDF yang bisa diunduh |
| Dark Mode penuh | Beberapa komponen masih hardcoded warna terang |
| PWA | Agar bisa diinstall sebagai app di tablet kasir |
| Multi-kasir report | Laporan per kasir (siapa yang paling banyak proses) |
| Barcode scanner | Input menu cepat via barcode di StockPage |
| Keyboard shortcut | F1-F4 untuk metode bayar, Enter untuk konfirmasi |

---

## CATATAN TEKNIS — Schema Database

```
=== ENUM VALUES ===
payment_method_enum: TUNAI | DEBIT | KREDIT | QRIS
order_status_enum:   PENDING | LUNAS | DIBATALKAN
stock_type_enum:     TAMBAH | KOREKSI | RUSAK | PENJUALAN
user_role_enum:      admin | cashier

=== PAYMENT TABLE ===
- payment_method: enum payment_method_enum (TUNAI/DEBIT/KREDIT/QRIS)
- card_type: VARCHAR (bukan enum — kode lama yang salah sudah diperbaiki)
- cash_received: integer (wajib diisi jika TUNAI)

=== CRITICAL CONSTRAINT ===
payment_check: IF payment_method = 'TUNAI'
  THEN cash_received IS NOT NULL AND cash_received >= amount_paid
  ELSE OK (non-tunai tidak perlu cash_received)
```

---

*Laporan ini dibuat berdasarkan audit statis kode, pemeriksaan schema database langsung, dan analisis log error yang terekam di sistem.*
