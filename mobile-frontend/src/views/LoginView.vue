<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="waves">
        <div class="wave wave1"></div>
        <div class="wave wave2"></div>
        <div class="wave wave3"></div>
      </div>
    </div>

    <div class="login-content">
      <div class="logo-area">
        <div class="ship-icon">🚢</div>
        <h1 class="brand-name">海上物流</h1>
        <p class="brand-sub">您的海运配送专家</p>
      </div>

      <div class="login-card">
        <h2 class="card-title">账号登录</h2>
        <van-form @submit="handleLogin">
          <van-cell-group inset>
            <van-field
              v-model="username"
              name="username"
              label="账号"
              placeholder="请输入用户名"
              left-icon="manager"
              :rules="[{ required: true, message: '请输入用户名' }]"
            />
            <van-field
              v-model="password"
              name="password"
              type="password"
              label="密码"
              placeholder="请输入密码"
              left-icon="lock"
              :rules="[{ required: true, message: '请输入密码' }]"
            />
          </van-cell-group>
          <div class="demo-hint">
            <van-icon name="info-o" />
            演示账号：admin / 123456
          </div>
          <div class="btn-wrap">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
              loading-text="登录中..."
              color="linear-gradient(135deg, #0066cc, #0099ff)"
            >
              登 录
            </van-button>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showFailToast } from 'vant'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('admin')
const password = ref('123456')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    const result = await authStore.login(username.value, password.value)
    if (result.success) {
      showToast({ message: '登录成功', icon: 'success' })
      router.replace('/home')
    } else {
      showFailToast(result.message || '用户名或密码错误')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #003d7a 0%, #0066cc 45%, #0099ff 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.waves {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 200px;
}

.wave {
  position: absolute;
  bottom: 0;
  width: 200%;
  height: 120px;
  border-radius: 50% 50% 0 0;
  opacity: 0.3;
}

.wave1 {
  background: rgba(255, 255, 255, 0.5);
  animation: wave-anim 6s infinite ease-in-out;
  left: -50%;
}

.wave2 {
  background: rgba(255, 255, 255, 0.3);
  animation: wave-anim 8s infinite ease-in-out reverse;
  left: -50%;
  height: 100px;
  bottom: 10px;
}

.wave3 {
  background: rgba(255, 255, 255, 0.2);
  animation: wave-anim 10s infinite ease-in-out;
  left: -50%;
  height: 80px;
  bottom: 20px;
}

@keyframes wave-anim {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(25%); }
}

.login-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 24px 40px;
  min-height: 100vh;
}

.logo-area {
  text-align: center;
  margin-bottom: 40px;
  color: #fff;
}

.ship-icon {
  font-size: 72px;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.brand-name {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 4px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  margin-bottom: 6px;
}

.brand-sub {
  font-size: 14px;
  opacity: 0.9;
  letter-spacing: 1px;
}

.login-card {
  width: 100%;
  background: #fff;
  border-radius: 20px;
  padding: 28px 0 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 20px;
}

.demo-hint {
  margin: 12px 16px 0;
  padding: 8px 12px;
  background: #f0f7ff;
  border-radius: 8px;
  font-size: 12px;
  color: #0066cc;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-wrap {
  margin: 20px 16px 0;
}
</style>
