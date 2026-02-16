import { createRouter, createWebHistory } from 'vue-router'
import { Toast } from 'vant'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/home/index.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/dishes',
    name: 'dishes',
    component: () => import('../views/dishes/index.vue'),
    meta: { title: '点菜' }
  },
  {
    path: '/dish-detail/:id',
    name: 'dish-detail',
    component: () => import('../views/dish-detail/index.vue'),
    meta: { title: '菜品详情' }
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('../views/calendar/index.vue'),
    meta: { title: '选择送达日期' }
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../views/cart/index.vue'),
    meta: { title: '购物车' }
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../views/orders/index.vue'),
    meta: { title: '我的订单' }
  },
  {
    path: '/order-detail/:id',
    name: 'order-detail',
    component: () => import('../views/order-detail/index.vue'),
    meta: { title: '订单详情' }
  },
  {
    path: '/review/:orderId',
    name: 'review',
    component: () => import('../views/review/index.vue'),
    meta: { title: '评价订单' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/profile/index.vue'),
    meta: { title: '我的' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '点菜系统'
  
  // 检查需要登录的页面
  const requiresAuth = ['cart', 'orders', 'order-detail', 'review', 'profile']
  if (requiresAuth.includes(to.name)) {
    const token = localStorage.getItem('token')
    if (!token) {
      Toast.fail('请先登录')
      // 在实际应用中，这里应该跳转到登录页
      next(false)
      return
    }
  }
  
  next()
})

export default router
