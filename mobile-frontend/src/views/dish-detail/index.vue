<template>
  <div class="dish-detail-page">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="dish.name"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    />

    <!-- 图片轮播 -->
    <van-swipe :autoplay="3000" indicator-color="#FF6B35">
      <van-swipe-item v-for="(image, index) in dish.images" :key="index">
        <van-image
          :src="image"
          fit="cover"
          width="100%"
          height="300px"
          @click="previewImages(index)"
        />
      </van-swipe-item>
    </van-swipe>

    <!-- 菜品信息 -->
    <div class="dish-info-card">
      <div class="dish-header">
        <div>
          <div class="dish-name">{{ dish.name }}</div>
          <div class="dish-desc">{{ dish.description }}</div>
        </div>
        <div class="dish-price">¥{{ dish.price }}</div>
      </div>

      <div class="dish-tags">
        <van-tag v-for="tag in dish.tags" :key="tag" plain type="danger" size="medium">
          {{ tag }}
        </van-tag>
      </div>

      <van-divider />

      <div class="dish-stats">
        <div class="stat-item">
          <van-icon name="star" color="#FF6B35" />
          <span>{{ dish.rating }} 分</span>
        </div>
        <div class="stat-item">
          <van-icon name="comment-o" />
          <span>{{ dish.reviewCount }} 评价</span>
        </div>
        <div class="stat-item">
          <van-icon name="bag-o" />
          <span>已售 {{ dish.soldCount }}</span>
        </div>
      </div>
    </div>

    <!-- 菜品详情 -->
    <div class="detail-section">
      <h3 class="section-title">菜品详情</h3>
      <div class="detail-content">
        <p>{{ dish.detail }}</p>
      </div>
      
      <van-cell-group inset>
        <van-cell title="主要食材" :value="dish.ingredients" />
        <van-cell title="菜品分类" :value="dish.category" />
        <van-cell title="口味特点" :value="dish.taste" />
        <van-cell title="保存方式" :value="dish.storage" />
      </van-cell-group>
    </div>

    <!-- 用户评价 -->
    <div class="review-section">
      <div class="section-header">
        <h3 class="section-title">用户评价 ({{ reviews.length }})</h3>
        <span class="view-all" @click="viewAllReviews">查看全部 ></span>
      </div>

      <div v-if="reviews.length > 0" class="review-list">
        <div v-for="review in reviews.slice(0, 3)" :key="review.id" class="review-item">
          <div class="review-header">
            <div class="user-info">
              <van-image
                round
                width="40"
                height="40"
                :src="review.userAvatar"
              />
              <div class="user-detail">
                <div class="user-name">{{ review.userName }}</div>
                <van-rate
                  v-model="review.rating"
                  :size="12"
                  color="#FF6B35"
                  void-icon="star"
                  void-color="#eee"
                  readonly
                />
              </div>
            </div>
            <div class="review-date">{{ review.date }}</div>
          </div>
          
          <div class="review-content">{{ review.content }}</div>
          
          <div v-if="review.images && review.images.length" class="review-images">
            <van-image
              v-for="(img, idx) in review.images"
              :key="idx"
              width="80"
              height="80"
              fit="cover"
              :src="img"
              @click="previewReviewImages(review.images, idx)"
            />
          </div>
        </div>
      </div>
      
      <van-empty v-else description="暂无评价" />
    </div>

    <!-- 底部购买栏 -->
    <van-submit-bar
      :price="totalPrice"
      button-text="加入购物车"
      button-color="#FF6B35"
      @submit="onSubmit"
    >
      <template #tip>
        <div class="quantity-control">
          <span>数量：</span>
          <van-stepper v-model="quantity" min="1" max="99" />
        </div>
      </template>
    </van-submit-bar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Toast, ImagePreview } from 'vant'
import { dishApi } from '@/api/mobile'
import { useCartStore } from '@/store'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const quantity = ref(1)
const dish = ref({
  id: 1,
  name: '宫保鸡丁',
  description: '经典川菜，香辣可口',
  price: 28.00,
  rating: 4.8,
  reviewCount: 128,
  soldCount: 568,
  images: [
    'https://images.unsplash.com/photo-1603073524394-61e3451b69a7?w=800',
    'https://images.unsplash.com/photo-1603073524394-61e3451b69a7?w=800',
  ],
  tags: ['热销', '川菜', '辣'],
  detail: '宫保鸡丁是一道经典的川菜，以鸡肉为主料，配以花生米、辣椒等辅料烹制而成。其口味香辣可口，鸡肉鲜嫩，花生米酥脆，是下饭的绝佳选择。',
  ingredients: '鸡肉、花生米、辣椒、葱姜蒜',
  category: '热菜 / 川菜',
  taste: '香辣可口',
  storage: '冷藏保存，建议2小时内食用'
})

const reviews = ref([
  {
    id: 1,
    userName: '美食爱好者',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    rating: 5,
    date: '2024-01-15',
    content: '非常好吃！鸡肉很嫩，辣度适中，强烈推荐！',
    images: [
      'https://images.unsplash.com/photo-1603073524394-61e3451b69a7?w=400',
    ]
  },
  {
    id: 2,
    userName: '吃货小王',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 4,
    date: '2024-01-14',
    content: '味道不错，份量也足，就是稍微有点油',
    images: []
  },
  {
    id: 3,
    userName: '美味人生',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    rating: 5,
    date: '2024-01-13',
    content: '超级好吃！已经是第三次点了，每次都很满意',
    images: []
  }
])

const totalPrice = computed(() => dish.value.price * quantity.value * 100)

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 预览菜品图片
const previewImages = (startPosition) => {
  ImagePreview({
    images: dish.value.images,
    startPosition
  })
}

// 预览评价图片
const previewReviewImages = (images, startPosition) => {
  ImagePreview({
    images,
    startPosition
  })
}

// 查看全部评价
const viewAllReviews = () => {
  Toast('查看全部评价功能开发中')
}

// 加入购物车
const onSubmit = () => {
  cartStore.addToCart(dish.value, quantity.value)
  Toast.success(`已加入 ${quantity.value} 份到购物车`)
  setTimeout(() => {
    router.push('/cart')
  }, 1000)
}

onMounted(async () => {
  const dishId = route.params.id
  // 这里可以根据 dishId 加载实际数据
  // const res = await dishApi.getDishDetail(dishId)
  // dish.value = res.data
})
</script>

<style scoped>
.dish-detail-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}

.dish-info-card,
.detail-section,
.review-section {
  background: white;
  margin: 10px;
  padding: 15px;
  border-radius: 8px;
}

.dish-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.dish-name {
  font-size: 20px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 5px;
}

.dish-desc {
  font-size: 14px;
  color: #969799;
}

.dish-price {
  font-size: 24px;
  color: #FF6B35;
  font-weight: bold;
}

.dish-tags {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.dish-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #646566;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.detail-content {
  font-size: 14px;
  color: #646566;
  line-height: 1.6;
  margin-bottom: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.view-all {
  font-size: 14px;
  color: #969799;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-item {
  padding-bottom: 15px;
  border-bottom: 1px solid #ebedf0;
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  gap: 10px;
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.review-date {
  font-size: 12px;
  color: #969799;
}

.review-content {
  font-size: 14px;
  color: #323233;
  line-height: 1.5;
  margin-bottom: 8px;
}

.review-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

:deep(.van-submit-bar__tip) {
  padding: 10px 16px;
  background: #fff;
}
</style>
