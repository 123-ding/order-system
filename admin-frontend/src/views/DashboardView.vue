<template>
  <div class="dashboard">
    <!-- Stat Cards -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="card in statCards" :key="card.key">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: card.gradient }">
              <span class="stat-emoji">{{ card.icon }}</span>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-change" :class="card.trend > 0 ? 'up' : 'down'">
                {{ card.trend > 0 ? '↑' : '↓' }} {{ Math.abs(card.trend) }}% 较上月
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">📈 近7天订单趋势</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button value="orders">订单量</el-radio-button>
                <el-radio-button value="revenue">营收</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="chartRef" class="echarts-container"></div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-title">🥧 订单状态分布</div>
          </template>
          <div ref="pieRef" class="echarts-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Recent Orders -->
    <el-card shadow="hover" class="recent-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">📋 最近订单</span>
          <el-button type="primary" link @click="$router.push('/orders')">
            查看全部 →
          </el-button>
        </div>
      </template>
      <el-table :data="recentOrders" stripe size="small">
        <el-table-column prop="orderNo" label="订单号" width="150" />
        <el-table-column prop="customer" label="客户" width="100" />
        <el-table-column prop="origin" label="起始港" width="100" />
        <el-table-column prop="destination" label="目的港" width="100" />
        <el-table-column prop="cargo" label="货物类型" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="ORDER_STATUS[row.status]?.type" size="small">
              {{ ORDER_STATUS[row.status]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="freight" label="运费(元)" align="right" width="120" />
        <el-table-column prop="createdAt" label="创建时间" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { ORDER_STATUS } from '@/utils/constants'

const chartRef = ref(null)
const pieRef = ref(null)
const chartType = ref('orders')
let lineChart = null
let pieChart = null

const statCards = [
  {
    key: 'total',
    label: '总订单数',
    value: '1,284',
    icon: '📦',
    trend: 12.5,
    gradient: 'linear-gradient(135deg, #1a6eb0, #2196F3)'
  },
  {
    key: 'active',
    label: '进行中订单',
    value: '86',
    icon: '🚢',
    trend: 8.3,
    gradient: 'linear-gradient(135deg, #0e9aa7, #26c6da)'
  },
  {
    key: 'vessels',
    label: '船舶数量',
    value: '24',
    icon: '⚓',
    trend: 0,
    gradient: 'linear-gradient(135deg, #1b6ca8, #42a5f5)'
  },
  {
    key: 'revenue',
    label: '本月营收',
    value: '¥2,863,400',
    icon: '💰',
    trend: 18.7,
    gradient: 'linear-gradient(135deg, #0d6e4f, #26a969)'
  }
]

const recentOrders = [
  { orderNo: 'ORD-2024-001284', customer: '远洋贸易', origin: '上海港', destination: '广州港', cargo: '集装箱', status: 'in_transit', freight: '48,500', createdAt: '2024-06-01' },
  { orderNo: 'ORD-2024-001283', customer: '华南物流', origin: '深圳港', destination: '青岛港', cargo: '散货', status: 'loading', freight: '32,000', createdAt: '2024-06-01' },
  { orderNo: 'ORD-2024-001282', customer: '北方运输', origin: '天津港', destination: '上海港', cargo: '液体货', status: 'confirmed', freight: '65,200', createdAt: '2024-05-31' },
  { orderNo: 'ORD-2024-001281', customer: '东海航运', origin: '宁波港', destination: '大连港', cargo: '滚装货物', status: 'arrived', freight: '28,800', createdAt: '2024-05-31' },
  { orderNo: 'ORD-2024-001280', customer: '福建货运', origin: '福州港', destination: '天津港', cargo: '集装箱', status: 'completed', freight: '54,100', createdAt: '2024-05-30' }
]

const ordersTrendData = {
  orders: [42, 58, 51, 74, 63, 89, 76],
  revenue: [128000, 196000, 172000, 248000, 210000, 305000, 267000]
}

const days = ['5/27', '5/28', '5/29', '5/30', '5/31', '6/1', '今天']

function initLineChart() {
  lineChart = echarts.init(chartRef.value)
  updateLineChart()
}

function updateLineChart() {
  const isOrders = chartType.value === 'orders'
  const data = isOrders ? ordersTrendData.orders : ordersTrendData.revenue
  lineChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: isOrders
        ? '{b}<br/>订单量: {c} 单'
        : '{b}<br/>营收: ¥{c}'
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: '#c0cfe0' } },
      axisLabel: { color: '#6a8aaa' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#e8f0f8', type: 'dashed' } },
      axisLabel: { color: '#6a8aaa' }
    },
    series: [
      {
        name: isOrders ? '订单量' : '营收',
        type: 'line',
        data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        itemStyle: { color: '#1a6eb0' },
        lineStyle: { color: '#1a6eb0', width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(26,110,176,0.3)' },
            { offset: 1, color: 'rgba(26,110,176,0.02)' }
          ])
        }
      }
    ]
  })
}

function initPieChart() {
  pieChart = echarts.init(pieRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: { color: '#5a7a9a', fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' }
        },
        data: [
          { value: 86, name: '运输中', itemStyle: { color: '#1a6eb0' } },
          { value: 234, name: '已完成', itemStyle: { color: '#26a969' } },
          { value: 52, name: '装货中', itemStyle: { color: '#f0a020' } },
          { value: 38, name: '待确认', itemStyle: { color: '#8fa8c0' } },
          { value: 14, name: '已取消', itemStyle: { color: '#e05555' } }
        ]
      }
    ]
  })
}

watch(chartType, updateLineChart)

function handleResize() {
  lineChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  initLineChart()
  initPieChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  lineChart?.dispose()
  pieChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid #e4edf5;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-emoji {
  font-size: 26px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a2f45;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 13px;
  color: #6a8aaa;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
}

.stat-change.up {
  color: #26a969;
}

.stat-change.down {
  color: #e05555;
}

.chart-card {
  border-radius: 12px;
  border: 1px solid #e4edf5;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a2f45;
}

.echarts-container {
  height: 280px;
}

.recent-card {
  border-radius: 12px;
  border: 1px solid #e4edf5;
}
</style>
