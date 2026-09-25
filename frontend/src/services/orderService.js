// frontend/src/services/orderService.js
// [INC-01 FIX] Semua method unwrap ke level yang konsisten:
// - List/detail: .then(r => r.data.data) → langsung data
// - Aksi (checkout, pay): .then(r => r.data) → { success, message, data }
//   karena komponen perlu akses r.data (invoice, change_amount, dll)
import api from './api'

export const orderService = {
  checkout: (payload)   => api.post('/orders/checkout', payload).then(r => r.data),
  getAll:   (params={}) => api.get('/orders', { params }).then(r => r.data.data),
  getCounts:()          => api.get('/orders/counts').then(r => r.data.data),
  getById:  (id)        => api.get(`/orders/${id}`).then(r => r.data.data),
  // [INC-01 FIX] pay juga .then(r => r.data) agar BillingPage bisa akses res.data.invoice_number
  pay: (id, payload)    => api.post(`/orders/${id}/pay`, payload).then(r => r.data),
}
