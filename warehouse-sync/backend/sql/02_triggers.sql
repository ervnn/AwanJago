-- ============================================================
-- WarehouseSync — 02: Triggers & Functions
-- Jalankan setelah 01_tables.sql
-- ============================================================

-- Auto create profile saat user daftar via Supabase Auth
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'staff')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- ============================================================
-- Trigger: tambah stock saat Inbound
-- ============================================================
create or replace function increase_stock()
returns trigger as $$
begin
  update products
  set stock = stock + new.quantity,
      updated_at = now()
  where id = new.product_id;

  return new;
end;
$$ language plpgsql;

create trigger inbound_stock_trigger
after insert on inbounds
for each row
execute function increase_stock();

-- ============================================================
-- Trigger: kurangi stock saat Outbound + validasi
-- ============================================================
create or replace function decrease_stock()
returns trigger as $$
begin
  if (select stock from products where id = new.product_id) < new.quantity then
    raise exception 'Insufficient stock';
  end if;

  update products
  set stock = stock - new.quantity,
      updated_at = now()
  where id = new.product_id;

  return new;
end;
$$ language plpgsql;

create trigger outbound_stock_trigger
after insert on outbounds
for each row
execute function decrease_stock();
