<template>
  <div>
    <div class="page-header">
      <h2>总览大屏</h2>
      <el-tag type="success">系统运行正常</el-tag>
    </div>

    <!-- Stat Cards -->
    <el-row :gutter="16" style="margin-bottom:20px;">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="number" :style="{ color: stat.color }">{{ stat.value }}</div>
            <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:8px;">
              <el-icon :style="{ color: stat.color }"><component :is="stat.icon" /></el-icon>
              <div class="label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- Device Status Table -->
      <el-col :span="14">
        <el-card>
          <template #header>
            <span style="font-weight:600;">设备接入状态</span>
          </template>
          <el-table :data="deviceSummary" size="small">
            <el-table-column prop="type" label="设备类型" />
            <el-table-column prop="total" label="总数" align="center" />
            <el-table-column prop="online" label="在线" align="center">
              <template #default="{ row }">
                <el-tag type="success" size="small">{{ row.online }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="offline" label="离线" align="center">
              <template #default="{ row }">
                <el-tag type="info" size="small">{{ row.offline }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="alarm" label="告警" align="center">
              <template #default="{ row }">
                <el-tag type="danger" size="small">{{ row.alarm }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- Recent Alarms -->
      <el-col :span="10">
        <el-card>
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:600;">最新告警</span>
              <el-button text type="primary" size="small" @click="$router.push('/alarms')">查看全部</el-button>
            </div>
          </template>
          <div v-for="alarm in recentAlarms" :key="alarm.id" class="alarm-item">
            <el-tag :type="alarmTagType(alarm.level)" size="small">{{ alarm.levelLabel }}</el-tag>
            <span style="margin-left:8px;font-size:13px;">{{ alarm.message }}</span>
            <div style="color:#999;font-size:11px;margin-top:2px;">{{ alarm.time }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDeviceStore } from '../stores/device'

const store = useDeviceStore()

const stats = computed(() => {
  const all = store.devices
  return [
    { label: '无人机接入', value: all.filter(d => d.deviceType === 'uav').length, color: '#1890ff', icon: 'Promotion' },
    { label: '探测设备', value: all.filter(d => d.deviceType === 'detection').length, color: '#52c41a', icon: 'Search' },
    { label: '侦测设备', value: all.filter(d => d.deviceType === 'sensing').length, color: '#faad14', icon: 'Connection' },
    { label: '反制设备', value: all.filter(d => d.deviceType === 'countermeasure').length, color: '#f5222d', icon: 'Warning' },
  ]
})

const deviceSummary = computed(() => {
  const types = [
    { key: 'uav', type: '无人机' },
    { key: 'detection', type: '探测设备' },
    { key: 'sensing', type: '侦测设备' },
    { key: 'countermeasure', type: '反制设备' },
  ]
  return types.map(t => {
    const list = store.devices.filter(d => d.deviceType === t.key)
    return {
      type: t.type,
      total: list.length,
      online: list.filter(d => d.status === 'online').length,
      offline: list.filter(d => d.status === 'offline').length,
      alarm: list.filter(d => d.status === 'alarm').length,
    }
  })
})

const recentAlarms = [
  { id: 1, level: 'red', levelLabel: '紧急', message: '禁飞区检测到未授权无人机', time: '2026-03-16 08:45:12' },
  { id: 2, level: 'orange', levelLabel: '严重', message: 'SPECTRUM-01 通信中断超过 30 秒', time: '2026-03-16 08:30:05' },
  { id: 3, level: 'yellow', levelLabel: '预警', message: 'DJI-M300-01 电量低于 20%', time: '2026-03-16 08:15:44' },
]

function alarmTagType(level: string) {
  return level === 'red' ? 'danger' : level === 'orange' ? 'warning' : ''
}
</script>

<style scoped>
.alarm-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.alarm-item:last-child { border-bottom: none; }
</style>
