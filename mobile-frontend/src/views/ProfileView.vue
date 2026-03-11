<template>
  <div class="profile-page">
    <!-- Header -->
    <div class="profile-header">
      <div class="avatar-area">
        <div class="avatar">🧑</div>
        <div class="user-info">
          <div class="user-name">{{ user?.name || '用户' }}</div>
          <div class="user-company">{{ user?.company || '远洋货运有限公司' }}</div>
        </div>
        <van-button size="small" plain color="#fff" class="edit-btn" @click="showEditProfile = true">
          编辑
        </van-button>
      </div>

      <div class="profile-stats">
        <div class="pstat" @click="$router.push('/orders')">
          <div class="pstat-num">24</div>
          <div class="pstat-label">总订单</div>
        </div>
        <div class="pstat-divider"></div>
        <div class="pstat" @click="$router.push('/orders?tab=in_transit')">
          <div class="pstat-num">8</div>
          <div class="pstat-label">运输中</div>
        </div>
        <div class="pstat-divider"></div>
        <div class="pstat">
          <div class="pstat-num">98%</div>
          <div class="pstat-label">好评率</div>
        </div>
      </div>
    </div>

    <!-- My Info -->
    <div class="section-label">我的信息</div>
    <van-cell-group inset>
      <van-cell title="用户名" :value="user?.username || 'admin'" icon="manager-o" />
      <van-cell title="手机号" :value="user?.phone || '138****5678'" icon="phone-o" />
      <van-cell title="邮箱" :value="user?.email || 'zhang@maritime.com'" icon="envelop-o" />
      <van-cell title="公司" :value="user?.company || '远洋货运有限公司'" icon="home-o" />
    </van-cell-group>

    <!-- Services -->
    <div class="section-label">服务中心</div>
    <van-cell-group inset>
      <van-cell
        title="修改密码"
        icon="lock"
        is-link
        @click="showChangePwd = true"
      />
      <van-cell
        title="联系客服"
        icon="service-o"
        is-link
        value="400-888-0066"
        @click="callService"
      />
      <van-cell
        title="运费计算器"
        icon="balance-o"
        is-link
        @click="$router.push('/create-order')"
      />
      <van-cell
        title="关于我们"
        icon="info-o"
        is-link
        @click="showAbout = true"
      />
    </van-cell-group>

    <!-- Logout -->
    <div class="logout-area">
      <van-button
        block
        round
        type="danger"
        plain
        @click="handleLogout"
      >
        退出登录
      </van-button>
    </div>

    <!-- Edit Profile Dialog -->
    <van-dialog
      v-model:show="showEditProfile"
      title="编辑个人信息"
      show-cancel-button
      @confirm="saveProfile"
    >
      <div class="edit-body">
        <van-field v-model="editForm.name" label="姓名" placeholder="请输入真实姓名" />
        <van-field v-model="editForm.phone" label="手机" type="tel" placeholder="请输入手机号" />
        <van-field v-model="editForm.email" label="邮箱" type="email" placeholder="请输入邮箱" />
        <van-field v-model="editForm.company" label="公司" placeholder="请输入公司名称" />
      </div>
    </van-dialog>

    <!-- Change Password Dialog -->
    <van-dialog
      v-model:show="showChangePwd"
      title="修改密码"
      show-cancel-button
      @confirm="changePwd"
    >
      <div class="edit-body">
        <van-field
          v-model="pwdForm.old"
          type="password"
          label="原密码"
          placeholder="请输入原密码"
        />
        <van-field
          v-model="pwdForm.new1"
          type="password"
          label="新密码"
          placeholder="请输入新密码"
        />
        <van-field
          v-model="pwdForm.new2"
          type="password"
          label="确认密码"
          placeholder="再次输入新密码"
        />
      </div>
    </van-dialog>

    <!-- About Dialog -->
    <van-dialog
      v-model:show="showAbout"
      title="关于我们"
      confirm-button-text="知道了"
    >
      <div class="about-body">
        <div class="about-logo">🚢</div>
        <div class="about-name">海上物流配送平台</div>
        <div class="about-version">版本 v1.0.0</div>
        <p class="about-desc">
          专注于海运物流配送服务，连接全球主要港口，
          提供集装箱、散货、液货、滚装货物等多类型运输方案。
          安全、可靠、高效是我们的承诺。
        </p>
        <div class="about-contact">
          <span>官网: www.maritime-logistics.com</span>
          <span>客服: 400-888-0066</span>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showToast, showFailToast } from 'vant'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const showEditProfile = ref(false)
const showChangePwd = ref(false)
const showAbout = ref(false)

const editForm = ref({
  name: user.value?.name || '',
  phone: user.value?.phone || '',
  email: user.value?.email || '',
  company: user.value?.company || ''
})

const pwdForm = ref({ old: '', new1: '', new2: '' })

function saveProfile() {
  showSuccessToast('个人信息已更新')
}

function changePwd() {
  if (!pwdForm.value.old) { showToast('请输入原密码'); return }
  if (pwdForm.value.new1 !== pwdForm.value.new2) {
    showFailToast('两次密码不一致')
    return
  }
  showSuccessToast('密码修改成功')
  pwdForm.value = { old: '', new1: '', new2: '' }
}

function callService() {
  window.location.href = 'tel:4008880066'
}

function handleLogout() {
  authStore.logout()
  showSuccessToast('已退出登录')
  setTimeout(() => router.replace('/login'), 800)
}
</script>

<style scoped>
.profile-page {
  min-height: 100%;
  background: #f5f7fa;
  padding-bottom: 30px;
}

.profile-header {
  background: linear-gradient(135deg, #003d7a, #0066cc);
  padding: 48px 16px 20px;
  border-radius: 0 0 24px 24px;
}

.avatar-area {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.avatar {
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border: 2px solid rgba(255,255,255,0.5);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  color: #fff;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
}

.user-company {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 3px;
}

.edit-btn {
  border-color: rgba(255,255,255,0.6) !important;
  color: #fff !important;
  background: rgba(255,255,255,0.15) !important;
}

.profile-stats {
  display: flex;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 12px 0;
}

.pstat {
  flex: 1;
  text-align: center;
  color: #fff;
  cursor: pointer;
}

.pstat-num {
  font-size: 22px;
  font-weight: 700;
}

.pstat-label {
  font-size: 11px;
  opacity: 0.85;
  margin-top: 2px;
}

.pstat-divider {
  width: 1px;
  background: rgba(255,255,255,0.3);
  margin: 4px 0;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #888;
  padding: 16px 16px 8px;
  letter-spacing: 0.5px;
}

.logout-area {
  padding: 24px 16px;
}

.edit-body {
  padding: 8px 0;
}

.about-body {
  padding: 20px 16px;
  text-align: center;
}

.about-logo { font-size: 48px; margin-bottom: 8px; }
.about-name { font-size: 18px; font-weight: 700; color: #1a1a1a; }
.about-version { font-size: 12px; color: #aaa; margin: 4px 0 12px; }

.about-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
  text-align: left;
  margin-bottom: 12px;
}

.about-contact {
  font-size: 12px;
  color: #888;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
