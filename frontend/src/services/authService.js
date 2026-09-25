// frontend/src/services/authService.js
import api from './api'

export const authService = {
  login: (payload) => api.post('/auth/login', payload).then(r => r.data),
  me:    ()        => api.get('/auth/me').then(r => r.data.data),
  logout:()        => api.post('/auth/logout').then(r => r.data),
}
