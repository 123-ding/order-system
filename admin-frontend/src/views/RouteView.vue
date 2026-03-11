<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">🗺️ 航线管理</h2>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="航线名称">
          <el-input v-model="search" placeholder="搜索航线" clearable style="width: 200px" :prefix-icon="Search" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Plus" @click="openDialog()">新增航线</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="filteredRoutes" stripe border>
        <el-table-column type="index" label="#" width="55" />
        <el-table-column prop="name" label="航线名称" width="160" />
        <el-table-column prop="origin" label="起始港" width="110" />
        <el-table-column prop="destination" label="目的港" width="110" />
        <el-table-column prop="distance" label="距离(海里)" width="120" align="right">
          <template #default="{ row }">
            {{ row.distance.toLocaleString() }} NM
          </template>
        </el-table-column>
        <el-table-column prop="days" label="预计天数" width="100" align="center">
          <template #default="{ row }">{{ row.days }} 天</template>
        </el-table-column>
        <el-table-column prop="rate" label="运费率(元/吨)" width="140" align="right">
          <template #default="{ row }">
            <span class="rate-text">{{ row.rate.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="途经港" min-width="180">
          <template #default="{ row }">
            <el-tag v-for="p in row.waypoints" :key="p" size="small" type="info" style="margin-right: 4px">{{ p }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.active ? 'success' : 'info'" size="small">
              {{ row.active ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button link :type="row.active ? 'warning' : 'success'" size="small" @click="toggleRoute(row)">
              {{ row.active ? '停用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="deleteRoute(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingRoute ? '编辑航线' : '新增航线'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="航线名称" prop="name">
          <el-input v-model="form.name" placeholder="例：上海-广州航线" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="起始港" prop="origin">
              <el-select v-model="form.origin" style="width: 100%">
                <el-option v-for="p in PORTS" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目的港" prop="destination">
              <el-select v-model="form.destination" style="width: 100%">
                <el-option v-for="p in PORTS" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="距离(海里)" prop="distance">
              <el-input-number v-model="form.distance" :min="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计天数" prop="days">
              <el-input-number v-model="form.days" :min="1" :max="90" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="运费率(元/吨)" prop="rate">
          <el-input-number v-model="form.rate" :min="1" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.active" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveRoute">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { PORTS } from '@/utils/constants'

const search = ref('')
const dialogVisible = ref(false)
const editingRoute = ref(null)
const saving = ref(false)
const formRef = ref(null)

const form = reactive({ name: '', origin: '', destination: '', distance: 500, days: 3, rate: 50, active: true })

const rules = {
  name: [{ required: true, message: '请输入航线名称', trigger: 'blur' }],
  origin: [{ required: true, message: '请选择起始港', trigger: 'change' }],
  destination: [{ required: true, message: '请选择目的港', trigger: 'change' }]
}

const routes = reactive([
  { id: 1, name: '沪穗集装箱快线', origin: '上海港', destination: '广州港', distance: 1050, days: 4, rate: 85, waypoints: ['厦门港'], active: true },
  { id: 2, name: '环渤海散货航线', origin: '天津港', destination: '大连港', distance: 320, days: 1, rate: 45, waypoints: [], active: true },
  { id: 3, name: '东南沿海油品线', origin: '宁波港', destination: '深圳港', distance: 780, days: 3, rate: 120, waypoints: ['福州港'], active: true },
  { id: 4, name: '北方干散货航线', origin: '青岛港', destination: '天津港', distance: 280, days: 1, rate: 38, waypoints: [], active: true },
  { id: 5, name: '东南集装箱干线', origin: '上海港', destination: '厦门港', distance: 560, days: 2, rate: 72, waypoints: ['宁波港'], active: false },
  { id: 6, name: '西南沿海综合线', origin: '广州港', destination: '福州港', distance: 490, days: 2, rate: 65, waypoints: [], active: true }
])

const filteredRoutes = computed(() => routes.filter(r =>
  !search.value || r.name.includes(search.value) || r.origin.includes(search.value) || r.destination.includes(search.value)
))

function openDialog(row = null) {
  editingRoute.value = row
  if (row) {
    Object.assign(form, { name: row.name, origin: row.origin, destination: row.destination, distance: row.distance, days: row.days, rate: row.rate, active: row.active })
  } else {
    Object.assign(form, { name: '', origin: '', destination: '', distance: 500, days: 3, rate: 50, active: true })
  }
  dialogVisible.value = true
}

async function saveRoute() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  await new Promise(r => setTimeout(r, 500))
  if (editingRoute.value) {
    const idx = routes.findIndex(r => r.id === editingRoute.value.id)
    if (idx !== -1) Object.assign(routes[idx], { ...form })
    ElMessage.success('航线更新成功')
  } else {
    routes.push({ id: Date.now(), waypoints: [], ...form })
    ElMessage.success('航线添加成功')
  }
  saving.value = false
  dialogVisible.value = false
}

function toggleRoute(row) {
  row.active = !row.active
  ElMessage.success(row.active ? '航线已启用' : '航线已停用')
}

async function deleteRoute(row) {
  await ElMessageBox.confirm(`确定要删除「${row.name}」吗？`, '删除确认', { type: 'warning' }).catch(() => null)
  const idx = routes.findIndex(r => r.id === row.id)
  if (idx !== -1) routes.splice(idx, 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 16px; }
.page-title { font-size: 20px; font-weight: 700; color: #1a2f45; }
.filter-card { border-radius: 10px; border: 1px solid #e4edf5; }
:deep(.filter-card .el-card__body) { padding: 16px 20px 4px; }
.table-card { border-radius: 10px; border: 1px solid #e4edf5; }
.rate-text { color: #0d6e4f; font-weight: 600; }
</style>
