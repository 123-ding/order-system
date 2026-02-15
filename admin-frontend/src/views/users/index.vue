<template>
  <div class="users-container">
    <!-- 搜索工具栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名/手机号"
            clearable
            style="width: 200px"
            @clear="handleSearch"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="50" :src="row.avatar">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>

        <el-table-column prop="username" label="用户名" min-width="120" />
        
        <el-table-column prop="phone" label="手机号" min-width="130" />
        
        <el-table-column prop="email" label="邮箱" min-width="180" />

        <el-table-column label="订单数" width="100">
          <template #default="{ row }">
            <el-tag type="info">{{ row.orderCount || 0 }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="消费金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.totalAmount || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="注册时间" min-width="160" />

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :icon="View" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button type="warning" link size="small" :icon="Key" @click="resetPassword(row)">
              重置密码
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSearch"
        @current-change="handleSearch"
        class="pagination"
      />
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="用户详情"
      width="600px"
    >
      <div v-if="currentUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">
            {{ currentUser.username }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ currentUser.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱" :span="2">
            {{ currentUser.email || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单数量">
            {{ currentUser.orderCount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="消费总额">
            ¥{{ currentUser.totalAmount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.status === 1 ? 'success' : 'danger'">
              {{ currentUser.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">
            {{ currentUser.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录" :span="2">
            {{ currentUser.lastLoginAt || '从未登录' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordVisible"
      title="重置密码"
      width="500px"
    >
      <el-form :model="passwordForm" label-width="80px">
        <el-form-item label="新密码">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPasswordVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  View,
  Key,
  UserFilled
} from '@element-plus/icons-vue'
import {
  getUsers,
  getUserDetail,
  updateUserStatus,
  resetUserPassword
} from '@/api/admin'

const loading = ref(false)
const detailVisible = ref(false)
const resetPasswordVisible = ref(false)

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])
const currentUser = ref(null)

const passwordForm = reactive({
  userId: null,
  newPassword: ''
})

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const res = await getUsers(params)
    if (res.code === 200) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchUsers()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  handleSearch()
}

// 查看详情
const viewDetail = async (row) => {
  try {
    const res = await getUserDetail(row.id)
    if (res.code === 200) {
      currentUser.value = res.data
      detailVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取用户详情失败')
  }
}

// 状态变更
const handleStatusChange = async (row) => {
  try {
    const res = await updateUserStatus(row.id, row.status)
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
    } else {
      ElMessage.error(res.message || '状态更新失败')
      row.status = row.status === 1 ? 0 : 1
    }
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 1 ? 0 : 1
  }
}

// 重置密码
const resetPassword = (row) => {
  passwordForm.userId = row.id
  passwordForm.newPassword = ''
  resetPasswordVisible.value = true
}

// 确认重置密码
const confirmResetPassword = async () => {
  if (!passwordForm.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }

  if (passwordForm.newPassword.length < 6) {
    ElMessage.warning('密码长度不能少于6位')
    return
  }

  try {
    const res = await resetUserPassword(passwordForm.userId, passwordForm.newPassword)
    if (res.code === 200) {
      ElMessage.success('密码重置成功')
      resetPasswordVisible.value = false
    } else {
      ElMessage.error(res.message || '密码重置失败')
    }
  } catch (error) {
    ElMessage.error('密码重置失败')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
.users-container {
  .search-card {
    margin-bottom: 20px;
    border-radius: 12px;

    .search-form {
      margin-bottom: 0;
    }
  }

  .table-card {
    border-radius: 12px;

    .amount {
      font-weight: 600;
      color: #f56c6c;
    }

    .pagination {
      margin-top: 20px;
      justify-content: flex-end;
    }
  }

  .user-detail {
    :deep(.el-descriptions) {
      margin-top: 20px;
    }
  }
}
</style>
