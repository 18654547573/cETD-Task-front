import moment from 'moment'

/**
 * Format date
 * @param {string|Date} date
 * @param {string} format
 * @returns {string}
 */
export function formatDate (date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  return moment(date).format(format)
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
 * Get status color
 * @param {string} status
 * @returns {string}
 */
export function getStatusColor (status) {
  const colorMap = {
    DRAFT: '#1890ff',
    SUBMITTED: '#52c41a',
    APPROVED: '#52c41a',
    REJECTED: '#ff4d4f'
  }
  return colorMap[status] || '#666'
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
 * Format JSON string for display
 * @param {string} jsonString
 * @returns {string}
 */
export function formatJson (jsonString) {
  if (!jsonString) return ''
  try {
    const obj = JSON.parse(jsonString)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return jsonString
  }
}

/**
 * Validate JSON string
 * @param {string} jsonString
 * @returns {boolean}
 */
export function isValidJson (jsonString) {
  if (!jsonString) return true
  try {
    JSON.parse(jsonString)
    return true
  } catch (e) {
    return false
  }
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
 * Deep clone object
 * @param {Object} obj
 * @returns {Object}
 */
export function deepClone (obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}
