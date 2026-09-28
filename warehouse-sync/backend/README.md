# WarehouseSync — Backend (Supabase)

Backend WarehouseSync menggunakan **Supabase** sebagai BaaS (Backend as a Service).
Tidak ada server custom — semua dihandle oleh Supabase:

| Layanan | Keterangan |
|---------|-----------|
| **Authentication** | Supabase Auth (JWT otomatis) |
| **Database** | PostgreSQL |
| **REST API** | Auto-generated dari schema |
| **Row Level Security** | Policy berbasis role |

## Urutan Setup

Jalankan SQL berikut secara berurutan di **Supabase SQL Editor**:

```
1. sql/01_tables.sql   → Membuat semua tabel
2. sql/02_triggers.sql → Trigger update stok + auto profile
3. sql/03_rls.sql      → Row Level Security policies
```

## Cara Membuat User

Karena tidak ada halaman register, user dibuat manual:

1. Buka Supabase Dashboard → **Authentication → Users**
2. Klik **Add User** → isi email & password
3. Setelah user dibuat, buka **Table Editor → profiles**
4. Set `role` = `admin` atau `staff` untuk user tersebut

> ⚠️ Jika trigger `handle_new_user` berjalan dengan benar,
> profile akan otomatis terbuat saat user didaftarkan.
> Kamu hanya perlu memastikan kolom `role` diisi dengan benar.
