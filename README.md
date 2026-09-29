# AwanJago — WarehouseSync

Aplikasi manajemen gudang berbasis web dengan arsitektur **React + Supabase**. Mendukung manajemen barang, supplier, klien, dan pencatatan transaksi barang masuk/keluar secara real-time.

---

## 💡 Business Model

WarehouseSync mengelola alur barang dari **Supplier → Gudang → Klien** secara terpusat.

```
SUPPLIER
   │
   │  Mengirim barang ke gudang
   ▼
[INBOUND]  →  Stok Barang Bertambah
   │
   │  Barang tersimpan di gudang
   ▼
[GUDANG / STOK]
   │
   │  Barang dikirim ke klien/pemesan
   ▼
[OUTBOUND]  →  Stok Barang Berkurang
   │
   ▼
KLIEN
```

### Alur Lengkap

1. **Master Data** — Admin menginput data Barang, Supplier, dan Klien terlebih dahulu.
2. **Inbound** — Saat barang datang dari Supplier, staff mencatat transaksi Inbound (pilih barang, supplier, qty, tanggal). Stok otomatis **bertambah**.
3. **Stok Terpantau** — Dashboard menampilkan total stok, total barang, dan grafik tren bulanan secara real-time.
4. **Outbound** — Saat barang keluar ke Klien, staff mencatat transaksi Outbound (pilih barang, klien, qty, tanggal). Stok otomatis **berkurang**.
5. **Validasi** — Sistem menolak Outbound jika qty melebihi stok yang tersedia (dicek di sisi client & server via SQL trigger).

### Aktor

| Aktor       | Peran                                                                 |
|-------------|-----------------------------------------------------------------------|
| **Admin**   | Kelola master data (Barang, Supplier, Klien) + catat transaksi        |
| **Staff**   | Catat transaksi Inbound & Outbound (tidak bisa ubah master data)      |
| **Supplier**| Pihak yang mengirim barang masuk ke gudang (dicatat di Inbound)       |
| **Klien**   | Pihak yang menerima/membeli barang dari gudang (dicatat di Outbound)  |

---

## 🔗 Links

| | |
|---|---|
| **Frontend (Live)** | https://warehouse-sync-pi.vercel.app/ |
| **Database** | Supabase — Project: `gudang` |

---

## 🔐 Credentials

### Database Supabase
- **Name:** gudang
- **Password:** Gudang123!@#

### Test Accounts
| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | paijo@test.com       | qwerty123 |
| Staff | miswanto@test.com    | qwerty123 |

---

## 🚀 Tech Stack

| Komponen       | Teknologi                 |
|----------------|---------------------------|
| Frontend       | React + TypeScript (Vite) |
| UI             | Tailwind CSS              |
| Backend        | Supabase (BaaS)           |
| Database       | PostgreSQL                |
| Authentication | Supabase Auth (JWT)       |
| Deployment     | Vercel                    |

---

## 👥 Role Pengguna

### Admin
- Login & Dashboard
- CRUD Barang (Tambah, Edit, Hapus)
- CRUD Supplier
- CRUD Klien
- Catat Inbound & Outbound

### Staff
- Login & Dashboard
- Lihat data Barang, Supplier, Klien
- Catat Inbound & Outbound
- *(Tidak bisa mengubah data master)*

---

## 📋 Fitur

### Dashboard
- Total Barang, Total Stock, Total Inbound, Total Outbound
- Filter statistik berdasarkan bulan
- Grafik tren Inbound vs Outbound bulanan (tahun berjalan)

### Barang
- Field: SKU, Nama Barang, Kategori, Stock
- Admin: CRUD penuh | Staff: hanya lihat

### Supplier
- Field: Nama Supplier, Nama PIC, Kontak, Nama Barang yang Disuplai
- Terhubung ke transaksi **Inbound**
- Admin: CRUD penuh | Staff: hanya lihat

### Klien
- Field: Nama Klien / Perusahaan, Nama PIC, Kontak
- Terhubung ke transaksi **Outbound**
- Admin: CRUD penuh | Staff: hanya lihat

### Inbound (Barang Masuk)
- Input: Barang, Supplier, Quantity, Tanggal
- Saat disimpan → Stock otomatis **bertambah** via SQL trigger

### Outbound (Barang Keluar)
- Input: Barang, Klien, Quantity, Tanggal
- Saat disimpan → Stock otomatis **berkurang** via SQL trigger
- Validasi: Quantity tidak boleh melebihi stock

---

## 🗃️ Database Schema

```
profiles        → Data user (id, name, email, role)
products        → Master barang (sku, name, category, stock)
suppliers       → Data supplier (supplier_name, pic_name, contact, product_name)
clients         → Data klien (client_name, pic_name, contact)
inbounds        → Transaksi masuk (product_id, supplier_id, quantity, date, user_id)
outbounds       → Transaksi keluar (product_id, client_id, quantity, date, user_id)
```

**SQL Migrations (jalankan berurutan di Supabase SQL Editor):**

```
01_tables.sql                  → Buat tabel utama
02_triggers.sql                → Trigger update stok otomatis
03_rls.sql                     → Row Level Security policies
04_dummy_data.sql              → Data dummy produk & transaksi
05_dummy_users.sql             → Data dummy user
06_suppliers.sql               → Tabel suppliers + RLS
07_alter_inbound_outbound.sql  → Tambah supplier_id ke inbounds
09_clients.sql                 → Tabel clients + tambah client_id ke outbounds
10_dummy_clients.sql           → Data dummy supplier & klien + update data lama
```

---

## 🏗️ Struktur Folder

```
warehouse-sync/
├── frontend/
│   ├── src/
│   │   ├── pages/        → Dashboard, Barang, Supplier, Klien, Inbound, Outbound
│   │   ├── services/     → api.ts (Supabase queries)
│   │   ├── hooks/        → useAsync
│   │   ├── layouts/      → AppLayout (Sidebar)
│   │   ├── types/        → TypeScript interfaces
│   │   └── contexts/     → AuthContext
│   └── .env              → VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
└── backend/
    └── sql/              → Migration SQL files
```
