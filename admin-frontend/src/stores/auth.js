import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.user?.username || state.user?.name || '管理员'
  },

  actions: {
    async login(credentials) {
      try {
        const res = await request.post('/auth/login', credentials)
        const { token, user } = res.data
        this.token = token
        this.user = user
        localStorage.setItem('token', token)
        return { success: true }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || '登录失败' }
      }
    },

    async fetchProfile() {
      try {
        const res = await request.get('/auth/profile')
        this.user = res.data
      } catch {
        // ignore
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    }
  }
})
