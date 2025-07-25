import axios from 'axios'
import { Message } from 'element-ui'

// Create axios instance
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    // Add loading or auth token here if needed
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    const message = error.response?.data?.message || error.response?.data || error.message || 'Network Error'
    Message.error(message)
    return Promise.reject(error)
  }
)

// Application APIs
export const applicationApi = {
  // Get all applications
  getAll () {
    return apiClient.get('/applications')
  },

  // Get application by ID
  getById (id) {
    return apiClient.get(`/applications/${id}`)
  },

  // Get application by number
  getByNumber (number) {
    return apiClient.get(`/applications/number/${number}`)
  },

  // Create new application
  create (data) {
    return apiClient.post('/applications', data)
  },

  // Update application
  update (id, data) {
    return apiClient.put(`/applications/${id}`, data)
  },

  // Update root section
  updateRootSection (id, rootSection) {
    return apiClient.put(`/applications/${id}/root-section`, { rootSection })
  },

  // Delete application
  delete (id) {
    return apiClient.delete(`/applications/${id}`)
  }
}

// Submission Unit APIs
export const submissionUnitApi = {
  // Get all submission units
  getAll () {
    return apiClient.get('/submission-units')
  },

  // Get submission unit by ID
  getById (id) {
    return apiClient.get(`/submission-units/${id}`)
  },

  // Get submission units by application ID
  getByAppId (appId) {
    return apiClient.get(`/submission-units/by-app/${appId}`)
  },

  // Get submission unit by app ID and sequence
  getByAppIdAndSequence (appId, sequenceNum) {
    return apiClient.get(`/submission-units/by-app/${appId}/sequence/${sequenceNum}`)
  },

  // Create new submission unit
  create (data) {
    return apiClient.post('/submission-units', data)
  },

  // Update submission unit
  update (id, data) {
    return apiClient.put(`/submission-units/${id}`, data)
  },

  // Update CoU data
  updateCouData (id, couData) {
    return apiClient.put(`/submission-units/${id}/cou-data`, { couData })
  },

  // Delete submission unit
  delete (id) {
    return apiClient.delete(`/submission-units/${id}`)
  },

  // Create sample CoU data
  createSampleCouData (data) {
    return apiClient.post('/submission-units/sample-cou-data', data)
  }
}

export default apiClient
