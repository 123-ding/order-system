<template>
  <div class="home-page">
    <!-- 搜索栏 -->
    <van-sticky>
      <van-search
        v-model="searchValue"
        shape="round"
        background="#FF6B35"
        placeholder="搜索菜品"
        @click="goToSearch"
      />
    </van-sticky>

    <!-- 下拉刷新 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <!-- 轮播图 -->
      <van-swipe class="banner-swipe" :autoplay="3000" indicator-color="#FF6B35">
        <van-swipe-item v-for="(banner, index) in banners" :key="index">
          <van-image
            :src="banner.image"
            fit="cover"
            width="100%"
            height="180px"
          />
        </van-swipe-item>
      </van-swipe>

      <!-- 公告 -->
      <van-notice-bar
        left-icon="volume-o"
        color="#FF6B35"
        background="#FFF5F0"
        text="欢迎使用点菜系统！每日新鲜食材，健康美味送到家~"
      />

      <!-- 分类导航 -->
      <div class="category-section">
        <h3 class="section-title">菜品分类</h3>
        <van-grid :column-num="4" :border="false">
          <van-grid-item
            v-for="category in categories"
            :key="category.id"
            :icon="category.icon"
            :text="category.name"
            @click="goToCategory(category.id)"
          />
        </van-grid>
      </div>

      <!-- 今日推荐 -->
      <div class="recommend-section">
        <h3 class="section-title">
          <van-icon name="fire" color="#FF6B35" />
          今日推荐
        </h3>
        <div class="dish-list">
          <van-card
            v-for="dish in recommendedDishes"
            :key="dish.id"
            :price="dish.price.toFixed(2)"
            :desc="dish.description"
            :title="dish.name"
            :thumb="dish.image"
            @click="goToDishDetail(dish.id)"
          >
            <template #tags>
              <van-tag v-if="dish.isNew" plain type="danger">新品</van-tag>
              <van-tag v-if="dish.isHot" plain type="warning">热销</van-tag>
            </template>
            <template #footer>
              <van-button
                size="small"
                type="primary"
                color="#FF6B35"
                @click.stop="addToCart(dish)"
              >
                加入购物车
              </van-button>
            </template>
          </van-card>
        </div>
      </div>

      <!-- 热销菜品 -->
      <div class="hot-section">
        <h3 class="section-title">
          <van-icon name="hot" color="#FF6B35" />
          热销菜品
        </h3>
        <van-grid :column-num="2" :border="false">
          <van-grid-item
            v-for="dish in hotDishes"
            :key="dish.id"
            @click="goToDishDetail(dish.id)"
          >
            <van-image :src="dish.image" fit="cover" />
            <div class="dish-info">
              <div class="dish-name">{{ dish.name }}</div>
              <div class="dish-price">¥{{ dish.price }}</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>
    </van-pull-refresh>

    <!-- 购物车按钮 -->
    <div class="cart-button" @click="goToCart">
      <van-icon name="shopping-cart" size="24" />
      <van-badge v-if="cartCount > 0" :content="cartCount" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import { dishApi, bannerApi } from '@/api/mobile'
import { useCartStore } from '@/store'

const router = useRouter()
const cartStore = useCartStore()

const searchValue = ref('')
const refreshing = ref(false)
const banners = ref([
  { image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800' },
  { image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' },
  { image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800' }
])

const categories = ref([
  { id: 1, name: '热菜', icon: 'fire' },
  { id: 2, name: '凉菜', icon: 'coupon' },
  { id: 3, name: '汤类', icon: 'cup' },
  { id: 4, name: '主食', icon: 'cake' },
  { id: 5, name: '素菜', icon: 'flower-o' },
  { id: 6, name: '海鲜', icon: 'gift' },
  { id: 7, name: '甜品', icon: 'smile' },
  { id: 8, name: '饮品', icon: 'coffee' }
])

const recommendedDishes = ref([
  {
    id: 1,
    name: '宫保鸡丁',
    description: '经典川菜，香辣可口',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1603073524394-61e3451b69a7?w=400',
    isNew: true,
    isHot: true
  },
  {
    id: 2,
    name: '麻婆豆腐',
    description: '麻辣鲜香，下饭神器',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    isHot: true
  },
  {
    id: 3,
    name: '红烧肉',
    description: '肥而不腻，入口即化',
    price: 38.00,
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
    isNew: true
  }
])

const hotDishes = ref([
  {
    id: 4,
    name: '糖醋里脊',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1587439139558-4e9f36ff9b28?w=400'
  },
  {
    id: 5,
    name: '鱼香肉丝',
    price: 26.00,
    image: 'https://images.unsplash.com/photo-1604908815453-3e3d44159c72?w=400'
  },
  {
    id: 6,
    name: '西红柿炒鸡蛋',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=400'
  },
  {
    id: 7,
    name: '青椒肉丝',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?w=400'
  }
])

const cartCount = computed(() => cartStore.totalCount)

// 下拉刷新
const onRefresh = async () => {
  try {
    // 这里可以调用实际的 API
    await new Promise(resolve => setTimeout(resolve, 1000))
    Toast.success('刷新成功')
  } catch (error) {
    Toast.fail('刷新失败')
  } finally {
    refreshing.value = false
  }
}

// 跳转到搜索页面
const goToSearch = () => {
  router.push('/dishes')
}

// 跳转到分类
const goToCategory = (categoryId) => {
  router.push({
    path: '/dishes',
    query: { category: categoryId }
  })
}

// 跳转到菜品详情
const goToDishDetail = (dishId) => {
  router.push(`/dish-detail/${dishId}`)
}

// 添加到购物车
const addToCart = (dish) => {
  cartStore.addToCart(dish)
  Toast.success('已加入购物车')
}

// 跳转到购物车
const goToCart = () => {
  router.push('/cart')
}

onMounted(() => {
  // 可以在这里加载实际数据
})
</script>

<style scoped>
.home-page {
  padding-bottom: 60px;
}

.banner-swipe {
  margin-bottom: 10px;
}

.category-section,
.recommend-section,
.hot-section {
  background: white;
  margin: 10px 0;
  padding: 15px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 15px 0;
  color: #323233;
  display: flex;
  align-items: center;
  gap: 5px;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dish-info {
  margin-top: 8px;
  text-align: center;
}

.dish-name {
  font-size: 14px;
  color: #323233;
  margin-bottom: 4px;
}

.dish-price {
  font-size: 16px;
  color: #FF6B35;
  font-weight: bold;
}

.cart-button {
  position: fixed;
  right: 20px;
  bottom: 70px;
  width: 50px;
  height: 50px;
  background: #FF6B35;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 12px rgba(255, 107, 53, 0.4);
  z-index: 999;
}

:deep(.van-card__footer) {
  margin-top: 8px;
}

:deep(.van-grid-item__content) {
  padding: 10px 8px;
}
</style>
