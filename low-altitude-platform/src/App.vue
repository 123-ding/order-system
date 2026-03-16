<template>
  <router-view v-if="route?.path === '/login'" />
  <el-container v-else style="height:100vh;">
    <!-- Sidebar -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" style="background:#001529;transition:width 0.2s;">
      <div class="logo" style="height:60px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:700;border-bottom:1px solid #122040;overflow:hidden;white-space:nowrap;">
        <el-icon style="font-size:22px;flex-shrink:0;"><Promotion /></el-icon>
        <span v-if="!isCollapsed" style="margin-left:8px;">低空智联网中台</span>
      </div>
      <el-menu
        :default-active="route?.path ?? ''"
        :collapse="isCollapsed"
        router
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#1890ff"
        style="border-right:none;"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon><template #title>总览大屏</template>
        </el-menu-item>
        <el-sub-menu index="/devices">
          <template #title><el-icon><Grid /></el-icon><span>设备管理</span></template>
          <el-menu-item index="/devices/uav"><el-icon><Promotion /></el-icon>无人机管理</el-menu-item>
          <el-menu-item index="/devices/detection"><el-icon><Search /></el-icon>探测设备</el-menu-item>
          <el-menu-item index="/devices/sensing"><el-icon><Connection /></el-icon>侦测设备</el-menu-item>
          <el-menu-item index="/devices/countermeasure"><el-icon><Warning /></el-icon>反制设备</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/alarms">
          <el-icon><Bell /></el-icon><template #title>告警中心</template>
        </el-menu-item>
        <el-menu-item index="/protocols">
          <el-icon><Setting /></el-icon><template #title>协议管理</template>
        </el-menu-item>
        <el-sub-menu index="/system">
          <template #title><el-icon><Tools /></el-icon><span>系统管理</span></template>
          <el-menu-item index="/system/users">用户管理</el-menu-item>
          <el-menu-item index="/system/roles">角色权限</el-menu-item>
          <el-menu-item index="/system/audit">审计日志</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- Header -->
      <el-header style="background:#fff;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;padding:0 20px;">
        <el-icon style="cursor:pointer;font-size:20px;" @click="isCollapsed=!isCollapsed"><Fold /></el-icon>
        <div style="display:flex;align-items:center;gap:16px;">
          <el-badge :value="alarmCount" :max="99">
            <el-icon style="font-size:20px;cursor:pointer;" @click="$router.push('/alarms')"><Bell /></el-icon>
          </el-badge>
          <el-dropdown>
            <span style="cursor:pointer;display:flex;align-items:center;gap:6px;">
              <el-avatar :size="28" style="background:#1890ff;">A</el-avatar>
              <span>管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/login')">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Main -->
      <el-main style="overflow:auto;padding:20px;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const isCollapsed = ref(false)
const alarmCount = ref(3)
</script>
