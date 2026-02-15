<template>
  <div class="calendar-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="选择送达日期"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    />

    <!-- 日历 -->
    <van-calendar
      v-model:show="showCalendar"
      :min-date="minDate"
      :max-date="maxDate"
      :default-date="defaultDate"
      color="#FF6B35"
      @confirm="onConfirm"
    />

    <div class="calendar-content">
      <!-- 说明 -->
      <van-notice-bar
        left-icon="info-o"
        color="#FF6B35"
        background="#FFF5F0"
        text="请选择您希望收到订单的日期，我们将在当天为您送达"
      />

      <!-- 选中日期显示 -->
      <div class="selected-date-card">
        <div class="card-title">当前选择的送达日期</div>
        <div class="selected-date" @click="showCalendar = true">
          <van-icon name="calendar-o" color="#FF6B35" size="24" />
          <span v-if="selectedDate" class="date-text">
            {{ formatDate(selectedDate) }}
          </span>
          <span v-else class="placeholder">点击选择日期</span>
        </div>
      </div>

      <!-- 快捷选择 -->
      <div class="quick-select">
        <div class="card-title">快捷选择</div>
        <van-grid :column-num="3" :border="false">
          <van-grid-item
            v-for="quick in quickDates"
            :key="quick.label"
            @click="selectQuickDate(quick.date)"
          >
            <van-button
              :type="isSelectedDate(quick.date) ? 'primary' : 'default'"
              :color="isSelectedDate(quick.date) ? '#FF6B35' : undefined"
              size="small"
              block
            >
              {{ quick.label }}
            </van-button>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 配送时段 -->
      <div class="delivery-time-card">
        <div class="card-title">配送时段</div>
        <van-radio-group v-model="selectedTimeSlot">
          <van-cell-group inset>
            <van-cell
              v-for="slot in timeSlots"
              :key="slot.value"
              clickable
              @click="selectedTimeSlot = slot.value"
            >
              <template #title>
                <div class="time-slot-title">
                  <span>{{ slot.label }}</span>
                  <van-tag v-if="slot.tag" :type="slot.tagType" plain size="medium">
                    {{ slot.tag }}
                  </van-tag>
                </div>
              </template>
              <template #right-icon>
                <van-radio :name="slot.value" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>

      <!-- 温馨提示 -->
      <div class="tips-card">
        <div class="card-title">温馨提示</div>
        <van-cell-group inset>
          <van-cell>
            <template #icon>
              <van-icon name="info-o" color="#FF6B35" />
            </template>
            <template #title>
              <div class="tip-text">
                <div>• 当日12:00前下单，可选择当日送达</div>
                <div>• 配送时间可能因天气等因素有所延迟</div>
                <div>• 如需修改配送时间，请及时联系客服</div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>

    <!-- 底部确认按钮 -->
    <div class="bottom-bar">
      <van-button
        type="primary"
        color="#FF6B35"
        size="large"
        block
        :disabled="!selectedDate"
        @click="confirmSelection"
      >
        确认选择
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import { useCartStore } from '@/store'
import dayjs from 'dayjs'

const router = useRouter()
const cartStore = useCartStore()

const showCalendar = ref(true)
const selectedDate = ref(null)
const selectedTimeSlot = ref('morning')

// 日历日期范围
const today = new Date()
const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)
const defaultDate = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1))

// 快捷日期选择
const quickDates = computed(() => {
  const dates = []
  const now = new Date()
  
  // 如果当前时间在12点之前，可以选择今天
  if (now.getHours() < 12) {
    dates.push({
      label: '今天',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate())
    })
  }
  
  dates.push({
    label: '明天',
    date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  })
  
  dates.push({
    label: '后天',
    date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)
  })
  
  return dates
})

// 配送时段
const timeSlots = ref([
  {
    value: 'morning',
    label: '上午 (9:00 - 12:00)',
    tag: '推荐',
    tagType: 'danger'
  },
  {
    value: 'noon',
    label: '中午 (12:00 - 14:00)',
    tag: '',
    tagType: ''
  },
  {
    value: 'afternoon',
    label: '下午 (14:00 - 18:00)',
    tag: '',
    tagType: ''
  },
  {
    value: 'evening',
    label: '晚上 (18:00 - 20:00)',
    tag: '',
    tagType: ''
  }
])

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 日历确认
const onConfirm = (date) => {
  selectedDate.value = date
  showCalendar.value = false
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

// 判断是否选中某个日期
const isSelectedDate = (date) => {
  if (!selectedDate.value) return false
  return dayjs(date).format('YYYY-MM-DD') === dayjs(selectedDate.value).format('YYYY-MM-DD')
}

// 快捷选择日期
const selectQuickDate = (date) => {
  selectedDate.value = date
}

// 确认选择
const confirmSelection = () => {
  if (!selectedDate.value) {
    Toast.fail('请选择送达日期')
    return
  }
  
  const dateStr = dayjs(selectedDate.value).format('YYYY-MM-DD')
  const timeSlotLabel = timeSlots.value.find(s => s.value === selectedTimeSlot.value)?.label
  
  // 保存到购物车store
  cartStore.setDeliveryDate(`${dateStr} ${timeSlotLabel}`)
  
  Toast.success('已设置送达时间')
  setTimeout(() => {
    router.back()
  }, 500)
}

onMounted(() => {
  // 如果购物车已有日期，则回显
  if (cartStore.deliveryDate) {
    const [dateStr] = cartStore.deliveryDate.split(' ')
    selectedDate.value = new Date(dateStr)
  } else {
    // 默认选择明天
    selectedDate.value = defaultDate.value
  }
})
</script>

<style scoped>
.calendar-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 70px;
}

.calendar-content {
  padding: 10px;
}

.selected-date-card,
.quick-select,
.delivery-time-card,
.tips-card {
  background: white;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 15px;
}

.selected-date {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: #FFF5F0;
  border-radius: 8px;
  border: 2px dashed #FF6B35;
  cursor: pointer;
}

.date-text {
  font-size: 18px;
  font-weight: bold;
  color: #FF6B35;
}

.placeholder {
  font-size: 16px;
  color: #969799;
}

.time-slot-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tip-text {
  font-size: 13px;
  color: #646566;
  line-height: 1.8;
}

.tip-text div {
  margin: 4px 0;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 16px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
}

:deep(.van-calendar) {
  position: relative;
}
</style>
