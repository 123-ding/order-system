<template>
  <div class="cart-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="购物车"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    />

    <div v-if="cartItems.length > 0" class="cart-content">
      <!-- 送达日期 -->
      <div class="delivery-date-card" @click="goToCalendar">
        <van-cell
          title="送达日期"
          is-link
          :value="deliveryDateText"
          icon="calendar-o"
        />
      </div>

      <!-- 购物车列表 -->
      <div class="cart-list">
        <van-checkbox-group v-model="checkedItems">
          <van-swipe-cell
            v-for="item in cartItems"
            :key="item.id"
          >
            <van-card
              :price="item.price.toFixed(2)"
              :title="item.name"
              :thumb="item.image"
            >
              <template #num>
                <van-stepper
                  v-model="item.quantity"
                  :min="1"
                  :max="99"
                  @change="updateQuantity(item)"
                />
              </template>
              <template #footer>
                <van-checkbox :name="item.id" />
              </template>
            </van-card>
            
            <template #right>
              <van-button
                square
                text="删除"
                type="danger"
                class="delete-button"
                @click="removeItem(item.id)"
              />
            </template>
          </van-swipe-cell>
        </van-checkbox-group>
      </div>

      <!-- 优惠券 -->
      <div class="coupon-card" @click="showCouponPicker = true">
        <van-cell
          title="优惠券"
          is-link
          :value="selectedCoupon ? selectedCoupon.name : '暂无可用优惠券'"
          icon="coupon-o"
        />
      </div>

      <!-- 备注 -->
      <div class="remark-card">
        <van-field
          v-model="remark"
          rows="2"
          autosize
          type="textarea"
          maxlength="100"
          placeholder="备注信息（选填，如口味要求等）"
          show-word-limit
        />
      </div>

      <!-- 价格明细 -->
      <div class="price-detail">
        <van-cell-group inset>
          <van-cell title="商品总额" :value="`¥${subtotal.toFixed(2)}`" />
          <van-cell title="配送费" :value="`¥${deliveryFee.toFixed(2)}`" />
          <van-cell
            v-if="discount > 0"
            title="优惠"
            :value="`-¥${discount.toFixed(2)}`"
            value-class="discount-value"
          />
        </van-cell-group>
      </div>
    </div>

    <!-- 空购物车 -->
    <van-empty
      v-else
      description="购物车空空如也"
      image="cart-o"
    >
      <van-button
        type="primary"
        color="#FF6B35"
        round
        @click="goToShop"
      >
        去逛逛
      </van-button>
    </van-empty>

    <!-- 底部提交栏 -->
    <van-submit-bar
      v-if="cartItems.length > 0"
      :price="totalPrice * 100"
      button-text="结算"
      button-color="#FF6B35"
      :disabled="checkedItems.length === 0"
      @submit="onSubmit"
    >
      <template #default>
        <van-checkbox v-model="checkAll" @change="onCheckAllChange">
          全选
        </van-checkbox>
      </template>
    </van-submit-bar>

    <!-- 优惠券选择器 -->
    <van-popup
      v-model:show="showCouponPicker"
      position="bottom"
      round
    >
      <div class="coupon-picker">
        <div class="picker-header">
          <span class="picker-title">选择优惠券</span>
          <van-icon name="cross" @click="showCouponPicker = false" />
        </div>
        
        <div class="coupon-list">
          <div
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            class="coupon-item"
            :class="{ selected: selectedCoupon?.id === coupon.id }"
            @click="selectCoupon(coupon)"
          >
            <div class="coupon-left">
              <div class="coupon-amount">¥{{ coupon.amount }}</div>
              <div class="coupon-condition">满{{ coupon.minAmount }}可用</div>
            </div>
            <div class="coupon-right">
              <div class="coupon-name">{{ coupon.name }}</div>
              <div class="coupon-expire">有效期至 {{ coupon.expireDate }}</div>
            </div>
          </div>
          
          <van-empty v-if="availableCoupons.length === 0" description="暂无可用优惠券" />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Toast, Dialog } from 'vant'
import { useCartStore } from '@/store'

const router = useRouter()
const cartStore = useCartStore()

const checkedItems = ref([])
const checkAll = ref(false)
const remark = ref('')
const showCouponPicker = ref(false)
const selectedCoupon = ref(null)

const deliveryFee = ref(5.00)

// 可用优惠券
const availableCoupons = ref([
  {
    id: 1,
    name: '新人专享券',
    amount: 10,
    minAmount: 50,
    expireDate: '2024-12-31'
  },
  {
    id: 2,
    name: '满减优惠券',
    amount: 20,
    minAmount: 100,
    expireDate: '2024-12-31'
  }
])

const cartItems = computed(() => cartStore.items)

const deliveryDateText = computed(() => {
  return cartStore.deliveryDate || '请选择送达日期'
})

// 商品小计
const subtotal = computed(() => {
  return checkedItems.value.reduce((total, itemId) => {
    const item = cartItems.value.find(i => i.id === itemId)
    return item ? total + item.price * item.quantity : total
  }, 0)
})

// 优惠金额
const discount = computed(() => {
  if (!selectedCoupon.value) return 0
  if (subtotal.value >= selectedCoupon.value.minAmount) {
    return selectedCoupon.value.amount
  }
  return 0
})

// 总价
const totalPrice = computed(() => {
  return Math.max(0, subtotal.value + deliveryFee.value - discount.value)
})

// 监听购物车变化，更新选中项
watch(() => cartItems.value.length, () => {
  checkedItems.value = checkedItems.value.filter(id => 
    cartItems.value.some(item => item.id === id)
  )
  updateCheckAll()
})

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 跳转到日历
const goToCalendar = () => {
  router.push('/calendar')
}

// 跳转到商城
const goToShop = () => {
  router.push('/dishes')
}

// 更新数量
const updateQuantity = (item) => {
  cartStore.updateQuantity(item.id, item.quantity)
}

// 删除商品
const removeItem = (itemId) => {
  Dialog.confirm({
    title: '提示',
    message: '确定要删除这件商品吗？',
  }).then(() => {
    cartStore.removeFromCart(itemId)
    Toast.success('已删除')
  }).catch(() => {
    // 取消删除
  })
}

// 全选切换
const onCheckAllChange = (checked) => {
  if (checked) {
    checkedItems.value = cartItems.value.map(item => item.id)
  } else {
    checkedItems.value = []
  }
}

// 更新全选状态
const updateCheckAll = () => {
  checkAll.value = cartItems.value.length > 0 && 
    checkedItems.value.length === cartItems.value.length
}

// 监听选中项变化
watch(checkedItems, () => {
  updateCheckAll()
})

// 选择优惠券
const selectCoupon = (coupon) => {
  if (subtotal.value < coupon.minAmount) {
    Toast.fail(`需满${coupon.minAmount}元才能使用`)
    return
  }
  selectedCoupon.value = coupon
  showCouponPicker.value = false
  Toast.success('优惠券已选择')
}

// 提交订单
const onSubmit = () => {
  if (!cartStore.deliveryDate) {
    Toast.fail('请选择送达日期')
    goToCalendar()
    return
  }

  if (checkedItems.value.length === 0) {
    Toast.fail('请选择要结算的商品')
    return
  }

  Dialog.confirm({
    title: '确认订单',
    message: `共 ${checkedItems.value.length} 件商品，总计 ¥${totalPrice.value.toFixed(2)}`,
  }).then(() => {
    // 创建订单
    createOrder()
  }).catch(() => {
    // 取消
  })
}

// 创建订单
const createOrder = () => {
  Toast.loading({
    message: '提交中...',
    forbidClick: true,
    duration: 0
  })

  // 模拟API请求
  setTimeout(() => {
    Toast.clear()
    Toast.success('订单提交成功')
    
    // 清空购物车中已结算的商品
    checkedItems.value.forEach(itemId => {
      cartStore.removeFromCart(itemId)
    })
    
    // 跳转到订单页面
    setTimeout(() => {
      router.push('/orders')
    }, 500)
  }, 1500)
}

// 初始化时默认全选
checkedItems.value = cartItems.value.map(item => item.id)
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}

.cart-content {
  padding-bottom: 10px;
}

.delivery-date-card,
.coupon-card {
  background: white;
  margin: 10px;
  border-radius: 8px;
  overflow: hidden;
}

.cart-list {
  margin: 10px;
}

.cart-list :deep(.van-swipe-cell) {
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
}

.cart-list :deep(.van-card) {
  background: white;
}

.delete-button {
  height: 100%;
}

.remark-card {
  background: white;
  margin: 10px;
  padding: 10px;
  border-radius: 8px;
}

.price-detail {
  margin: 10px;
}

.discount-value {
  color: #FF6B35;
}

:deep(.van-submit-bar__bar) {
  padding-left: 16px;
}

.coupon-picker {
  height: 60vh;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ebedf0;
}

.picker-title {
  font-size: 16px;
  font-weight: bold;
}

.coupon-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.coupon-item {
  display: flex;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  color: white;
  position: relative;
}

.coupon-item.selected::after {
  content: '✓';
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: white;
  color: #FF6B35;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.coupon-left {
  width: 100px;
  border-right: 2px dashed rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-right: 15px;
}

.coupon-amount {
  font-size: 28px;
  font-weight: bold;
}

.coupon-condition {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.coupon-right {
  flex: 1;
  padding-left: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.coupon-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 6px;
}

.coupon-expire {
  font-size: 12px;
  opacity: 0.8;
}
</style>
