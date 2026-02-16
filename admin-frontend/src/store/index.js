import { defineStore } from 'pinia'
import { ref } from 'vue'

// 用户状态管理
export const useUserStore = defineStore('user', () => {
  // 从 localStorage 获取保存的 token 和用户信息
  const token = ref(localStorage.getItem('admin_token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('admin_userInfo') || '{}'))

  // 设置 token
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('admin_token', newToken)
    } else {
      localStorage.removeItem('admin_token')
    }
  }

  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = info
    if (info && Object.keys(info).length > 0) {
      localStorage.setItem('admin_userInfo', JSON.stringify(info))
    } else {
      localStorage.removeItem('admin_userInfo')
    }
  }

  // 登录
  const login = (tokenValue, info) => {
    setToken(tokenValue)
    setUserInfo(info)
  }

  // 登出
  const logout = () => {
    setToken('')
    setUserInfo({})
  }

  // 清除所有数据
  const clear = () => {
    logout()
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    login,
    logout,
    clear
  }
})
