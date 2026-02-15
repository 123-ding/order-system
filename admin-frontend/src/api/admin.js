import request from './request'

// ========== 认证相关 ==========

/**
 * 管理员登录
 * @param {Object} data - 登录信息 { username, password }
 * @returns {Promise}
 */
export const login = (data) => {
  return request({
    url: '/admin/auth/login',
    method: 'post',
    data
  })
}

/**
 * 获取管理员信息
 * @returns {Promise}
 */
export const getAdminInfo = () => {
  return request({
    url: '/admin/auth/info',
    method: 'get'
  })
}

/**
 * 管理员登出
 * @returns {Promise}
 */
export const logout = () => {
  return request({
    url: '/admin/auth/logout',
    method: 'post'
  })
}

// ========== 仪表盘统计 ==========

/**
 * 获取仪表盘统计数据
 * @returns {Promise}
 */
export const getDashboardStats = () => {
  return request({
    url: '/admin/dashboard/stats',
    method: 'get'
  })
}

// ========== 菜品管理 ==========

/**
 * 获取菜品列表
 * @param {Object} params - 查询参数 { page, pageSize, keyword, categoryId, status }
 * @returns {Promise}
 */
export const getDishes = (params) => {
  return request({
    url: '/admin/dishes',
    method: 'get',
    params
  })
}

/**
 * 获取菜品详情
 * @param {Number} id - 菜品ID
 * @returns {Promise}
 */
export const getDishDetail = (id) => {
  return request({
    url: `/admin/dishes/${id}`,
    method: 'get'
  })
}

/**
 * 创建菜品
 * @param {Object} data - 菜品信息
 * @returns {Promise}
 */
export const createDish = (data) => {
  return request({
    url: '/admin/dishes',
    method: 'post',
    data
  })
}

/**
 * 更新菜品
 * @param {Number} id - 菜品ID
 * @param {Object} data - 菜品信息
 * @returns {Promise}
 */
export const updateDish = (id, data) => {
  return request({
    url: `/admin/dishes/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除菜品
 * @param {Number} id - 菜品ID
 * @returns {Promise}
 */
export const deleteDish = (id) => {
  return request({
    url: `/admin/dishes/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除菜品
 * @param {Array} ids - 菜品ID数组
 * @returns {Promise}
 */
export const batchDeleteDishes = (ids) => {
  return request({
    url: '/admin/dishes/batch-delete',
    method: 'post',
    data: { ids }
  })
}

/**
 * 更新菜品状态
 * @param {Number} id - 菜品ID
 * @param {Number} status - 状态 (0:下架, 1:上架)
 * @returns {Promise}
 */
export const updateDishStatus = (id, status) => {
  return request({
    url: `/admin/dishes/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// ========== 分类管理 ==========

/**
 * 获取分类列表
 * @param {Object} params - 查询参数 { page, pageSize, keyword }
 * @returns {Promise}
 */
export const getCategories = (params) => {
  return request({
    url: '/admin/categories',
    method: 'get',
    params
  })
}

/**
 * 获取所有分类（不分页）
 * @returns {Promise}
 */
export const getAllCategories = () => {
  return request({
    url: '/admin/categories/all',
    method: 'get'
  })
}

/**
 * 获取分类详情
 * @param {Number} id - 分类ID
 * @returns {Promise}
 */
export const getCategoryDetail = (id) => {
  return request({
    url: `/admin/categories/${id}`,
    method: 'get'
  })
}

/**
 * 创建分类
 * @param {Object} data - 分类信息
 * @returns {Promise}
 */
export const createCategory = (data) => {
  return request({
    url: '/admin/categories',
    method: 'post',
    data
  })
}

/**
 * 更新分类
 * @param {Number} id - 分类ID
 * @param {Object} data - 分类信息
 * @returns {Promise}
 */
export const updateCategory = (id, data) => {
  return request({
    url: `/admin/categories/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除分类
 * @param {Number} id - 分类ID
 * @returns {Promise}
 */
export const deleteCategory = (id) => {
  return request({
    url: `/admin/categories/${id}`,
    method: 'delete'
  })
}

// ========== 订单管理 ==========

/**
 * 获取订单列表
 * @param {Object} params - 查询参数 { page, pageSize, keyword, status, startDate, endDate }
 * @returns {Promise}
 */
export const getOrders = (params) => {
  return request({
    url: '/admin/orders',
    method: 'get',
    params
  })
}

/**
 * 获取订单详情
 * @param {Number} id - 订单ID
 * @returns {Promise}
 */
export const getOrderDetail = (id) => {
  return request({
    url: `/admin/orders/${id}`,
    method: 'get'
  })
}

/**
 * 更新订单状态
 * @param {Number} id - 订单ID
 * @param {Number} status - 状态
 * @returns {Promise}
 */
export const updateOrderStatus = (id, status) => {
  return request({
    url: `/admin/orders/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 取消订单
 * @param {Number} id - 订单ID
 * @param {String} reason - 取消原因
 * @returns {Promise}
 */
export const cancelOrder = (id, reason) => {
  return request({
    url: `/admin/orders/${id}/cancel`,
    method: 'post',
    data: { reason }
  })
}

// ========== 评价管理 ==========

/**
 * 获取评价列表
 * @param {Object} params - 查询参数 { page, pageSize, dishId, userId, rating }
 * @returns {Promise}
 */
export const getReviews = (params) => {
  return request({
    url: '/admin/reviews',
    method: 'get',
    params
  })
}

/**
 * 删除评价
 * @param {Number} id - 评价ID
 * @returns {Promise}
 */
export const deleteReview = (id) => {
  return request({
    url: `/admin/reviews/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除评价
 * @param {Array} ids - 评价ID数组
 * @returns {Promise}
 */
export const batchDeleteReviews = (ids) => {
  return request({
    url: '/admin/reviews/batch-delete',
    method: 'post',
    data: { ids }
  })
}

// ========== 用户管理 ==========

/**
 * 获取用户列表
 * @param {Object} params - 查询参数 { page, pageSize, keyword, status }
 * @returns {Promise}
 */
export const getUsers = (params) => {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

/**
 * 获取用户详情
 * @param {Number} id - 用户ID
 * @returns {Promise}
 */
export const getUserDetail = (id) => {
  return request({
    url: `/admin/users/${id}`,
    method: 'get'
  })
}

/**
 * 更新用户状态
 * @param {Number} id - 用户ID
 * @param {Number} status - 状态 (0:禁用, 1:正常)
 * @returns {Promise}
 */
export const updateUserStatus = (id, status) => {
  return request({
    url: `/admin/users/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 重置用户密码
 * @param {Number} id - 用户ID
 * @param {String} newPassword - 新密码
 * @returns {Promise}
 */
export const resetUserPassword = (id, newPassword) => {
  return request({
    url: `/admin/users/${id}/reset-password`,
    method: 'post',
    data: { newPassword }
  })
}

// ========== 系统设置 ==========

/**
 * 获取系统设置
 * @returns {Promise}
 */
export const getSettings = () => {
  return request({
    url: '/admin/settings',
    method: 'get'
  })
}

/**
 * 更新系统设置
 * @param {Object} data - 设置信息
 * @returns {Promise}
 */
export const updateSettings = (data) => {
  return request({
    url: '/admin/settings',
    method: 'put',
    data
  })
}

/**
 * 上传图片
 * @param {FormData} formData - 包含图片文件的 FormData
 * @returns {Promise}
 */
export const uploadImage = (formData) => {
  return request({
    url: '/admin/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
