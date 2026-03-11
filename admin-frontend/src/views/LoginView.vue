<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>

    <el-card class="login-card" shadow="always">
      <div class="login-header">
        <div class="ship-icon">🚢</div>
        <h1 class="system-title">海上物流管理系统</h1>
        <p class="system-subtitle">Maritime Logistics Platform</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            clearable
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="demo-hint">
        <el-alert type="info" :closable="false" show-icon>
          <template #title>
            演示账号：admin / 123456
          </template>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: '123456'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为 2-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ]
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // Mock login: accept any credentials for demo
    const mockToken = 'mock-jwt-token-' + Date.now()
    localStorage.setItem('token', mockToken)
    authStore.token = mockToken
    authStore.user = { username: form.username, name: form.username, role: 'admin' }
    ElMessage.success('登录成功，欢迎回来！')
    router.push('/dashboard')
  } catch {
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a2a4a 0%, #0d4f8c 40%, #1a7abf 70%, #0e9aa7 100%);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 160px;
  border-radius: 50% 50% 0 0;
  animation: wave-anim 8s infinite linear;
  opacity: 0.15;
}

.wave1 {
  background: #ffffff;
  animation-duration: 6s;
  bottom: -20px;
}

.wave2 {
  background: #a8d8f0;
  animation-duration: 9s;
  animation-delay: -2s;
  bottom: -30px;
}

.wave3 {
  background: #5bb3d9;
  animation-duration: 12s;
  animation-delay: -4s;
  bottom: -40px;
}

@keyframes wave-anim {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.login-card {
  width: 420px;
  border-radius: 16px;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.ship-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 8px rgba(0, 100, 200, 0.3));
}

.system-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a3f6f;
  margin-bottom: 6px;
  letter-spacing: 2px;
}

.system-subtitle {
  font-size: 13px;
  color: #8a9bb0;
  letter-spacing: 1px;
}

.login-form {
  margin-top: 8px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  letter-spacing: 4px;
  background: linear-gradient(90deg, #1a6eb0, #0e9aa7);
  border: none;
  border-radius: 8px;
}

.login-btn:hover {
  background: linear-gradient(90deg, #1558a0, #0c8a95);
}

.demo-hint {
  margin-top: 16px;
}
</style>
