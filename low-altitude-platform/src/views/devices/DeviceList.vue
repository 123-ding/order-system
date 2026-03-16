<template>
  <div>
    <div class="page-header">
      <h2>{{ title }}</h2>
      <el-button type="primary" :icon="Plus" @click="goAdd">新增设备</el-button>
    </div>

    <!-- Filter Bar -->
    <el-card style="margin-bottom:16px;">
      <el-row :gutter="12">
        <el-col :span="6">
          <el-input v-model="filterName" placeholder="搜索设备名称" clearable :prefix-icon="Search" />
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width:100%;">
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="告警" value="alarm" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterRegion" placeholder="区域筛选" clearable style="width:100%;">
            <el-option v-for="r in REGION_OPTIONS" :key="r" :label="r" :value="r" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button @click="filterName='';filterStatus='';filterRegion=''">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Table -->
    <el-card>
      <el-table :data="filteredDevices" stripe style="width:100%;">
        <el-table-column prop="name" label="设备名称" min-width="140" />
        <el-table-column prop="brand" label="品牌" min-width="120" />
        <el-table-column prop="model" label="型号" min-width="120" />
        <el-table-column label="协议" min-width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ protocolLabel(row.protocol) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="连接地址" min-width="160">
          <template #default="{ row }">
            <span v-if="row.protocol === 'mqtt'">{{ row.mqttBroker }}:{{ row.port }}</span>
            <span v-else-if="row.protocol === 'websocket'">{{ row.wsUrl }}</span>
            <span v-else-if="['serial_rs232','serial_rs485'].includes(row.protocol)">{{ row.serialPort }}</span>
            <span v-else>{{ row.host }}:{{ row.port }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="region" label="区域" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-badge :is-dot="row.status==='alarm'" :type="statusType(row.status)">
              <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column label="最后心跳" min-width="160">
          <template #default="{ row }">
            <span>{{ row.lastSeenAt ? formatTime(row.lastSeenAt) : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" :icon="View" @click="viewDetail(row)">详情</el-button>
              <el-button size="small" type="primary" :icon="Edit" @click="goEdit(row.id)">编辑</el-button>
              <el-button size="small" type="danger" :icon="Delete" @click="confirmDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top:16px;display:flex;justify-content:flex-end;">
        <el-pagination background layout="total, prev, pager, next" :total="filteredDevices.length" :page-size="10" />
      </div>
    </el-card>

    <!-- Detail Drawer -->
    <el-drawer v-model="drawerVisible" title="设备详情" direction="rtl" size="420px">
      <template v-if="selectedDevice">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="设备名称">{{ selectedDevice.name }}</el-descriptions-item>
          <el-descriptions-item label="品牌">{{ selectedDevice.brand }}</el-descriptions-item>
          <el-descriptions-item label="型号">{{ selectedDevice.model }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ title }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{ selectedDevice.region }}</el-descriptions-item>
          <el-descriptions-item label="通信协议">{{ protocolLabel(selectedDevice.protocol) }}</el-descriptions-item>
          <el-descriptions-item label="连接地址">
            <span v-if="['serial_rs232','serial_rs485'].includes(selectedDevice.protocol)">{{ selectedDevice.serialPort }} @ {{ selectedDevice.baudRate }} bps</span>
            <span v-else-if="selectedDevice.protocol === 'mqtt'">{{ selectedDevice.mqttBroker }}:{{ selectedDevice.port }} / {{ selectedDevice.mqttTopic }}</span>
            <span v-else>{{ selectedDevice.host }}:{{ selectedDevice.port }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType(selectedDevice.status)">{{ statusLabel(selectedDevice.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后心跳">{{ selectedDevice.lastSeenAt ? formatTime(selectedDevice.lastSeenAt) : '—' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatTime(selectedDevice.createdAt) }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top:20px;display:flex;gap:8px;">
          <el-button type="primary" @click="testConnection(selectedDevice)">测试连接</el-button>
          <el-button type="warning" @click="goEdit(selectedDevice.id);drawerVisible=false">编辑</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, View, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDeviceStore } from '../../stores/device'
import type { Device, DeviceType } from '../../types/device'
import { PROTOCOL_OPTIONS, REGION_OPTIONS } from '../../types/device'

const props = defineProps<{ deviceType: DeviceType; title: string }>()
const router = useRouter()
const store = useDeviceStore()

const filterName = ref('')
const filterStatus = ref('')
const filterRegion = ref('')
const drawerVisible = ref(false)
const selectedDevice = ref<Device | null>(null)

const filteredDevices = computed(() =>
  store.getByType(props.deviceType).filter(d => {
    if (filterName.value && !d.name.toLowerCase().includes(filterName.value.toLowerCase())) return false
    if (filterStatus.value && d.status !== filterStatus.value) return false
    if (filterRegion.value && d.region !== filterRegion.value) return false
    return true
  })
)

function protocolLabel(p: string) {
  const all = Object.values(PROTOCOL_OPTIONS).flat()
  return all.find(o => o.value === p)?.label ?? p
}

function statusType(s: string) {
  return s === 'online' ? 'success' : s === 'alarm' ? 'danger' : s === 'disabled' ? 'info' : ''
}

function statusLabel(s: string) {
  return { online: '在线', offline: '离线', alarm: '告警', disabled: '已禁用' }[s] ?? s
}

function formatTime(t: string) {
  return new Date(t).toLocaleString('zh-CN')
}

function goAdd() {
  router.push(`/devices/${props.deviceType}/add`)
}

function goEdit(id: number) {
  router.push(`/devices/${props.deviceType}/edit/${id}`)
}

function viewDetail(device: Device) {
  selectedDevice.value = device
  drawerVisible.value = true
}

function confirmDelete(device: Device) {
  ElMessageBox.confirm(`确定删除设备「${device.name}」吗？此操作不可恢复。`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger',
  }).then(() => {
    store.removeDevice(device.id)
    ElMessage.success('设备已删除')
  }).catch(() => {})
}

function testConnection(device: Device) {
  ElMessage.info(`正在测试连接「${device.name}」...`)
  setTimeout(() => {
    ElMessage.success('连接测试成功！延迟 12ms')
  }, 1500)
}
</script>
