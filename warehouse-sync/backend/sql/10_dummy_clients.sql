-- ============================================================
-- WarehouseSync — 10: Dummy Data Clients + Update existing transactions
-- ============================================================

-- Insert dummy suppliers (jika belum ada)
INSERT INTO suppliers (supplier_name, pic_name, contact, product_name) VALUES
('CV. Elektronik Jaya', 'Andi Pratama', '082198765432', 'Keyboard Mechanical RGB, Mouse Wireless Pro'),
('PT. Mebel Indo', 'Siti Aminah', '085311223344', 'Kursi Ergonomis, Meja Standing Desk'),
('Toko ATK Sejahtera', 'Budi Santoso', '081234567890', 'Kertas HVS A4 (Box)')
ON CONFLICT DO NOTHING;

-- Insert dummy clients
INSERT INTO clients (client_name, pic_name, contact) VALUES
('PT. Teknologi Nusantara', 'Hendra Wijaya', '081399988877'),
('CV. Kantor Prima', 'Dewi Lestari', '087711223344'),
('Toko Berkah Jaya', 'Rizky Maulana', '085600001122');

-- Update existing inbounds with supplier_id (distribusikan ke supplier yang sesuai)
do $$
declare
  v_sup_elekt uuid;
  v_sup_mebel uuid;
  v_sup_atk   uuid;
begin
  select id into v_sup_elekt from suppliers where supplier_name = 'CV. Elektronik Jaya' limit 1;
  select id into v_sup_mebel from suppliers where supplier_name = 'PT. Mebel Indo' limit 1;
  select id into v_sup_atk   from suppliers where supplier_name = 'Toko ATK Sejahtera' limit 1;

  -- Keyboard dan Mouse → Elektronik
  update inbounds set supplier_id = v_sup_elekt
  where product_id in (
    'D290F1EE-6C54-4B01-90E6-D701748F0851',
    'D290F1EE-6C54-4B01-90E6-D701748F0852'
  ) and supplier_id is null;

  -- Kursi dan Meja → Mebel
  update inbounds set supplier_id = v_sup_mebel
  where product_id in (
    'D290F1EE-6C54-4B01-90E6-D701748F0853',
    'D290F1EE-6C54-4B01-90E6-D701748F0854'
  ) and supplier_id is null;

  -- Kertas HVS → ATK
  update inbounds set supplier_id = v_sup_atk
  where product_id = 'D290F1EE-6C54-4B01-90E6-D701748F0855'
    and supplier_id is null;
end;
$$;

-- Update existing outbounds with client_id (distribusikan ke klien)
do $$
declare
  v_cl1 uuid;
  v_cl2 uuid;
  v_cl3 uuid;
  v_ids uuid[];
  v_rec record;
  v_i int := 0;
begin
  select id into v_cl1 from clients where client_name = 'PT. Teknologi Nusantara' limit 1;
  select id into v_cl2 from clients where client_name = 'CV. Kantor Prima' limit 1;
  select id into v_cl3 from clients where client_name = 'Toko Berkah Jaya' limit 1;

  v_ids := ARRAY[v_cl1, v_cl2, v_cl3];

  for v_rec in select id from outbounds where client_id is null order by date loop
    update outbounds set client_id = v_ids[(v_i % 3) + 1] where id = v_rec.id;
    v_i := v_i + 1;
  end loop;
end;
$$;
