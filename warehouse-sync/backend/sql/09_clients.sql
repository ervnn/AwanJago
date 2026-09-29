-- ============================================================
-- WarehouseSync — 09: Clients Table & RLS
-- ============================================================

create table clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  pic_name text not null,
  contact text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Tambahkan kolom client_id di outbounds
alter table outbounds add column client_id uuid references clients(id) on delete set null;

alter table clients enable row level security;

-- Semua user login boleh melihat klien
create policy "Authenticated users can view clients"
on clients
for select
to authenticated
using (true);

-- Hanya Admin boleh mengubah klien
create policy "Admin manage clients"
on clients
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
