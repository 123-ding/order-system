<template>
  <div>
    <div class="page-header">
      <h2>审计日志</h2>
    </div>
    <el-card>
      <el-row :gutter="12" style="margin-bottom:16px;">
        <el-col :span="5">
          <el-input v-model="filterUser" placeholder="操作用户" clearable />
        </el-col>
        <el-col :span="5">
          <el-select v-model="filterAction" placeholder="操作类型" clearable style="width:100%;">
            <el-option label="新增设备" value="ADD_DEVICE" />
            <el-option label="删除设备" value="DELETE_DEVICE" />
            <el-option label="下发指令" value="SEND_COMMAND" />
            <el-option label="告警处置" value="ALARM_DISPOSE" />
            <el-option label="用户登录" value="LOGIN" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width:100%;" />
        </el-col>
        <el-col :span="6">
          <el-button type="primary">查询</el-button>
          <el-button>导出</el-button>
        </el-col>
      </el-row>
      <el-table :data="logs" stripe>
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column prop="user" label="操作用户" width="100" />
        <el-table-column prop="action" label="操作类型" width="130">
          <template #default="{ row }">
            <el-tag size="small">{{ row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="操作对象" />
        <el-table-column prop="detail" label="详情" />
        <el-table-column prop="ip" label="来源 IP" width="130" />
        <el-table-column label="结果" width="80">
          <template #default="{ row }">
            <el-tag :type="row.result === '成功' ? 'success' : 'danger'" size="small">{{ row.result }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const filterUser = ref('')
const filterAction = ref('')
const dateRange = ref(null)

const logs = ref([
  { time: '2026-03-16 08:45:00', user: 'admin', action: 'ADD_DEVICE', target: 'DJI-M300-01', detail: '新增无人机设备，协议: MAVLink v2.0', ip: '192.168.0.10', result: '成功' },
  { time: '2026-03-16 08:30:00', user: 'operator1', action: 'ALARM_DISPOSE', target: '告警#2', detail: '确认告警：SPECTRUM-01 通信中断', ip: '192.168.0.20', result: '成功' },
  { time: '2026-03-16 08:00:00', user: 'operator1', action: 'SEND_COMMAND', target: 'JAM-RS-01', detail: '下发反制启动指令', ip: '192.168.0.20', result: '成功' },
  { time: '2026-03-16 07:55:00', user: 'unknown', action: 'LOGIN', target: '—', detail: '登录失败（密码错误）', ip: '10.0.0.55', result: '失败' },
])
</script>
