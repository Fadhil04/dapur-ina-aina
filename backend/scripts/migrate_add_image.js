// Script migration: Tambah kolom image_url ke table menu_item
const pool = require('../src/config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Menjalankan migration: Tambah kolom image_url...');
    
    await client.query(`
      ALTER TABLE menu_item 
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
    `);
    
    await client.query(`
      COMMENT ON COLUMN menu_item.image_url IS 'URL gambar menu item (opsional)';
    `);
    
    console.log('✅ Migration berhasil! Kolom image_url sudah ditambahkan.');
    
    // Verifikasi
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'menu_item' AND column_name = 'image_url'
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ Verifikasi:', result.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Migration gagal:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
