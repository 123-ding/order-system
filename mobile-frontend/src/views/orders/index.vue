<template>
  <div class="orders-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="我的订单"
      fixed
      placeholder
    />

    <!-- 订单标签 -->
    <van-sticky :offset-top="46">
      <van-tabs
        v-model:active="activeTab"
        color="#FF6B35"
        @change="onTabChange"
      >
        <van-tab title="全部" name="all" />
        <van-tab title="待支付" name="pending" />
        <van-tab title="配送中" name="shipping" />
        <van-tab title="已完成" name="completed" />
        <van-tab title="已取消" name="cancelled" />
      </van-tabs>
    </van-sticky>

    <!-- 订单列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="orders-list">
          <div
            v-for="order in orders"
            :key="order.id"
            class="order-card"
            @click="goToOrderDetail(order.id)"
          >
            <!-- 订单头部 -->
            <div class="order-header">
              <span class="order-number">订单号：{{ order.orderNo }}</span>
              <van-tag
                :type="getOrderStatusType(order.status)"
                plain
              >
                {{ getOrderStatusText(order.status) }}
              </van-tag>
            </div>

            <!-- 订单商品 -->
            <div class="order-items">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="order-item"
              >
                <van-image
                  :src="item.image"
                  width="60"
                  height="60"
                  fit="cover"
                  radius="4"
                />
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-meta">
                    <span class="item-price">¥{{ item.price }}</span>
                    <span class="item-quantity">x{{ item.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 订单信息 -->
            <div class="order-info">
              <van-cell
                title="送达时间"
                :value="order.deliveryDate"
                icon="clock-o"
                size="small"
              />
              <van-cell
                title="订单金额"
                :value="`¥${order.totalAmount.toFixed(2)}`"
                icon="balance-o"
                size="small"
              />
            </div>

            <!-- 订单操作 -->
            <div class="order-actions">
              <van-button
                v-if="order.status === 'pending'"
                size="small"
                @click.stop="cancelOrder(order.id)"
              >
                取消订单
              </van-button>
              <van-button
                v-if="order.status === 'pending'"
                size="small"
                type="primary"
                color="#FF6B35"
                @click.stop="payOrder(order.id)"
              >
                立即支付
              </van-button>
              <van-button
                v-if="order.status === 'shipping'"
                size="small"
                type="primary"
                color="#FF6B35"
                @click.stop="confirmOrder(order.id)"
              >
                确认收货
              </van-button>
              <van-button
                v-if="order.status === 'completed' && !order.reviewed"
                size="small"
                type="primary"
                color="#FF6B35"
                @click.stop="reviewOrder(order.id)"
              >
                去评价
              </van-button>
              <van-button
                v-if="order.status === 'completed' || order.status === 'cancelled'"
                size="small"
                @click.stop="deleteOrder(order.id)"
              >
                删除订单
              </van-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <van-empty
          v-if="!loading && orders.length === 0"
          description="暂无订单"
          image="search"
        >
          <van-button
            type="primary"
            color="#FF6B35"
            round
            @click="goToShop"
          >
            去下单
          </van-button>
        </van-empty>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Toast, Dialog } from 'vant'
import { orderApi } from '@/api/mobile'

const router = useRouter()

const activeTab = ref('all')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const orders = ref([])
const page = ref(1)

// 模拟订单数据
const mockOrders = [
  {
    id: 1,
    orderNo: '20240115123456',
    status: 'pending',
    deliveryDate: '2024-01-16 12:00-14:00',
    totalAmount: 128.00,
    reviewed: false,
    items: [
      {
        id: 1,
        name: '宫保鸡丁',
        price: 28.00,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1603073524394-61e3451b69a7?w=400'
      },
      {
        id: 2,
        name: '麻婆豆腐',
        price: 22.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400'
      }
    ]
  },
  {
    id: 2,
    orderNo: '20240114098765',
    status: 'shipping',
    deliveryDate: '2024-01-15 09:00-12:00',
    totalAmount: 88.00,
    reviewed: false,
    items: [
      {
        id: 3,
        name: '红烧肉',
        price: 38.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400'
      },
      {
        id: 4,
        name: '糖醋里脊',
        price: 32.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1587439139558-4e9f36ff9b28?w=400'
      }
    ]
  },
  {
    id: 3,
    orderNo: '20240113054321',
    status: 'completed',
    deliveryDate: '2024-01-14 18:00-20:00',
    totalAmount: 156.00,
    reviewed: false,
    items: [
      {
        id: 5,
        name: '鱼香肉丝',
        price: 26.00,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1604908815453-3e3d44159c72?w=400'
      },
      {
        id: 6,
        name: '水煮鱼',
        price: 58.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400'
      }
    ]
  }
]

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    paid: '已支付',
    shipping: '配送中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    paid: 'primary',
    shipping: 'primary',
    completed: 'success',
    cancelled: 'default'
  }
  return typeMap[status] || 'default'
}

// 标签切换
const onTabChange = () => {
  page.value = 1
  orders.value = []
  finished.value = false
  loadOrders()
}

// 下拉刷新
const onRefresh = async () => {
  page.value = 1
  orders.value = []
  finished.value = false
  await loadOrders()
  refreshing.value = false
}

// 上拉加载
const onLoad = () => {
  loadOrders()
}

// 加载订单
const loadOrders = async () => {
  try {
    loading.value = true
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 过滤订单
    let filteredOrders = [...mockOrders]
    if (activeTab.value !== 'all') {
      filteredOrders = filteredOrders.filter(o => o.status === activeTab.value)
    }
    
    if (filteredOrders.length === 0) {
      finished.value = true
    } else {
      orders.value = filteredOrders
      finished.value = true
    }
  } catch (error) {
    Toast.fail('加载失败')
  } finally {
    loading.value = false
  }
}

// 跳转到订单详情
const goToOrderDetail = (orderId) => {
  router.push(`/order-detail/${orderId}`)
}

// 跳转到商城
const goToShop = () => {
  router.push('/dishes')
}

// 取消订单
const cancelOrder = (orderId) => {
  Dialog.confirm({
    title: '提示',
    message: '确定要取消这个订单吗？',
  }).then(async () => {
    Toast.loading({
      message: '取消中...',
      forbidClick: true,
    })
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'cancelled'
    }
    
    Toast.success('订单已取消')
  }).catch(() => {
    // 用户取消
  })
}

// 支付订单
const payOrder = (orderId) => {
  Toast.loading({
    message: '跳转支付...',
    forbidClick: true,
    duration: 1500
  })
  
  setTimeout(() => {
    Toast.success('支付成功')
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'shipping'
    }
  }, 1500)
}

// 确认收货
const confirmOrder = (orderId) => {
  Dialog.confirm({
    title: '提示',
    message: '确认已收到订单吗？',
  }).then(async () => {
    Toast.loading({
      message: '处理中...',
      forbidClick: true,
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'completed'
    }
    
    Toast.success('确认成功')
  }).catch(() => {
    // 用户取消
  })
}

// 评价订单
const reviewOrder = (orderId) => {
  router.push(`/review/${orderId}`)
}

// 删除订单
const deleteOrder = (orderId) => {
  Dialog.confirm({
    title: '提示',
    message: '确定要删除这个订单吗？',
  }).then(() => {
    const index = orders.value.findIndex(o => o.id === orderId)
    if (index > -1) {
      orders.value.splice(index, 1)
    }
    Toast.success('已删除')
  }).catch(() => {
    // 用户取消
  })
}

onMounted(() => {
  // 初始加载在onLoad中自动触发
})
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}

.orders-list {
  padding: 10px;
}

.order-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f7f8fa;
  border-bottom: 1px solid #ebedf0;
}

.order-number {
  font-size: 13px;
  color: #646566;
}

.order-items {
  padding: 15px;
}

.order-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.order-item:last-child {
  margin-bottom: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 14px;
  color: #323233;
  font-weight: 500;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 14px;
  color: #FF6B35;
  font-weight: bold;
}

.item-quantity {
  font-size: 13px;
  color: #969799;
}

.order-info {
  border-top: 1px solid #ebedf0;
  border-bottom: 1px solid #ebedf0;
}

.order-info :deep(.van-cell) {
  padding: 8px 15px;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 15px;
}
</style>
