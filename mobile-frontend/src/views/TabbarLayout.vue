<template>
  <div class="tabbar-layout">
    <div class="page-content">
      <router-view v-slot="{ Component }">
        <keep-alive :include="['HomeView', 'OrderListView', 'ProfileView']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>

    <van-tabbar v-model="activeTab" :border="true" safe-area-inset-bottom fixed>
      <van-tabbar-item name="home" icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item name="orders" icon="orders-o" to="/orders">我的订单</van-tabbar-item>
      <van-tabbar-item name="create" to="/create-order">
        <template #icon>
          <div class="create-btn">
            <van-icon name="plus" size="22" color="#fff" />
          </div>
        </template>
        下单
      </van-tabbar-item>
      <van-tabbar-item name="profile" icon="contact" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeTab = computed(() => {
  const path = route.path
  if (path.startsWith('/orders')) return 'orders'
  if (path === '/create-order') return 'create'
  if (path === '/profile') return 'profile'
  return 'home'
})
</script>

<style scoped>
.tabbar-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 60px;
}

.create-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #0066cc, #0099ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -18px;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.5);
}

:deep(.van-tabbar-item--active) {
  color: #0066cc;
}

:deep(.van-tabbar-item:nth-child(3) .van-tabbar-item__text) {
  color: #0066cc;
  font-weight: 600;
}
</style>
