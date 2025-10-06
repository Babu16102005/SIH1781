// API utility functions for the Career Guidance System
import axios from 'axios'

// Base API URL
const API_BASE_URL = 'http://localhost:8000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      // If no token and not on auth pages, redirect to login
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If unauthorized and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // If using Firebase, try to refresh the token
        if (import.meta.env.VITE_USE_FIREBASE === 'true') {
          const { getAuth, onIdTokenChanged } = await import('firebase/auth')
          const auth = getAuth()
          
          const user = auth.currentUser
          if (user) {
            const newToken = await user.getIdToken(true) // Force refresh
            localStorage.setItem('token', newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Continue to redirect to login on refresh failure
      }
      
      // For custom auth or if refresh failed
      localStorage.removeItem('token')
      const returnUrl = window.location.pathname + window.location.search
      window.location.href = `/login?redirect=${encodeURIComponent(returnUrl)}`
      return Promise.reject(error)
    }
    
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getProfile: () => api.get('/users/profile'),
}

export const assessmentAPI = {
  create: (assessmentData) => api.post('/assessments', assessmentData),
  get: (id) => api.get(`/assessments/${id}`),
  getAll: () => api.get('/assessments'),
}

export const skillAPI = {
  evaluate: (skillData) => api.post('/skills/evaluate', skillData),
  getEvaluation: () => api.get('/skills/evaluate'),
}

export const recommendationAPI = {
  generate: () => api.post('/recommendations/generate'),
  getAll: () => api.get('/recommendations'),
  get: (id) => api.get(`/recommendations/${id}`),
}

export const healthAPI = {
  check: () => api.get('/health'),
}

export const videoAPI = {
  getCareerVideos: (careerTitle) => api.get(`/videos/career/${encodeURIComponent(careerTitle)}`),
  getSkillVideos: (skillName) => api.get(`/videos/skill/${encodeURIComponent(skillName)}`),
  getTrendingVideos: () => api.get('/videos/trending'),
}

export default api
