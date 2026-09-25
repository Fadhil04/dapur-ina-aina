# 📖 Dokumentasi Lengkap & Rangkuman Sistem — Dapur Ina Aina

Sistem Informasi Manajemen Pemesanan, Kasir, dan Mutasi Stok Restoran & Cafe berbasis Web (**Express.js + PostgreSQL + EJS**).

---

## 📑 Daftar Isi
1. [Gambaran Umum Sistem](#1-gambaran-umum-sistem)
2. [Arsitektur & Tech Stack](#2-arsitektur--tech-stack)
3. [Fitur Utama & Fungsionalitas](#3-fitur-utama--fungsionalitas)
4. [Struktur Direktori Proyek](#4-struktur-direktori-proyek)
5. [Struktur Navigasi & Alur Routing](#5-struktur-navigasi--alur-routing)
6. [Diagram UML](#6-diagram-uml)
   - [6.1 Use Case Diagram](#61-use-case-diagram)
   - [6.2 Activity Diagram — Pemesanan Pelanggan](#62-activity-diagram--alur-pemesanan-pelanggan)
   - [6.3 Activity Diagram — Pembayaran Kasir & Pengurangan Stok](#63-activity-diagram--alur-pembayaran-kasir--pengurangan-stok)
   - [6.4 Activity Diagram — Penyesuaian Mutasi Stok Admin](#64-activity-diagram--alur-penyesuaian-mutasi-stok-admin)
   - [6.5 Class Diagram (Arsitektur Model & Database)](#65-class-diagram)
7. [Skema Database & Relasi (ERD)](#7-skema-database--relasi-erd)
8. [Akun & Hak Akses (RBAC)](#8-akun--hak-akses-rbac)
9. [Panduan Instalasi & Menjalankan](#9-panduan-instalasi--menjalankan)

---

## 1. Gambaran Umum Sistem

**Dapur Ina Aina** adalah aplikasi manajemen restoran modern yang dirancang untuk:
- Memudahkan **Pelanggan** melihat buku menu interaktif secara mandiri, memilih makanan/minuman ke keranjang, dan melakukan pemesanan langsung dari meja makan mereka.
- Membantu **Kasir** memproses tagihan/billing, menerima pembayaran (Tunai / Non-Tunai), menghitung uang kembalian secara otomatis, dan mencetak struk kasir digital.
- Membantu **Administrator** memantau performa penjualan lewat analitik dashboard grafis 7 hari, memantau menu berstok rendah (*low stock warning*), mengelola katalog menu, serta mencatat mutasi penyesuaian stok (*Stock In / Rusak / Penjualan*).

---

## 2. Arsitektur & Tech Stack

Sistem dibangun menggunakan pola **MVC (Model-View-Controller)**:

- **Backend Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Web Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (didukung *connection pooling* via `pg`)
- **Template Engine**: [EJS (Embedded JavaScript Templates)](https://ejs.co/)
- **Styling UI/UX**: Custom Modern CSS Design System (Glassmorphism, Vibrant Palette, Micro-animations, Print Receipt Styling)
- **Visualisasi Grafik**: [Chart.js](https://www.chartjs.org/) (Dashboard pendapatan & omset)
- **Keamanan & Middleware**:
  - `bcrypt`: Hashing password aman
  - `express-session` + `connect-pg-simple`: Manajemen sesi terenkripsi yang persisten di PostgreSQL
  - `helmet`: Pengaturan HTTP Security Headers
  - `morgan`: Request HTTP Logger
  - `method-override`: Dukungan HTTP verbs `PUT` dan `DELETE` dari form HTML

---

## 3. Fitur Utama & Fungsionalitas

| ID | Fitur | Deskripsi | Aktor |
|---|---|---|---|
| **FR-1** | Katalog Menu Interaktif | Pelanggan dapat menjelajahi menu per kategori, melihat ketersediaan stok, harga, dan foto | Pelanggan |
| **FR-2** | Keranjang & Checkout Mandiri | Menambahkan menu ke keranjang belanja, mengubah kuantitas, input nama & meja, checkout pesanan | Pelanggan |
| **FR-3** | Concurrency Stock Lock | Menggunakan transaksi database `SELECT ... FOR UPDATE` saat checkout untuk mencegah race-condition antar pelanggan | Sistem |
| **FR-4** | Daftar Pesanan & Filter | Kasir/Admin melihat antrean order dengan tab filter status (`SEMUA`, `PENDING`, `LUNAS`) dan paginasi | Kasir, Admin |
| **FR-5** | Billing & Struk Digital | Rincian invoice pesanan, rincian item, pajak/subtotal, status transaksi, tombol cetak struk (*print-ready*) | Kasir, Admin |
| **FR-6** | Pembayaran Tunai | Validasi uang diterima >= tagihan, hitung kembalian instan, update order status ke `LUNAS` | Kasir, Admin |
| **FR-7** | Pembayaran Non-Tunai | Pencatatan transaksi Debit/Kredit/QRIS lengkap dengan nomor referensi approval | Kasir, Admin |
| **FR-8** | Otomasi Mutasi Stok Penjualan | Stok produk langsung terpotong saat pesanan dilunasi, dicatat ke tabel mutasi sebagai `PENJUALAN` | Sistem |
| **FR-9** | Manajemen Stok & Katalog | Menambah menu baru, mengedit harga/nama/kategori, soft-delete menu nonaktif | Admin |
| **FR-10** | Penyesuaian Mutasi Stok | Mencatat mutasi manual (`TAMBAH` atau `RUSAK/EXPIRED`) beserta catatan/alasan penyesuaian | Admin |
| **FR-11** | Riwayat Audit Mutasi Stok | Riwayat jejak audit stok per menu: stok awal, perubahan (+/-), stok akhir, pencatat, & waktu | Admin |
| **FR-12** | Dashboard Analitik & Metrik | Grafik omset 7 hari terakhir, omset hari ini, total pesanan pending & lunas, tabel peringatan stok tipis | Admin, Kasir |
| **FR-13** | Role-Based Access Control | Pembatasan hak akses berbasis peran (`admin` vs `cashier`) pada tingkat middleware | Sistem |

---

## 4. Struktur Direktori Proyek

```text
dapur_ina_aina/
├── public/                     # Asset Statis Publik
│   ├── css/
│   │   └── style.css           # Desain Sistem & Komponen CSS Modern
│   └── js/
│       └── main.js             # Interaktivitas UI, Kalkulasi Kembalian, Print Struk
├── src/
│   ├── config/                 # Konfigurasi Inti
│   │   ├── db.js               # Pool Koneksi Database PostgreSQL
│   │   └── session.js          # Konfigurasi Session Store PostgreSQL
│   ├── controllers/            # Controller Logika Bisnis (MVC)
│   │   ├── authController.js       # Login & Logout Autentikasi
│   │   ├── customerController.js   # Katalog Menu, Keranjang, Checkout Pelanggan
│   │   ├── dashboardController.js  # Metrik & Grafik Dashboard
│   │   ├── orderController.js      # Daftar Pesanan & Detail Billing
│   │   ├── paymentController.js    # Eksekusi Pembayaran & Deduct Stok
│   │   └── stockController.js      # CRUD Menu & Mutasi Stok
│   ├── middlewares/            # Middleware
│   │   ├── auth.js             # Guard Autentikasi & RBAC (Role Checker)
│   │   └── errorHandler.js     # Error Handler Terpusat
│   ├── models/                 # Model Data & Kueri Database
│   │   ├── menuItemModel.js        # Kueri Menu & Kategori
│   │   ├── orderModel.js           # Kueri Header Pesanan & Items
│   │   ├── paymentModel.js         # Kueri Transaksi Pembayaran
│   │   ├── stockMovementModel.js   # Kueri Pencatatan Mutasi Stok
│   │   └── userModel.js            # Kueri Pengguna & Verifikasi Bcrypt
│   ├── routes/                 # Routing Endpoint
│   │   ├── authRoutes.js           # /login, /logout
│   │   ├── customerRoutes.js       # /menu, /menu/cart, /cart, /cart/checkout
│   │   ├── dashboardRoutes.js      # /dashboard
│   │   ├── orderRoutes.js          # /orders, /orders/:id/billing
│   │   ├── paymentRoutes.js        # /orders/:id/pay
│   │   └── stockRoutes.js          # /stock, /stock/update, /stock/menu/*
│   └── views/                  # Tampilan Antarmuka EJS
│       ├── auth/login.ejs          # Form Login Petugas
│       ├── customer/
│       │   ├── menu.ejs            # Katalog Menu Publik
│       │   └── cart.ejs            # Keranjang Belanja & Checkout
│       ├── dashboard/index.ejs     # Dashboard Utama
│       ├── orders/
│       │   ├── index.ejs           # Tabel Antrean Pesanan
│       │   └── billing.ejs         # Billing, Struk & Form Kasir
│       ├── stock/
│       │   ├── index.ejs           # Tabel Stok & Mutasi
│       │   ├── menu_form.ejs       # Form Tambah/Edit Menu
│       │   └── history.ejs         # Riwayat Log Mutasi Menu
│       ├── partials/
│       │   ├── header.ejs          # Navbar, Metadata, Layout Atas
│       │   └── footer.ejs          # Footer, Layout Bawah
│       └── errors/
│           ├── 404.ejs             # Halaman Not Found
│           └── 500.ejs             # Halaman Internal Error
├── tests/                      # Suite Pengujian Otomatis
│   ├── e2e_flow_test.js        # Uji Flow Pelanggan, Auth, Navigasi
│   └── e2e_advanced_test.js    # Uji Pembayaran, Mutasi Stok, RBAC
├── .env                        # Variabel Lingkungan Database & Port
├── package.json                # Dependensi Proyek
└── server.js                   # Entry Point Utama Aplikasi
```

---

## 5. Struktur Navigasi & Alur Routing

```mermaid
graph TD
    Root["/ (Root URL)"] -->|Redirect| Menu["/menu (Katalog Menu Publik)"]
    
    subgraph Alur Pelanggan [Area Publik Pelanggan]
        Menu -->|Pilih Item & Qty| AddCart["POST /menu/cart"]
        AddCart --> Menu
        Menu -->|Buka Keranjang| Cart["GET /cart (Keranjang Pesanan)"]
        Cart -->|Hapus Item| RemoveCart["POST /cart/remove/:id"]
        RemoveCart --> Cart
        Cart -->|Kirim Order| Checkout["POST /cart/checkout"]
        Checkout -->|Nomor Invoice Terbit| CartSuccess["Tampilan Sukses Invoice"]
    end

    subgraph Alur Autentikasi [Login & Keamanan]
        Login["GET /login (Form Login Kasir/Admin)"]
        SubmitLogin["POST /login (Verifikasi Kredensial)"]
        Logout["POST /logout (Hancurkan Sesi)"]
        Login --> SubmitLogin
        SubmitLogin -->|Sukses| OrdersNav["Redirect -> /orders"]
        SubmitLogin -->|Gagal| Login
        Logout --> Login
    end

    subgraph Area Kasir & Admin [Staff Dashboard]
        OrdersNav --> OrdersList["GET /orders (Daftar Antrean Pesanan)"]
        OrdersList --> FilterOrder["GET /orders?status=PENDING/LUNAS&page=X"]
        OrdersList --> Billing["GET /orders/:id/billing (Billing & Struk)"]
        Billing --> ProcessPay["POST /orders/:id/pay (Bayar Tunai/Non-Tunai)"]
        ProcessPay -->|Update Lunas + Deduct Stok| Billing
        Billing --> PrintReceipt["Print Struk (Cetak Kertas Kasir)"]
        
        Dashboard["GET /dashboard (Metrik Omset & Grafik Chart.js)"]
    end

    subgraph Area Khusus Administrator [Role: admin Only]
        Stock["GET /stock (Manajemen Stok & Mutasi)"]
        Stock --> AddStock["POST /stock/update (Tambah/Rusak Stok)"]
        Stock --> AddMenuForm["GET /stock/menu/add (Form Menu Baru)"]
        AddMenuForm --> CreateMenu["POST /stock/menu"]
        Stock --> EditMenuForm["GET /stock/menu/:id/edit (Edit Menu)"]
        EditMenuForm --> UpdateMenu["PUT /stock/menu/:id"]
        Stock --> DeleteMenu["DELETE /stock/menu/:id (Soft Deactivate)"]
        Stock --> HistoryStock["GET /stock/:id/history (Riwayat Mutasi)"]
    end
```

---

## 6. Diagram UML

### 6.1 Use Case Diagram

```mermaid
graph LR
    actorCustomer((👤 Pelanggan))
    actorCashier((💳 Kasir))
    actorAdmin((👑 Administrator))

    subgraph Sistem Dapur Ina Aina
        UC1[Lihat Katalog Menu & Kategori]
        UC2[Kelola Keranjang Belanja]
        UC3[Checkout & Buat Pesanan Meja]
        
        UC4[Login / Logout Sistem]
        UC5[Lihat Daftar Pesanan & Filter Status]
        UC6[Lihat Billing & Rincian Tagihan]
        UC7[Proses Pembayaran Tunai / Non-Tunai]
        UC8[Cetak Struk Transaksi]
        UC9[Lihat Dashboard & Grafik Omset]

        UC10[Kelola Katalog Menu Tambah/Edit/Hapus]
        UC11[Update Mutasi Stok Manual Tambah/Rusak]
        UC12[Lihat Riwayat & Jejak Audit Mutasi Stok]
    end

    actorCustomer --> UC1
    actorCustomer --> UC2
    actorCustomer --> UC3

    actorCashier --> UC4
    actorCashier --> UC5
    actorCashier --> UC6
    actorCashier --> UC7
    actorCashier --> UC8
    actorCashier --> UC9

    actorAdmin --> UC4
    actorAdmin --> UC5
    actorAdmin --> UC6
    actorAdmin --> UC7
    actorAdmin --> UC8
    actorAdmin --> UC9
    actorAdmin --> UC10
    actorAdmin --> UC11
    actorAdmin --> UC12
```

---

### 6.2 Activity Diagram — Alur Pemesanan Pelanggan

```mermaid
stateDiagram-v2
    [*] --> BukaMenu: Akses /menu
    BukaMenu --> PilihKategori: Filter Kategori / Cari Menu
    PilihKategori --> TambahKeKeranjang: Klik 'Tambah ke Keranjang'
    TambahKeKeranjang --> BukaKeranjang: Buka /cart
    
    state KeranjangCheck <<choice>>
    BukaKeranjang --> KeranjangCheck
    KeranjangCheck --> BukaMenu: Ubah / Tambah Menu Lain
    KeranjangCheck --> InputDataMeja: Keranjang Sesuai

    InputDataMeja --> KlikCheckout: Isi Nama Pemesan & No Meja
    
    state ValidasiCheckout <<choice>>
    KlikCheckout --> ValidasiCheckout: Validasi Stok & Meja (SELECT FOR UPDATE)
    ValidasiCheckout --> KeranjangError: Stok Tidak Cukup / Data Kosong
    KeranjangError --> BukaKeranjang: Tampilkan Pesan Error
    
    ValidasiCheckout --> SimpanPesanan: Stok Cukup
    SimpanPesanan --> TerbitkanInvoice: Insert orders & order_items
    TerbitkanInvoice --> KosongkanKeranjang: Session Cart Di-reset
    KosongkanKeranjang --> TampilSukses: Tampilkan Nomor Invoice & Status PENDING
    TampilSukses --> [*]
```

---

### 6.3 Activity Diagram — Alur Pembayaran Kasir & Pengurangan Stok

```mermaid
stateDiagram-v2
    [*] --> BukaDaftarPesanan: Kasir Login & Buka /orders
    BukaDaftarPesanan --> PilihPesananPending: Klik Pesanan Status PENDING
    PilihPesananPending --> BukaBilling: Akses /orders/:id/billing
    BukaBilling --> PilihMetodeBayar: Pilih Metode Pembayaran

    state CekMetode <<choice>>
    PilihMetodeBayar --> CekMetode
    
    CekMetode --> FormTunai: Metode TUNAI
    FormTunai --> InputNominalUang: Masukkan Uang Diterima
    
    CekMetode --> FormNonTunai: Metode NON-TUNAI
    FormNonTunai --> InputRefCard: Masukkan Kartu/QRIS & No Ref Approval

    state ValidasiBayar <<choice>>
    InputNominalUang --> ValidasiBayar: Submit Pembayaran
    InputRefCard --> ValidasiBayar: Submit Pembayaran

    ValidasiBayar --> TolakBayar: Uang Kurang / Ref Kosong
    TolakBayar --> BukaBilling: Tampilkan Error Tagihan

    ValidasiBayar --> MulaiTransaksiDB: Data Valid (BEGIN)
    MulaiTransaksiDB --> InsertPayment: Simpan ke tabel payments
    InsertPayment --> UpdateStatusOrder: Set orders.status = 'LUNAS' & id_user kasir
    
    state LoopItems {
        [*] --> KurangiStokMenu: UPDATE menu_item.stock = stock - qty
        KurangiStokMenu --> CatatMutasiJual: INSERT stock_movement (type: 'PENJUALAN')
        CatatMutasiJual --> [*]
    }
    
    UpdateStatusOrder --> LoopItems
    LoopItems --> CommitTransaksi: Transaksi Sukses (COMMIT)
    CommitTransaksi --> TampilBillingLunas: Tampilkan Rincian Lunas & Kembalian
    TampilBillingLunas --> CetakStruk: Klik 'Cetak Struk'
    CetakStruk --> [*]
```

---

### 6.4 Activity Diagram — Alur Penyesuaian Mutasi Stok Admin

```mermaid
stateDiagram-v2
    [*] --> LoginAdmin: Admin Login
    LoginAdmin --> BukaMenuStok: Akses /stock
    BukaMenuStok --> PilihAksi: Pilih Menu yang Ingin Disesuaikan
    
    state CabangAksi <<choice>>
    PilihAksi --> CabangAksi
    
    CabangAksi --> ModalMutasi: Klik 'Sesuaikan Stok'
    ModalMutasi --> FormMutasi: Pilih Jenis (TAMBAH / RUSAK) & Jumlah
    FormMutasi --> SimpanMutasi: Submit Mutasi Stok
    SimpanMutasi --> UpdateStokDB: Update stock menu & catat stock_movement
    UpdateStokDB --> BukaMenuStok: Tampilkan Tabel Terkini
    
    CabangAksi --> BukaHistory: Klik 'Riwayat Mutasi'
    BukaHistory --> TampilAuditLog: Menampilkan Log Mutasi Perubahan Stok
    TampilAuditLog --> [*]
```

---

### 6.5 Class Diagram

```mermaid
classDiagram
    class User {
        +int id_user
        +string name_user
        +string username
        +string password
        +string role
        +boolean is_active
        +timestamp created_at
        +findByUsername(username)
        +verifyPassword(plain, hash)
        +hashPassword(plain)
    }

    class Category {
        +int id_category
        +string name_category
    }

    class MenuItem {
        +int id_menu_item
        +int id_category
        +string name_menu
        +decimal price
        +int stock
        +boolean is_active
        +findAll(filters)
        +findById(id)
        +create(data)
        +update(id, data)
        +updateStock(id, newStock, client)
        +deactivate(id)
    }

    class Order {
        +int id_order
        +int id_user
        +string invoice_number
        +string customer_name
        +string table_number
        +string status
        +decimal total_amount
        +timestamp created_at
        +createOrder(data, client)
        +findAll(options)
        +findById(id)
        +assignCashierAndSetStatus(id, idUser, status, client)
        +getCounts()
    }

    class OrderItem {
        +int id_order_item
        +int id_order
        +int id_menu_item
        +int quantity
        +decimal price
        +decimal subtotal
    }

    class Payment {
        +int id_payment
        +int id_order
        +string payment_method
        +decimal amount_paid
        +decimal cash_received
        +decimal change_amount
        +string card_type
        +string last_four
        +string reference_no
        +timestamp created_at
        +create(data, client)
        +findByOrderId(id_order)
    }

    class StockMovement {
        +int id_stock_movement
        +int id_menu_item
        +int id_user
        +string type
        +int quantity_before
        +int quantity_change
        +int quantity_after
        +string note
        +timestamp created_at
        +create(data, client)
        +findByMenuItem(id_menu_item)
    }

    Category "1" -- "0..*" MenuItem : mengelompokkan
    User "1" -- "0..*" Order : memproses_kasir
    User "1" -- "0..*" StockMovement : mencatat
    Order "1" -- "1..*" OrderItem : memiliki
    MenuItem "1" -- "0..*" OrderItem : dipesan_dalam
    Order "1" -- "0..1" Payment : dilunasi_oleh
    MenuItem "1" -- "0..*" StockMovement : memiliki_riwayat
```

---

## 7. Skema Database & Relasi (ERD)

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "melayani (id_user)"
    USERS ||--o{ STOCK_MOVEMENT : "mencatat (id_user)"
    CATEGORY ||--o{ MENU_ITEM : "kategori (id_category)"
    MENU_ITEM ||--o{ ORDER_ITEMS : "dipesan (id_menu_item)"
    MENU_ITEM ||--o{ STOCK_MOVEMENT : "audit (id_menu_item)"
    ORDERS ||--|{ ORDER_ITEMS : "rincian (id_order)"
    ORDERS ||--o| PAYMENTS : "pembayaran (id_order)"

    USERS {
        serial id_user PK
        varchar name_user
        varchar username UK
        varchar password
        enum_role role "admin | cashier"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    CATEGORY {
        serial id_category PK
        varchar name_category
    }

    MENU_ITEM {
        serial id_menu_item PK
        int id_category FK
        varchar name_menu
        decimal price
        int stock
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    ORDERS {
        serial id_order PK
        int id_user FK "Kasir Pelayan (Null saat Pending)"
        varchar invoice_number UK
        varchar customer_name
        varchar table_number
        enum_status status "PENDING | LUNAS"
        decimal total_amount
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        serial id_order_item PK
        int id_order FK
        int id_menu_item FK
        int quantity
        decimal price
        decimal subtotal
    }

    PAYMENTS {
        serial id_payment PK
        int id_order FK
        enum_payment payment_method "TUNAI | NON_TUNAI"
        decimal amount_paid
        decimal cash_received
        decimal change_amount
        varchar card_type
        varchar last_four
        varchar reference_no
        timestamp created_at
    }

    STOCK_MOVEMENT {
        serial id_stock_movement PK
        int id_menu_item FK
        int id_user FK
        enum_mutasi type "TAMBAH | RUSAK | PENJUALAN"
        int quantity_before
        int quantity_change
        int quantity_after
        varchar note
        timestamp created_at
    }
```

---

## 8. Akun & Hak Akses (RBAC)

Aplikasi dilengkapi dengan sistem keamanan **Role-Based Access Control (RBAC)**:

| Peran (Role) | Kredensial Default | Hak Akses & Pembatasan |
|---|---|---|
| **Administrator** | Username: `admin`<br>Password: `admin123` | **Akses Penuh (Full Access)**:<br>- Dashboard analitik & grafik omset<br>- Manajemen & antrean pesanan<br>- Proses billing kasir & cetak struk<br>- Manajemen stok produk & input mutasi<br>- Tambah/Edit/Hapus menu masakan |
| **Kasir (Cashier)** | Username: `kasir1`<br>Password: `kasir123` | **Operasional Kasir**:<br>- Melihat antrean pesanan meja<br>- Memproses pembayaran (Tunai & Non-Tunai)<br>- Mencetak struk transaksi pelanggan<br>- *Dilarang (403 Forbidden) mengakses menu stok & katalog* |
| **Pelanggan (Publik)**| *Tanpa Login* | **Pemesanan Mandiri**:<br>- Melihat katalog buku menu & harga<br>- Mengelola keranjang belanja<br>- Checkout mandiri berdasarkan nomor meja |

---

## 9. Panduan Instalasi & Menjalankan

### Persyaratan Sistem
- [Node.js](https://nodejs.org/) v18 atau lebih baru
- [PostgreSQL](https://www.postgresql.org/) v14 atau lebih baru

### 1. Konfigurasi Environment (`.env`)
Pastikan file `.env` di root proyek telah dikonfigurasi:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_NAME=dapur_ina_aina
SESSION_SECRET=supersecret_session_key_dapur_ina_aina_2026
```

### 2. Menjalankan Server
```bash
# Menjalankan aplikasi
npm start
# atau
node server.js
```
Akses aplikasi melalui browser di: **http://localhost:3000**

### 3. Menjalankan Uji Otomatis (Automated Tests)
```bash
# Menjalankan seluruh skenario pengujian E2E (17/17 PASS)
node tests/e2e_flow_test.js
node tests/e2e_advanced_test.js
```

---
*Dokumentasi ini digenerate secara otomatis untuk proyek Dapur Ina Aina.*
