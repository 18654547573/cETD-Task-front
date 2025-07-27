import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    console.log('Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    console.log('Response:', response.status, response.config.url)
    return response.data
  },
  error => {
    // 对响应错误做点什么
    console.error('Response Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

// Application API
export const applicationApi = {
  // 获取所有应用
  getAll() {
    return api.get('/applications')
  },

  // 根据ID获取应用
  getById(id) {
    return api.get(`/applications/${id}`)
  },

  // 创建应用
  create(data) {
    return api.post('/applications', data)
  },

  // 更新应用
  update(id, data) {
    return api.put(`/applications/${id}`, data)
  },

  // 删除应用
  delete(id) {
    return api.delete(`/applications/${id}`)
  },

  // 更新Root Section
  updateRootSection(id, rootSectionJson) {
    return api.put(`/applications/${id}/root-section`, {
      rootSection: rootSectionJson
    })
  }
}

// Submission Unit API
export const submissionUnitApi = {
  // 获取所有提交单元
  getAll() {
    return api.get('/submission-units')
  },

  // 根据应用ID获取提交单元
  getByAppId(appId) {
    return api.get(`/submission-units/by-app/${appId}`)
  },

  // 根据ID获取提交单元
  getById(id) {
    return api.get(`/submission-units/${id}`)
  },

  // 创建提交单元
  create(data) {
    return api.post('/submission-units', data)
  },

  // 更新提交单元
  update(id, data) {
    return api.put(`/submission-units/${id}`, data)
  },

  // 删除提交单元
  delete(id) {
    return api.delete(`/submission-units/${id}`)
  },

  // 更新CoU数据（替换整个数组）
  updateCouData(id, couData) {
    return api.put(`/submission-units/${id}/cou-data`, {
      couData: couData
    })
  },

  // 添加单个CoU操作
  addCouOperation(id, couOperation) {
    return api.post(`/submission-units/${id}/cou-operations`, couOperation)
  },

  // 获取所有CoU操作
  getCouOperations(id) {
    return api.get(`/submission-units/${id}/cou-operations`)
  },

  // 删除CoU操作
  removeCouOperation(id, couId) {
    return api.delete(`/submission-units/${id}/cou-operations/${couId}`)
  },

  // 获取示例CoU数据
  getSampleCouData(operationType, nodeId, documentPath) {
    return api.get('/submission-units/sample-cou-data', {
      params: {
        operationType,
        nodeId,
        documentPath
      }
    })
  }
}

export default api
