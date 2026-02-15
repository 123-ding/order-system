<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="error-title">页面未找到</div>
      <div class="error-description">
        抱歉，您访问的页面不存在或已被删除
      </div>
      <el-button type="primary" size="large" @click="goHome">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;

  .not-found-content {
    text-align: center;
    color: #ffffff;

    .error-code {
      font-size: 120px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 20px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      animation: float 3s ease-in-out infinite;
    }

    .error-title {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 15px;
    }

    .error-description {
      font-size: 16px;
      margin-bottom: 40px;
      opacity: 0.9;
    }

    .el-button {
      padding: 15px 40px;
      font-size: 16px;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@media (max-width: 768px) {
  .not-found-content {
    .error-code {
      font-size: 80px;
    }

    .error-title {
      font-size: 24px;
    }

    .error-description {
      font-size: 14px;
    }
  }
}
</style>
