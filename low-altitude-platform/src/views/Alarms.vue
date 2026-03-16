<template>
  <div>
    <div class="page-header">
      <h2>告警中心</h2>
      <div style="display:flex;gap:8px;">
        <el-select v-model="filterLevel" placeholder="告警级别" clearable style="width:130px;">
          <el-option label="红色（紧急）" value="red" />
          <el-option label="橙色（严重）" value="orange" />
          <el-option label="黄色（预警）" value="yellow" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="处理状态" clearable style="width:130px;">
          <el-option label="待处理" value="pending" />
          <el-option label="已确认" value="acknowledged" />
          <el-option label="已关闭" value="closed" />
        </el-select>
        <el-button type="primary" @click="filterLevel='';filterStatus=''">重置</el-button>
      </div>
    </div>

    <el-card>
      <el-table :data="filteredAlarms" stripe>
        <el-table-column label="告警级别" width="120">
          <template #default="{ row }">
            <el-tag :type="levelType(row.level)" effect="dark">{{ row.levelLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="告警信息" min-width="240" />
        <el-table-column prop="source" label="来源设备" width="140" />
        <el-table-column prop="time" label="告警时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" size="small" type="warning" @click="acknowledge(row)">确认</el-button>
            <el-button v-if="row.status !== 'closed'" size="small" type="success" @click="closeAlarm(row)">关闭</el-button>
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

interface Alarm {
  id: number; level: string; levelLabel: string; message: string
  source: string; time: string; status: string; statusLabel: string
}

const alarms = ref<Alarm[]>([
  { id: 1, level: 'red', levelLabel: '紧急', message: '禁飞区检测到未授权无人机入侵', source: 'RADAR-HW-01', time: '2026-03-16 08:45:12', status: 'pending', statusLabel: '待处理' },
  { id: 2, level: 'orange', levelLabel: '严重', message: 'SPECTRUM-01 通信中断超过 30 秒', source: 'SPECTRUM-01', time: '2026-03-16 08:30:05', status: 'acknowledged', statusLabel: '已确认' },
  { id: 3, level: 'yellow', levelLabel: '预警', message: 'DJI-M300-01 电量低于 20%', source: 'DJI-M300-01', time: '2026-03-16 08:15:44', status: 'pending', statusLabel: '待处理' },
  { id: 4, level: 'orange', levelLabel: '严重', message: '探测到未识别飞行目标（频率：2.4GHz）', source: 'SPECTRUM-01', time: '2026-03-16 07:58:33', status: 'closed', statusLabel: '已关闭' },
  { id: 5, level: 'red', levelLabel: '紧急', message: '反制设备 JAM-RS-01 执行失败', source: 'JAM-RS-01', time: '2026-03-16 07:30:00', status: 'closed', statusLabel: '已关闭' },
])

const filterLevel = ref('')
const filterStatus = ref('')

const filteredAlarms = computed(() =>
  alarms.value.filter(a => {
    if (filterLevel.value && a.level !== filterLevel.value) return false
    if (filterStatus.value && a.status !== filterStatus.value) return false
    return true
  })
)

function levelType(l: string) {
  return l === 'red' ? 'danger' : l === 'orange' ? 'warning' : ''
}
function statusType(s: string) {
  return s === 'pending' ? 'danger' : s === 'acknowledged' ? 'warning' : 'info'
}

function acknowledge(alarm: Alarm) {
  alarm.status = 'acknowledged'
  alarm.statusLabel = '已确认'
  ElMessage.success('告警已确认')
}
function closeAlarm(alarm: Alarm) {
  alarm.status = 'closed'
  alarm.statusLabel = '已关闭'
  ElMessage.success('告警已关闭')
}
function viewDetail(alarm: Alarm) {
  ElMessage.info(`告警详情：${alarm.message}`)
}
</script>
