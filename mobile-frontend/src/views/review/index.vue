<template>
  <div class="review-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="评价订单"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    />

    <van-form @submit="onSubmit">
      <!-- 订单商品 -->
      <div class="order-items-card">
        <div class="card-title">订单商品</div>
        <div
          v-for="item in orderItems"
          :key="item.id"
          class="review-item"
        >
          <van-image
            :src="item.image"
            width="60"
            height="60"
            fit="cover"
            radius="4"
          />
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-price">¥{{ item.price }} x{{ item.quantity }}</div>
          </div>
        </div>
      </div>

      <!-- 整体评分 -->
      <div class="rating-card">
        <div class="card-title">整体评分</div>
        <div class="rating-container">
          <van-rate
            v-model="rating"
            :size="30"
            color="#FF6B35"
            void-icon="star"
            void-color="#eee"
            :gutter="10"
          />
          <span class="rating-text">{{ getRatingText(rating) }}</span>
        </div>
      </div>

      <!-- 评价内容 -->
      <div class="content-card">
        <div class="card-title">评价内容</div>
        <van-field
          v-model="content"
          rows="4"
          autosize
          type="textarea"
          maxlength="200"
          placeholder="说说您对本次订单的感受吧~"
          show-word-limit
          :rules="[{ required: true, message: '请填写评价内容' }]"
        />
      </div>

      <!-- 上传图片 -->
      <div class="upload-card">
        <div class="card-title">上传图片（选填）</div>
        <van-uploader
          v-model="fileList"
          multiple
          :max-count="6"
          :after-read="afterRead"
          :before-delete="beforeDelete"
        >
          <template #preview-cover="{ file }">
            <div class="preview-cover">
              <van-icon name="cross" @click.stop="deleteImage(file)" />
            </div>
          </template>
        </van-uploader>
        <div class="upload-tip">最多上传6张图片，每张不超过5MB</div>
      </div>

      <!-- 标签选择 -->
      <div class="tags-card">
        <div class="card-title">选择标签（选填）</div>
        <div class="tags-list">
          <van-tag
            v-for="tag in availableTags"
            :key="tag"
            :type="selectedTags.includes(tag) ? 'primary' : 'default'"
            :color="selectedTags.includes(tag) ? '#FF6B35' : undefined"
            size="large"
            round
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </van-tag>
        </div>
      </div>

      <!-- 匿名评价 -->
      <div class="anonymous-card">
        <van-cell center>
          <template #title>
            <span class="cell-title">匿名评价</span>
          </template>
          <template #right-icon>
            <van-switch
              v-model="anonymous"
              size="20"
              active-color="#FF6B35"
            />
          </template>
        </van-cell>
        <div class="anonymous-tip">开启后，您的昵称和头像将不会被显示</div>
      </div>

      <!-- 底部提交按钮 -->
      <div class="submit-bar">
        <van-button
          type="primary"
          color="#FF6B35"
          size="large"
          block
          native-type="submit"
          :loading="submitting"
        >
          提交评价
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Toast } from 'vant'
import { reviewApi } from '@/api/mobile'

const router = useRouter()
const route = useRoute()

const rating = ref(5)
const content = ref('')
const fileList = ref([])
const selectedTags = ref([])
const anonymous = ref(false)
const submitting = ref(false)

const orderItems = ref([
  {
    id: 1,
    name: '宫保鸡丁',
    price: 28.00,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1603073524394-61e3451b69a7?w=400'
  },
  {
    id: 2,
    name: '麻婆豆腐',
    price: 22.00,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400'
  }
])

const availableTags = ref([
  '味道不错',
  '分量足',
  '配送及时',
  '包装完好',
  '性价比高',
  '食材新鲜',
  '口味正宗',
  '服务周到'
])

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 获取评分文本
const getRatingText = (score) => {
  const textMap = {
    1: '非常不满意',
    2: '不满意',
    3: '一般',
    4: '满意',
    5: '非常满意'
  }
  return textMap[score] || ''
}

// 切换标签
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// 图片上传后
const afterRead = async (file) => {
  // 显示上传中的loading
  Toast.loading({
    message: '上传中...',
    forbidClick: true,
    duration: 0
  })

  try {
    // 这里应该调用实际的上传接口
    // const res = await reviewApi.uploadImage(file.file)
    
    // 模拟上传
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    Toast.clear()
    Toast.success('上传成功')
    
    // file.url = res.data.url
  } catch (error) {
    Toast.fail('上传失败')
    // 移除上传失败的文件
    const index = fileList.value.indexOf(file)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
  }
}

// 删除图片前确认
const beforeDelete = () => {
  return new Promise((resolve) => {
    Toast.confirm({
      message: '确定要删除这张图片吗？',
    }).then(() => {
      resolve(true)
    }).catch(() => {
      resolve(false)
    })
  })
}

// 删除图片
const deleteImage = (file) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

// 提交评价
const onSubmit = async () => {
  if (!content.value.trim()) {
    Toast.fail('请填写评价内容')
    return
  }

  submitting.value = true
  Toast.loading({
    message: '提交中...',
    forbidClick: true,
    duration: 0
  })

  try {
    // 准备提交数据
    const reviewData = {
      orderId: route.params.orderId,
      rating: rating.value,
      content: content.value,
      images: fileList.value.map(f => f.url || f.content),
      tags: selectedTags.value,
      anonymous: anonymous.value
    }

    // 这里应该调用实际的API
    // await reviewApi.createReview(reviewData)
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1500))

    Toast.clear()
    Toast.success('评价成功')
    
    // 返回订单列表
    setTimeout(() => {
      router.push('/orders')
    }, 500)
  } catch (error) {
    Toast.fail('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const orderId = route.params.orderId
  // 这里可以根据 orderId 加载订单商品数据
  // const res = await orderApi.getOrderDetail(orderId)
  // orderItems.value = res.data.items
})
</script>

<style scoped>
.review-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 70px;
}

.order-items-card,
.rating-card,
.content-card,
.upload-card,
.tags-card,
.anonymous-card {
  background: white;
  margin: 10px;
  padding: 15px;
  border-radius: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 15px;
}

.review-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #ebedf0;
}

.review-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 14px;
  color: #323233;
  font-weight: 500;
}

.item-price {
  font-size: 13px;
  color: #969799;
}

.rating-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 0;
}

.rating-text {
  font-size: 16px;
  color: #FF6B35;
  font-weight: bold;
}

.upload-tip {
  font-size: 12px;
  color: #969799;
  margin-top: 10px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tags-list .van-tag {
  padding: 8px 16px;
  cursor: pointer;
}

.anonymous-card {
  padding: 0;
}

.anonymous-card .van-cell {
  padding: 15px;
}

.cell-title {
  font-size: 15px;
  font-weight: 500;
}

.anonymous-tip {
  font-size: 12px;
  color: #969799;
  padding: 0 15px 15px;
}

.submit-bar {
  padding: 10px 16px;
  margin-top: 10px;
}

.preview-cover {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0 0 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-cover .van-icon {
  color: white;
  font-size: 12px;
}

:deep(.van-field__control) {
  background: #f7f8fa;
  border-radius: 4px;
  padding: 10px;
}
</style>
