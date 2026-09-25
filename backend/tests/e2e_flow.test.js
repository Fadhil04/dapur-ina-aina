/**
 * E2E Flow Test — Dapur Ina Aina Backend API
 *
 * Menguji alur lengkap:
 *   Login → GET Menu → Checkout → GET Order (PENDING) → Pay → GET Order (LUNAS) → Verifikasi stok berkurang
 *
 * Membutuhkan koneksi database aktif dan data user yang valid.
 * Jalankan dengan: npm test (di folder backend/)
 */
require('dotenv').config();
const request = require('supertest');
const app     = require('../server');
const pool    = require('../src/config/db');

// Kredensial dari .env atau fallback ke data seeding default
const CASHIER_USER = process.env.TEST_USER     || 'admin';
const CASHIER_PASS = process.env.TEST_PASSWORD || 'admin123';

let authToken  = null;
let testOrderId = null;
let testMenuId  = null;
let stockBefore = null;

afterAll(async () => {
  // Tutup pool koneksi agar Jest bisa exit
  await pool.end();
});

describe('Fase 1 — Autentikasi', () => {
  test('POST /api/v1/auth/login dengan kredensial valid → 200 + JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: CASHIER_USER, password: CASHIER_PASS });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBeDefined();

    authToken = res.body.data.token;
  });

  test('POST /api/v1/auth/login dengan password salah → 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: CASHIER_USER, password: 'SALAH_PASSWORD' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/auth/me dengan token valid → 200 + user data', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user).toBeDefined();
  });
});

describe('Fase 2 — Menu (publik)', () => {
  test('GET /api/v1/menu → 200 + array menu', async () => {
    const res = await request(app).get('/api/v1/menu');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    // Simpan menu pertama dengan stok > 0 untuk dipakai checkout
    const available = res.body.data.find(m => m.stock > 0);
    expect(available).toBeDefined();
    testMenuId  = available.id_menu_item;
    stockBefore = available.stock;
  });

  test('GET /api/v1/menu — semua item harus is_active = true', async () => {
    const res = await request(app).get('/api/v1/menu');
    expect(res.status).toBe(200);
    res.body.data.forEach(item => {
      expect(item.is_active).toBe(true);
    });
  });

  test('GET /api/v1/menu/categories → 200 + array kategori', async () => {
    const res = await request(app).get('/api/v1/menu/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Fase 3 — Checkout (publik)', () => {
  test('POST /api/v1/orders/checkout dengan payload valid → 201 + PENDING', async () => {
    const res = await request(app)
      .post('/api/v1/orders/checkout')
      .send({
        customer_name: 'Pelanggan Test E2E',
        table_number:  'Meja 99',
        items: [{ id_menu_item: testMenuId, quantity: 1 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.invoice_number).toMatch(/^INV-/);

    testOrderId = res.body.data.id_order;
  });

  test('POST /api/v1/orders/checkout dengan items kosong → 400', async () => {
    const res = await request(app)
      .post('/api/v1/orders/checkout')
      .send({ customer_name: 'Test', table_number: 'Meja 1', items: [] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Fase 4 — Manajemen Pesanan (protected)', () => {
  test('GET /api/v1/orders tanpa token → 401', async () => {
    const res = await request(app).get('/api/v1/orders');
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/orders dengan token valid → 200 + list pesanan', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.orders)).toBe(true);
  });

  test(`GET /api/v1/orders/:id → 200 + status PENDING`, async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${testOrderId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDING');
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  test('GET /api/v1/orders/counts → 200 + { total, pending, lunas }', async () => {
    const res = await request(app)
      .get('/api/v1/orders/counts')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(0);
    expect(res.body.data.pending).toBeGreaterThanOrEqual(0);
  });
});

describe('Fase 5 — Pembayaran (protected)', () => {
  test('POST /api/v1/orders/:id/pay → 200 + pembayaran berhasil', async () => {
    const orderRes = await request(app)
      .get(`/api/v1/orders/${testOrderId}`)
      .set('Authorization', `Bearer ${authToken}`);
    const totalAmount = orderRes.body.data.total_amount;

    const res = await request(app)
      .post(`/api/v1/orders/${testOrderId}/pay`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ payment_method: 'TUNAI', amount_paid: totalAmount + 5000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.invoice_number).toBeDefined();
  });

  test('GET /api/v1/orders/:id setelah bayar → status LUNAS', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${testOrderId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('LUNAS');
  });

  test('POST /api/v1/orders/:id/pay KEDUA KALI → 409 (idempoten)', async () => {
    const res = await request(app)
      .post(`/api/v1/orders/${testOrderId}/pay`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ payment_method: 'TUNAI', amount_paid: 999999 });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe('Fase 6 — Stok (admin only)', () => {
  test('GET /api/v1/stock → 200 + stok menu berkurang setelah penjualan', async () => {
    const res = await request(app)
      .get('/api/v1/stock')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const item = res.body.data.items.find(i => i.id_menu_item === testMenuId);
    expect(item).toBeDefined();
    // Stok harus berkurang 1 setelah penjualan
    expect(item.stock).toBe(stockBefore - 1);
  });
});

describe('Fase 7 — Dashboard (protected)', () => {
  test('GET /api/v1/dashboard/stats → 200 + metrik hari ini', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pending_count).toBeGreaterThanOrEqual(0);
    expect(res.body.data.revenue_today).toBeGreaterThanOrEqual(0);
  });

  test('GET /api/v1/dashboard/chart → 200 + tepat 7 elemen', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/chart')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(7);
    res.body.data.forEach(d => {
      expect(d.label).toBeDefined();
      expect(typeof d.revenue).toBe('number');
    });
  });
});
