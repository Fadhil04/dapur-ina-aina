# 📖 Dokumentasi Lengkap & Rangkuman Sistem — Dapur Ina Aina

Sistem Informasi Manajemen Pemesanan, Kasir, dan Mutasi Stok Restoran & Cafe berbasis Web (**Monorepo: Express.js + React + PostgreSQL + Vite**).

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

**Monorepo Architecture**: Dapur Ina Aina kini menggunakan pola monorepo dengan **React SPA** untuk frontend dan **Express.js REST API** untuk backend:

### Frontend (React SPA)
- **Framework**: React 19 + Vite (TypeScript/JSX)
- **Styling**: Tailwind CSS + CSS Modules
- **Routing**: React Router DOM v6
- **State Management**: React Context API + Zustand
- **Data Fetching**: Axios + React Query (@tanstack/react-query)
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React

### Backend (REST API)
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 4
- **Database**: PostgreSQL + pg (node-postgres)
- **Authentication**: JWT (JSON Web Tokens) + bcrypt
- **Validation**: Zod (schema validation)
- **Excel Export**: ExcelJS (untuk laporan Excel)
- **Security Middleware**: Helmet, CORS, express-rate-limit

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
| **FR-14** | Laporan Excel Sales Report | Admin-only sales report dengan Excel download dan date range picker (tingkat meja) | Admin |

---

## 4. Struktur Direktori Proyek (Monorepo)

```text
dapur_ina_aina/ (ROOT MONOREPO)
├── backend/                    # Express.js REST API
│   ├── src/
│   │   ├── config/            # Konfigurasi Database, Middleware
│   │   │   └── db.js          # PostgreSQL Pool Connection
│   │   ├── controllers/       # Controller Business Logic
│   │   │   ├── authController.js      # Login, Logout, JWT Auth
│   │   │   ├── menuController.js      # CRUD Menu & Kategori
│   │   │   ├── orderController.js     # Order Management
│   │   │   ├── paymentController.js   # Payment Processing
│   │   │   ├── stockController.js     # Stock CRUD & Mutations
│   │   │   ├── dashboardController.js # Dashboard Analytics
│   │   │   └── reportController.js    # Excel Report Generation
│   │   ├── middlewares/       # Middleware Layers
│   │   │   ├── auth.js        # JWT Authentication & RBAC
│   │   │   ├── validator.js   # Zod Input Validation
│   │   │   └── errorHandler.js # Global Error Handler
│   │   ├── models/            # Database Models & Queries
│   │   │   ├── userModel.js          # Users & Authentication
│   │   │   ├── menuItemModel.js      # Menu Items & Categories
│   │   │   ├── orderModel.js         # Orders & Order Items
│   │   │   ├── paymentModel.js       # Payment Transactions
│   │   │   └── stockMovementModel.js # Stock Audit Trail
│   │   ├── routes/            # REST API Routes
│   │   │   ├── api.js         # Master Router /api/v1
│   │   │   ├── authRoutes.js          # /auth
│   │   │   ├── menuRoutes.js          # /menu
│   │   │   ├── orderRoutes.js         # /orders (includes /orders/report/excel)
│   │   │   ├── stockRoutes.js         # /stock (admin only)
│   │   │   └── dashboardRoutes.js     # /dashboard (admin only)
│   ├── tests/                 # Automated Tests
│   │   └── e2e_flow.test.js   # E2E Test Suite
│   ├── scripts/               # Database & Migration Scripts
│   │   ├── update_passwords.js
│   │   ├── migrate_add_image.js
│   │   └── add_image_to_menu.sql
│   ├── server.js              # Express Server Entry Point
│   └── package.json           # Backend Dependencies (~1313 LOC)
├── frontend/                  # React SPA Application
│   ├── src/
│   │   ├── api/              # API Client Configuration
│   │   │   └── client.js             # Axios Instance & Interceptors
│   │   ├── components/        # Reusable UI Components
│   │   │   ├── ui/            # Base UI Components
│   │   │   │   ├── Toast.jsx          # Notification Toast
│   │   │   │   ├── Modal.jsx          # Dialog Modal
│   │   │   │   ├── LoadingSkeleton.jsx
│   │   │   │   ├── KpiCard.jsx        # KPI Stat Card
│   │   │   │   ├── EmptyState.jsx     # Empty State UI
│   │   │   │   ├── index.jsx          # UI Components Barrel Export
│   │   │   │   └── ui.js              # Legacy UI Utils
│   │   │   ├── customer/      # Customer-Facing Components
│   │   │   │   ├── MenuCard.jsx       # Menu Item Card
│   │   │   │   └── CategoryPills.jsx  # Category Filter Pills
│   │   │   ├── admin/         # Admin Dashboard Components
│   │   │   │   ├── StatCard.jsx       # Dashboard Stats
│   │   │   │   ├── RevenueChart.jsx   # Revenue Charts
│   │   │   │   ├── OrderTable.jsx     # Orders Table
│   │   │   │   └── LowStockAlert.jsx  # Low Stock Alerts
│   │   │   ├── layout/        # Layout Components
│   │   │   │   ├── Header.jsx         # Navigation Header
│   │   │   │   └── Footer.jsx         # Page Footer
│   │   │   └── Receipt.jsx    # Thermal Receipt Printer Component
│   │   ├── layouts/          # Page Layout Wrappers
│   │   │   ├── CustomerLayout.jsx    # Customer-facing Layout
│   │   │   └── DashboardLayout.jsx   # Protected Dashboard Layout
│   │   ├── pages/            # Page Components
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.jsx     # Staff Login Page
│   │   │   ├── customer/              # Customer Pages
│   │   │   │   ├── MenuPage.jsx       # Menu Catalog
│   │   │   │   └── CartPage.jsx       # Shopping Cart
│   │   │   └── admin/                 # Admin Pages
│   │   │       ├── DashboardPage.jsx  # Analytics Dashboard
│   │   │       ├── OrdersPage.jsx     # Orders Management
│   │   │       ├── CreateOrderPage.jsx # Create New Order
│   │   │       ├── BillingPage.jsx    # Billing & Payment
│   │   │       ├── StockPage.jsx      # Stock Management
│   │   │       └── StockHistoryPage.jsx # Stock Audit History
│   │   ├── services/         # API Service Layer
│   │   │   ├── api.js                # Legacy API Utils
│   │   │   ├── authService.js        # Auth API Calls
│   │   │   ├── menuService.js        # Menu API Calls
│   │   │   ├── orderService.js       # Order API Calls
│   │   │   ├── stockService.js       # Stock API Calls
│   │   │   └── dashboardService.js   # Dashboard API Calls
│   │   ├── context/          # React Context Providers
│   │   │   ├── AuthContext.jsx        # Authentication State
│   │   │   └── CartContext.jsx        # Shopping Cart State
│   │   ├── hooks/            # Custom React Hooks
│   │   │   └── useApi.js             # API Fetching Hook
│   │   ├── utils/            # Utility Functions
│   │   │   ├── format.js             # Number & Date Formatting
│   │   │   └── billing.js            # Billing Calculations
│   │   ├── App.jsx           # Main App Component & Routing
│   │   └── main.jsx          # Application Entry Point
│   ├── dist/                 # Production Build Output
│   └── package.json          # Frontend Dependencies (~653 LOC)
├── package.json              # Root Monorepo Config
│   ├── dev:backend           # Run backend dev server
│   ├── dev:frontend          # Run frontend dev server
│   └── dev:all               # Run both concurrently
├── .gitignore                # Git Ignore Rules
├── .env                      # Environment Variables
└── RANGKUMAN_PROJEK.md       # This Documentation
```

---

## 5. Struktur Navigasi & Alur Routing (React SPA)

```mermaid
graph TD
    Root["/ (Root)"] -->|Redirect| Menu["/menu (Menu Catalog)"]
    
    subgraph Public Area [Public - Customer]
        Menu -->|Pilih Item & Qty| Cart["/cart (Shopping Cart)"]
        Cart -->|Checkout| OrderSuccess["Order Success Page"]
        Menu --> Login["/login (Staff Login)"]
    end
    
    subgraph Protected Area [Staff Dashboard - Protected by JWT]
        Login -->|Success Redirect| Orders["/orders (Orders List)"]
        Orders -->|Create New| CreateOrder["/orders/create"]
        Orders -->|View Details| Billing["/orders/:id/billing"]
        Orders -->|Admin Only| Dashboard["/dashboard"]
        Dashboard -->|Admin Only| Stock["/stock"]
        Stock -->|View History| StockHistory["/stock/:id/history"]
    end
    
    subgraph RBAC Protection [Role-Based Access Control]
        Orders -- Allowed --> Kasir["Role: cashier"]
        Orders -- Allowed --> Admin["Role: admin"]
        Dashboard -- Only --> Admin
        Stock -- Only --> Admin
    end
```

**API Endpoints**:
- `POST /api/v1/auth/login` - Login staff (rate limited: 5/15min)
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/logout` - Logout staff
- `GET /api/v1/menu` - Get all menu items (public)
- `GET /api/v1/menu/categories` - Get menu categories (public)
- `GET /api/v1/menu/:id` - Get menu item by ID (public)
- `POST /api/v1/menu` - Create menu item (admin only)
- `PUT /api/v1/menu/:id` - Update menu item (admin only)
- `DELETE /api/v1/menu/:id` - Deactivate menu item (admin only)
- `POST /api/v1/orders/checkout` - Customer checkout (public)
- `POST /api/v1/orders/create-for-customer` - Kasir create order (protected)
- `GET /api/v1/orders` - List orders with filters (protected)
- `GET /api/v1/orders/counts` - Get order counts by status (protected)
- `GET /api/v1/orders/:id` - Get order detail (protected)
- `POST /api/v1/orders/:id/pay` - Process payment (protected)
- `GET /api/v1/orders/report/excel` - Excel sales report (admin only)
- `GET /api/v1/dashboard/stats` - Dashboard statistics (admin only)
- `GET /api/v1/dashboard/chart` - Revenue chart data (admin only)
- `GET /api/v1/stock` - List all stock (admin only)
- `POST /api/v1/stock/adjust` - Adjust stock manually (admin only)
- `GET /api/v1/stock/:id/history` - Stock movement history (admin only)

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
        
        UC4[Login / Logout Sistem via JWT]
        UC5[Lihat Daftar Pesanan & Filter Status]
        UC6[Lihat Billing & Rincian Tagihan]
        UC7[Proses Pembayaran Tunai / Non-Tunai]
        UC8[Cetak Struk Transaksi]
        UC9[Lihat Dashboard & Grafik Omset]
        UC10[Unduh Laporan Excel Penjualan]

        UC11[Kelola Katalog Menu Tambah/Edit/Hapus]
        UC12[Update Mutasi Stok Manual Tambah/Rusak]
        UC13[Lihat Riwayat & Jejak Audit Mutasi Stok]
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
    actorAdmin --> UC13
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
        varchar image_url
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
| **Administrator** | Username: `admin`<br>Password: `admin123` | **Akses Penuh (Full Access)**:<br>- Dashboard analitik & grafik omset<br>- Manajemen & antrean pesanan<br>- Proses billing kasir & cetak struk<br>- Manajemen stok produk & input mutasi<br>- Tambah/Edit/Hapus menu masakan<br>- Unduh laporan Excel penjualan |
| **Kasir (Cashier)** | Username: `kasir1`<br>Password: `kasir123` | **Operasional Kasir**:<br>- Melihat antrean pesanan meja<br>- Memproses pembayaran (Tunai & Non-Tunai)<br>- Mencetak struk transaksi pelanggan<br>- *Dilarang (403 Forbidden) mengakses menu stok, katalog, dan dashboard admin* |
| **Pelanggan (Publik)**| *Tanpa Login* | **Pemesanan Mandiri**:<br>- Melihat katalog buku menu & harga<br>- Mengelola keranjang belanja<br>- Checkout mandiri berdasarkan nomor meja |

**Authentication Flow**:
1. Staff login via `/login` page
2. Backend validates credentials, generates JWT token
3. Token stored in localStorage / HTTP-only cookie
4. Frontend includes token in `Authorization: Bearer <token>` header
5. Backend middleware validates token for protected routes
6. RBAC middleware checks user role for admin-only endpoints

---

## 9. Panduan Instalasi & Menjalankan

### Persyaratan Sistem
- [Node.js](https://nodejs.org/) v18 atau lebih baru
- [PostgreSQL](https://www.postgresql.org/) v14 atau lebih baru
- [Git](https://git-scm.com/) (untuk cloning)

### 1. Konfigurasi Environment (`.env`)
Buat file `.env` di root direktori dengan konfigurasi berikut:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_NAME=dapur_ina_aina

# JWT Configuration
JWT_SECRET=supersecret_jwt_key_dapur_ina_aina_2026
JWT_EXPIRES_IN=24h

# Server Ports
BACKEND_PORT=3001
FRONTEND_PORT=5173

# CORS Origin
CORS_ORIGIN=http://localhost:5173
```

### 2. Setup Database
```bash
# Login ke PostgreSQL dan buat database
psql -U postgres
CREATE DATABASE dapur_ina_aina;

# Import skema database (jika ada file SQL)
psql -U postgres -d dapur_ina_aina -f database/schema.sql
```

### 3. Menjalankan Aplikasi (Monorepo)

#### Option A: Jalankan Semua (Backend + Frontend)
```bash
# Install dependencies untuk semua bagian
npm run install:all

# Jalankan backend dan frontend secara bersamaan
npm run dev:all
```

#### Option B: Jalankan Terpisah
```bash
# Backend API (Express.js)
cd backend
npm install
npm run dev
# API berjalan di http://localhost:3001

# Frontend SPA (React)
cd frontend
npm install
npm run dev
# Frontend berjalan di http://localhost:5173
```

### 4. Akses Aplikasi
- **Frontend SPA**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/v1/docs (jika tersedia)

### 5. Menjalankan Uji Otomatis
```bash
# Jalankan test suite untuk backend
cd backend
npm test

# Jalankan E2E test (jika tersedia)
node tests/e2e_flow.test.js
```

---

## 10. Fitur Terbaru & Status Perkembangan

### ✅ Sudah Diimplementasikan & Stabil:
1. **Arsitektur Monorepo** - Backend Express.js + Frontend React SPA terpisah
2. **JWT Authentication** - Token-based auth dengan rate limiting (5/15min)
3. **React Router v6** - Client-side routing dengan protected routes & lazy loading
4. **Tailwind CSS + Responsive Design** - Mobile-first responsive layout
5. **React Context API** - State management untuk auth & shopping cart
6. **Excel Sales Report** - Admin-only report dengan date range picker
7. **Thermal Receipt Printing** - Struk digital untuk transaksi kasir
8. **Concurrency Control** - Database transaction locks untuk stok
9. **RBAC (Role-Based Access Control)** - Admin vs Kasir permission system
10. **Dashboard Analytics** - Grafik omset 7 hari & real-time stats

### 🔧 Fitur Baru Terbaru (Sep 2026):
1. **Admin-only Excel Report** - Laporan penjualan dengan rentang tanggal
2. **Receipt After Payment** - Struk digital otomatis setelah pembayaran
3. **Database Optimization** - Perbaikan query dan path imports
4. **Payment Confirmation Flow** - Alur pembayaran yang lebih smooth
5. **Login Rate Limiting** - Proteksi terhadap brute force attacks

### 🚧 Perbaikan & Refactoring:
1. **Route Security Fix** - Dashboard route protection (SEC-01)
2. **Bug Fixes** - Perbaikan bug pada billing & payment flows
3. **Code Cleanup** - Penghapusan file tidak terpakai & duplikasi
4. **Database Schema** - Skema database yang konsisten

### 📊 Statistik Proyek:
- **Backend**: ~1,313 baris kode JavaScript
- **Frontend**: ~653 baris kode JSX/JavaScript
- **Total**: ~1,966 baris kode
- **API Endpoints**: 20+ endpoints dengan RBAC protection
- **Database Tables**: 7 tabel dengan relasi lengkap

### 🔄 Potensi Pengembangan:
1. **TypeScript Migration** - Migrasi dari JSX ke TypeScript
2. **WebSocket Integration** - Real-time order notifications
3. **PWA Support** - Installable web app untuk tablet/kasir
4. **Redis Caching** - Caching untuk performance improvement
5. **Docker Deployment** - Containerized deployment
6. **QR Code Payment** - Integrasi dengan payment gateway lokal

### 📋 Kompatibilitas Browser:
- Chrome 90+ (rekomendasi)
- Firefox 88+
- Safari 14+
- Edge 90+

---

*Dokumentasi ini diperbarui terakhir: September 26, 2026 (berdasarkan commit terbaru: 38a8fd4 "Memperbaiki laporan penjualan")*
*Versi Sistem: 2.0.0 (Monorepo Edition)*
*Architecture: Modern SPA + REST API*
*Status: Production-ready dengan fitur lengkap untuk operasional restoran*
