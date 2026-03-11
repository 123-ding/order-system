<template>
  <div class="order-detail-page">
    <van-nav-bar
      :title="order.orderNo"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    >
      <template #right>
        <van-icon name="share-o" size="18" @click="handleShare" />
      </template>
    </van-nav-bar>

    <!-- Status Banner -->
    <div class="status-banner" :class="'status-banner--' + order.status">
      <div class="status-icon">{{ statusConfig[order.status]?.icon }}</div>
      <div class="status-text">{{ statusConfig[order.status]?.label }}</div>
      <div class="status-sub">{{ statusConfig[order.status]?.sub }}</div>
    </div>

    <!-- Timeline -->
    <div class="detail-card">
      <div class="card-title">运输进度</div>
      <van-steps
        :active="order.stepActive"
        active-color="#0066cc"
        direction="vertical"
        class="timeline"
      >
        <van-step v-for="step in order.steps" :key="step.name">
          <div class="step-name">{{ step.name }}</div>
          <div class="step-time" v-if="step.time">{{ step.time }}</div>
          <div class="step-desc" v-if="step.desc">{{ step.desc }}</div>
        </van-step>
      </van-steps>
    </div>

    <!-- Order Info -->
    <div class="detail-card">
      <div class="card-title">订单信息</div>
      <van-cell-group :border="false">
        <van-cell title="订单编号" :value="order.orderNo" />
        <van-cell title="起始港" :value="order.origin" />
        <van-cell title="目的港" :value="order.destination" />
        <van-cell title="预计出发" :value="order.departureDate" />
        <van-cell title="预计到达" :value="order.arrivalDate" />
        <van-cell title="承运船舶" :value="order.vessel" />
        <van-cell title="运费" class="freight-cell">
          <template #value>
            <span class="freight-amount">¥{{ order.freight.toLocaleString() }}</span>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- Cargo Info -->
    <div class="detail-card">
      <div class="card-title">货物信息</div>
      <van-cell-group :border="false">
        <van-cell title="货物描述" :value="order.cargoDesc" />
        <van-cell title="货物类型" :value="order.cargoType" />
        <van-cell title="重量" :value="order.weight + ' 吨'" />
        <van-cell title="体积" :value="order.volume + ' m³'" />
        <van-cell title="包装方式" :value="order.packaging" />
        <van-cell title="危险品" :value="order.isHazmat ? '是' : '否'" />
      </van-cell-group>
    </div>

    <!-- Contact Info -->
    <div class="detail-card">
      <div class="card-title">联系信息</div>
      <van-cell-group :border="false">
        <van-cell title="联系人" :value="order.contact" />
        <van-cell title="联系电话" :value="order.phone" is-link :url="'tel:' + order.phone" />
        <van-cell title="公司名称" :value="order.company" />
      </van-cell-group>
    </div>

    <!-- Action Buttons -->
    <div class="action-bar">
      <van-button
        plain
        type="primary"
        icon="phone-o"
        @click="callService"
      >
        联系客服
      </van-button>
      <van-button
        v-if="order.status === 'pending'"
        type="danger"
        plain
        icon="cross"
        @click="cancelOrder"
      >
        取消订单
      </van-button>
      <van-button
        v-if="order.status === 'completed'"
        type="success"
        icon="star-o"
        @click="showRating = true"
      >
        评价
      </van-button>
    </div>

    <van-dialog
      v-model:show="showCancelConfirm"
      title="确认取消"
      message="确定要取消此订单吗？取消后无法恢复。"
      show-cancel-button
      confirm-button-color="#ee0a24"
      @confirm="doCancel"
    />

    <van-dialog
      v-model:show="showRating"
      title="服务评价"
      show-cancel-button
      @confirm="doRate"
    >
      <div class="rating-body">
        <van-rate v-model="rating" :size="28" color="#ffd21e" void-icon="star" void-color="#eee" />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const route = useRoute()
const router = useRouter()

const showCancelConfirm = ref(false)
const showRating = ref(false)
const rating = ref(5)

const statusConfig = {
  pending: { label: '待确认', icon: '⏳', sub: '等待平台确认订单', color: '#ff9800' },
  confirmed: { label: '已确认', icon: '✅', sub: '订单已确认，等待装货', color: '#0066cc' },
  loading_cargo: { label: '装货中', icon: '🏗️', sub: '货物正在装载中', color: '#0066cc' },
  in_transit: { label: '运输中', icon: '🚢', sub: '货船正在海上航行', color: '#0066cc' },
  arrived: { label: '已到港', icon: '⚓', sub: '货船已抵达目的港', color: '#07c160' },
  completed: { label: '已完成', icon: '🎉', sub: '订单已完成，感谢您的信任', color: '#07c160' }
}

const mockOrders = {
  'ORD20240601': {
    id: 'ORD20240601',
    orderNo: 'ORD-2024-0601',
    status: 'in_transit',
    origin: '上海港',
    destination: '新加坡港',
    departureDate: '2024-06-03',
    arrivalDate: '2024-06-18',
    vessel: '东方之星',
    freight: 58000,
    cargoDesc: '电子产品及配件',
    cargoType: '集装箱',
    weight: 120,
    volume: 240,
    packaging: '标准集装箱20英尺',
    isHazmat: false,
    contact: '李明',
    phone: '13900139001',
    company: '远洋货运有限公司',
    stepActive: 3,
    steps: [
      { name: '已下单', time: '2024-06-01 09:32', desc: '客户提交订单' },
      { name: '已确认', time: '2024-06-01 14:05', desc: '平台确认并安排船期' },
      { name: '装货中', time: '2024-06-03 08:00', desc: '上海港码头装货' },
      { name: '运输中', time: '2024-06-03 18:45', desc: '东方之星已离港，预计6月18日到达' },
      { name: '已到港', time: '', desc: '' },
      { name: '完成', time: '', desc: '' }
    ]
  },
  'ORD20240589': {
    id: 'ORD20240589',
    orderNo: 'ORD-2024-0589',
    status: 'in_transit',
    origin: '广州港',
    destination: '鹿特丹港',
    departureDate: '2024-05-30',
    arrivalDate: '2024-07-05',
    vessel: '海上丝路号',
    freight: 320000,
    cargoDesc: '农产品大宗散货',
    cargoType: '散货',
    weight: 2500,
    volume: 3000,
    packaging: '散装',
    isHazmat: false,
    contact: '王芳',
    phone: '13812341234',
    company: '南海物流集团',
    stepActive: 3,
    steps: [
      { name: '已下单', time: '2024-05-28 10:00', desc: '' },
      { name: '已确认', time: '2024-05-28 16:30', desc: '' },
      { name: '装货中', time: '2024-05-30 06:00', desc: '广州黄埔港装货' },
      { name: '运输中', time: '2024-05-30 20:00', desc: '已进入印度洋航段' },
      { name: '已到港', time: '', desc: '' },
      { name: '完成', time: '', desc: '' }
    ]
  }
}

const defaultOrder = {
  id: route.params.id,
  orderNo: route.params.id,
  status: 'in_transit',
  origin: '上海港',
  destination: '目的港',
  departureDate: '2024-06-01',
  arrivalDate: '2024-06-20',
  vessel: '东方之星',
  freight: 50000,
  cargoDesc: '普通货物',
  cargoType: '集装箱',
  weight: 100,
  volume: 200,
  packaging: '标准集装箱',
  isHazmat: false,
  contact: '联系人',
  phone: '13800138000',
  company: '货运公司',
  stepActive: 3,
  steps: [
    { name: '已下单', time: '2024-06-01', desc: '' },
    { name: '已确认', time: '2024-06-01', desc: '' },
    { name: '装货中', time: '2024-06-02', desc: '' },
    { name: '运输中', time: '2024-06-03', desc: '正在运输中' },
    { name: '已到港', time: '', desc: '' },
    { name: '完成', time: '', desc: '' }
  ]
}

const order = computed(() => mockOrders[route.params.id] || defaultOrder)

function cancelOrder() {
  showCancelConfirm.value = true
}

function doCancel() {
  showSuccessToast('订单已取消')
  setTimeout(() => router.back(), 1000)
}

function doRate() {
  showSuccessToast('感谢您的评价！')
}

function callService() {
  window.location.href = 'tel:4008880066'
}

function handleShare() {
  showToast('分享功能开发中')
}
</script>

<style scoped>
.order-detail-page {
  min-height: 100%;
  background: #f5f7fa;
  padding-bottom: 100px;
}

.status-banner {
  margin: 12px;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, #0066cc, #0099ff);
  color: #fff;
}

.status-banner--pending { background: linear-gradient(135deg, #ff9800, #ffb74d); }
.status-banner--confirmed { background: linear-gradient(135deg, #0066cc, #0099ff); }
.status-banner--loading_cargo { background: linear-gradient(135deg, #0066cc, #0099ff); }
.status-banner--in_transit { background: linear-gradient(135deg, #003d7a, #0066cc); }
.status-banner--arrived { background: linear-gradient(135deg, #07c160, #39d881); }
.status-banner--completed { background: linear-gradient(135deg, #07c160, #39d881); }

.status-icon { font-size: 40px; margin-bottom: 8px; }
.status-text { font-size: 20px; font-weight: 700; }
.status-sub { font-size: 13px; opacity: 0.9; margin-top: 4px; }

.detail-card {
  background: #fff;
  border-radius: 14px;
  margin: 10px 12px 0;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  padding: 14px 16px 8px;
  border-bottom: 1px solid #f5f5f5;
}

.timeline {
  padding: 12px 0;
}

.step-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.step-time {
  font-size: 12px;
  color: #0066cc;
  margin-top: 2px;
}

.step-desc {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.freight-amount {
  color: #e04040;
  font-size: 16px;
  font-weight: 700;
}

:deep(.van-cell__value) {
  color: #333;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  display: flex;
  gap: 10px;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
}

.action-bar .van-button {
  flex: 1;
  min-height: 44px;
}

.rating-body {
  padding: 20px;
  text-align: center;
}
</style>
