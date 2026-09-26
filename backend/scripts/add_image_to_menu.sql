-- Migration: Tambah kolom image_url ke table menu_item
-- Tanggal: 2026-09-26

ALTER TABLE menu_item 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

COMMENT ON COLUMN menu_item.image_url IS 'URL gambar menu item (opsional)';
