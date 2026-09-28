-- ============================================================
-- WarehouseSync — 06: Suppliers Table & RLS
-- ============================================================

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  supplier_name text not null,
  pic_name text not null,
  contact text not null,
  product_name text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table suppliers enable row level security;

-- Semua user login boleh melihat supplier
create policy "Authenticated users can view suppliers"
on suppliers
for select
to authenticated
using (true);

-- Hanya Admin boleh mengubah (insert, update, delete) supplier
create policy "Admin manage suppliers"
on suppliers
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
