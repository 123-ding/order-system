<template>
  <div class="login-bg">
    <div class="login-box">
      <div class="login-logo">
        <el-icon style="font-size:40px;color:#1890ff;"><Promotion /></el-icon>
        <h2>低空智联网安全可信中台</h2>
        <p>Low-Altitude Intelligent IoT Security Platform</p>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" size="large" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width:100%;" :loading="loading" @click="handleLogin">登 录</el-button>
        </el-form-item>
      </el-form>
      <p style="text-align:center;color:#999;font-size:12px;">演示账号：admin / admin123</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = ref({ username: 'admin', password: 'admin123' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

function handleLogin() {
  formRef.value.validate((valid: boolean) => {
    if (!valid) return
    loading.value = true
    setTimeout(() => {
      loading.value = false
      if (form.value.username === 'admin' && form.value.password === 'admin123') {
        ElMessage.success('登录成功')
        router.push('/dashboard')
      } else {
        ElMessage.error('用户名或密码错误')
      }
    }, 800)
  })
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #001529 0%, #003566 60%, #0a5c8a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-box {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.login-logo {
  text-align: center;
  margin-bottom: 32px;
}
.login-logo h2 {
  font-size: 18px;
  font-weight: 700;
  color: #001529;
  margin: 12px 0 4px;
}
.login-logo p {
  font-size: 12px;
  color: #999;
}
</style>
