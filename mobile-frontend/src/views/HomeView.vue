<template>
  <div class="home-page">
    <!-- Header -->
    <div class="home-header">
      <div class="header-top">
        <div class="greeting">
          <span class="hi">你好，{{ user?.name || '用户' }} 👋</span>
          <span class="date">{{ todayStr }}</span>
        </div>
        <van-badge :content="3">
          <van-icon name="bell" size="22" color="#fff" />
        </van-badge>
      </div>

      <!-- Search bar -->
      <div class="search-wrap">
        <van-search
          v-model="searchQuery"
          placeholder="请输入订单号或货物编号查询"
          shape="round"
          background="transparent"
          @search="handleSearch"
        />
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stats-row">
      <div class="stat-card" @click="$router.push('/orders')">
        <div class="stat-num">{{ stats.total }}</div>
        <div class="stat-label">我的订单</div>
      </div>
      <div class="stat-card stat-card--blue" @click="$router.push('/orders?tab=in_transit')">
        <div class="stat-num">{{ stats.inTransit }}</div>
        <div class="stat-label">运输中</div>
      </div>
      <div class="stat-card stat-card--orange" @click="$router.push('/orders?tab=pending')">
        <div class="stat-num">{{ stats.pending }}</div>
        <div class="stat-label">待处理</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section">
      <div class="section-title">快捷操作</div>
      <div class="quick-actions">
        <div class="action-item" @click="$router.push('/create-order')">
          <div class="action-icon action-icon--blue">📦</div>
          <span>立即下单</span>
        </div>
        <div class="action-item" @click="showTracking = true">
          <div class="action-icon action-icon--cyan">🔍</div>
          <span>货物追踪</span>
        </div>
        <div class="action-item" @click="$router.push('/orders')">
          <div class="action-icon action-icon--green">📋</div>
          <span>历史订单</span>
        </div>
        <div class="action-item" @click="showContact = true">
          <div class="action-icon action-icon--orange">📞</div>
          <span>联系客服</span>
        </div>
      </div>
    </div>

    <!-- In-transit Orders -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">运输中货物</div>
        <span class="section-more" @click="$router.push('/orders')">查看全部 ›</span>
      </div>
      <div
        v-for="order in inTransitOrders"
        :key="order.id"
        class="transit-card"
        @click="$router.push(`/orders/${order.id}`)"
      >
        <div class="transit-head">
          <span class="transit-no">{{ order.orderNo }}</span>
          <van-tag type="primary" size="medium">运输中</van-tag>
        </div>
        <div class="transit-route">
          <span class="port origin">{{ order.origin }}</span>
          <div class="route-line">
            <span class="ship-emoji">🚢</span>
            <div class="dashed-line"></div>
          </div>
          <span class="port dest">{{ order.destination }}</span>
        </div>
        <div class="transit-progress">
          <van-progress
            :percentage="order.progress"
            stroke-width="6"
            color="linear-gradient(90deg, #0066cc, #0099ff)"
            track-color="#e8f4ff"
          />
          <span class="progress-label">{{ order.progressLabel }}</span>
        </div>
        <div class="transit-footer">
          <span>预计到港：{{ order.eta }}</span>
          <span>船名：{{ order.vessel }}</span>
        </div>
      </div>
    </div>

    <!-- Notices -->
    <div class="section">
      <div class="section-title">航运公告</div>
      <van-notice-bar
        v-for="notice in notices"
        :key="notice.id"
        :text="notice.text"
        :left-icon="notice.icon"
        :color="notice.color"
        :background="notice.bg"
        wrapable
        :scrollable="false"
        class="notice-item"
      />
    </div>

    <!-- Tracking Dialog -->
    <van-dialog
      v-model:show="showTracking"
      title="货物追踪"
      show-cancel-button
      confirm-button-text="查询"
      @confirm="doTrack"
    >
      <div class="tracking-body">
        <van-field
          v-model="trackingNo"
          placeholder="请输入订单号或货物编号"
          clearable
          autofocus
        />
      </div>
    </van-dialog>

    <!-- Contact Dialog -->
    <van-action-sheet
      v-model:show="showContact"
      title="联系客服"
    >
      <div class="contact-sheet">
        <div class="contact-item">
          <van-icon name="phone-circle" size="28" color="#0066cc" />
          <div class="contact-info">
            <div class="contact-label">客服热线（24小时）</div>
            <div class="contact-value">400-888-0066</div>
          </div>
          <van-button size="small" type="primary" @click="callService">拨打</van-button>
        </div>
        <div class="contact-item">
          <van-icon name="chat-o" size="28" color="#0066cc" />
          <div class="contact-info">
            <div class="contact-label">在线客服</div>
            <div class="contact-value">工作日 9:00-18:00</div>
          </div>
          <van-button size="small" plain type="primary">咨询</van-button>
        </div>
        <div class="contact-item">
          <van-icon name="envelop-o" size="28" color="#0066cc" />
          <div class="contact-info">
            <div class="contact-label">商务邮箱</div>
            <div class="contact-value">service@maritime.com</div>
          </div>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const searchQuery = ref('')
const showTracking = ref(false)
const showContact = ref(false)
const trackingNo = ref('')

const todayStr = computed(() => dayjs().format('YYYY年MM月DD日'))

const stats = ref({ total: 24, inTransit: 8, pending: 3 })

const inTransitOrders = ref([
  {
    id: 'ORD20240601',
    orderNo: 'ORD-2024-0601',
    origin: '上海港',
    destination: '新加坡港',
    progress: 65,
    progressLabel: '公海运输中',
    eta: '2024-06-18',
    vessel: '东方之星'
  },
  {
    id: 'ORD20240589',
    orderNo: 'ORD-2024-0589',
    origin: '广州港',
    destination: '鹿特丹港',
    progress: 30,
    progressLabel: '南海航段',
    eta: '2024-07-05',
    vessel: '海上丝路号'
  },
  {
    id: 'ORD20240555',
    orderNo: 'ORD-2024-0555',
    origin: '青岛港',
    destination: '洛杉矶港',
    progress: 80,
    progressLabel: '即将到港',
    eta: '2024-06-12',
    vessel: '太平洋使者'
  }
])

const notices = ref([
  {
    id: 1,
    text: '【重要】南海台风警报：受台风"玛利亚"影响，广州至东南亚航线可能延误3-5天，请相关客户注意。',
    icon: 'warning-o',
    color: '#ed6a0c',
    bg: '#fffbe8'
  },
  {
    id: 2,
    text: '【通知】上海港6月15日起启用新集装箱码头，装卸效率提升30%，欢迎客户选择上海港中转。',
    icon: 'bullhorn-o',
    color: '#0066cc',
    bg: '#f0f7ff'
  },
  {
    id: 3,
    text: '【优惠】本月新客户首单享9折优惠，活动截止至6月30日，欢迎咨询客服了解详情。',
    icon: 'gift-o',
    color: '#07c160',
    bg: '#f0fff4'
  }
])

function handleSearch() {
  if (!searchQuery.value.trim()) return
  showToast('正在查询：' + searchQuery.value)
}

function doTrack() {
  if (!trackingNo.value.trim()) {
    showToast('请输入单号')
    return
  }
  router.push('/orders/' + trackingNo.value.trim())
}

function callService() {
  window.location.href = 'tel:4008880066'
}
</script>

<style scoped>
.home-page {
  background: #f5f7fa;
  min-height: 100%;
  padding-bottom: 20px;
}

.home-header {
  background: linear-gradient(135deg, #003d7a 0%, #0066cc 60%, #0099ff 100%);
  padding: 48px 16px 20px;
  border-radius: 0 0 24px 24px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  color: #fff;
}

.greeting .hi {
  font-size: 18px;
  font-weight: 600;
  display: block;
}

.greeting .date {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 2px;
  display: block;
}

.search-wrap :deep(.van-search) {
  padding: 0;
}

.search-wrap :deep(.van-search__content) {
  background: rgba(255,255,255,0.95);
}

/* Stats */
.stats-row {
  display: flex;
  gap: 10px;
  padding: 16px 16px 0;
  margin-top: -12px;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 14px 10px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  cursor: pointer;
}

.stat-card--blue { background: linear-gradient(135deg, #0066cc, #0099ff); color: #fff; }
.stat-card--orange { background: linear-gradient(135deg, #ff6b35, #ff9f4a); color: #fff; }

.stat-num {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.8;
}

.stat-card:not(.stat-card--blue):not(.stat-card--orange) .stat-num { color: #0066cc; }
.stat-card:not(.stat-card--blue):not(.stat-card--orange) .stat-label { color: #666; }

/* Section */
.section {
  margin: 16px 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.section-more {
  font-size: 13px;
  color: #0066cc;
  cursor: pointer;
}

/* Quick actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #fff;
  border-radius: 16px;
  padding: 16px 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 0;
}

.action-item span {
  font-size: 12px;
  color: #333;
  text-align: center;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.action-icon--blue { background: #e8f4ff; }
.action-icon--cyan { background: #e0f9f9; }
.action-icon--green { background: #e8fff0; }
.action-icon--orange { background: #fff3e8; }

/* Transit cards */
.transit-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.1s;
}

.transit-card:active { transform: scale(0.98); }

.transit-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.transit-no {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.transit-route {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.port {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
}

.route-line {
  flex: 1;
  display: flex;
  align-items: center;
  margin: 0 8px;
  position: relative;
}

.ship-emoji {
  font-size: 18px;
  position: relative;
  z-index: 1;
  margin-right: 4px;
}

.dashed-line {
  flex: 1;
  border-bottom: 2px dashed #b3d4f5;
}

.transit-progress {
  margin-bottom: 8px;
}

.progress-label {
  font-size: 11px;
  color: #0066cc;
  margin-top: 4px;
  display: block;
}

.transit-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-top: 8px;
}

/* Notices */
.notice-item {
  border-radius: 10px;
  margin-bottom: 8px;
  overflow: hidden;
}

/* Dialogs */
.tracking-body {
  padding: 16px;
}

.contact-sheet {
  padding: 8px 16px 24px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.contact-item:last-child { border-bottom: none; }

.contact-info {
  flex: 1;
}

.contact-label {
  font-size: 13px;
  color: #666;
}

.contact-value {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-top: 2px;
}
</style>
