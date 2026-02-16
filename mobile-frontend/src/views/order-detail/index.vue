<template>
  <div class="order-detail-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="订单详情"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    />

    <!-- 订单状态 -->
    <div class="status-card">
      <div class="status-header">
        <van-icon :name="getStatusIcon(order.status)" size="40" color="#FF6B35" />
        <div class="status-text">
          <div class="status-title">{{ getOrderStatusText(order.status) }}</div>
          <div class="status-desc">{{ getStatusDesc(order.status) }}</div>
        </div>
      </div>
    </div>

    <!-- 配送信息 -->
    <div class="delivery-card">
      <div class="card-title">
        <van-icon name="logistics" color="#FF6B35" />
        配送信息
      </div>
      <van-cell title="配送时间" :value="order.deliveryDate" />
      <van-cell title="收货地址" :value="order.address" />
      <van-cell title="联系电话" :value="order.phone" />
    </div>

    <!-- 订单进度 -->
    <div class="progress-card">
      <div class="card-title">
        <van-icon name="clock-o" color="#FF6B35" />
        订单进度
      </div>
      <van-steps
        :active="getActiveStep(order.status)"
        active-color="#FF6B35"
        direction="vertical"
      >
        <van-step v-for="step in orderSteps" :key="step.name">
          <template #inactive-icon>
            <van-icon :name="step.icon" />
          </template>
          <template #active-icon>
            <van-icon :name="step.icon" color="#FF6B35" />
          </template>
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div class="step-time">{{ step.time }}</div>
          </div>
        </van-step>
      </van-steps>
    </div>

    <!-- 商品清单 -->
    <div class="items-card">
      <div class="card-title">
        <van-icon name="shopping-cart-o" color="#FF6B35" />
        商品清单
      </div>
      <van-card
        v-for="item in order.items"
        :key="item.id"
        :price="item.price.toFixed(2)"
        :title="item.name"
        :thumb="item.image"
        :num="item.quantity"
      />
    </div>

    <!-- 订单信息 -->
    <div class="order-info-card">
      <div class="card-title">
        <van-icon name="description" color="#FF6B35" />
        订单信息
      </div>
      <van-cell title="订单编号" :value="order.orderNo" />
      <van-cell title="下单时间" :value="order.createTime" />
      <van-cell title="支付方式" :value="order.paymentMethod" />
      <van-cell title="备注信息" :value="order.remark || '无'" />
    </div>

    <!-- 费用明细 -->
    <div class="price-card">
      <div class="card-title">
        <van-icon name="balance-o" color="#FF6B35" />
        费用明细
      </div>
      <van-cell title="商品总额" :value="`¥${order.subtotal.toFixed(2)}`" />
      <van-cell title="配送费" :value="`¥${order.deliveryFee.toFixed(2)}`" />
      <van-cell
        v-if="order.discount > 0"
        title="优惠"
        :value="`-¥${order.discount.toFixed(2)}`"
        value-class="discount-value"
      />
      <van-cell
        title="实付金额"
        :value="`¥${order.totalAmount.toFixed(2)}`"
        value-class="total-value"
      />
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-actions">
      <van-button
        v-if="order.status === 'pending'"
        size="large"
        @click="cancelOrder"
      >
        取消订单
      </van-button>
      <van-button
        v-if="order.status === 'pending'"
        size="large"
        type="primary"
        color="#FF6B35"
        @click="payOrder"
      >
        立即支付
      </van-button>
      <van-button
        v-if="order.status === 'shipping'"
        size="large"
        type="primary"
        color="#FF6B35"
        @click="confirmOrder"
      >
        确认收货
      </van-button>
      <van-button
        v-if="order.status === 'completed' && !order.reviewed"
        size="large"
        type="primary"
        color="#FF6B35"
        @click="reviewOrder"
      >
        去评价
      </van-button>
      <van-button
        v-if="order.status === 'completed' || order.status === 'cancelled'"
        size="large"
        @click="deleteOrder"
      >
        删除订单
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Toast, Dialog } from 'vant'
import { orderApi } from '@/api/mobile'

const router = useRouter()
const route = useRoute()

const order = ref({
  id: 1,
  orderNo: '20240115123456',
  status: 'shipping',
  deliveryDate: '2024-01-16 12:00-14:00',
  address: '北京市朝阳区三里屯街道',
  phone: '138****5678',
  createTime: '2024-01-15 10:30:00',
  paymentMethod: '微信支付',
  remark: '少辣，不要葱',
  subtotal: 118.00,
  deliveryFee: 5.00,
  discount: 10.00,
  totalAmount: 113.00,
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
    },
    {
      id: 3,
      name: '红烧肉',
      price: 38.00,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400'
    }
  ]
})

const orderSteps = ref([
  {
    name: 'created',
    title: '订单已创建',
    time: '2024-01-15 10:30:00',
    icon: 'records'
  },
  {
    name: 'paid',
    title: '支付成功',
    time: '2024-01-15 10:31:23',
    icon: 'passed'
  },
  {
    name: 'preparing',
    title: '商家备货中',
    time: '2024-01-15 10:35:00',
    icon: 'fire'
  },
  {
    name: 'shipping',
    title: '配送中',
    time: '2024-01-16 11:20:00',
    icon: 'logistics'
  },
  {
    name: 'completed',
    title: '已完成',
    time: '',
    icon: 'checked'
  }
])

// 返回上一页
const onClickLeft = () => {
  router.back()
}

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

// 获取状态描述
const getStatusDesc = (status) => {
  const descMap = {
    pending: '请尽快完成支付',
    paid: '商家正在为您备货',
    shipping: '配送员正在全力送达',
    completed: '订单已完成，期待再次光临',
    cancelled: '订单已取消'
  }
  return descMap[status] || ''
}

// 获取状态图标
const getStatusIcon = (status) => {
  const iconMap = {
    pending: 'clock-o',
    paid: 'passed',
    shipping: 'logistics',
    completed: 'checked',
    cancelled: 'cross'
  }
  return iconMap[status] || 'question-o'
}

// 获取当前进度步骤
const getActiveStep = (status) => {
  const stepMap = {
    pending: 0,
    paid: 1,
    preparing: 2,
    shipping: 3,
    completed: 4,
    cancelled: 0
  }
  return stepMap[status] || 0
}

// 取消订单
const cancelOrder = () => {
  Dialog.confirm({
    title: '提示',
    message: '确定要取消这个订单吗？',
  }).then(async () => {
    Toast.loading({
      message: '取消中...',
      forbidClick: true,
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    order.value.status = 'cancelled'
    Toast.success('订单已取消')
  }).catch(() => {
    // 用户取消
  })
}

// 支付订单
const payOrder = () => {
  Toast.loading({
    message: '跳转支付...',
    forbidClick: true,
    duration: 1500
  })
  
  setTimeout(() => {
    Toast.success('支付成功')
    order.value.status = 'shipping'
  }, 1500)
}

// 确认收货
const confirmOrder = () => {
  Dialog.confirm({
    title: '提示',
    message: '确认已收到订单吗？',
  }).then(async () => {
    Toast.loading({
      message: '处理中...',
      forbidClick: true,
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    order.value.status = 'completed'
    orderSteps.value[4].time = new Date().toLocaleString('zh-CN')
    Toast.success('确认成功')
  }).catch(() => {
    // 用户取消
  })
}

// 评价订单
const reviewOrder = () => {
  router.push(`/review/${order.value.id}`)
}

// 删除订单
const deleteOrder = () => {
  Dialog.confirm({
    title: '提示',
    message: '确定要删除这个订单吗？',
  }).then(() => {
    Toast.success('已删除')
    router.back()
  }).catch(() => {
    // 用户取消
  })
}

onMounted(async () => {
  const orderId = route.params.id
  // 这里可以根据 orderId 加载实际数据
  // const res = await orderApi.getOrderDetail(orderId)
  // order.value = res.data
})
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 70px;
}

.status-card,
.delivery-card,
.progress-card,
.items-card,
.order-info-card,
.price-card {
  background: white;
  margin: 10px;
  padding: 15px;
  border-radius: 8px;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-text {
  flex: 1;
}

.status-title {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 5px;
}

.status-desc {
  font-size: 14px;
  color: #969799;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.step-content {
  padding-bottom: 15px;
}

.step-title {
  font-size: 14px;
  color: #323233;
  margin-bottom: 4px;
}

.step-time {
  font-size: 12px;
  color: #969799;
}

.discount-value {
  color: #FF6B35;
}

.total-value {
  color: #FF6B35;
  font-size: 16px;
  font-weight: bold;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 16px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 10px;
}

.bottom-actions .van-button {
  flex: 1;
}

:deep(.van-step__circle-container) {
  margin-right: 10px;
}
</style>
