# 🎨 AUDIT UI/UX MENYELURUH — Dapur Ina Aina
**Tanggal Audit:** 26 September 2026  
**Fokus:** UI (Antarmuka Visual) & UX (Pengalaman Pengguna)  
**Halaman yang diaudit:** Login · Header · Menu · Cart · Orders · Buat Pesanan · Billing · Dashboard · Stok · Histori Stok

---

## 📋 DAFTAR ISI
1. [Ringkasan Eksekutif UI/UX](#ringkasan)
2. [Audit Per Halaman](#per-halaman)
3. [Audit Komponen Bersama](#komponen)
4. [Audit Konsistensi Global](#konsistensi)
5. [Audit Aksesibilitas](#aksesibilitas)
6. [Audit Responsivitas](#responsivitas)
7. [Tabel Temuan Lengkap](#tabel)
8. [Rencana Perbaikan Step-by-Step](#perbaikan)
9. [Roadmap Prioritas](#roadmap)

---

## 1. RINGKASAN EKSEKUTIF UI/UX {#ringkasan}

**Nilai Keseluruhan: 6.5 / 10**

### Kekuatan:
- ✅ Design system kustom yang kohesif (design tokens: `text-on-surface`, `bg-surface`, dll)
- ✅ Loading states yang baik (skeleton, spinner, pesan loading)
- ✅ Feedback visual saat pesanan baru masuk (badge pulse animasi)
- ✅ Modal konfirmasi untuk aksi penting (logout, buat pesanan, bayar)
- ✅ Responsif dasar (mobile menu hamburger tersedia)

### Kelemahan Kritis:
- ❌ **StockPage** menggunakan design system berbeda total (Tailwind plain) — terlihat seperti aplikasi lain
- ❌ **Header** menampilkan nama user kosong (`user.name` bukannya `user.name_user`)
- ❌ **CartPage pelanggan** tidak ada opsi takeaway — harus isi nomor meja, tidak fleksibel
- ❌ **Halaman sukses** di CreateOrderPage hilang otomatis setelah 3 detik — user tidak sempat mencatat invoice
- ❌ Tidak ada feedback visual saat tombol di-hover di beberapa halaman
- ❌ Error ditampilkan dua kali sekaligus (inline + Toast) di beberapa form

---

## 2. AUDIT PER HALAMAN {#per-halaman}

---

### 📄 Halaman: LOGIN (`/login`)

**File:** `frontend/src/pages/auth/LoginPage.jsx`

#### UI — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| L-UI-01 | Logo di halaman login hanya ikon `LogIn` — tidak ada logo/brand Dapur Ina Aina yang representatif | Sedang |
| L-UI-02 | Judul "Dapur Ina Aina" menggunakan `font-headline-md` padahal di Header menggunakan `font-headline-sm` — inkonsistensi ukuran heading brand | Rendah |
| L-UI-03 | Demo credentials (`admin` / `admin123`) tampil di UI produksi secara plain text — risiko keamanan dan terlihat tidak profesional | Tinggi |
| L-UI-04 | Background halaman login polos (`bg-surface`) — tidak ada visual yang menarik atau ilustrasi | Rendah |
| L-UI-05 | Tombol "Masuk" tidak memiliki loading spinner — hanya teks "Memproses..." tanpa indikator visual | Sedang |

#### UX — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| L-UX-01 | Error ditampilkan DUA KALI: inline (div merah) DAN Toast di kanan bawah — user mendapat notifikasi ganda yang membingungkan | Tinggi |
| L-UX-02 | Setelah login berhasil, langsung redirect ke `/orders` — tidak ada transitional feedback (tidak ada animasi atau pesan "Berhasil masuk") | Sedang |
| L-UX-03 | Tidak ada fitur "Lupa Password" — jika kasir lupa password tidak ada jalur recovery mandiri | Sedang |
| L-UX-04 | Form tidak memiliki `autofocus` di field username — user harus klik field dulu sebelum mengetik | Rendah |
| L-UX-05 | Tombol toggle show/hide password tidak memiliki `aria-label` — screen reader tidak bisa menjelaskan fungsinya | Sedang |

---

### 📄 Komponen: HEADER (Navigasi Global)

**File:** `frontend/src/components/layout/Header.jsx`

#### UI — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| H-UI-01 | `user.name` (baris 106) harusnya `user.name_user` — nama user selalu KOSONG di header | Kritis |
| H-UI-02 | Di mobile, info user (nama + role) disembunyikan (`hidden sm:flex`) — di layar < 640px user tidak tau siapa yang login | Sedang |
| H-UI-03 | Logo di header menggunakan emoji 🍳 — tidak profesional untuk tampilan produksi, sebaiknya gunakan SVG logo | Rendah |
| H-UI-04 | Nav link aktif menggunakan `bg-primary text-on-primary` (pill/badge style) — inkonsistensi: halaman lain menggunakan underline atau indikator lain | Rendah |
| H-UI-05 | Header memiliki duplikasi kode mobile menu yang identik untuk tiap role — kode bertambah panjang tanpa alasan | Rendah (kode) |

#### UX — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| H-UX-01 | Mobile menu tidak menutup saat user klik di luar area menu — user harus klik ikon X untuk menutup | Sedang |
| H-UX-02 | Tombol logout hanya ikon LogOut tanpa label teks — user baru mungkin tidak tahu fungsinya (terutama di desktop) | Sedang |
| H-UX-03 | Tidak ada visual breadcrumb atau indikator halaman aktif yang jelas di mobile — user tidak tahu sedang di halaman mana | Sedang |
| H-UX-04 | Modal konfirmasi logout muncul di kanan (slide dari kanan, karena Modal styling) — ini tidak natural untuk konfirmasi kecil yang seharusnya muncul di tengah | Sedang |

---

### 📄 Halaman: MENU PELANGGAN (`/menu`)

**File:** `frontend/src/pages/customer/MenuPage.jsx`  
**Komponen:** `MenuCard.jsx`, `CategoryPills.jsx`

#### UI — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| M-UI-01 | `MenuCard` tidak ada gambar/foto menu — kartu menu hanya berisi teks nama, kategori, harga. Sangat plain untuk halaman menu restoran | Tinggi |
| M-UI-02 | Kategori menu (`name_category`) hanya tampil sebagai teks kecil abu-abu di bawah nama menu — tidak ada ikon atau warna kategori | Rendah |
| M-UI-03 | Tombol "Tambah ke Keranjang" berubah menjadi "Tambah (2)" saat item di cart — informasi yang berguna tapi font dan ukuran tidak berubah, terlihat crowded | Sedang |
| M-UI-04 | `MenuCard` hover effect hanya `-translate-y-1` tanpa shadow peningkatan — efek hover terasa minimal | Rendah |
| M-UI-05 | Badge "Menipis" dan "Habis" ukurannya kecil dan bisa bertabrakan dengan nama menu panjang (layout `flex justify-between`) | Sedang |
| M-UI-06 | Grid menu: mobile 1 kolom, tablet 2 kolom, desktop 4 kolom — di layar tablet (768px) 2 kolom terasa terlalu sedikit, 3 kolom lebih optimal | Rendah |

#### UX — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| M-UX-01 | Tidak ada feedback saat item berhasil ditambahkan ke keranjang — tidak ada animasi, toast, atau indikator visual bahwa aksi berhasil | Kritis |
| M-UX-02 | Tombol keranjang di header pelanggan tampil di pojok kiri (`/cart` link), tapi tombol "Keranjang (n)" hanya muncul di header halaman menu jika cart > 0. Di halaman lain (menu scroll panjang), tidak ada cara cepat akses keranjang | Tinggi |
| M-UX-03 | Saat pencarian menu tidak menemukan hasil, `EmptyState` tampil dengan gambar 📭 dan teks "Menu Tidak Ditemukan" — tidak ada saran atau tombol "Reset filter" untuk memudahkan user | Sedang |
| M-UX-04 | Menu dengan stok habis masih tampil di daftar (dengan opacity 60%) — user tetap melihat item yang tidak bisa dipesan, bisa memenuhi halaman | Rendah |
| M-UX-05 | Tidak ada indikasi harga total di keranjang saat user browse menu — user harus pergi ke halaman cart untuk melihat total | Sedang |
| M-UX-06 | Tidak ada sorting menu (harga: termurah/termahal, nama: A-Z) | Rendah |

---

### 📄 Halaman: KERANJANG PELANGGAN (`/cart`)

**File:** `frontend/src/pages/customer/CartPage.jsx`

#### UI — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| C-UI-01 | Subtotal dan Total menampilkan nilai yang SAMA (`totalPrice`) — baris "Subtotal" dan "Total" identik, tidak ada perbedaan. Membingungkan | Tinggi |
| C-UI-02 | Saat keranjang kosong, `EmptyState` ditampilkan tapi tidak ada tombol "Lihat Menu" untuk kembali langsung ke menu | Sedang |
| C-UI-03 | Form input (Nama Pemesan, Nomor Meja) menggunakan `px-4 py-2.5` sementara halaman lain menggunakan `px-space-md py-space-md` — inkonsistensi spacing class | Rendah |

#### UX — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| C-UX-01 | **Tidak ada opsi Takeaway di CartPage pelanggan** — pelanggan WAJIB mengisi nomor meja, padahal bisa saja ingin takeaway | Kritis |
| C-UX-02 | Mengurangi quantity ke 0 langsung MENGHAPUS item dari cart tanpa konfirmasi — user mungkin tidak sadar item hilang | Sedang |
| C-UX-03 | Setelah pesan berhasil, halaman sukses menampilkan instruksi 4 langkah yang baik. Tapi tidak ada tombol "Salin Invoice" untuk menyalin nomor invoice ke clipboard | Sedang |
| C-UX-04 | Error ditampilkan DUA KALI: inline (div merah) DAN Toast — duplikasi notifikasi seperti di LoginPage | Tinggi |
| C-UX-05 | `placeholder="Nama kamu"` menggunakan bahasa tidak formal ("kamu") sementara label menggunakan "Nama Pemesan" yang formal — inkonsistensi tone | Rendah |
| C-UX-06 | Tidak ada estimasi waktu penyajian yang ditampilkan setelah order berhasil | Rendah |

---

### 📄 Halaman: PESANAN KASIR & ADMIN (`/orders`)

**File:** `frontend/src/pages/admin/OrdersPage.jsx`  
**Komponen:** `OrderTable.jsx`

#### UI — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| O-UI-01 | Tabel `OrderTable` tidak memiliki hover state pada baris — tidak ada visual feedback saat mouse di atas baris | Rendah |
| O-UI-02 | Badge status "Take Away" di kolom Meja/Tipe menggunakan class inline hardcoded (bukan komponen Badge) — inkonsistensi dengan kolom Status yang menggunakan komponen `<Badge>` | Sedang |
| O-UI-03 | Kolom "Total" menggunakan class `font-currency-md text-currency-md` tapi class ini mungkin tidak terdefinisi di design system — perlu verifikasi | Sedang |
| O-UI-04 | Stats KPI di halaman Orders (Total/Pending/Lunas) menggunakan typography class `font-display-lg text-headline-lg` — tidak konsisten dengan KpiCard di Dashboard yang menggunakan format berbeda | Rendah |
| O-UI-05 | Notifikasi pesanan baru (`newPending`) hanya berupa titik merah kecil di pojok kartu — sangat mudah terlewat, terutama di monitor besar | Sedang |

#### UX — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| O-UX-01 | **Tidak ada fitur pencarian pesanan** — kasir tidak bisa cari berdasarkan nama pelanggan atau invoice | Kritis |
| O-UX-02 | **Tidak ada pagination** — semua pesanan di-load sekaligus. Jika ada 100+ pesanan, performa turun dan user harus scroll panjang | Tinggi |
| O-UX-03 | Tombol "Refresh" tidak memberikan feedback visual yang jelas selain spinner kecil di ikon — tidak ada konfirmasi bahwa data berhasil di-refresh | Rendah |
| O-UX-04 | Di tab "PENDING", daftar tidak diurutkan berdasarkan urgensi (waktu paling lama menunggu di atas) — order lama bisa tenggelam di bawah | Tinggi |
| O-UX-05 | Kasir tidak bisa melihat detail item pesanan langsung dari tabel — harus masuk ke halaman billing dulu untuk melihat item yang dipesan | Sedang |
| O-UX-06 | Tidak ada visual perbedaan yang jelas antara pesanan PENDING dan LUNAS dalam tabel (hanya badge kecil) — kasir bisa salah klik "Bayar" pada pesanan yang sudah lunas | Sedang |

---

### 📄 Halaman: BUAT PESANAN KASIR (`/orders/create`)

**File:** `frontend/src/pages/admin/CreateOrderPage.jsx`

#### UI — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| CP-UI-01 | Menu grid hanya 2-3 kolom (`grid-cols-2 md:grid-cols-3`) — di layar besar (1440px) hanya 3 kolom terasa tidak efisien, bisa 4-5 kolom | Rendah |
| CP-UI-02 | Card menu di CreateOrderPage tidak memiliki gambar — konsisten dengan MenuPage, tapi tetap terasa kosong secara visual | Sedang |
| CP-UI-03 | Keranjang di sisi kanan (`sticky top-24`) terlihat bagus di desktop, tapi di mobile keranjang muncul SETELAH daftar menu — user harus scroll jauh ke bawah untuk melihat keranjang | Kritis |
| CP-UI-04 | Tombol +/- quantity di keranjang sangat kecil (hanya `p-1` padding) — sulit ditekan di layar sentuh | Tinggi |
| CP-UI-05 | Tombol konfirmasi modal "Konfirmasi" tidak ada ikon — tombol Batal vs Konfirmasi terlihat hampir identik | Rendah |

#### UX — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| CP-UX-01 | **Halaman sukses hilang otomatis setelah 3 detik** (`setTimeout(() => setSuccess(null), 3000)`) — kasir tidak punya cukup waktu untuk mencatat nomor invoice sebelum halaman kembali ke form kosong | Kritis |
| CP-UX-02 | Di modal konfirmasi pesanan, info "Meja/Info" menampilkan value `{tableNumber}` tapi saat TAKEAWAY `tableNumber` kosong — di modal terlihat kosong tanpa keterangan | Tinggi |
| CP-UX-03 | Tidak ada shortcut keyboard untuk menambah item ke cart (misal: tekan Enter saat card terfokus) | Rendah |
| CP-UX-04 | Placeholder nomor meja "Contoh: Meja 5" mengsugesikan user harus ketik "Meja 5" — tapi database menyimpan nilai ini apa adanya, tidak ada normalisasi | Sedang |
| CP-UX-05 | Saat stok habis, card menu menampilkan div merah "Habis" tapi card masih bisa di-hover (translate efek tetap ada) — misleading, seolah card interaktif | Rendah |
| CP-UX-06 | `max-h-64 overflow-y-auto` pada daftar keranjang — jika ada banyak item, area scroll terlalu kecil (hanya 256px), item di bawah tidak terlihat | Sedang |

---

### 📄 Halaman: BILLING / PEMBAYARAN (`/orders/:id/billing`)

**File:** `frontend/src/pages/admin/BillingPage.jsx`

#### UI — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| B-UI-01 | Struk pembayaran tidak memiliki `@media print` CSS — jika kasir mencetak struk, layout akan berantakan karena tampil seperti halaman web biasa | Kritis |
| B-UI-02 | Tombol pilihan metode bayar (Tunai/Debit/Kredit/QRIS) menggunakan `grid grid-cols-2 md:grid-cols-4` — di mobile 2 kolom, tapi di desktop 4 kolom dengan tombol yang terlalu lebar dan banyak whitespace | Sedang |
| B-UI-03 | Tampilan struk menggunakan `border-dashed` yang terlihat bagus, tapi total menggunakan `font-headline-md` yang terlalu besar untuk area yang sempit | Rendah |
| B-UI-04 | Info meja/tipe setelah fix menampilkan `📦 Take Away` — emoji mungkin tidak muncul di print/PDF | Rendah |

#### UX — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| B-UX-01 | Saat metode TUNAI dipilih, input "Nominal Dibayar" tidak auto-focus — kasir harus klik field manual setelah pilih metode | Sedang |
| B-UX-02 | Tidak ada tombol angka cepat untuk nominal tunai (misal: tombol "50.000", "100.000", "Pas") — di POS fisik biasanya ada shortcut nominal | Sedang |
| B-UX-03 | Info box "Deskripsi Info Box" (warna biru `bg-secondary-container`) untuk non-tunai tidak menjelaskan langkah selanjutnya — hanya info bahwa akan "dicatat sebagai pembayaran DEBIT" | Rendah |
| B-UX-04 | Setelah pembayaran berhasil, tombol "Cetak Struk" dan "Pesanan Berikutnya" tampil. Tapi tombol cetak menggunakan `window.print()` yang membuka print dialog dengan layout web penuh — bukan struk yang rapi | Tinggi |
| B-UX-05 | Modal konfirmasi menampilkan harga dengan format benar, tapi tidak menampilkan daftar item yang dibayar — kasir tidak bisa memverifikasi item sebelum konfirmasi | Sedang |
| B-UX-06 | Pesanan yang sudah LUNAS tetap bisa dibuka di `/orders/:id/billing` tapi form pembayaran hilang dan hanya tampil struk — tidak ada pesan yang menjelaskan kenapa form tidak muncul | Rendah |

---

### 📄 Halaman: DASHBOARD ADMIN (`/dashboard`)

**File:** `frontend/src/pages/admin/DashboardPage.jsx`

#### UI — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| D-UI-01 | Chart warna `borderColor: '#9f3c16'` hardcoded hex — tidak menggunakan CSS variable design system. Jika tema berubah, chart tetap warna lama | Sedang |
| D-UI-02 | Grid chart `bg-color: '#fbeae7'` hardcoded — sama masalah dengan poin atas | Rendah |
| D-UI-03 | `KpiCard` menampilkan trend sebagai badge kecil di bawah — jika nilai panjang (seperti nama menu panjang) bisa overflow | Sedang |
| D-UI-04 | `downloadError` ditampilkan DUA KALI: sebagai `<p>` merah inline DAN `<Toast>` — duplikasi notifikasi | Tinggi |
| D-UI-05 | Section "Unduh Laporan" menggunakan `rounded-lg border` untuk date input — gaya yang berbeda dari input di halaman lain yang menggunakan `rounded-xl` | Rendah |

#### UX — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| D-UX-01 | KPI "Menu Terlaris" selalu tampil "—" karena backend tidak menghitung data ini — user melihat informasi kosong tanpa penjelasan | Kritis |
| D-UX-02 | KPI "Omset Hari Ini" menampilkan angka tapi tidak ada perbandingan vs hari kemarin — user tidak tahu apakah omset naik atau turun | Tinggi |
| D-UX-03 | Chart 7 hari hanya menampilkan omset, tidak ada cara untuk melihat detail hari tertentu selain tooltip — tidak ada drill-down | Rendah |
| D-UX-04 | Tombol "Unduh Excel" tidak menunjukkan format file yang akan diunduh selain dari label — tidak ada ikon file Excel yang familiar | Rendah |
| D-UX-05 | Range date unduh laporan tidak memiliki validasi max date ke hari ini — user bisa memilih tanggal di masa depan | Sedang |
| D-UX-06 | Setelah berhasil download, tidak ada feedback sukses (Toast/pesan) — user tidak tahu apakah download berhasil atau sedang loading | Sedang |
| D-UX-07 | `LowStockAlert` di dashboard menampilkan list stok menipis, tapi tidak ada link langsung ke halaman Stok untuk memperbaiki | Sedang |

---

### 📄 Halaman: STOK & MENU (`/stock`)

**File:** `frontend/src/pages/admin/StockPage.jsx`

#### UI — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| S-UI-01 | **Seluruh StockPage menggunakan design system yang BERBEDA** dari halaman lain — `text-gray-500`, `bg-white`, `border-gray-200` vs design tokens kustom | Kritis |
| S-UI-02 | Header tabel menggunakan `text-xs text-gray-500 uppercase bg-gray-50` — terlihat seperti aplikasi Tailwind default | Kritis |
| S-UI-03 | Modal `MenuModal` dan `AdjustModal` menggunakan `bg-white` hardcoded — tidak ikut design system, tampak putih polos tidak konsisten | Tinggi |
| S-UI-04 | Tombol di modal menggunakan `bg-orange-500 hover:bg-orange-600` — warna oranye berbeda dari warna primary aplikasi | Tinggi |
| S-UI-05 | Focus ring menggunakan `focus:ring-orange-400` bukan `focus:ring-primary/40` | Sedang |
| S-UI-06 | Tidak ada empty state yang bagus saat daftar menu kosong — tabel langsung kosong tanpa visual | Sedang |
| S-UI-07 | Baris dengan stok ≤ 5 menggunakan `bg-red-50 hover:bg-red-50` — warna tidak ikut design system | Sedang |

#### UX — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| S-UX-01 | **Tidak ada konfirmasi sebelum menonaktifkan menu** — tombol delete langsung eksekusi | Kritis |
| S-UX-02 | Tidak ada fitur pencarian menu di halaman stok — admin harus scroll untuk cari menu tertentu | Tinggi |
| S-UX-03 | Tipe mutasi stok hanya "TAMBAH" dan "RUSAK" — tidak ada "KOREKSI" padahal enum DB mendukungnya | Sedang |
| S-UX-04 | Setelah edit/tambah menu berhasil, tidak ada feedback sukses — modal langsung tutup tanpa toast/pesan berhasil | Tinggi |
| S-UX-05 | Tombol Edit, Mutasi Stok, dan Histori hanya berupa ikon kecil tanpa label — admin baru tidak tahu fungsinya tanpa hover tooltip | Sedang |
| S-UX-06 | Saat admin tambah menu baru, tidak ada preview harga dalam format Rupiah saat mengetik di field harga | Rendah |
| S-UX-07 | Tidak ada sorting kolom tabel (klik header untuk sort berdasarkan nama/stok/harga) | Rendah |

---

### 📄 Halaman: HISTORI MUTASI STOK (`/stock/:id/history`)

**File:** `frontend/src/pages/admin/StockHistoryPage.jsx`

#### UI — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| SH-UI-01 | Badge tipe mutasi (TAMBAH/RUSAK/PENJUALAN) menggunakan class inline langsung, bukan komponen `<Badge>` yang ada — inkonsistensi | Rendah |
| SH-UI-02 | Kolom perubahan (+/-) menggunakan `font-title-md text-title-md` yang lebih besar dari kolom lain — inkonsistensi ukuran teks dalam tabel | Rendah |

#### UX — Temuan:

| ID | Temuan | Tingkat |
|---|---|---|
| SH-UX-01 | Tidak ada filter tanggal untuk histori mutasi — admin harus scroll semua riwayat dari awal | Sedang |
| SH-UX-02 | Tidak ada pagination di histori — jika ada ratusan mutasi, loading dan performa buruk | Sedang |
| SH-UX-03 | Kolom "Catatan" menggunakan `truncate` — teks panjang terpotong tanpa cara untuk melihat teks lengkapnya | Rendah |

---

## 3. AUDIT KOMPONEN BERSAMA {#komponen}

### 🧩 Komponen: Button

**File:** `frontend/src/components/ui/index.jsx`

| ID | Temuan | Tingkat |
|---|---|---|
| BTN-01 | Variant `disabled` adalah CSS class yang harus di-pass manual sebagai `variant="disabled"` — padahal HTML `disabled` prop juga ada. Jika user pass `disabled={true}` tanpa `variant="disabled"`, button terlihat aktif tapi tidak bisa diklik | Tinggi |
| BTN-02 | Tidak ada variant `danger` (merah) — aksi destruktif seperti hapus tidak punya tombol merah yang standar | Sedang |
| BTN-03 | Tidak ada ukuran `sm` dan `lg` — semua button ukurannya sama | Rendah |
| BTN-04 | `active:scale-[0.98]` efek press ada tapi hanya sangat halus — mungkin tidak terlihat di monitor biasa | Rendah |

### 🧩 Komponen: Modal

**File:** `frontend/src/components/ui/Modal.jsx`

| ID | Temuan | Tingkat |
|---|---|---|
| MOD-01 | Modal muncul sebagai slide dari KANAN (full height sidebar style) — tidak cocok untuk semua konteks. Konfirmasi kecil (logout, hapus) seharusnya muncul di TENGAH layar sebagai dialog | Tinggi |
| MOD-02 | Tidak ada animasi masuk/keluar (fade, slide) — modal langsung muncul/hilang tanpa transisi | Sedang |
| MOD-03 | Tidak ada backdrop click animation saat user mencoba klik di luar modal — langsung tutup tanpa efek | Rendah |
| MOD-04 | Modal tidak mengunci scroll body di belakang — user bisa scroll halaman saat modal terbuka | Sedang |

### 🧩 Komponen: Toast

**File:** `frontend/src/components/ui/Toast.jsx`

| ID | Temuan | Tingkat |
|---|---|---|
| TOAST-01 | Toast tampil di `bottom-6 right-6` — di mobile bisa tertutup oleh virtual keyboard atau navbar bottom browser | Sedang |
| TOAST-02 | Error ditampilkan ganda: inline dan Toast — duplikasi di LoginPage, CartPage, BillingPage, DashboardPage | Tinggi |
| TOAST-03 | Tidak ada animasi masuk (slide-in dari bawah) — Toast langsung muncul | Rendah |
| TOAST-04 | Hanya ada type `success`, `error`, `info` — tidak ada `warning` | Rendah |

### 🧩 Komponen: EmptyState

**File:** `frontend/src/components/ui/EmptyState.jsx`

| ID | Temuan | Tingkat |
|---|---|---|
| ES-01 | Emoji `📭` hardcoded — tidak bisa diganti per konteks (misalnya icon berbeda untuk "Stok Kosong" vs "Menu Tidak Ditemukan") | Rendah |
| ES-02 | Tidak ada slot untuk action button — user tidak bisa langsung melakukan aksi dari empty state (misal: "Tambah Menu Pertama") | Sedang |

### 🧩 Komponen: SearchInput

**File:** `frontend/src/components/ui/index.jsx`

| ID | Temuan | Tingkat |
|---|---|---|
| SI-01 | Tidak ada tombol clear (X) untuk menghapus teks pencarian — user harus manual hapus teks | Sedang |
| SI-02 | Tidak ada debounce — setiap keystroke langsung trigger query ke API | Sedang |

---

## 4. AUDIT KONSISTENSI GLOBAL {#konsistensi}

### Inkonsistensi Typography

| Tempat | Class yang Digunakan | Seharusnya |
|---|---|---|
| LoginPage — error message | `text-body-sm font-body-sm` | Konsisten ✅ |
| CartPage — form input | `px-4 py-2.5` (hardcoded) | `px-space-md py-space-md` (token) |
| StockPage — seluruh halaman | `text-gray-500`, `bg-white` | `text-on-surface-variant`, `bg-surface` |
| StockHistoryPage — badge tipe | Inline class string | Komponen `<Badge>` |
| DashboardPage — date input | `rounded-lg` | `rounded-xl` (seperti halaman lain) |

### Inkonsistensi Spacing

| Tempat | Class yang Digunakan | Seharusnya |
|---|---|---|
| CartPage form input | `px-4 py-2.5` | `px-space-lg py-space-md` |
| StockPage header | `px-4 py-3` | `px-space-lg py-space-md` |
| Semua halaman admin lain | `px-space-lg py-space-md` | ✅ Benar |

### Inkonsistensi Warna

| Tempat | Warna | Masalah |
|---|---|---|
| `RevenueChart` | `#9f3c16` (hardcoded hex) | Tidak pakai CSS variable, tidak responsif tema |
| `RevenueChart grid` | `#fbeae7` (hardcoded hex) | Sama masalah |
| `StockPage` aksi button | `bg-orange-500` | Tidak sesuai warna `primary` aplikasi |

### Inkonsistensi Penamaan/Copy

| Tempat | Teks yang Digunakan | Rekomendasi |
|---|---|---|
| CartPage placeholder | "Nama kamu" (informal) | "Nama Anda" atau "Nama pemesan" (formal) |
| CreateOrderPage placeholder | "Nama kustomer" | "Nama pelanggan" |
| Header tab mobile | Tidak ada label | Tambahkan judul "Menu Navigasi" |
| Billing info non-tunai | "akan dicatat sebagai" | "akan diproses sebagai" (lebih akurat) |

---

## 5. AUDIT AKSESIBILITAS {#aksesibilitas}

| ID | Masalah | Halaman | Tingkat |
|---|---|---|---|
| AK-01 | Tombol toggle show/hide password tidak punya `aria-label` | Login | Sedang |
| AK-02 | Tombol Logout di Header hanya ikon, tidak punya `aria-label` | Header | Sedang |
| AK-03 | Tombol Edit/Mutasi/Histori di StockPage hanya ikon, tidak punya label teks atau `aria-label` yang jelas | Stok | Sedang |
| AK-04 | `MenuCard` tidak punya `role="article"` atau `aria-label` untuk screen reader | Menu | Rendah |
| AK-05 | Input field di seluruh form tidak memiliki `id` yang terhubung ke `<label>` via `htmlFor` — beberapa menggunakan label wrapper saja | Semua form | Sedang |
| AK-06 | Modal tidak menangkap focus (focus trap) saat terbuka — user bisa Tab ke elemen di belakang modal | Semua modal | Tinggi |
| AK-07 | Modal tidak menutup saat tekan tombol `Escape` | Semua modal | Sedang |
| AK-08 | Tombol +/- quantity di CreateOrderPage dan CartPage tidak punya `aria-label="Tambah satu" / "Kurangi satu"` | Cart & Buat Pesanan | Sedang |
| AK-09 | Kontras warna badge "Menipis" (`bg-tertiary-fixed text-on-tertiary-fixed-variant`) perlu diverifikasi — nama token tidak standar dan mungkin tidak cukup kontras | Menu, Stok | Sedang |
| AK-10 | Tidak ada `<main>` atau `<section>` semantic wrapper di halaman-halaman — hanya `<div>` | Semua halaman | Rendah |

---

## 6. AUDIT RESPONSIVITAS {#responsivitas}

| ID | Masalah | Breakpoint | Tingkat |
|---|---|---|---|
| RES-01 | Keranjang di CreateOrderPage muncul di bawah daftar menu di mobile — user harus scroll sangat jauh | < 1024px (lg) | Kritis |
| RES-02 | Tabel Orders tidak ada horizontal scroll indicator di mobile — user tidak tahu tabel bisa di-scroll horizontal | < 768px | Tinggi |
| RES-03 | Stats KPI di halaman Orders (`grid-cols-1 sm:grid-cols-3`) — di mobile tampil 1 kolom yang bagus, tapi di tablet medium (640px-768px) langsung 3 kolom yang sempit | 640px - 768px | Sedang |
| RES-04 | Modal terlalu lebar di mobile (`max-w-lg = 512px`) — di layar 375px, modal hampir full width dengan padding sangat kecil | < 480px | Sedang |
| RES-05 | Header nama user `hidden sm:flex` — di mobile (< 640px) tidak ada informasi siapa yang login | < 640px | Sedang |
| RES-06 | RevenueChart tidak punya `min-height` — di mobile chart bisa terlalu kecil dan tidak bisa dibaca | < 640px | Sedang |
| RES-07 | EmptyState di StockHistoryPage tidak responsif — `py-16` terlalu besar di mobile, banyak whitespace tidak berguna | Mobile | Rendah |
| RES-08 | Tombol +/- quantity di CartPage menggunakan `w-8 h-8` — di mobile (touch) idealnya minimal 44x44px sesuai standar Apple HIG | Mobile | Sedang |

---

## 7. TABEL TEMUAN LENGKAP {#tabel}

| No | ID | Area | Halaman/Komponen | Temuan Singkat | Keparahan |
|---|---|---|---|---|---|
| 1 | H-UI-01 | UI | Header | Nama user kosong (`user.name` bukan `user.name_user`) | **Kritis** |
| 2 | S-UI-01 | UI | StockPage | Design system berbeda total (Tailwind plain) | **Kritis** |
| 3 | S-UX-01 | UX | StockPage | Tidak ada konfirmasi sebelum hapus/nonaktifkan menu | **Kritis** |
| 4 | CP-UX-01 | UX | Buat Pesanan | Halaman sukses hilang otomatis 3 detik, kasir tidak sempat catat invoice | **Kritis** |
| 5 | CP-UI-03 | UI | Buat Pesanan | Keranjang muncul di bawah daftar menu di mobile — user harus scroll jauh | **Kritis** |
| 6 | C-UX-01 | UX | Cart Pelanggan | Tidak ada opsi Takeaway — pelanggan wajib isi nomor meja | **Kritis** |
| 7 | M-UX-01 | UX | Menu | Tidak ada feedback saat item ditambahkan ke keranjang | **Kritis** |
| 8 | O-UX-01 | UX | Orders | Tidak ada fitur pencarian pesanan | **Kritis** |
| 9 | B-UI-01 | UI | Billing | Tidak ada CSS print — cetak struk berantakan | **Kritis** |
| 10 | D-UX-01 | UX | Dashboard | "Menu Terlaris" selalu "—" | **Kritis** |
| 11 | L-UX-01 | UX | Login | Error ditampilkan dua kali (inline + Toast) | **Tinggi** |
| 12 | C-UI-01 | UI | Cart | Subtotal = Total (nilai sama, label berbeda, membingungkan) | **Tinggi** |
| 13 | TOAST-02 | UI | Semua | Duplikasi error: inline + Toast di 4+ halaman | **Tinggi** |
| 14 | MOD-01 | UI | Semua | Modal selalu slide dari kanan — tidak cocok untuk dialog konfirmasi kecil | **Tinggi** |
| 15 | BTN-01 | UI | Semua | `disabled` HTML vs `variant="disabled"` tidak sinkron | **Tinggi** |
| 16 | O-UX-04 | UX | Orders | Pesanan pending tidak diurutkan berdasarkan waktu menunggu | **Tinggi** |
| 17 | AK-06 | Aksesibilitas | Modal | Tidak ada focus trap di modal | **Tinggi** |
| 18 | S-UX-04 | UX | Stok | Tidak ada feedback sukses setelah edit/tambah menu | **Tinggi** |
| 19 | D-UI-04 | UI | Dashboard | `downloadError` tampil dua kali (inline + Toast) | **Tinggi** |
| 20 | B-UX-04 | UX | Billing | Cetak struk via `window.print()` menghasilkan layout web, bukan struk | **Tinggi** |
| 21 | RES-01 | Responsivitas | Buat Pesanan | Keranjang di bawah menu di mobile | **Kritis** |
| 22 | O-UX-02 | UX | Orders | Tidak ada pagination | **Tinggi** |
| 23 | M-UI-01 | UI | Menu | Tidak ada gambar/foto menu | **Tinggi** |
| 24 | H-UX-04 | UX | Header | Modal logout slide dari kanan, tidak natural untuk konfirmasi | **Sedang** |
| 25 | CP-UX-02 | UX | Buat Pesanan | Modal konfirmasi info "Meja" kosong saat TAKEAWAY | **Tinggi** |
| 26 | SI-01 | UI | SearchInput | Tidak ada tombol clear pencarian | **Sedang** |
| 27 | SI-02 | UI | SearchInput | Tidak ada debounce — setiap keystroke trigger API call | **Sedang** |
| 28 | ES-02 | UI | EmptyState | Tidak ada slot action button | **Sedang** |
| 29 | D-UX-06 | UX | Dashboard | Tidak ada feedback sukses setelah download Excel | **Sedang** |
| 30 | D-UX-07 | UX | Dashboard | LowStockAlert tidak ada link langsung ke halaman Stok | **Sedang** |
| 31 | S-UX-02 | UX | Stok | Tidak ada pencarian di halaman Stok | **Tinggi** |
| 32 | CP-UI-04 | UI | Buat Pesanan | Tombol +/- di keranjang terlalu kecil untuk touch | **Tinggi** |
| 33 | C-UX-02 | UX | Cart | Kurangi qty ke 0 langsung hapus item tanpa konfirmasi | **Sedang** |

---

## 8. RENCANA PERBAIKAN STEP-BY-STEP {#perbaikan}

---

### FIX #1 — Nama User Kosong di Header

**Mengapa penting:** Kasir dan admin tidak tahu siapa yang sedang login.

**File:** `frontend/src/components/layout/Header.jsx` baris 106

**Langkah:**
1. Cari baris: `<span className="text-on-surface-variant">{user.name}</span>`
2. Ganti dengan: `<span className="text-on-surface-variant">{user.name_user}</span>`

**Definisi selesai:** Header menampilkan nama pengguna yang login.

**Effort:** Sangat kecil (5 menit)

---

### FIX #2 — Hapus Duplikasi Error (Inline + Toast)

**Mengapa penting:** User menerima notifikasi error dua kali sekaligus — satu di dalam form (inline) dan satu Toast di pojok kanan bawah. Ini membingungkan dan tidak profesional.

**File yang terdampak:**
- `LoginPage.jsx` (baris 86-90 dan 109)
- `CartPage.jsx` (baris 213-217 dan 252)
- `BillingPage.jsx` (baris 325-329 dan 441-449)
- `DashboardPage.jsx` (baris 180-182 dan 185-193)

**Aturan:** Pilih satu saja. **Gunakan inline error** untuk error form (validation) karena letaknya dekat dengan input yang bermasalah. **Hapus Toast error** untuk kasus ini.

**Langkah (contoh untuk LoginPage):**
1. Buka `LoginPage.jsx`
2. Hapus baris 109: `{error && <Toast title="Error" message={error} type="error" ... />}`
3. Sisakan hanya div inline error (baris 86-90)
4. Ulangi untuk CartPage, BillingPage, DashboardPage

**Definisi selesai:** Error hanya tampil sekali, di lokasi yang relevan.

**Effort:** Kecil (30 menit)

---

### FIX #3 — Halaman Sukses Buat Pesanan Tidak Hilang Otomatis

**Mengapa penting:** Kasir tidak punya cukup waktu mencatat nomor invoice sebelum halaman kembali kosong (hanya 3 detik).

**File:** `frontend/src/pages/admin/CreateOrderPage.jsx` baris 113-116

**Langkah:**
1. Cari dan **hapus** blok timeout berikut (baris 113-116):
```jsx
// HAPUS BLOK INI:
setTimeout(() => {
  setSuccess(null);
}, 3000);
```
2. Biarkan halaman sukses tetap tampil sampai user sendiri yang klik "Buat Pesanan Baru".

**Definisi selesai:** Halaman sukses tetap tampil sampai kasir klik tombol "Buat Pesanan Baru", invoice bisa dibaca dengan nyaman.

**Effort:** Sangat kecil (5 menit)

---

### FIX #4 — Tambah Opsi Takeaway di CartPage Pelanggan

**Mengapa penting:** Pelanggan tidak bisa memesan takeaway melalui aplikasi — selalu harus mengisi nomor meja.

**File:** `frontend/src/pages/customer/CartPage.jsx`

**Langkah:**
1. Tambahkan state `orderType` di atas state `form`:
```jsx
const [orderType, setOrderType] = useState('MEJA'); // MEJA | TAKEAWAY
```

2. Tambahkan toggle pilihan tipe pesanan sebelum form (setelah `<h2>Detail Pemesanan</h2>`):
```jsx
{/* Toggle Tipe Pesanan */}
<div className="flex gap-space-md bg-surface-container rounded-xl p-space-sm">
  {['MEJA', 'TAKEAWAY'].map((t) => (
    <button
      key={t}
      type="button"
      onClick={() => setOrderType(t)}
      className={`flex-1 py-space-md rounded-lg font-label-lg text-label-lg transition-all ${
        orderType === t
          ? 'bg-surface-container-lowest text-on-surface shadow-sm'
          : 'text-on-surface-variant hover:text-on-surface'
      }`}
    >
      {t === 'MEJA' ? '🪑 Meja' : '📦 Take Away'}
    </button>
  ))}
</div>
```

3. Ubah field "Nomor Meja" agar hanya tampil jika `orderType === 'MEJA'`:
```jsx
{orderType === 'MEJA' && (
  <div>
    <label>Nomor Meja</label>
    <input ... />
  </div>
)}
```

4. Di fungsi `handleCheckout`, ubah `table_number` di payload:
```js
table_number: orderType === 'MEJA' ? form.table_number.trim() : 'TAKEAWAY',
```

5. Update validasi: hanya wajibkan nomor meja jika `orderType === 'MEJA'`:
```js
if (orderType === 'MEJA' && !form.table_number.trim()) {
  setError('Nomor meja wajib diisi.');
  return;
}
```

**Definisi selesai:** Pelanggan bisa memilih "Meja" atau "Take Away" — jika Take Away, field nomor meja tersembunyi.

**Effort:** Kecil (1 jam)

---

### FIX #5 — Feedback Saat Tambah Item ke Keranjang (Menu Pelanggan)

**Mengapa penting:** Tidak ada tanda bahwa item berhasil ditambahkan — user bisa ragu apakah aksi berhasil.

**File:** `frontend/src/components/customer/MenuCard.jsx`

**Langkah:**
1. Tambahkan state `added` di dalam `MenuCard`:
```jsx
const [added, setAdded] = useState(false);
```

2. Update fungsi `handleAdd`:
```jsx
const handleAdd = () => {
  addItem({ id_menu_item: menu.id_menu_item, name_menu: menu.name_menu, price: menu.price });
  setAdded(true);
  setTimeout(() => setAdded(false), 1500);
};
```

3. Ubah tampilan tombol untuk memberikan feedback:
```jsx
<Button
  variant="primary"
  icon={added ? CheckCircle : Plus}
  onClick={handleAdd}
  className={`w-full transition-all ${added ? 'bg-secondary text-on-secondary' : ''}`}
  disabled={outOfStock}
>
  {added ? 'Ditambahkan!' : inCart ? `Tambah (${inCart.quantity})` : 'Tambah ke Keranjang'}
</Button>
```

4. Import `CheckCircle` dari lucide-react di baris 1.

**Definisi selesai:** Setelah klik "Tambah ke Keranjang", tombol berubah hijau dengan teks "Ditambahkan!" selama 1.5 detik, lalu kembali normal.

**Effort:** Kecil (45 menit)

---

### FIX #6 — Keranjang Sticky di Mobile (Buat Pesanan)

**Mengapa penting:** Di mobile, keranjang tampil setelah daftar menu yang panjang — kasir harus scroll jauh ke bawah untuk melihat keranjang.

**File:** `frontend/src/pages/admin/CreateOrderPage.jsx` (baris 182-323)

**Langkah:**
1. Tambahkan tombol floating "Lihat Keranjang" di mobile yang muncul saat cart > 0:

```jsx
{/* Floating Cart Button — hanya di mobile */}
{cart.length > 0 && (
  <div className="fixed bottom-6 left-0 right-0 px-margin flex justify-center lg:hidden z-40">
    <button
      onClick={() => document.getElementById('cart-panel').scrollIntoView({ behavior: 'smooth' })}
      className="flex items-center gap-space-md px-space-xl py-space-md rounded-2xl bg-primary text-on-primary shadow-xl font-label-lg text-label-lg"
    >
      <ShoppingCart size={20} />
      Keranjang ({cart.length}) · {formatRupiah(totalPrice)}
    </button>
  </div>
)}
```

2. Tambahkan `id="cart-panel"` ke elemen `<Card>` keranjang (baris 222):
```jsx
<Card id="cart-panel" className="p-space-lg h-fit flex flex-col gap-space-lg sticky top-24">
```

**Definisi selesai:** Di mobile, tombol floating "Keranjang (n) · Rp X" muncul di bawah layar — klik langsung scroll ke panel keranjang.

**Effort:** Kecil (1 jam)

---

### FIX #7 — Tambah Tombol Clear di SearchInput

**Mengapa penting:** User tidak bisa menghapus pencarian dengan satu klik — harus hapus manual karakter per karakter.

**File:** `frontend/src/components/ui/index.jsx` (komponen SearchInput)

**Langkah:**
1. Update komponen `SearchInput` agar menerima prop `onClear`:

```jsx
export function SearchInput({ value, onChange, onClear, placeholder = 'Cari...' }) {
  return (
    <div className="relative flex-1 max-w-xl">
      <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={onClear || (() => onChange({ target: { value: '' } }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Hapus pencarian"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
```

2. Import `X` dari lucide-react di baris 1 file index.jsx.

**Definisi selesai:** Saat ada teks di search input, muncul ikon X di kanan. Klik X → input kosong kembali.

**Effort:** Kecil (30 menit)

---

### FIX #8 — Tombol di Modal Konfirmasi Buat Pesanan — Fix "Meja" Kosong Saat Takeaway

**Mengapa penting:** Saat TAKEAWAY dipilih, bagian "Meja/Info" di modal konfirmasi tampil kosong karena `tableNumber` memang kosong.

**File:** `frontend/src/pages/admin/CreateOrderPage.jsx` baris 337-342

**Langkah:**
1. Cari baris 337-342 di modal konfirmasi:
```jsx
<div>
  <p className="font-label-md ...">
    {orderMode === 'MEJA' ? 'Meja' : 'Info'}
  </p>
  <p className="font-body-md ...">{tableNumber}</p>
</div>
```

2. Ganti dengan:
```jsx
<div>
  <p className="font-label-md text-label-md text-on-surface-variant">
    {orderMode === 'MEJA' ? 'Nomor Meja' : 'Tipe Pesanan'}
  </p>
  <p className="font-body-md text-body-md text-on-surface">
    {orderMode === 'MEJA' ? tableNumber : '📦 Take Away'}
  </p>
</div>
```

**Definisi selesai:** Saat TAKEAWAY, modal konfirmasi menampilkan "Tipe Pesanan: 📦 Take Away" dengan jelas.

**Effort:** Sangat kecil (10 menit)

---

### FIX #9 — CSS Print untuk Struk Pembayaran

**Mengapa penting:** Kasir tidak bisa mencetak struk — layout akan tampil sebagai halaman web penuh, bukan struk kasir.

**File:** `frontend/src/pages/admin/BillingPage.jsx` dan `frontend/src/index.css`

**Langkah:**

1. Tambahkan style print di `frontend/src/index.css`:

```css
@media print {
  /* Sembunyikan semua elemen selain struk */
  header,
  nav,
  .no-print,
  button {
    display: none !important;
  }

  /* Lebar struk thermal 80mm */
  body {
    width: 80mm;
    margin: 0;
    padding: 0;
    font-size: 12px;
  }

  /* Area konten struk */
  .print-area {
    display: block !important;
    width: 100%;
    max-width: 80mm;
    margin: 0 auto;
    padding: 4mm;
  }
}
```

2. Di `BillingPage.jsx`, tambahkan class `print-area` ke `Card` struk (baris 138):
```jsx
<Card className="p-space-lg mb-space-lg print-area">
```

3. Tambahkan class `no-print` ke semua elemen yang TIDAK ingin dicetak (form pembayaran, tombol navigasi):
```jsx
{/* Tombol Kembali */}
<button className="... no-print">...</button>

{/* Form pembayaran */}
{!isLunas && (
  <Card className="p-space-lg no-print">...</Card>
)}

{/* Panel sukses */}
{isLunas && (
  <Card className="... no-print">...</Card>
)}
```

**Definisi selesai:** Klik "Cetak Struk" → browser print dialog terbuka → yang tercetak hanya area struk dengan lebar 80mm (format thermal printer standard).

**Effort:** Sedang (2 jam)

---

### FIX #10 — Modal Konfirmasi Kecil di Tengah, Bukan Slide dari Kanan

**Mengapa penting:** Konfirmasi logout, hapus, bayar seharusnya muncul sebagai dialog di tengah layar — bukan panel slide dari kanan yang biasanya digunakan untuk form panjang.

**File:** `frontend/src/components/ui/Modal.jsx`

**Langkah:**
1. Tambahkan prop `size` ke Modal (`'dialog'` untuk tengah layar, `'panel'` untuk slide kanan):

```jsx
export function Modal({ open, isOpen, onClose, title, subtitle, children, size = 'dialog' }) {
  if (!open && !isOpen) return null;

  if (size === 'panel') {
    // Versi lama — slide dari kanan (untuk form panjang)
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-surface-container-lowest shadow-2xl overflow-y-auto flex flex-col">
          {/* ... konten sama seperti sekarang ... */}
        </div>
      </div>
    );
  }

  // Default — dialog di tengah
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-space-lg bg-surface-container flex items-start justify-between">
          <div>
            <h3 className="font-title-lg text-title-lg text-on-surface font-bold">{title}</h3>
            {subtitle && <span className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</span>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-variant">
            <X size={20} />
          </button>
        </div>
        <div className="p-space-lg flex flex-col gap-space-lg">{children}</div>
      </div>
    </div>
  );
}
```

2. Semua modal konfirmasi kecil (logout, buat pesanan, bayar) sudah menggunakan `size="dialog"` sebagai default — tidak perlu mengubah pemanggil.

**Definisi selesai:** Modal konfirmasi muncul di tengah layar sebagai dialog. Panel slide dari kanan tetap tersedia dengan `size="panel"`.

**Effort:** Sedang (1.5 jam)

---

### FIX #11 — Feedback Sukses Setelah Edit/Tambah Menu di StockPage

**Mengapa penting:** Setelah admin menyimpan menu, modal langsung tutup tanpa ada konfirmasi bahwa aksi berhasil.

**File:** `frontend/src/pages/admin/StockPage.jsx`

**Langkah:**
1. Tambahkan state `successMsg` di komponen `StockPage`:
```jsx
const [successMsg, setSuccessMsg] = useState(null);
```

2. Update fungsi `handleSaved`:
```jsx
const handleSaved = (msg = 'Perubahan berhasil disimpan') => {
  qc.invalidateQueries({ queryKey: ['stock'] });
  qc.invalidateQueries({ queryKey: ['menu'] });
  setMenuModal(null);
  setAdjustModal(null);
  setSuccessMsg(msg);
  setTimeout(() => setSuccessMsg(null), 3000);
};
```

3. Tampilkan Toast sukses di bawah komponen:
```jsx
{successMsg && (
  <Toast
    title="Berhasil"
    message={successMsg}
    type="success"
    onClose={() => setSuccessMsg(null)}
    duration={3000}
  />
)}
```

4. Import `Toast` dari `'../ui'` di baris atas file.

**Definisi selesai:** Setelah simpan menu, muncul Toast hijau "Berhasil — Perubahan berhasil disimpan" selama 3 detik.

**Effort:** Kecil (30 menit)

---

### FIX #12 — Debounce di SearchInput

**Mengapa penting:** Setiap karakter yang diketik di search input langsung memicu request ke API — jika user mengetik "Nasi Goreng" (12 karakter), ada 12 request berurutan. Ini boros bandwidth dan membuat UI terasa lag.

**File:** `frontend/src/components/ui/index.jsx` (SearchInput) atau buat hook terpisah.

**Langkah:**
1. Buat file `frontend/src/hooks/useDebounce.js`:

```js
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

2. Di halaman yang menggunakan SearchInput (MenuPage, CreateOrderPage), gunakan debounce:

```jsx
// SEBELUM:
const [search, setSearch] = useState('');
// queryKey: ['menu', { search }]

// SESUDAH:
import { useDebounce } from '../../hooks/useDebounce';
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 400);
// queryKey: ['menu', { search: debouncedSearch }]
// queryFn: () => menuService.getMenu({ search: debouncedSearch || undefined })
```

**Definisi selesai:** API hanya dipanggil 400ms setelah user berhenti mengetik, bukan setiap karakter.

**Effort:** Kecil (45 menit)

---

### FIX #13 — Tombol +/- Quantity Lebih Besar di Mobile

**Mengapa penting:** Standar Apple HIG mensyaratkan minimal 44x44px untuk elemen interaktif di layar sentuh. Saat ini tombol +/- hanya ~32px.

**File:** `frontend/src/pages/admin/CreateOrderPage.jsx` dan `frontend/src/pages/customer/CartPage.jsx`

**Langkah (CreateOrderPage, baris 244-256):**
```jsx
// SEBELUM:
<button onClick={...} className="p-1 hover:bg-surface-container-high">
  <Minus size={14} />
</button>

// SESUDAH:
<button
  onClick={...}
  className="w-9 h-9 flex items-center justify-center hover:bg-surface-container-high rounded-lg transition-colors"
  aria-label="Kurangi satu"
>
  <Minus size={16} />
</button>
```

Lakukan hal sama untuk tombol + dan tombol di CartPage.

**Definisi selesai:** Semua tombol quantity memiliki ukuran minimal 36x36px (dekat standar 44px) dengan `aria-label` yang jelas.

**Effort:** Kecil (45 menit)

---

### FIX #14 — Atribut `aria-label` pada Tombol Ikon

**Mengapa penting:** Tombol yang hanya berisi ikon tidak dapat dipahami oleh screen reader — user dengan disabilitas visual tidak bisa menggunakan aplikasi.

**File:** `Header.jsx`, `StockPage.jsx`, `LoginPage.jsx`

**Langkah:**

Di `Header.jsx` (baris 112-118) — tombol Logout:
```jsx
// SEBELUM:
<button onClick={() => setShowLogoutConfirm(true)} title="Logout">
  <LogOut size={20} />
</button>

// SESUDAH:
<button
  onClick={() => setShowLogoutConfirm(true)}
  aria-label="Logout dari sistem"
  title="Logout"
>
  <LogOut size={20} />
</button>
```

Di `LoginPage.jsx` (baris 76-81) — tombol show/hide password:
```jsx
<button
  type="button"
  onClick={() => setShowPass(v => !v)}
  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
>
```

Di `StockPage.jsx` — tombol Edit, Mutasi, Histori:
```jsx
<button title="Edit menu" aria-label={`Edit menu ${item.name_menu}`}>
<button title="Mutasi stok" aria-label={`Mutasi stok ${item.name_menu}`}>
<button title="Histori stok" aria-label={`Lihat histori stok ${item.name_menu}`}>
```

**Definisi selesai:** Semua tombol ikon memiliki `aria-label` yang deskriptif.

**Effort:** Kecil (30 menit)

---

### FIX #15 — Konsistensi StockPage Design System

**Mengapa penting:** StockPage terlihat seperti aplikasi yang berbeda karena menggunakan Tailwind default bukan design tokens kustom.

**File:** `frontend/src/pages/admin/StockPage.jsx` (seluruh file)

**Tabel Penggantian Class:**

| Class Lama | Class Baru |
|---|---|
| `bg-white` | `bg-surface-container-lowest` |
| `text-gray-800` | `text-on-surface` |
| `text-gray-500` | `text-on-surface-variant` |
| `text-gray-600` | `text-on-surface-variant` |
| `border-gray-200` | `border-outline-variant` |
| `text-red-500` | `text-error` |
| `bg-red-50` | `bg-error-container` |
| `bg-gray-50` | `bg-surface-container-low` |
| `hover:bg-gray-50` | `hover:bg-surface-container-low` |
| `focus:ring-orange-400` | `focus:ring-primary/40` |
| `bg-orange-500 text-white` | `bg-primary text-on-primary` |
| `hover:bg-orange-600` | `hover:bg-primary-container` |
| `text-xs` | `font-label-md text-label-md` |
| `divide-gray-100` | `divide-outline-variant` |

**Definisi selesai:** Halaman Stok memiliki tampilan visual yang konsisten dengan halaman Orders dan Dashboard.

**Effort:** Sedang (2 jam)

---

## 9. ROADMAP PRIORITAS {#roadmap}

### 🔴 SEGERA (Kritis — Hari Ini)

| FIX | Judul | Effort |
|---|---|---|
| #1 | Nama user kosong di Header | 5 mnt |
| #3 | Halaman sukses buat pesanan tidak hilang otomatis | 5 mnt |
| #2 | Hapus duplikasi error (inline + Toast) di 4 halaman | 30 mnt |
| #8 | Modal konfirmasi buat pesanan — info Takeaway kosong | 10 mnt |

**Total: ~50 menit**

---

### 🟡 JANGKA PENDEK (1–2 Minggu)

| FIX | Judul | Effort |
|---|---|---|
| #4 | Opsi Takeaway di CartPage pelanggan | 1 jam |
| #5 | Feedback saat tambah item ke keranjang | 45 mnt |
| #7 | Tombol Clear di SearchInput | 30 mnt |
| #11 | Feedback sukses setelah edit/tambah menu | 30 mnt |
| #12 | Debounce di SearchInput | 45 mnt |
| #13 | Tombol +/- quantity lebih besar | 45 mnt |
| #14 | aria-label pada tombol ikon | 30 mnt |
| #15 | Konsistensi design system StockPage | 2 jam |

**Total: ~7 jam**

---

### 🟢 JANGKA MENENGAH (1–3 Bulan)

| FIX | Judul | Effort |
|---|---|---|
| #6 | Keranjang sticky/floating di mobile | 1 jam |
| #9 | CSS print untuk struk pembayaran | 2 jam |
| #10 | Modal konfirmasi kecil di tengah layar | 1.5 jam |
| — | Tambah foto/gambar menu (placeholder atau upload) | Besar |
| — | Pagination di halaman Orders | 3 jam |
| — | Sorting pesanan berdasarkan waktu tunggu | 1 jam |
| — | Link dari LowStockAlert ke halaman Stok | 15 mnt |
| — | Konfirmasi sebelum qty dikurangi ke 0 | 30 mnt |
| — | Tombol "Salin Invoice" di halaman sukses Cart | 15 mnt |
| — | Focus trap di semua modal | 2 jam |
| — | Modal tutup saat tekan Escape | 30 mnt |

---

### ⚪ NICE-TO-HAVE (Backlog)

| Fitur | Deskripsi |
|---|---|
| Foto menu | Upload gambar untuk setiap menu item |
| Sorting menu | Filter harga: termurah → termahal |
| Notifikasi suara | Bunyi saat pesanan baru masuk |
| Animasi Toast | Slide-in dari bawah |
| Animasi Modal | Fade-in/scale-in |
| Dark Mode | Design tokens sudah mendukung, tinggal media query |
| Shortcut keyboard | Enter untuk konfirmasi, Escape untuk batal |
| Estimasi waktu saji | Tampilkan estimasi waktu tunggu setelah order dibuat |
| Histori pencarian | Simpan pencarian terakhir di localStorage |
| Filter tanggal histori stok | Untuk melihat mutasi per periode |

---

*Laporan UI/UX ini dibuat berdasarkan analisis kode statis semua file frontend. Screenshot dan pengujian langsung di browser disarankan untuk validasi temuan visual.*
