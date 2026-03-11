<template>
  <div class="create-order-page">
    <van-nav-bar
      title="立即下单"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />

    <van-steps :active="currentStep" active-color="#0066cc" class="step-bar">
      <van-step>航线信息</van-step>
      <van-step>货物信息</van-step>
      <van-step>联系信息</van-step>
    </van-steps>

    <van-form ref="formRef" @submit="handleSubmit">
      <!-- Step 1: Route -->
      <div v-show="currentStep === 0">
        <div class="form-section">
          <div class="form-section-title">📍 航线选择</div>
          <van-cell-group inset>
            <van-field
              v-model="form.origin"
              label="起始港"
              placeholder="请选择起始港"
              readonly
              right-icon="arrow-down"
              :rules="[{ required: true, message: '请选择起始港' }]"
              @click="showOriginPicker = true"
            />
            <van-field
              v-model="form.destination"
              label="目的港"
              placeholder="请选择目的港"
              readonly
              right-icon="arrow-down"
              :rules="[{ required: true, message: '请选择目的港' }]"
              @click="showDestPicker = true"
            />
            <van-field
              v-model="form.departureDate"
              label="预计出发"
              placeholder="请选择出发日期"
              readonly
              right-icon="calendar-o"
              :rules="[{ required: true, message: '请选择出发日期' }]"
              @click="showDatePicker = true"
            />
          </van-cell-group>
        </div>

        <!-- Estimated cost -->
        <div v-if="estimatedCost" class="cost-card">
          <div class="cost-title">预估运费</div>
          <div class="cost-amount">¥{{ estimatedCost.toLocaleString() }}</div>
          <div class="cost-note">* 最终运费以确认单为准，包含基本运价+燃油附加</div>
        </div>

        <div class="route-info-card" v-if="form.origin && form.destination">
          <div class="route-display">
            <div class="route-port">
              <div class="port-dot port-dot--origin"></div>
              <div>
                <div class="port-name">{{ form.origin }}</div>
                <div class="port-label">起始港</div>
              </div>
            </div>
            <div class="route-mid">
              <div class="route-ship">🚢</div>
              <div class="route-days">约 {{ routeDays }} 天</div>
            </div>
            <div class="route-port">
              <div class="port-dot port-dot--dest"></div>
              <div>
                <div class="port-name">{{ form.destination }}</div>
                <div class="port-label">目的港</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Cargo -->
      <div v-show="currentStep === 1">
        <div class="form-section">
          <div class="form-section-title">📦 货物信息</div>
          <van-cell-group inset>
            <van-field label="货物类型" :rules="[{ required: true }]">
              <template #input>
                <van-radio-group v-model="form.cargoType" direction="horizontal" class="cargo-radio">
                  <van-radio name="集装箱">集装箱</van-radio>
                  <van-radio name="散货">散货</van-radio>
                  <van-radio name="液货">液货</van-radio>
                  <van-radio name="滚装货物">滚装</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field
              v-model="form.weight"
              label="重量(吨)"
              type="number"
              placeholder="请输入货物重量"
              :rules="[{ required: true, message: '请输入重量' }, { pattern: /^\d+(\.\d+)?$/, message: '请输入有效数字' }]"
            >
              <template #right-icon><span class="unit-label">吨</span></template>
            </van-field>
            <van-field
              v-model="form.volume"
              label="体积(m³)"
              type="number"
              placeholder="请输入货物体积"
              :rules="[{ required: true, message: '请输入体积' }]"
            >
              <template #right-icon><span class="unit-label">m³</span></template>
            </van-field>
            <van-field
              v-model="form.cargoDesc"
              label="货物描述"
              type="textarea"
              placeholder="请描述货物名称、规格等"
              rows="3"
              autosize
              :rules="[{ required: true, message: '请填写货物描述' }]"
            />
            <van-field label="是否危险品">
              <template #input>
                <van-switch v-model="form.isHazmat" size="22" active-color="#ee0a24" />
              </template>
            </van-field>
            <van-field v-if="form.isHazmat" v-model="form.hazmatClass" label="危险品等级" placeholder="如: 3类易燃液体" />
          </van-cell-group>
        </div>
      </div>

      <!-- Step 3: Contact -->
      <div v-show="currentStep === 2">
        <div class="form-section">
          <div class="form-section-title">👤 联系信息</div>
          <van-cell-group inset>
            <van-field
              v-model="form.contact"
              label="联系人"
              placeholder="请输入联系人姓名"
              :rules="[{ required: true, message: '请填写联系人' }]"
            />
            <van-field
              v-model="form.phone"
              label="手机号"
              type="tel"
              placeholder="请输入手机号"
              :rules="[{ required: true, message: '请填写手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式有误' }]"
            />
            <van-field
              v-model="form.company"
              label="公司名称"
              placeholder="请输入公司名称"
              :rules="[{ required: true, message: '请填写公司名称' }]"
            />
            <van-field
              v-model="form.email"
              label="邮箱"
              type="email"
              placeholder="用于接收订单通知（选填）"
            />
            <van-field v-model="form.remark" label="备注" type="textarea" placeholder="如有特殊要求请填写" rows="2" autosize />
          </van-cell-group>
        </div>

        <!-- Order Summary -->
        <div class="summary-card">
          <div class="summary-title">订单摘要</div>
          <div class="summary-row"><span>航线</span><span>{{ form.origin }} → {{ form.destination }}</span></div>
          <div class="summary-row"><span>预计出发</span><span>{{ form.departureDate }}</span></div>
          <div class="summary-row"><span>货物类型</span><span>{{ form.cargoType }}</span></div>
          <div class="summary-row"><span>重量/体积</span><span>{{ form.weight }}吨 / {{ form.volume }}m³</span></div>
          <div class="summary-row summary-row--freight">
            <span>预估运费</span>
            <span class="freight-val">¥{{ estimatedCost?.toLocaleString() || '--' }}</span>
          </div>
        </div>
      </div>
    </van-form>

    <!-- Bottom Nav Buttons -->
    <div class="form-actions">
      <van-button v-if="currentStep > 0" plain type="primary" @click="prevStep">上一步</van-button>
      <van-button
        v-if="currentStep < 2"
        type="primary"
        color="linear-gradient(135deg, #0066cc, #0099ff)"
        @click="nextStep"
      >
        下一步
      </van-button>
      <van-button
        v-if="currentStep === 2"
        type="primary"
        color="linear-gradient(135deg, #0066cc, #0099ff)"
        :loading="submitting"
        loading-text="提交中..."
        @click="handleSubmit"
      >
        提交订单
      </van-button>
    </div>

    <!-- Pickers -->
    <van-popup v-model:show="showOriginPicker" position="bottom" round>
      <van-picker
        title="选择起始港"
        :columns="portOptions"
        @confirm="onOriginConfirm"
        @cancel="showOriginPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDestPicker" position="bottom" round>
      <van-picker
        title="选择目的港"
        :columns="portOptions"
        @confirm="onDestConfirm"
        @cancel="showDestPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        title="选择出发日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(0)
const submitting = ref(false)
const showOriginPicker = ref(false)
const showDestPicker = ref(false)
const showDatePicker = ref(false)

const minDate = new Date()
const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

const portOptions = [
  { text: '上海港', value: '上海港' },
  { text: '宁波港', value: '宁波港' },
  { text: '广州港', value: '广州港' },
  { text: '深圳港', value: '深圳港' },
  { text: '青岛港', value: '青岛港' },
  { text: '天津港', value: '天津港' },
  { text: '新加坡港', value: '新加坡港' },
  { text: '鹿特丹港', value: '鹿特丹港' },
  { text: '洛杉矶港', value: '洛杉矶港' },
  { text: '汉堡港', value: '汉堡港' },
  { text: '迪拜港', value: '迪拜港' },
  { text: '横滨港', value: '横滨港' }
]

const form = ref({
  origin: '',
  destination: '',
  departureDate: '',
  cargoType: '集装箱',
  weight: '',
  volume: '',
  cargoDesc: '',
  isHazmat: false,
  hazmatClass: '',
  contact: authStore.user?.name || '',
  phone: authStore.user?.phone || '',
  company: authStore.user?.company || '',
  email: authStore.user?.email || '',
  remark: ''
})

const routeDaysMap = {
  '上海港-新加坡港': 6, '上海港-鹿特丹港': 28, '上海港-洛杉矶港': 14,
  '广州港-鹿特丹港': 30, '宁波港-横滨港': 3, '青岛港-洛杉矶港': 16,
  '天津港-汉堡港': 25, '深圳港-迪拜港': 12
}

const routeDays = computed(() => {
  const key = `${form.value.origin}-${form.value.destination}`
  const reverseKey = `${form.value.destination}-${form.value.origin}`
  return routeDaysMap[key] || routeDaysMap[reverseKey] || 15
})

const estimatedCost = computed(() => {
  if (!form.value.origin || !form.value.destination || !form.value.weight) return null
  const baseRate = routeDays.value * 1200
  const weightFee = parseFloat(form.value.weight) * 80
  const hazmatSurcharge = form.value.isHazmat ? weightFee * 0.3 : 0
  return Math.round(baseRate + weightFee + hazmatSurcharge)
})

function onOriginConfirm({ selectedOptions }) {
  form.value.origin = selectedOptions[0]?.text || ''
  showOriginPicker.value = false
}

function onDestConfirm({ selectedOptions }) {
  form.value.destination = selectedOptions[0]?.text || ''
  showDestPicker.value = false
}

function onDateConfirm({ selectedValues }) {
  form.value.departureDate = selectedValues.join('-')
  showDatePicker.value = false
}

function nextStep() {
  if (currentStep.value === 0) {
    if (!form.value.origin) { showToast('请选择起始港'); return }
    if (!form.value.destination) { showToast('请选择目的港'); return }
    if (form.value.origin === form.value.destination) { showToast('起始港和目的港不能相同'); return }
    if (!form.value.departureDate) { showToast('请选择出发日期'); return }
  }
  if (currentStep.value === 1) {
    if (!form.value.weight) { showToast('请输入货物重量'); return }
    if (!form.value.volume) { showToast('请输入货物体积'); return }
    if (!form.value.cargoDesc) { showToast('请填写货物描述'); return }
  }
  currentStep.value++
}

function prevStep() {
  currentStep.value--
}

async function handleSubmit() {
  if (!form.value.contact || !form.value.phone || !form.value.company) {
    showToast('请完善联系信息')
    return
  }
  submitting.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  submitting.value = false
  showSuccessToast('订单提交成功！')
  setTimeout(() => router.push('/orders'), 1200)
}
</script>

<style scoped>
.create-order-page {
  min-height: 100%;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.step-bar {
  background: #fff;
  padding: 16px;
  margin-bottom: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.form-section {
  margin: 12px 0 0;
}

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  padding: 0 16px 8px;
}

.cost-card {
  margin: 12px 12px 0;
  background: linear-gradient(135deg, #003d7a, #0066cc);
  border-radius: 14px;
  padding: 16px;
  color: #fff;
  text-align: center;
}

.cost-title {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 6px;
}

.cost-amount {
  font-size: 32px;
  font-weight: 700;
}

.cost-note {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 6px;
}

.route-info-card {
  margin: 10px 12px 0;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.route-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.route-port {
  display: flex;
  align-items: center;
  gap: 8px;
}

.port-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.port-dot--origin { background: #0066cc; }
.port-dot--dest { background: #07c160; }

.port-name { font-size: 14px; font-weight: 700; color: #1a1a1a; }
.port-label { font-size: 11px; color: #999; margin-top: 2px; }

.route-mid {
  text-align: center;
}

.route-ship { font-size: 24px; }
.route-days { font-size: 11px; color: #0066cc; margin-top: 2px; }

.cargo-radio {
  flex-wrap: wrap;
  gap: 8px;
}

.unit-label {
  font-size: 13px;
  color: #666;
  padding-right: 4px;
}

.summary-card {
  margin: 12px 12px 0;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.summary-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  padding: 6px 0;
  color: #333;
}

.summary-row span:first-child { color: #888; }
.summary-row--freight { padding-top: 10px; border-top: 1px solid #f5f5f5; font-weight: 600; }

.freight-val {
  color: #e04040;
  font-size: 18px;
  font-weight: 700;
}

.form-actions {
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

.form-actions .van-button {
  flex: 1;
  min-height: 44px;
  border-radius: 22px;
}
</style>
