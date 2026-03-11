<template>
  <el-container class="layout-container">
    <!-- Sidebar -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">🚢</span>
        <span v-if="!isCollapsed" class="logo-text">海上物流平台</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        background-color="#0d2137"
        text-color="#b8cfe0"
        active-text-color="#5bc9e0"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>控制台</template>
        </el-menu-item>

        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>

        <el-menu-item index="/vessels">
          <el-icon><Ship /></el-icon>
          <template #title>船舶管理</template>
        </el-menu-item>

        <el-menu-item index="/routes">
          <el-icon><MapLocation /></el-icon>
          <template #title>航线管理</template>
        </el-menu-item>

        <el-menu-item index="/cargo">
          <el-icon><Box /></el-icon>
          <template #title>货物管理</template>
        </el-menu-item>

        <el-menu-item index="/users">
          <el-icon><UserFilled /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- Header -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            :icon="isCollapsed ? Expand : Fold"
            circle
            size="small"
            class="collapse-btn"
            @click="isCollapsed = !isCollapsed"
          />
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-badge :value="3" class="notice-badge">
            <el-button :icon="Bell" circle size="small" class="header-btn" />
          </el-badge>

          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar size="small" class="avatar">
                {{ avatarText }}
              </el-avatar>
              <span class="user-name">{{ authStore.userName }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile" :icon="User">个人信息</el-dropdown-item>
                <el-dropdown-item command="settings" :icon="Setting">系统设置</el-dropdown-item>
                <el-dropdown-item divided command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Main content -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  DataAnalysis, Document, MapLocation, Box, UserFilled,
  Expand, Fold, Bell, ArrowDown, User, Setting, SwitchButton
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapsed = ref(false)

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/orders/')) return '/orders'
  return path
})

const currentTitle = computed(() => route.meta?.title || '控制台')

const avatarText = computed(() => {
  const name = authStore.userName
  return name ? name.charAt(0).toUpperCase() : 'A'
})

// Ship icon component workaround using emoji
const Ship = {
  render() {
    return null
  }
}

async function handleCommand(cmd) {
  if (cmd === 'logout') {
    await ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
      type: 'warning',
      confirmButtonText: '确定退出',
      cancelButtonText: '取消'
    }).catch(() => null)

    authStore.logout()
    ElMessage.success('已安全退出')
    router.push('/login')
  } else if (cmd === 'profile') {
    ElMessage.info('个人信息功能开发中')
  } else if (cmd === 'settings') {
    ElMessage.info('系统设置功能开发中')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #0d2137;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  white-space: nowrap;
}

.logo-icon {
  font-size: 26px;
  flex-shrink: 0;
}

.logo-text {
  margin-left: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #5bc9e0;
  letter-spacing: 1px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 2px 8px;
  border-radius: 8px;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(91, 201, 224, 0.15) !important;
  border-left: 3px solid #5bc9e0;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.07) !important;
}

.header {
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e8eef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  color: #5a7a9a;
  border-color: #d0dde8;
}

.breadcrumb {
  font-size: 13px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-btn {
  color: #5a7a9a;
  border-color: #d0dde8;
}

.notice-badge :deep(.el-badge__content) {
  font-size: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f0f7ff;
}

.avatar {
  background: linear-gradient(135deg, #1a6eb0, #0e9aa7);
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.user-name {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.main-content {
  background: #f0f4f8;
  overflow-y: auto;
  padding: 20px;
}
</style>
