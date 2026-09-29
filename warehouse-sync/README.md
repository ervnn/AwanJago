# WarehouseSync

Aplikasi manajemen gudang berbasis web dengan arsitektur **React + Supabase**. Mendukung manajemen barang, supplier, klien, dan pencatatan transaksi barang masuk/keluar secara real-time.

---

## 🚀 Tech Stack

| Komponen       | Teknologi                |
|----------------|--------------------------|
| Frontend       | React + TypeScript (Vite)|
| UI             | Tailwind CSS             |
| Backend        | Supabase (BaaS)          |
| Database       | PostgreSQL               |
| Authentication | Supabase Auth (JWT)      |
| Deployment     | Vercel                   |

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
- Admin: CRUD penuh
- Staff: hanya lihat

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
- Riwayat transaksi: Tanggal, SKU, Nama Barang, Supplier, Qty, Dicatat Oleh

### Outbound (Barang Keluar)
- Input: Barang, Klien, Quantity, Tanggal
- Saat disimpan → Stock otomatis **berkurang** via SQL trigger
- Validasi: Quantity tidak boleh melebihi stock (cek client-side & server-side)
- Riwayat transaksi: Tanggal, SKU, Nama Barang, Klien, Qty, Dicatat Oleh

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
01_tables.sql              → Buat tabel utama
02_triggers.sql            → Trigger update stok otomatis
03_rls.sql                 → Row Level Security policies
04_dummy_data.sql          → Data dummy produk & transaksi
05_dummy_users.sql         → Data dummy user
06_suppliers.sql           → Tabel suppliers + RLS
07_alter_inbound_outbound.sql → Tambah supplier_id ke inbounds
09_clients.sql             → Tabel clients + tambah client_id ke outbounds
10_dummy_clients.sql       → Data dummy supplier & klien + update data lama
```

---

## 🏗️ Struktur Folder

```
warehouse-sync/
├── frontend/
│   ├── src/
│   │   ├── pages/         → DashboardPage, BarangPage, SupplierPage,
│   │   │                     ClientPage, InboundPage, OutboundPage
│   │   ├── components/    → Komponen reusable
│   │   ├── services/      → api.ts (Supabase queries)
│   │   ├── hooks/         → useAsync
│   │   ├── layouts/       → AppLayout (Sidebar)
│   │   ├── types/         → TypeScript interfaces
│   │   └── contexts/      → AuthContext
│   └── .env               → VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
│
└── backend/
    └── sql/               → Migration SQL files
```

---

## ⚙️ Setup & Deployment

### 1. Clone & Install

```bash
git clone <repo-url>
cd warehouse-sync/frontend
npm install
```

### 2. Konfigurasi Supabase

Isi file `.env` di folder `frontend/`:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Setup Database

Jalankan semua file SQL di folder `backend/sql/` secara berurutan di **Supabase SQL Editor**.

### 4. Buat User

1. Buka Supabase Dashboard → **Authentication → Users → Add User**
2. Setelah user dibuat, buka **Table Editor → profiles**
3. Set kolom `role` = `admin` atau `staff`

### 5. Jalankan Lokal

```bash
npm run dev
```

### 6. Deploy ke Vercel

Push ke GitHub → Vercel otomatis build & deploy.  
Pastikan **Environment Variables** (`VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`) sudah diisi di Vercel Dashboard.

---

## 🔒 Keamanan

- **Supabase Auth** — JWT otomatis untuk setiap request
- **Row Level Security (RLS)** — Setiap tabel dilindungi policy berbasis role
- **SQL Trigger** — Validasi stock di sisi server (tidak bisa di-bypass dari frontend)
