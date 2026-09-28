-- ============================================================
-- WarehouseSync — 04: Dummy Data (Dari Januari - Bulan Ini)
-- ============================================================

-- Bersihkan data transaksi lama
delete from outbounds;
delete from inbounds;
delete from products where id::text like 'd290f1ee%';

-- Insert Dummy Products (Stock otomatis 0 di awal)
insert into products (id, sku, name, category, stock) values
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'ELK-001', 'Keyboard Mechanical RGB', 'Elektronik', 0),
  ('d290f1ee-6c54-4b01-90e6-d701748f0852', 'ELK-002', 'Mouse Wireless Pro', 'Elektronik', 0),
  ('d290f1ee-6c54-4b01-90e6-d701748f0853', 'MBL-001', 'Kursi Ergonomis', 'Furniture', 0),
  ('d290f1ee-6c54-4b01-90e6-d701748f0854', 'MBL-002', 'Meja Standing Desk', 'Furniture', 0),
  ('d290f1ee-6c54-4b01-90e6-d701748f0855', 'ATK-001', 'Kertas HVS A4 (Box)', 'ATK', 0);

-- Pakai DO block untuk set data berurutan dari Jan - Bulan Ini (Sep)
do $$
declare
  v_admin_id uuid;
  v_staff_id uuid;
  v_year int := extract(year from current_date)::int;
begin
  select id into v_admin_id from profiles where role = 'admin' limit 1;
  select id into v_staff_id from profiles where role = 'staff' limit 1;
  if v_staff_id is null then v_staff_id := v_admin_id; end if;

  -- ===== INBOUND (Januari - September) =====
  insert into inbounds (product_id, quantity, date, user_id) values
    -- Jan (1)
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 150, make_date(v_year, 1, 10), v_admin_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0852', 200, make_date(v_year, 1, 20), v_staff_id),
    -- Feb (2)
    ('d290f1ee-6c54-4b01-90e6-d701748f0853', 50,  make_date(v_year, 2, 5), v_admin_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0854', 40,  make_date(v_year, 2, 15), v_staff_id),
    -- Mar (3)
    ('d290f1ee-6c54-4b01-90e6-d701748f0855', 300, make_date(v_year, 3, 10), v_admin_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 100, make_date(v_year, 3, 25), v_staff_id),
    -- Apr (4)
    ('d290f1ee-6c54-4b01-90e6-d701748f0852', 150, make_date(v_year, 4, 12), v_admin_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 80,  make_date(v_year, 4, 18), v_staff_id),
    -- Mei (5)
    ('d290f1ee-6c54-4b01-90e6-d701748f0855', 200, make_date(v_year, 5, 5), v_admin_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0854', 30,  make_date(v_year, 5, 20), v_staff_id),
    -- Jun (6)
    ('d290f1ee-6c54-4b01-90e6-d701748f0853', 60,  make_date(v_year, 6, 8), v_admin_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 120, make_date(v_year, 6, 25), v_staff_id),
    -- Jul (7)
    ('d290f1ee-6c54-4b01-90e6-d701748f0852', 100, make_date(v_year, 7, 10), v_admin_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0855', 150, make_date(v_year, 7, 28), v_staff_id),
    -- Ags (8)
    ('d290f1ee-6c54-4b01-90e6-d701748f0854', 20,  make_date(v_year, 8, 5), v_admin_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 90,  make_date(v_year, 8, 20), v_staff_id),
    -- Sep (9) - Bulan Ini
    ('d290f1ee-6c54-4b01-90e6-d701748f0853', 45,  make_date(v_year, 9, 12), v_admin_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0852', 180, make_date(v_year, 9, 25), v_staff_id);

  -- ===== OUTBOUND (Januari - September) =====
  insert into outbounds (product_id, quantity, date, user_id) values
    -- Jan (1)
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 20, make_date(v_year, 1, 15), v_staff_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0852', 30, make_date(v_year, 1, 25), v_admin_id),
    -- Feb (2)
    ('d290f1ee-6c54-4b01-90e6-d701748f0853', 10, make_date(v_year, 2, 10), v_staff_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 40, make_date(v_year, 2, 28), v_admin_id),
    -- Mar (3)
    ('d290f1ee-6c54-4b01-90e6-d701748f0855', 50, make_date(v_year, 3, 15), v_staff_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0852', 20, make_date(v_year, 3, 30), v_admin_id),
    -- Apr (4)
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 25, make_date(v_year, 4, 20), v_staff_id),
    -- Mei (5)
    ('d290f1ee-6c54-4b01-90e6-d701748f0855', 60, make_date(v_year, 5, 12), v_staff_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0854', 5,  make_date(v_year, 5, 25), v_admin_id),
    -- Jun (6)
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 45, make_date(v_year, 6, 15), v_staff_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0853', 15, make_date(v_year, 6, 30), v_admin_id),
    -- Jul (7)
    ('d290f1ee-6c54-4b01-90e6-d701748f0852', 50, make_date(v_year, 7, 20), v_staff_id),
    -- Ags (8)
    ('d290f1ee-6c54-4b01-90e6-d701748f0855', 40, make_date(v_year, 8, 15), v_staff_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 30, make_date(v_year, 8, 25), v_admin_id),
    -- Sep (9) - Bulan Ini
    ('d290f1ee-6c54-4b01-90e6-d701748f0853', 20, make_date(v_year, 9, 18), v_staff_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0852', 35, make_date(v_year, 9, 28), v_admin_id);
end;
$$;
