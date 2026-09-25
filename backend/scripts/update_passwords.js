const pool = require('../src/config/db');
const bcrypt = require('bcrypt');

async function updatePasswords() {
  try {
    const adminHash = await bcrypt.hash('admin123', 10);
    const kasirHash = await bcrypt.hash('kasir123', 10);

    await pool.query('UPDATE users SET password = $1 WHERE username = $2', [adminHash, 'admin']);
    await pool.query('UPDATE users SET password = $1 WHERE username = $2', [kasirHash, 'kasir1']);

    console.log('✅ Passwords successfully updated with real bcrypt hashes!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating passwords:', err);
    process.exit(1);
  }
}

updatePasswords();
