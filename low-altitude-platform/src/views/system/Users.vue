<template>
  <div>
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" :icon="Plus">新增用户</el-button>
    </div>
    <el-card>
      <el-table :data="users" stripe>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="realName" label="姓名" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag>{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const users = ref([
  { id: 1, username: 'admin', realName: '系统管理员', role: '系统管理员', createdAt: '2026-01-01', enabled: true },
  { id: 2, username: 'operator1', realName: '张三', role: '操作员', createdAt: '2026-02-01', enabled: true },
  { id: 3, username: 'auditor1', realName: '李四', role: '审计员', createdAt: '2026-02-10', enabled: false },
])
</script>
