<template>
  <div class="order-list-page">
    <div class="list-header">
      <div class="header-title">我的订单</div>
    </div>

    <van-tabs v-model:active="activeTab" sticky animated color="#0066cc" title-active-color="#0066cc">
      <van-tab v-for="tab in tabs" :key="tab.name" :title="tab.label" :name="tab.name">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多订单了"
            @load="onLoad"
          >
            <div
              v-for="order in filteredOrders"
              :key="order.id"
              class="order-item"
              @click="$router.push(`/orders/${order.id}`)"
            >
              <div class="order-head">
                <span class="order-no">{{ order.orderNo }}</span>
                <van-tag
                  :type="statusConfig[order.status].type"
                  size="medium"
                >{{ statusConfig[order.status].label }}</van-tag>
              </div>
              <div class="order-route">
                <van-icon name="location-o" size="14" color="#0066cc" />
                <span class="route-text">{{ order.origin }}</span>
                <van-icon name="arrow" size="12" color="#aaa" />
                <span class="route-text">{{ order.destination }}</span>
              </div>
              <div class="order-info-row">
                <span class="info-item">
                  <van-icon name="goods-collect-o" size="12" />
                  {{ order.cargoType }}
                </span>
                <span class="info-item">
                  <van-icon name="balance-o" size="12" />
                  {{ order.weight }}吨
                </span>
                <span class="info-item freight">
                  ¥{{ order.freight.toLocaleString() }}
                </span>
              </div>
              <div class="order-foot">
                <span class="order-date">下单：{{ order.createdAt }}</span>
                <van-icon name="arrow" size="14" color="#ccc" />
              </div>
            </div>

            <div v-if="filteredOrders.length === 0" class="empty-state">
              <van-empty image="order" description="暂无相关订单" />
            </div>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('all')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(true)

const tabs = [
  { name: 'all', label: '全部' },
  { name: 'pending', label: '待确认' },
  { name: 'in_transit', label: '运输中' },
  { name: 'completed', label: '已完成' }
]

const statusConfig = {
  pending: { type: 'warning', label: '待确认' },
  confirmed: { type: 'primary', label: '已确认' },
  loading_cargo: { type: 'primary', label: '装货中' },
  in_transit: { type: 'primary', label: '运输中' },
  arrived: { type: 'success', label: '已到港' },
  completed: { type: 'success', label: '已完成' },
  cancelled: { type: 'danger', label: '已取消' }
}

const allOrders = ref([
  {
    id: 'ORD20240601',
    orderNo: 'ORD-2024-0601',
    origin: '上海港',
    destination: '新加坡港',
    cargoType: '集装箱',
    weight: 120,
    freight: 58000,
    status: 'in_transit',
    createdAt: '2024-06-01'
  },
  {
    id: 'ORD20240589',
    orderNo: 'ORD-2024-0589',
    origin: '广州港',
    destination: '鹿特丹港',
    cargoType: '散货',
    weight: 2500,
    freight: 320000,
    status: 'in_transit',
    createdAt: '2024-05-28'
  },
  {
    id: 'ORD20240575',
    orderNo: 'ORD-2024-0575',
    origin: '宁波港',
    destination: '横滨港',
    cargoType: '集装箱',
    weight: 85,
    freight: 28500,
    status: 'pending',
    createdAt: '2024-05-25'
  },
  {
    id: 'ORD20240560',
    orderNo: 'ORD-2024-0560',
    origin: '深圳港',
    destination: '迪拜港',
    cargoType: '液货',
    weight: 800,
    freight: 95000,
    status: 'pending',
    createdAt: '2024-05-22'
  },
  {
    id: 'ORD20240540',
    orderNo: 'ORD-2024-0540',
    origin: '青岛港',
    destination: '洛杉矶港',
    cargoType: '集装箱',
    weight: 200,
    freight: 125000,
    status: 'in_transit',
    createdAt: '2024-05-18'
  },
  {
    id: 'ORD20240520',
    orderNo: 'ORD-2024-0520',
    origin: '天津港',
    destination: '汉堡港',
    cargoType: '滚装货物',
    weight: 350,
    freight: 180000,
    status: 'completed',
    createdAt: '2024-05-10'
  },
  {
    id: 'ORD20240498',
    orderNo: 'ORD-2024-0498',
    origin: '上海港',
    destination: '釜山港',
    cargoType: '集装箱',
    weight: 60,
    freight: 18000,
    status: 'completed',
    createdAt: '2024-05-02'
  },
  {
    id: 'ORD20240470',
    orderNo: 'ORD-2024-0470',
    origin: '广州港',
    destination: '雅加达港',
    cargoType: '散货',
    weight: 1200,
    freight: 88000,
    status: 'completed',
    createdAt: '2024-04-22'
  },
  {
    id: 'ORD20240445',
    orderNo: 'ORD-2024-0445',
    origin: '宁波港',
    destination: '新加坡港',
    cargoType: '集装箱',
    weight: 95,
    freight: 42000,
    status: 'confirmed',
    createdAt: '2024-04-15'
  },
  {
    id: 'ORD20240420',
    orderNo: 'ORD-2024-0420',
    origin: '深圳港',
    destination: '曼谷港',
    cargoType: '液货',
    weight: 600,
    freight: 72000,
    status: 'completed',
    createdAt: '2024-04-08'
  }
])

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return allOrders.value
  if (activeTab.value === 'pending') return allOrders.value.filter(o => o.status === 'pending' || o.status === 'confirmed')
  if (activeTab.value === 'in_transit') return allOrders.value.filter(o => ['loading_cargo', 'in_transit', 'arrived'].includes(o.status))
  if (activeTab.value === 'completed') return allOrders.value.filter(o => o.status === 'completed' || o.status === 'cancelled')
  return allOrders.value
})

function onRefresh() {
  setTimeout(() => {
    refreshing.value = false
  }, 800)
}

function onLoad() {
  loading.value = false
  finished.value = true
}
</script>

<style scoped>
.order-list-page {
  min-height: 100%;
  background: #f5f7fa;
}

.list-header {
  background: linear-gradient(135deg, #003d7a, #0066cc);
  padding: 48px 16px 16px;
}

.header-title {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}

:deep(.van-tabs__wrap) {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.order-item {
  background: #fff;
  margin: 10px 12px 0;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.1s;
}

.order-item:active { transform: scale(0.98); }

.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-no {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
}

.order-route {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.route-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.order-info-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
}

.info-item {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 3px;
}

.info-item.freight {
  margin-left: auto;
  font-size: 15px;
  font-weight: 700;
  color: #e04040;
}

.order-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}

.order-date {
  font-size: 12px;
  color: #aaa;
}

.empty-state {
  padding: 40px 0;
}
</style>
