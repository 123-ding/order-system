<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <keep-alive :include="['Home', 'Dishes', 'Orders']">
        <component :is="Component" />
      </keep-alive>
    </router-view>
    
    <!-- 底部导航栏 -->
    <van-tabbar 
      v-if="showTabbar" 
      v-model="active" 
      active-color="#FF6B35"
      inactive-color="#646566"
      route
    >
      <van-tabbar-item to="/" icon="wap-home">首页</van-tabbar-item>
      <van-tabbar-item to="/orders" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)

// 需要隐藏底部导航的页面
const hideTabbarRoutes = ['dish-detail', 'calendar', 'cart', 'order-detail', 'review']

const showTabbar = computed(() => {
  return !hideTabbarRoutes.includes(route.name)
})

// 监听路由变化更新active
watch(() => route.path, (path) => {
  if (path === '/') active.value = 0
  else if (path === '/orders') active.value = 1
  else if (path === '/profile') active.value = 2
}, { immediate: true })
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background-color: #f7f8fa;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  padding-bottom: 50px;
}

/* 主题色 */
:root {
  --primary-color: #FF6B35;
  --primary-light: #FF8C61;
  --primary-dark: #E65A2F;
}

.page-container {
  min-height: calc(100vh - 50px);
  background-color: #f7f8fa;
}
</style>
