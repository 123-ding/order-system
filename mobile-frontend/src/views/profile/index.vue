<template>
  <div class="profile-page">
    <!-- 用户信息头部 -->
    <div class="user-header">
      <div class="user-info">
        <van-image
          round
          width="60"
          height="60"
          :src="userAvatar"
          @click="showAvatarPicker = true"
        />
        <div class="user-detail">
          <div class="user-name">{{ userName }}</div>
          <div class="user-phone">{{ userPhone }}</div>
        </div>
      </div>
      <van-icon name="setting-o" size="24" @click="goToSettings" />
    </div>

    <!-- 我的订单 -->
    <div class="order-section">
      <van-cell
        title="我的订单"
        is-link
        @click="goToOrders()"
      >
        <template #icon>
          <van-icon name="orders-o" color="#FF6B35" />
        </template>
        <template #right-icon>
          <span class="view-all">查看全部 ></span>
        </template>
      </van-cell>
      
      <van-grid :column-num="4" :border="false">
        <van-grid-item
          icon="clock-o"
          text="待支付"
          :badge="orderStats.pending"
          @click="goToOrders('pending')"
        />
        <van-grid-item
          icon="logistics"
          text="配送中"
          :badge="orderStats.shipping"
          @click="goToOrders('shipping')"
        />
        <van-grid-item
          icon="checked"
          text="已完成"
          @click="goToOrders('completed')"
        />
        <van-grid-item
          icon="comment-o"
          text="待评价"
          :badge="orderStats.toReview"
          @click="goToOrders('toReview')"
        />
      </van-grid>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <van-cell-group inset>
        <van-cell
          title="收货地址"
          is-link
          icon="location-o"
          @click="goToAddresses"
        />
        <van-cell
          title="优惠券"
          is-link
          icon="coupon-o"
          :label="`${couponCount} 张可用`"
          @click="goToCoupons"
        />
        <van-cell
          title="我的收藏"
          is-link
          icon="star-o"
          @click="goToFavorites"
        />
        <van-cell
          title="我的评价"
          is-link
          icon="comment-o"
          @click="goToReviews"
        />
      </van-cell-group>
    </div>

    <!-- 服务菜单 -->
    <div class="menu-section">
      <van-cell-group inset>
        <van-cell
          title="在线客服"
          is-link
          icon="service-o"
          @click="contactService"
        />
        <van-cell
          title="关于我们"
          is-link
          icon="info-o"
          @click="goToAbout"
        />
        <van-cell
          title="意见反馈"
          is-link
          icon="edit"
          @click="goToFeedback"
        />
      </van-cell-group>
    </div>

    <!-- 退出登录 -->
    <div class="logout-section">
      <van-button
        type="default"
        size="large"
        block
        @click="logout"
      >
        退出登录
      </van-button>
    </div>

    <!-- 头像选择弹窗 -->
    <van-action-sheet
      v-model:show="showAvatarPicker"
      :actions="avatarActions"
      cancel-text="取消"
      @select="onSelectAvatarAction"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Toast, Dialog } from 'vant'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()

const showAvatarPicker = ref(false)
const userAvatar = ref('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200')
const userName = ref('美食爱好者')
const userPhone = ref('138****5678')
const couponCount = ref(3)

const orderStats = ref({
  pending: 1,
  shipping: 2,
  completed: 15,
  toReview: 3
})

const avatarActions = ref([
  { name: '拍照', value: 'camera' },
  { name: '从相册选择', value: 'album' }
])

// 跳转到设置
const goToSettings = () => {
  Toast('设置功能开发中')
}

// 跳转到订单页面
const goToOrders = (status = 'all') => {
  router.push({
    path: '/orders',
    query: { status }
  })
}

// 跳转到收货地址
const goToAddresses = () => {
  Toast('收货地址管理功能开发中')
}

// 跳转到优惠券
const goToCoupons = () => {
  Toast('优惠券功能开发中')
}

// 跳转到收藏
const goToFavorites = () => {
  Toast('我的收藏功能开发中')
}

// 跳转到我的评价
const goToReviews = () => {
  Toast('我的评价功能开发中')
}

// 联系客服
const contactService = () => {
  Dialog.alert({
    title: '在线客服',
    message: '客服电话：400-888-8888\n服务时间：9:00-21:00',
    confirmButtonText: '知道了',
    confirmButtonColor: '#FF6B35'
  })
}

// 关于我们
const goToAbout = () => {
  Dialog.alert({
    title: '关于我们',
    message: '点菜系统 v1.0.0\n\n致力于为您提供优质的订餐服务',
    confirmButtonText: '知道了',
    confirmButtonColor: '#FF6B35'
  })
}

// 意见反馈
const goToFeedback = () => {
  Toast('意见反馈功能开发中')
}

// 选择头像操作
const onSelectAvatarAction = (action) => {
  showAvatarPicker.value = false
  
  if (action.value === 'camera') {
    Toast('调用相机功能')
  } else if (action.value === 'album') {
    Toast('选择相册功能')
  }
}

// 退出登录
const logout = () => {
  Dialog.confirm({
    title: '提示',
    message: '确定要退出登录吗？',
  }).then(() => {
    userStore.logout()
    Toast.success('已退出登录')
    // 在实际应用中，这里应该跳转到登录页
    router.push('/')
  }).catch(() => {
    // 用户取消
  })
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}

.user-header {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%);
  padding: 30px 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: white;
}

.user-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
}

.user-phone {
  font-size: 14px;
  opacity: 0.8;
}

.order-section {
  background: white;
  margin: -20px 10px 10px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.order-section .van-cell {
  padding: 15px;
}

.view-all {
  font-size: 14px;
  color: #969799;
  margin-right: -8px;
}

.menu-section {
  margin: 10px 0;
}

.logout-section {
  margin: 20px 10px;
}

:deep(.van-cell__left-icon) {
  margin-right: 10px;
}

:deep(.van-grid-item__content) {
  padding: 16px 8px;
}

:deep(.van-grid-item__icon) {
  font-size: 24px;
  color: #FF6B35;
}

:deep(.van-grid-item__text) {
  margin-top: 8px;
  font-size: 13px;
}

:deep(.van-badge) {
  top: 8px;
  right: 8px;
}
</style>
