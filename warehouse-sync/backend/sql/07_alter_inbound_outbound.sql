-- ============================================================
-- WarehouseSync — 07: Add Supplier to Transactions
-- ============================================================

alter table inbounds add column supplier_id uuid references suppliers(id) on delete set null;
alter table outbounds add column supplier_id uuid references suppliers(id) on delete set null;
