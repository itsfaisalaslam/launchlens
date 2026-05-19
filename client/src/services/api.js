import axios from 'axios'

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '')
const baseURL = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`

const api = axios.create({
  baseURL,
})

console.log('API BASE URL:', api.defaults.baseURL)

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
