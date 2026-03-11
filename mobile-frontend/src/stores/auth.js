import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  async function login(username, password) {
    // Demo credentials shortcut
    if (username === 'admin' && password === '123456') {
      const mockUser = {
        id: 1,
        username: 'admin',
        name: '张海明',
        phone: '13812345678',
        email: 'zhang@maritime.com',
        company: '远洋货运有限公司'
      }
      const mockToken = 'mock-jwt-token-' + Date.now()
      token.value = mockToken
      user.value = mockUser
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      return { success: true }
    }

    try {
      const res = await request.post('/auth/login', { username, password })
      token.value = res.data.token
      user.value = res.data.user
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message || '登录失败' }
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, login, logout }
})
