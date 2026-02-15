<template>
  <div class="settings-container">
    <el-card class="settings-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Setting /></el-icon>
            系统设置
          </span>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="settings-tabs">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            label-width="120px"
            class="settings-form"
          >
            <el-form-item label="系统名称">
              <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
            </el-form-item>

            <el-form-item label="系统Logo">
              <el-upload
                class="logo-uploader"
                :action="uploadAction"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleLogoSuccess"
                :before-upload="beforeUpload"
              >
                <img v-if="basicForm.logo" :src="basicForm.logo" class="logo" />
                <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>

            <el-form-item label="客服电话">
              <el-input v-model="basicForm.servicePhone" placeholder="请输入客服电话" />
            </el-form-item>

            <el-form-item label="客服邮箱">
              <el-input v-model="basicForm.serviceEmail" placeholder="请输入客服邮箱" />
            </el-form-item>

            <el-form-item label="系统公告">
              <el-input
                v-model="basicForm.announcement"
                type="textarea"
                :rows="4"
                placeholder="请输入系统公告"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveBasicSettings">
                保存设置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 订单设置 -->
        <el-tab-pane label="订单设置" name="order">
          <el-form
            ref="orderFormRef"
            :model="orderForm"
            label-width="150px"
            class="settings-form"
          >
            <el-form-item label="自动接单">
              <el-switch v-model="orderForm.autoAccept" />
              <div class="form-tip">开启后新订单将自动接单</div>
            </el-form-item>

            <el-form-item label="待支付超时时间">
              <el-input-number
                v-model="orderForm.paymentTimeout"
                :min="5"
                :max="60"
                :step="5"
              />
              <span class="input-suffix">分钟</span>
              <div class="form-tip">超过此时间未支付的订单将自动取消</div>
            </el-form-item>

            <el-form-item label="配送费">
              <el-input-number
                v-model="orderForm.deliveryFee"
                :min="0"
                :precision="2"
                :step="1"
              />
              <span class="input-suffix">元</span>
            </el-form-item>

            <el-form-item label="起送金额">
              <el-input-number
                v-model="orderForm.minOrderAmount"
                :min="0"
                :precision="2"
                :step="5"
              />
              <span class="input-suffix">元</span>
            </el-form-item>

            <el-form-item label="免配送费金额">
              <el-input-number
                v-model="orderForm.freeDeliveryAmount"
                :min="0"
                :precision="2"
                :step="10"
              />
              <span class="input-suffix">元</span>
              <div class="form-tip">订单金额超过此值免配送费</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveOrderSettings">
                保存设置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 营业时间 -->
        <el-tab-pane label="营业时间" name="business">
          <el-form
            ref="businessFormRef"
            :model="businessForm"
            label-width="120px"
            class="settings-form"
          >
            <el-form-item label="是否营业">
              <el-switch v-model="businessForm.isOpen" />
            </el-form-item>

            <el-form-item label="营业时间">
              <el-time-picker
                v-model="businessForm.openTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="开始时间"
              />
              <span class="time-separator">至</span>
              <el-time-picker
                v-model="businessForm.closeTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="结束时间"
              />
            </el-form-item>

            <el-form-item label="休息日">
              <el-checkbox-group v-model="businessForm.closedDays">
                <el-checkbox :label="1">周一</el-checkbox>
                <el-checkbox :label="2">周二</el-checkbox>
                <el-checkbox :label="3">周三</el-checkbox>
                <el-checkbox :label="4">周四</el-checkbox>
                <el-checkbox :label="5">周五</el-checkbox>
                <el-checkbox :label="6">周六</el-checkbox>
                <el-checkbox :label="0">周日</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveBusinessSettings">
                保存设置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Plus } from '@element-plus/icons-vue'
import { getSettings, updateSettings } from '@/api/admin'
import { useUserStore } from '@/store'

const userStore = useUserStore()

const activeTab = ref('basic')
const saving = ref(false)

const basicFormRef = ref(null)
const orderFormRef = ref(null)
const businessFormRef = ref(null)

const basicForm = reactive({
  systemName: '订餐系统',
  logo: '',
  servicePhone: '',
  serviceEmail: '',
  announcement: ''
})

const orderForm = reactive({
  autoAccept: false,
  paymentTimeout: 30,
  deliveryFee: 5,
  minOrderAmount: 20,
  freeDeliveryAmount: 50
})

const businessForm = reactive({
  isOpen: true,
  openTime: '09:00',
  closeTime: '22:00',
  closedDays: []
})

const uploadAction = computed(() => {
  return import.meta.env.VITE_API_BASE_URL + '/admin/upload/image'
})

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${userStore.token}`
  }
})

// 获取设置
const fetchSettings = async () => {
  try {
    const res = await getSettings()
    if (res.code === 200) {
      const data = res.data || {}
      
      // 基本设置
      if (data.basic) {
        Object.assign(basicForm, data.basic)
      }
      
      // 订单设置
      if (data.order) {
        Object.assign(orderForm, data.order)
      }
      
      // 营业时间
      if (data.business) {
        Object.assign(businessForm, data.business)
      }
    }
  } catch (error) {
    console.error('获取设置失败:', error)
  }
}

// 保存基本设置
const saveBasicSettings = async () => {
  saving.value = true
  try {
    const res = await updateSettings({
      type: 'basic',
      data: basicForm
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 保存订单设置
const saveOrderSettings = async () => {
  saving.value = true
  try {
    const res = await updateSettings({
      type: 'order',
      data: orderForm
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 保存营业时间
const saveBusinessSettings = async () => {
  saving.value = true
  try {
    const res = await updateSettings({
      type: 'business',
      data: businessForm
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// Logo上传成功
const handleLogoSuccess = (response) => {
  if (response.code === 200) {
    basicForm.logo = response.data.url
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 上传前检查
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped lang="scss">
.settings-container {
  .settings-card {
    border-radius: 12px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .settings-tabs {
      :deep(.el-tabs__nav-wrap::after) {
        display: none;
      }
    }

    .settings-form {
      max-width: 600px;
      margin-top: 20px;

      .logo-uploader {
        :deep(.el-upload) {
          width: 148px;
          height: 148px;
          border: 1px dashed #d9d9d9;
          border-radius: 8px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;

          &:hover {
            border-color: #409EFF;
          }
        }

        .logo {
          width: 148px;
          height: 148px;
          display: block;
          object-fit: contain;
        }

        .logo-uploader-icon {
          font-size: 28px;
          color: #8c939d;
          width: 148px;
          height: 148px;
          line-height: 148px;
          text-align: center;
        }
      }

      .form-tip {
        margin-top: 4px;
        font-size: 12px;
        color: #909399;
        line-height: 1.5;
      }

      .input-suffix {
        margin-left: 10px;
        color: #606266;
      }

      .time-separator {
        margin: 0 10px;
        color: #606266;
      }

      :deep(.el-checkbox-group) {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
      }
    }
  }
}
</style>
