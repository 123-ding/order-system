<template>
  <div class="dishes-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="点菜"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    >
      <template #right>
        <van-icon name="shopping-cart-o" size="20" @click="goToCart" />
        <van-badge v-if="cartCount > 0" :content="cartCount" style="margin-left: -8px; margin-top: -8px;" />
      </template>
    </van-nav-bar>

    <!-- 搜索栏 -->
    <van-sticky :offset-top="46">
      <van-search
        v-model="searchValue"
        shape="round"
        placeholder="搜索菜品"
        @search="onSearch"
        @clear="onClear"
      />
    </van-sticky>

    <!-- 分类标签 -->
    <van-sticky :offset-top="100">
      <van-tabs
        v-model:active="activeCategory"
        color="#FF6B35"
        @change="onCategoryChange"
      >
        <van-tab title="全部" name="all" />
        <van-tab title="热菜" name="1" />
        <van-tab title="凉菜" name="2" />
        <van-tab title="汤类" name="3" />
        <van-tab title="主食" name="4" />
        <van-tab title="素菜" name="5" />
        <van-tab title="海鲜" name="6" />
      </van-tabs>
    </van-sticky>

    <!-- 菜品列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="dishes-grid">
          <div
            v-for="dish in dishes"
            :key="dish.id"
            class="dish-item"
            @click="goToDishDetail(dish.id)"
          >
            <van-image
              :src="dish.image"
              fit="cover"
              lazy-load
            >
              <template #loading>
                <van-loading type="spinner" size="20" />
              </template>
            </van-image>
            
            <div class="dish-content">
              <div class="dish-name">{{ dish.name }}</div>
              <div class="dish-desc">{{ dish.description }}</div>
              
              <div class="dish-footer">
                <span class="dish-price">¥{{ dish.price }}</span>
                <van-button
                  type="primary"
                  size="small"
                  color="#FF6B35"
                  icon="plus"
                  round
                  @click.stop="addToCart(dish)"
                />
              </div>
              
              <div v-if="dish.tags && dish.tags.length" class="dish-tags">
                <van-tag
                  v-for="tag in dish.tags"
                  :key="tag"
                  plain
                  type="danger"
                  size="mini"
                >
                  {{ tag }}
                </van-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <van-empty
          v-if="!loading && dishes.length === 0"
          description="暂无菜品"
        />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Toast } from 'vant'
import { dishApi } from '@/api/mobile'
import { useCartStore } from '@/store'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const searchValue = ref('')
const activeCategory = ref('all')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const dishes = ref([])
const page = ref(1)
const pageSize = 20

const cartCount = computed(() => cartStore.totalCount)

// 模拟数据
const mockDishes = [
  {
    id: 1,
    name: '宫保鸡丁',
    description: '经典川菜，香辣可口',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1603073524394-61e3451b69a7?w=400',
    tags: ['热销', '辣']
  },
  {
    id: 2,
    name: '麻婆豆腐',
    description: '麻辣鲜香，下饭神器',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    tags: ['推荐', '辣']
  },
  {
    id: 3,
    name: '红烧肉',
    description: '肥而不腻，入口即化',
    price: 38.00,
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
    tags: ['新品']
  },
  {
    id: 4,
    name: '糖醋里脊',
    description: '酸甜可口，外酥里嫩',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1587439139558-4e9f36ff9b28?w=400',
    tags: ['热销']
  },
  {
    id: 5,
    name: '鱼香肉丝',
    description: '鱼香味浓，肉丝鲜嫩',
    price: 26.00,
    image: 'https://images.unsplash.com/photo-1604908815453-3e3d44159c72?w=400',
    tags: ['推荐']
  },
  {
    id: 6,
    name: '西红柿炒鸡蛋',
    description: '家常小炒，营养丰富',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=400',
    tags: []
  },
  {
    id: 7,
    name: '青椒肉丝',
    description: '清爽开胃，色香味俱全',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?w=400',
    tags: []
  },
  {
    id: 8,
    name: '水煮鱼',
    description: '麻辣鲜香，鱼肉滑嫩',
    price: 58.00,
    image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400',
    tags: ['热销', '辣']
  }
]

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 跳转购物车
const goToCart = () => {
  router.push('/cart')
}

// 搜索
const onSearch = () => {
  if (!searchValue.value.trim()) {
    return
  }
  page.value = 1
  dishes.value = []
  finished.value = false
  loadDishes()
}

// 清空搜索
const onClear = () => {
  page.value = 1
  dishes.value = []
  finished.value = false
  loadDishes()
}

// 分类切换
const onCategoryChange = () => {
  page.value = 1
  dishes.value = []
  finished.value = false
  loadDishes()
}

// 下拉刷新
const onRefresh = async () => {
  page.value = 1
  finished.value = false
  dishes.value = []
  await loadDishes()
  refreshing.value = false
}

// 上拉加载
const onLoad = () => {
  loadDishes()
}

// 加载菜品
const loadDishes = async () => {
  try {
    loading.value = true
    
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟分页
    const start = (page.value - 1) * pageSize
    const end = start + pageSize
    const newDishes = mockDishes.slice(start, end)
    
    if (newDishes.length === 0) {
      finished.value = true
    } else {
      dishes.value.push(...newDishes)
      page.value++
    }
  } catch (error) {
    Toast.fail('加载失败')
  } finally {
    loading.value = false
  }
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

onMounted(() => {
  // 从首页跳转过来可能带有分类参数
  if (route.query.category) {
    activeCategory.value = route.query.category
  }
})
</script>

<style scoped>
.dishes-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}

.dishes-grid {
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.dish-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.dish-item :deep(.van-image) {
  width: 100%;
  height: 140px;
  background: #f7f8fa;
}

.dish-content {
  padding: 10px;
}

.dish-name {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-desc {
  font-size: 12px;
  color: #969799;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dish-price {
  font-size: 18px;
  color: #FF6B35;
  font-weight: bold;
}

.dish-tags {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

:deep(.van-nav-bar__right) {
  display: flex;
  align-items: center;
  position: relative;
}
</style>
