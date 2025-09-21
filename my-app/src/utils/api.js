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
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
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
