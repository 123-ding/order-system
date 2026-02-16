<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo-container">
        <el-icon v-if="isCollapse" :size="28" color="#409EFF">
          <ShoppingCart />
        </el-icon>
        <template v-else>
          <el-icon :size="28" color="#409EFF">
            <ShoppingCart />
          </el-icon>
          <span class="logo-text">订餐系统</span>
        </template>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>

        <el-menu-item index="/dishes">
          <el-icon><Food /></el-icon>
          <template #title>菜品管理</template>
        </el-menu-item>

        <el-menu-item index="/categories">
          <el-icon><Grid /></el-icon>
          <template #title>分类管理</template>
        </el-menu-item>

        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>

        <el-menu-item index="/reviews">
          <el-icon><Star /></el-icon>
          <template #title>评价管理</template>
        </el-menu-item>

        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>

        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-icon" :size="20" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-badge :value="notificationCount" :hidden="notificationCount === 0" class="notification-badge">
            <el-icon :size="20" class="header-icon">
              <Bell />
            </el-icon>
          </el-badge>

          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="36" :src="userInfo.avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <span class="username">{{ userInfo.username || '管理员' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  账户设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ShoppingCart,
  DataAnalysis,
  Food,
  Grid,
  List,
  Star,
  User,
  Setting,
  Fold,
  Expand,
  Bell,
  UserFilled,
  SwitchButton
} from '@element-plus/icons-vue'
import { logout } from '@/api/admin'
import { useUserStore } from '@/store'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const notificationCount = ref(0)

const currentRoute = computed(() => route)
const activeMenu = computed(() => route.path)
const userInfo = computed(() => userStore.userInfo || {})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中...')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    try {
      await logout()
    } catch (error) {
      console.error('退出登录接口调用失败:', error)
    }

    userStore.logout()
    ElMessage.success('退出成功')
    router.push('/login')
  } catch (error) {
    // 用户取消操作
  }
}

// 监听路由变化，自动收起侧边栏（移动端）
watch(
  () => route.path,
  () => {
    if (window.innerWidth < 768) {
      isCollapse.value = true
    }
  }
)
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  display: flex;
}

.layout-aside {
  background: #ffffff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  transition: width 0.3s;
  overflow-x: hidden;

  .logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 0 20px;
    border-bottom: 1px solid #f0f0f0;

    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      white-space: nowrap;
    }
  }

  .sidebar-menu {
    border-right: none;
    height: calc(100vh - 60px);

    :deep(.el-menu-item) {
      height: 50px;
      line-height: 50px;
      margin: 4px 8px;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background-color: #ecf5ff;
      }

      &.is-active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;

        .el-icon {
          color: #ffffff;
        }
      }
    }
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.layout-header {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .collapse-icon {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: #409EFF;
      }
    }

    .el-breadcrumb {
      font-size: 14px;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .notification-badge {
      cursor: pointer;

      .header-icon {
        transition: all 0.3s;

        &:hover {
          color: #409EFF;
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 20px;
      transition: all 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }

      .username {
        font-size: 14px;
        color: #303133;
      }
    }
  }
}

.layout-main {
  padding: 20px;
  overflow-y: auto;
  background: #f5f7fa;
}

// 页面切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 响应式设计
@media (max-width: 768px) {
  .layout-header {
    padding: 0 15px;

    .header-left {
      .el-breadcrumb {
        display: none;
      }
    }

    .header-right {
      .username {
        display: none;
      }
    }
  }

  .layout-main {
    padding: 15px;
  }
}
</style>
