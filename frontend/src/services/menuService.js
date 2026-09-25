// frontend/src/services/menuService.js
import api from './api'

export const menuService = {
  getMenu: (params = {}) => api.get('/menu', { params }).then(r => r.data.data),
  getCategories: ()     => api.get('/menu/categories').then(r => r.data.data),
  getById: (id)         => api.get(`/menu/${id}`).then(r => r.data.data),
  create: (payload)     => api.post('/menu', payload).then(r => r.data),
  update: (id, payload) => api.put(`/menu/${id}`, payload).then(r => r.data),
  deactivate: (id)      => api.delete(`/menu/${id}`).then(r => r.data),
}
