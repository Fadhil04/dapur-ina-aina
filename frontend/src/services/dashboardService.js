// frontend/src/services/dashboardService.js
import api from './api'

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats').then(r => r.data.data),
  getChart: () => api.get('/dashboard/chart').then(r => r.data.data),
}
