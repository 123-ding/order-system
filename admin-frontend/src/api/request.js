import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加 JWT token
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token

    // 如果存在 token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理响应和错误
request.interceptors.response.use(
  (response) => {
    const res = response.data

    // 如果返回的状态码不是 200，则判断为错误
    if (res.code !== undefined && res.code !== 200) {
      ElMessage.error(res.message || '请求失败')

      // 401: 未授权，token 过期或无效
      if (res.code === 401) {
        const userStore = useUserStore()
        userStore.logout()
        router.push('/login')
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  (error) => {
    console.error('响应错误:', error)

    // 处理 HTTP 错误状态码
    if (error.response) {
      const status = error.response.status
      const userStore = useUserStore()

      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          userStore.logout()
          router.push('/login')
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error('网络连接失败，请检查您的网络')
    } else {
      // 发生了触发请求错误的问题
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default request
