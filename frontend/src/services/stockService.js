// frontend/src/services/stockService.js
import api from './api'

export const stockService = {
  getStock: ()             => api.get('/stock').then(r => r.data.data),
  adjustStock: (payload)   => api.post('/stock/adjust', payload).then(r => r.data),
  getHistory: (id)         => api.get(`/stock/${id}/history`).then(r => r.data.data),
}
