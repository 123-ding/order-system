<template>
  <div>
    <div class="page-header">
      <h2>角色权限管理</h2>
      <el-button type="primary" :icon="Plus">新增角色</el-button>
    </div>
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card>
          <template #header><span style="font-weight:600;">角色列表</span></template>
          <el-menu :default-active="activeRole" @select="activeRole = $event">
            <el-menu-item v-for="r in roles" :key="r.key" :index="r.key">{{ r.name }}</el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card>
          <template #header><span style="font-weight:600;">权限配置 — {{ currentRole?.name }}</span></template>
          <el-tree :data="permTree" show-checkbox node-key="id" :default-checked-keys="currentRole?.perms ?? []" style="margin-top:8px;" />
          <div style="margin-top:16px;">
            <el-button type="primary">保存权限</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const activeRole = ref('admin')
const roles = ref([
  { key: 'admin', name: '系统管理员', perms: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { key: 'device_mgr', name: '设备管理员', perms: [3,4,5,6,7,8] },
  { key: 'operator', name: '操作员', perms: [3,7,9,10] },
  { key: 'auditor', name: '审计员', perms: [11,12] },
])
const currentRole = computed(() => roles.value.find(r => r.key === activeRole.value))
const permTree = [
  { id: 1, label: '用户管理', children: [{ id: 2, label: '新增/编辑/删除用户' }] },
  { id: 3, label: '设备管理', children: [
    { id: 4, label: '无人机管理' },
    { id: 5, label: '探测设备管理' },
    { id: 6, label: '侦测设备管理' },
    { id: 7, label: '反制设备管理' },
    { id: 8, label: '反制指令下发' },
  ]},
  { id: 9, label: '告警管理', children: [
    { id: 10, label: '告警确认/关闭' },
  ]},
  { id: 11, label: '审计日志', children: [{ id: 12, label: '查看审计日志' }] },
]
</script>
