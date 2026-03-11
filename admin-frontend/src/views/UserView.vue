<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">👥 用户管理</h2>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="搜索">
          <el-input v-model="search" placeholder="用户名/邮箱/手机" clearable style="width: 220px" :prefix-icon="Search" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="roleFilter" placeholder="全部角色" clearable style="width: 120px">
            <el-option v-for="(val, key) in USER_ROLES" :key="key" :label="val.label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Plus" @click="openDialog()">新增用户</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="filteredUsers" stripe border>
        <el-table-column prop="username" label="用户名" width="130" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="USER_ROLES[row.role]?.type" size="small">
              {{ USER_ROLES[row.role]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="company" label="所属公司" min-width="140" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="注册时间" width="120" />
        <el-table-column prop="lastLogin" label="最近登录" width="120" />
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button
              link
              :type="row.status === 'active' ? 'warning' : 'success'"
              size="small"
              @click="toggleUser(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="deleteUser(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredUsers.length"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingUser ? '编辑用户' : '新增用户'"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" :disabled="!!editingUser" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" type="email" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="form.role" style="width: 100%">
                <el-option v-for="(val, key) in USER_ROLES" :key="key" :label="val.label" :value="key" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="所属公司">
          <el-input v-model="form.company" />
        </el-form-item>
        <el-form-item v-if="!editingUser" label="初始密码" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { USER_ROLES } from '@/utils/constants'

const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const editingUser = ref(null)
const saving = ref(false)
const formRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

const form = reactive({ username: '', name: '', email: '', phone: '', role: 'operator', company: '', password: '' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }, { min: 3, message: '用户名至少3个字符', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }, { min: 6, message: '密码至少6个字符', trigger: 'blur' }]
}

const users = reactive([
  { id: 1, username: 'admin', name: '张管理', email: 'admin@maritime.com', phone: '13800138000', role: 'admin', status: 'active', company: '海上物流集团', createdAt: '2024-01-01', lastLogin: '2024-06-01' },
  { id: 2, username: 'operator01', name: '李操作员', email: 'op01@maritime.com', phone: '13800138001', role: 'operator', status: 'active', company: '上海港务局', createdAt: '2024-01-15', lastLogin: '2024-06-01' },
  { id: 3, username: 'customer_sh', name: '王上海', email: 'wang@shandong-trade.com', phone: '13800138002', role: 'customer', status: 'active', company: '山东贸易有限公司', createdAt: '2024-02-10', lastLogin: '2024-05-30' },
  { id: 4, username: 'viewer01', name: '赵查看', email: 'zhao@maritime.com', phone: '13800138003', role: 'viewer', status: 'active', company: '海上物流集团', createdAt: '2024-02-20', lastLogin: '2024-05-28' },
  { id: 5, username: 'customer_gz', name: '陈广州', email: 'chen@guangzhou.com', phone: '13800138004', role: 'customer', status: 'active', company: '广州外贸公司', createdAt: '2024-03-01', lastLogin: '2024-05-31' },
  { id: 6, username: 'operator02', name: '刘操作', email: 'op02@maritime.com', phone: '13800138005', role: 'operator', status: 'disabled', company: '天津港务局', createdAt: '2024-03-15', lastLogin: '2024-05-01' },
  { id: 7, username: 'customer_nb', name: '孙宁波', email: 'sun@ningbo-logistics.com', phone: '13800138006', role: 'customer', status: 'active', company: '宁波物流有限公司', createdAt: '2024-04-01', lastLogin: '2024-05-29' },
  { id: 8, username: 'customer_qd', name: '周青岛', email: 'zhou@qingdao-cargo.com', phone: '13800138007', role: 'customer', status: 'active', company: '青岛货运代理', createdAt: '2024-04-10', lastLogin: '2024-05-27' }
])

const filteredUsers = computed(() => users.filter(u => {
  if (search.value && !u.username.includes(search.value) && !u.name.includes(search.value) && !u.email.includes(search.value) && !u.phone.includes(search.value)) return false
  if (roleFilter.value && u.role !== roleFilter.value) return false
  if (statusFilter.value && u.status !== statusFilter.value) return false
  return true
}))

function openDialog(row = null) {
  editingUser.value = row
  if (row) {
    Object.assign(form, { username: row.username, name: row.name, email: row.email, phone: row.phone, role: row.role, company: row.company, password: '' })
  } else {
    Object.assign(form, { username: '', name: '', email: '', phone: '', role: 'operator', company: '', password: '' })
  }
  dialogVisible.value = true
}

async function saveUser() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  await new Promise(r => setTimeout(r, 500))
  if (editingUser.value) {
    const idx = users.findIndex(u => u.id === editingUser.value.id)
    if (idx !== -1) Object.assign(users[idx], { name: form.name, email: form.email, phone: form.phone, role: form.role, company: form.company })
    ElMessage.success('用户信息更新成功')
  } else {
    users.push({
      id: Date.now(), status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
      lastLogin: '-',
      ...form
    })
    ElMessage.success('用户创建成功')
  }
  saving.value = false
  dialogVisible.value = false
}

function toggleUser(row) {
  row.status = row.status === 'active' ? 'disabled' : 'active'
  ElMessage.success(row.status === 'active' ? '用户已启用' : '用户已禁用')
}

async function deleteUser(row) {
  if (row.username === 'admin') {
    ElMessage.warning('不能删除超级管理员账号')
    return
  }
  await ElMessageBox.confirm(`确定要删除用户「${row.name}」吗？`, '删除确认', { type: 'warning' }).catch(() => null)
  const idx = users.findIndex(u => u.id === row.id)
  if (idx !== -1) users.splice(idx, 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 16px; }
.page-title { font-size: 20px; font-weight: 700; color: #1a2f45; }
.filter-card { border-radius: 10px; border: 1px solid #e4edf5; }
:deep(.filter-card .el-card__body) { padding: 16px 20px 4px; }
.table-card { border-radius: 10px; border: 1px solid #e4edf5; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
