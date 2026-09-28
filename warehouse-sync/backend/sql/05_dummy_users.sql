-- ============================================================
-- WarehouseSync — 05: Dummy Users
-- Menambahkan Admin dan Staff ke tabel auth.users
-- Trigger akan otomatis membuat data di tabel profiles
-- ============================================================

-- Ekstensi pgcrypto dibutuhkan untuk hashing password
create extension if not exists pgcrypto;

-- 1. Buat User Admin (admin@test.com / password123)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin Utama","role":"admin"}',
  now(),
  now()
);

-- 2. Buat User Staff (staff@test.com / password123)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'staff@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Staff Gudang","role":"staff"}',
  now(),
  now()
);
