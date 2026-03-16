import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
    { path: '/dashboard', component: () => import('../views/Dashboard.vue') },
    {
      path: '/devices/uav',
      component: () => import('../views/devices/DeviceList.vue'),
      props: { deviceType: 'uav', title: '无人机管理' },
    },
    {
      path: '/devices/uav/add',
      component: () => import('../views/devices/DeviceForm.vue'),
      props: { deviceType: 'uav', title: '新增无人机' },
    },
    {
      path: '/devices/uav/edit/:id',
      component: () => import('../views/devices/DeviceForm.vue'),
      props: (route) => ({ deviceType: 'uav', title: '编辑无人机', id: route.params.id }),
    },
    {
      path: '/devices/detection',
      component: () => import('../views/devices/DeviceList.vue'),
      props: { deviceType: 'detection', title: '探测设备管理' },
    },
    {
      path: '/devices/detection/add',
      component: () => import('../views/devices/DeviceForm.vue'),
      props: { deviceType: 'detection', title: '新增探测设备' },
    },
    {
      path: '/devices/detection/edit/:id',
      component: () => import('../views/devices/DeviceForm.vue'),
      props: (route) => ({ deviceType: 'detection', title: '编辑探测设备', id: route.params.id }),
    },
    {
      path: '/devices/sensing',
      component: () => import('../views/devices/DeviceList.vue'),
      props: { deviceType: 'sensing', title: '侦测设备管理' },
    },
    {
      path: '/devices/sensing/add',
      component: () => import('../views/devices/DeviceForm.vue'),
      props: { deviceType: 'sensing', title: '新增侦测设备' },
    },
    {
      path: '/devices/sensing/edit/:id',
      component: () => import('../views/devices/DeviceForm.vue'),
      props: (route) => ({ deviceType: 'sensing', title: '编辑侦测设备', id: route.params.id }),
    },
    {
      path: '/devices/countermeasure',
      component: () => import('../views/devices/DeviceList.vue'),
      props: { deviceType: 'countermeasure', title: '反制设备管理' },
    },
    {
      path: '/devices/countermeasure/add',
      component: () => import('../views/devices/DeviceForm.vue'),
      props: { deviceType: 'countermeasure', title: '新增反制设备' },
    },
    {
      path: '/devices/countermeasure/edit/:id',
      component: () => import('../views/devices/DeviceForm.vue'),
      props: (route) => ({ deviceType: 'countermeasure', title: '编辑反制设备', id: route.params.id }),
    },
    { path: '/alarms', component: () => import('../views/Alarms.vue') },
    { path: '/protocols', component: () => import('../views/Protocols.vue') },
    { path: '/system/users', component: () => import('../views/system/Users.vue') },
    { path: '/system/roles', component: () => import('../views/system/Roles.vue') },
    { path: '/system/audit', component: () => import('../views/system/Audit.vue') },
  ],
})

export default router
