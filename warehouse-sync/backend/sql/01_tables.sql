-- ============================================================
-- WarehouseSync — 01: Table Definitions
-- Jalankan file ini pertama di Supabase SQL Editor
-- ============================================================

-- Profiles (linked to auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  role text check (role in ('admin','staff')) not null,
  created_at timestamp default now()
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  category text not null,
  stock integer default 0 check (stock >= 0),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Inbounds
create table inbounds (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  date date default current_date,
  user_id uuid references profiles(id),
  created_at timestamp default now()
);

-- Outbounds
create table outbounds (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  date date default current_date,
  user_id uuid references profiles(id),
  created_at timestamp default now()
);
