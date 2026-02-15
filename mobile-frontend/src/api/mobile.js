import request from './request'

// 用户相关
export const userApi = {
  // 登录
  login(data) {
    return request.post('/auth/login', data)
  },
  
  // 注册
  register(data) {
    return request.post('/auth/register', data)
  },
  
  // 获取用户信息
  getUserInfo() {
    return request.get('/user/info')
  },
  
  // 更新用户信息
  updateUserInfo(data) {
    return request.put('/user/info', data)
  }
}

// 菜品相关
export const dishApi = {
  // 获取菜品列表
  getDishes(params) {
    return request.get('/dishes', { params })
  },
  
  // 获取菜品详情
  getDishDetail(id) {
    return request.get(`/dishes/${id}`)
  },
  
  // 获取分类列表
  getCategories() {
    return request.get('/categories')
  },
  
  // 搜索菜品
  searchDishes(keyword) {
    return request.get('/dishes/search', { params: { keyword } })
  },
  
  // 获取推荐菜品
  getRecommendedDishes() {
    return request.get('/dishes/recommended')
  }
}

// 订单相关
export const orderApi = {
  // 创建订单
  createOrder(data) {
    return request.post('/orders', data)
  },
  
  // 获取订单列表
  getOrders(params) {
    return request.get('/orders', { params })
  },
  
  // 获取订单详情
  getOrderDetail(id) {
    return request.get(`/orders/${id}`)
  },
  
  // 取消订单
  cancelOrder(id) {
    return request.post(`/orders/${id}/cancel`)
  },
  
  // 确认收货
  confirmOrder(id) {
    return request.post(`/orders/${id}/confirm`)
  }
}

// 评价相关
export const reviewApi = {
  // 获取菜品评价
  getDishReviews(dishId, params) {
    return request.get(`/dishes/${dishId}/reviews`, { params })
  },
  
  // 创建评价
  createReview(data) {
    return request.post('/reviews', data)
  },
  
  // 上传图片
  uploadImage(file) {
    const formData = new FormData()
    formData.append('image', file)
    return request.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// 购物车相关
export const cartApi = {
  // 获取购物车
  getCart() {
    return request.get('/cart')
  },
  
  // 添加到购物车
  addToCart(data) {
    return request.post('/cart/items', data)
  },
  
  // 更新购物车项
  updateCartItem(itemId, data) {
    return request.put(`/cart/items/${itemId}`, data)
  },
  
  // 删除购物车项
  removeCartItem(itemId) {
    return request.delete(`/cart/items/${itemId}`)
  },
  
  // 清空购物车
  clearCart() {
    return request.delete('/cart')
  }
}

// Banner 相关
export const bannerApi = {
  // 获取轮播图
  getBanners() {
    return request.get('/banners')
  }
}
