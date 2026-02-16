import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 用户状态管理
export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  const isLoggedIn = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    setToken,
    setUserInfo,
    logout
  }
})

// 购物车状态管理
export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('cart') || '[]'))
  const deliveryDate = ref(localStorage.getItem('deliveryDate') || '')

  // 购物车总数量
  const totalCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  // 购物车总价
  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  })

  // 添加到购物车
  function addToCart(dish, quantity = 1) {
    const existItem = items.value.find(item => item.id === dish.id)
    if (existItem) {
      existItem.quantity += quantity
    } else {
      items.value.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: quantity
      })
    }
    saveToStorage()
  }

  // 更新数量
  function updateQuantity(dishId, quantity) {
    const item = items.value.find(item => item.id === dishId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(dishId)
      } else {
        item.quantity = quantity
        saveToStorage()
      }
    }
  }

  // 从购物车移除
  function removeFromCart(dishId) {
    const index = items.value.findIndex(item => item.id === dishId)
    if (index > -1) {
      items.value.splice(index, 1)
      saveToStorage()
    }
  }

  // 清空购物车
  function clearCart() {
    items.value = []
    deliveryDate.value = ''
    saveToStorage()
  }

  // 设置送达日期
  function setDeliveryDate(date) {
    deliveryDate.value = date
    localStorage.setItem('deliveryDate', date)
  }

  // 保存到本地存储
  function saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  return {
    items,
    deliveryDate,
    totalCount,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setDeliveryDate
  }
})
