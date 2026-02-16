<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <el-icon :size="32"><ShoppingCart /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">今日订单</div>
              <el-statistic :value="stats.todayOrders" :loading="loading">
                <template #suffix>单</template>
              </el-statistic>
            </div>
          </div>
          <div class="stats-footer">
            <span class="stats-trend up">
              <el-icon><CaretTop /></el-icon>
              {{ stats.ordersGrowth }}%
            </span>
            <span class="stats-desc">较昨日</span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
              <el-icon :size="32"><Money /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">今日销售额</div>
              <el-statistic :value="stats.todaySales" :precision="2" :loading="loading">
                <template #prefix>¥</template>
              </el-statistic>
            </div>
          </div>
          <div class="stats-footer">
            <span class="stats-trend up">
              <el-icon><CaretTop /></el-icon>
              {{ stats.salesGrowth }}%
            </span>
            <span class="stats-desc">较昨日</span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">总用户数</div>
              <el-statistic :value="stats.totalUsers" :loading="loading" />
            </div>
          </div>
          <div class="stats-footer">
            <span class="stats-trend up">
              <el-icon><CaretTop /></el-icon>
              {{ stats.usersGrowth }}%
            </span>
            <span class="stats-desc">较上月</span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <el-icon :size="32"><Food /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">菜品总数</div>
              <el-statistic :value="stats.totalDishes" :loading="loading" />
            </div>
          </div>
          <div class="stats-footer">
            <span class="stats-trend">
              <el-icon><Minus /></el-icon>
              稳定
            </span>
            <span class="stats-desc">暂无变化</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表和最近订单 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 销售趋势图 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><TrendCharts /></el-icon>
                销售趋势
              </span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button label="week">近7天</el-radio-button>
                <el-radio-button label="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="chartRef" class="chart-container" v-loading="chartLoading"></div>
        </el-card>
      </el-col>

      <!-- 订单状态统计 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><PieChart /></el-icon>
                订单状态
              </span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-container" v-loading="chartLoading"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近订单 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><List /></el-icon>
            最近订单
          </span>
          <el-button type="primary" link @click="$router.push('/orders')">
            查看全部
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>

      <el-table :data="recentOrders" v-loading="tableLoading" stripe>
        <el-table-column prop="orderNo" label="订单号" min-width="150" />
        <el-table-column prop="userName" label="用户" min-width="100" />
        <el-table-column label="金额" min-width="100">
          <template #default="{ row }">
            <span class="amount">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" min-width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewOrder(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  ShoppingCart,
  Money,
  User,
  Food,
  CaretTop,
  Minus,
  TrendCharts,
  PieChart,
  List,
  ArrowRight
} from '@element-plus/icons-vue'
import { getDashboardStats, getOrders } from '@/api/admin'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const chartLoading = ref(false)
const tableLoading = ref(false)
const chartType = ref('week')

const stats = ref({
  todayOrders: 0,
  ordersGrowth: 0,
  todaySales: 0,
  salesGrowth: 0,
  totalUsers: 0,
  usersGrowth: 0,
  totalDishes: 0
})

const recentOrders = ref([])
const chartRef = ref(null)
const pieChartRef = ref(null)
let salesChart = null
let pieChart = null

// 获取统计数据
const fetchStats = async () => {
  loading.value = true
  try {
    const res = await getDashboardStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取最近订单
const fetchRecentOrders = async () => {
  tableLoading.value = true
  try {
    const res = await getOrders({ page: 1, pageSize: 10 })
    if (res.code === 200) {
      recentOrders.value = res.data.list || []
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    tableLoading.value = false
  }
}

// 初始化销售趋势图
const initSalesChart = () => {
  if (!chartRef.value) return

  salesChart = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '销售额(元)'
    },
    series: [
      {
        name: '销售额',
        type: 'bar',
        barWidth: '60%',
        data: [2800, 3200, 2900, 3500, 4200, 5100, 4800],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        }
      }
    ]
  }

  salesChart.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: '70%',
        data: [
          { value: 120, name: '待接单' },
          { value: 85, name: '制作中' },
          { value: 58, name: '配送中' },
          { value: 320, name: '已完成' },
          { value: 12, name: '已取消' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  pieChart.setOption(option)
}

// 状态类型
const getStatusType = (status) => {
  const types = {
    0: 'info',
    1: 'warning',
    2: 'primary',
    3: '',
    4: 'success',
    5: 'danger'
  }
  return types[status] || 'info'
}

// 状态文本
const getStatusText = (status) => {
  const texts = {
    0: '待支付',
    1: '待接单',
    2: '制作中',
    3: '配送中',
    4: '已完成',
    5: '已取消'
  }
  return texts[status] || '未知'
}

// 查看订单详情
const viewOrder = (order) => {
  ElMessage.info('订单详情功能开发中...')
}

// 监听图表类型变化
watch(chartType, () => {
  if (salesChart) {
    chartLoading.value = true
    setTimeout(() => {
      // 这里可以根据 chartType 加载不同的数据
      chartLoading.value = false
    }, 500)
  }
})

onMounted(async () => {
  await fetchStats()
  await fetchRecentOrders()
  
  await nextTick()
  initSalesChart()
  initPieChart()

  // 响应式图表
  window.addEventListener('resize', () => {
    salesChart?.resize()
    pieChart?.resize()
  })
})
</script>

<style scoped lang="scss">
.dashboard-container {
  .stats-row {
    margin-bottom: 20px;
  }

  .stats-card {
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }

    .stats-content {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;

      .stats-icon {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        flex-shrink: 0;
      }

      .stats-info {
        flex: 1;

        .stats-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        :deep(.el-statistic) {
          .el-statistic__head {
            display: none;
          }

          .el-statistic__content {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }

    .stats-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
      font-size: 12px;

      .stats-trend {
        display: flex;
        align-items: center;
        gap: 2px;
        font-weight: 500;

        &.up {
          color: #67c23a;
        }

        &.down {
          color: #f56c6c;
        }
      }

      .stats-desc {
        color: #909399;
      }
    }
  }

  .chart-row {
    margin-bottom: 20px;
  }

  .chart-card,
  .table-card {
    border-radius: 12px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .chart-container {
      height: 350px;
    }
  }

  .table-card {
    .amount {
      font-weight: 600;
      color: #f56c6c;
    }

    :deep(.el-table) {
      font-size: 14px;

      .el-table__header th {
        background-color: #fafafa;
      }
    }
  }
}

@media (max-width: 768px) {
  .stats-card {
    .stats-content {
      .stats-icon {
        width: 48px;
        height: 48px;

        .el-icon {
          font-size: 24px !important;
        }
      }

      .stats-info {
        :deep(.el-statistic__content) {
          font-size: 20px;
        }
      }
    }
  }

  .chart-container {
    height: 280px !important;
  }
}
</style>
