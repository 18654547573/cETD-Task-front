/**
 * 格式化JSON字符串
 * @param {string|object} data - 要格式化的数据
 * @param {number} indent - 缩进空格数
 * @returns {string} 格式化后的JSON字符串
 */
export function formatJson (data, indent = 2) {
  try {
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    return JSON.stringify(data, null, indent)
  } catch (error) {
    console.error('JSON格式化失败:', error)
    return typeof data === 'string' ? data : JSON.stringify(data)
  }
}

/**
 * 验证JSON字符串格式
 * @param {string} jsonString - JSON字符串
 * @returns {boolean} 是否为有效的JSON
 */
export function isValidJson (jsonString) {
  try {
    JSON.parse(jsonString)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get status text
 * @param {string} status
 * @returns {string}
 */
export function getStatusText (status) {
  const textMap = {
    DRAFT: '草稿',
    SUBMITTED: '已提交',
    APPROVED: '已批准',
    REJECTED: '已拒绝'
  }
  return textMap[status] || status
}

/**
 * Format date to date only
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateOnly (date) {
  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * Get application type options
 * @returns {Array}
 */
export function getApplicationTypeOptions () {
  return [
    { label: 'NDA (New Drug Application)', value: 'NDA' },
    { label: 'BLA (Biologics License Application)', value: 'BLA' },
    { label: 'ANDA (Abbreviated New Drug Application)', value: 'ANDA' }
  ]
}

export function formatDate (date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  // return mo
  // ment(date).format(format)
  return date;
}
/**
 * 格式化日期时间
 * @param {string|Date} dateTime - 日期时间
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime (dateTime) {
  if (!dateTime) return 'N/A'

  try {
    const date = new Date(dateTime)
    if (isNaN(date.getTime())) return 'Invalid Date'

    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize (bytes) {
  if (!bytes || bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export function deepClone (obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }

  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * Get submission type options
 * @returns {Array}
 */
export function getSubmissionTypeOptions () {
  return [
    { label: 'Original', value: 'original' },
    { label: 'Supplement', value: 'supplement' },
    { label: 'Amendment', value: 'amendment' }
  ]
}

/**
 * Get submission unit type options
 * @returns {Array}
 */
export function getSubmissionUnitTypeOptions () {
  return [
    { label: 'eCTD 4.0', value: 'ectd-4-0' },
    { label: 'eCTD 3.2', value: 'ectd-3-2' }
  ]
}

/**
 * Get status options
 * @returns {Array}
 */
export function getStatusOptions () {
  return [
    { label: '草稿', value: 'DRAFT' },
    { label: '已提交', value: 'SUBMITTED' },
    { label: '已批准', value: 'APPROVED' },
    { label: '已拒绝', value: 'REJECTED' }
  ]
}
/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce (func, wait) {
  let timeout
  return function executedFunction (...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle (func, limit) {
  let inThrottle
  return function executedFunction (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 生成唯一ID
 * @param {string} prefix - ID前缀
 * @returns {string} 唯一ID
 */
export function generateId (prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 文件扩展名
 */
export function getFileExtension (filename) {
  if (!filename || typeof filename !== 'string') return ''
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex !== -1 ? filename.slice(lastDotIndex + 1).toLowerCase() : ''
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否为有效邮箱
 */
export function isValidEmail (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证URL格式
 * @param {string} url - URL地址
 * @returns {boolean} 是否为有效URL
 */
export function isValidUrl (url) {
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}

/**
 * 将对象转换为查询字符串
 * @param {object} params - 参数对象
 * @returns {string} 查询字符串
 */
export function objectToQueryString (params) {
  return Object.keys(params)
    .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
}

/**
 * 将查询字符串转换为对象
 * @param {string} queryString - 查询字符串
 * @returns {object} 参数对象
 */
export function queryStringToObject (queryString) {
  const params = {}
  const searchParams = new URLSearchParams(queryString)
  for (const [key, value] of searchParams) {
    params[key] = value
  }
  return params
}

