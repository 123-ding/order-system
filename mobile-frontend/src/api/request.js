import axios from 'axios'
import { Toast } from 'vant'
import { useUserStore } from '../store'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加 JWT token
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    Toast.fail('请求错误')
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的状态码不是 200，则认为是错误
    if (res.code && res.code !== 200) {
      Toast.fail(res.message || '请求失败')
      
      // 401: 未授权，需要重新登录
      if (res.code === 401) {
        const userStore = useUserStore()
        userStore.logout()
        // 跳转到登录页面
        window.location.href = '/'
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  error => {
    console.error('API Error:', error)
    
    let message = '网络错误'
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请登录'
          const userStore = useUserStore()
          userStore.logout()
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = error.response.data?.message || '请求失败'
      }
    } else if (error.request) {
      message = '网络连接失败'
    }
    
    Toast.fail(message)
    return Promise.reject(error)
  }
)

export default request
