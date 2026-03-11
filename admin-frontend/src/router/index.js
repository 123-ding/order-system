import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('@/views/LayoutView.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '控制台' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/OrderListView.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/OrderDetailView.vue'),
        meta: { title: '订单详情' }
      },
      {
        path: 'vessels',
        name: 'Vessels',
        component: () => import('@/views/VesselView.vue'),
        meta: { title: '船舶管理' }
      },
      {
        path: 'routes',
        name: 'Routes',
        component: () => import('@/views/RouteView.vue'),
        meta: { title: '航线管理' }
      },
      {
        path: 'cargo',
        name: 'Cargo',
        component: () => import('@/views/CargoView.vue'),
        meta: { title: '货物管理' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/UserView.vue'),
        meta: { title: '用户管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (!to.meta.public && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
