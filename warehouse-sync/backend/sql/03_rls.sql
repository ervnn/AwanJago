-- ============================================================
-- WarehouseSync — 03: Row Level Security (RLS)
-- Jalankan setelah 02_triggers.sql
-- ============================================================

-- Aktifkan RLS pada semua tabel
alter table profiles enable row level security;
alter table products enable row level security;
alter table inbounds enable row level security;
alter table outbounds enable row level security;

-- ============================================================
-- PROFILES
-- User hanya bisa melihat profil sendiri
-- ============================================================
create policy "Users view own profile"
on profiles
for select
to authenticated
using (auth.uid() = id);

-- ============================================================
-- PRODUCTS
-- Semua user login boleh melihat barang
-- ============================================================
create policy "Authenticated users can view products"
on products
for select
to authenticated
using (true);

-- Hanya Admin boleh mengubah (insert, update, delete) barang
create policy "Admin manage products"
on products
for all
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and role = 'admin'
  )
);

-- ============================================================
-- INBOUNDS
-- Semua user terautentikasi bisa membuat & melihat inbound
-- ============================================================
create policy "Authenticated users manage inbounds"
on inbounds
for all
to authenticated
using (true)
with check (true);

-- ============================================================
-- OUTBOUNDS
-- Semua user terautentikasi bisa membuat & melihat outbound
-- ============================================================
create policy "Authenticated users manage outbounds"
on outbounds
for all
to authenticated
using (true)
with check (true);
