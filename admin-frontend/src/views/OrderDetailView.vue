<template>
  <div class="page-container">
    <!-- Back button + title -->
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="$router.push('/orders')" plain>返回列表</el-button>
      <h2 class="page-title">订单详情</h2>
      <el-tag :type="ORDER_STATUS[order.status]?.type" size="large">
        {{ ORDER_STATUS[order.status]?.label }}
      </el-tag>
    </div>

    <el-row :gutter="20">
      <!-- Order Info -->
      <el-col :span="16">
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-title">📄 基本信息</div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">
              <strong>{{ order.orderNo }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="客户">{{ order.customer }}</el-descriptions-item>
            <el-descriptions-item label="起始港">
              <el-tag type="info" size="small">{{ order.origin }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="目的港">
              <el-tag type="success" size="small">{{ order.destination }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="货物类型">{{ order.cargo }}</el-descriptions-item>
            <el-descriptions-item label="使用船舶">{{ order.vessel }}</el-descriptions-item>
            <el-descriptions-item label="货物重量">{{ order.weight }} 吨</el-descriptions-item>
            <el-descriptions-item label="运费">
              <span class="freight-text">¥ {{ order.freight.toLocaleString() }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="预计航行天数">{{ order.estimatedDays }} 天</el-descriptions-item>
            <el-descriptions-item label="预计到达">{{ order.eta }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ order.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ order.updatedAt }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ order.remark || '暂无备注' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Cargo Table -->
        <el-card class="info-card" shadow="never" style="margin-top: 16px">
          <template #header>
            <div class="card-title">📦 货物清单</div>
          </template>
          <el-table :data="order.cargoList" border stripe size="small">
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="cargoNo" label="货物编号" width="160" />
            <el-table-column prop="description" label="货物描述" min-width="160" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="weight" label="重量(吨)" width="100" align="right" />
            <el-table-column prop="volume" label="体积(m³)" width="100" align="right" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="CARGO_STATUS[row.status]?.type" size="small">
                  {{ CARGO_STATUS[row.status]?.label }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- Timeline -->
      <el-col :span="8">
        <el-card class="timeline-card" shadow="never">
          <template #header>
            <div class="card-title">🕐 状态时间线</div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="item in order.timeline"
              :key="item.time"
              :timestamp="item.time"
              :type="item.type"
              :hollow="item.hollow"
              placement="top"
            >
              <div class="timeline-content">
                <div class="timeline-title">{{ item.title }}</div>
                <div class="timeline-desc">{{ item.desc }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <el-card class="info-card" shadow="never" style="margin-top: 16px">
          <template #header>
            <div class="card-title">🚢 船舶信息</div>
          </template>
          <div class="vessel-mini">
            <div class="vessel-mini-row">
              <span class="vm-label">船舶名称</span>
              <span class="vm-value">{{ order.vessel }}</span>
            </div>
            <div class="vessel-mini-row">
              <span class="vm-label">船舶类型</span>
              <span class="vm-value">集装箱船</span>
            </div>
            <div class="vessel-mini-row">
              <span class="vm-label">注册号</span>
              <span class="vm-value">IMO9876543</span>
            </div>
            <div class="vessel-mini-row">
              <span class="vm-label">当前位置</span>
              <span class="vm-value location">东海 (30.2°N, 122.8°E)</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ORDER_STATUS, CARGO_STATUS } from '@/utils/constants'

const route = useRoute()
const orderId = computed(() => route.params.id)

// Mock order data based on ID
const allOrders = {
  1: {
    id: 1, orderNo: 'ORD-2024-001284', customer: '远洋贸易有限公司', origin: '上海港',
    destination: '广州港', cargo: '集装箱', vessel: '东方之星', weight: 1200,
    status: 'in_transit', freight: 48500, estimatedDays: 4, eta: '2024-06-05',
    createdAt: '2024-06-01', updatedAt: '2024-06-02', remark: '贵重电子产品，注意防潮',
    cargoList: [
      { id: 1, cargoNo: 'CGO-2024-001128', description: '电子设备整柜A', type: '集装箱', weight: 720, volume: 33.2, status: 'in_transit' },
      { id: 2, cargoNo: 'CGO-2024-001129', description: '电子设备整柜B', type: '集装箱', weight: 480, volume: 28.5, status: 'in_transit' }
    ],
    timeline: [
      { title: '订单创建', desc: '客户提交订单申请', time: '2024-06-01 09:00', type: 'primary', hollow: false },
      { title: '订单确认', desc: '运营人员审核并确认订单', time: '2024-06-01 11:30', type: 'success', hollow: false },
      { title: '装货中', desc: '货物开始在上海港装载', time: '2024-06-02 08:00', type: 'warning', hollow: false },
      { title: '运输中', desc: '船舶离港，开始运输', time: '2024-06-02 16:00', type: 'primary', hollow: false },
      { title: '到达目的港', desc: '预计到达广州港', time: '2024-06-05 估计', type: 'info', hollow: true },
      { title: '完成交付', desc: '货物完成交付', time: '待定', type: 'success', hollow: true }
    ]
  }
}

const order = computed(() => {
  const id = Number(orderId.value)
  return allOrders[id] || allOrders[1]
})
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 16px; }

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a2f45;
  flex: 1;
}

.info-card, .timeline-card {
  border-radius: 10px;
  border: 1px solid #e4edf5;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a2f45;
}

.freight-text {
  color: #0d6e4f;
  font-weight: 700;
  font-size: 16px;
}

.timeline-content {
  margin-bottom: 4px;
}

.timeline-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a2f45;
  margin-bottom: 2px;
}

.timeline-desc {
  font-size: 12px;
  color: #8a9bb0;
}

.vessel-mini {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vessel-mini-row {
  display: flex;
  justify-content: space-between;
}

.vm-label {
  font-size: 13px;
  color: #8a9bb0;
}

.vm-value {
  font-size: 13px;
  color: #2c3e50;
  font-weight: 500;
}

.vm-value.location {
  color: #1a6eb0;
}
</style>
