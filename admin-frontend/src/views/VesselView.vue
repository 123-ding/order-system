<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">🚢 船舶管理</h2>
    </div>

    <!-- Filter Bar -->
    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="船名">
          <el-input v-model="search" placeholder="输入船名搜索" clearable style="width: 180px" :prefix-icon="Search" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 130px">
            <el-option v-for="(val, key) in VESSEL_STATUS" :key="key" :label="val.label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Plus" @click="openDialog()">添加船舶</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Vessel Cards -->
    <el-row :gutter="20">
      <el-col :span="8" v-for="vessel in filteredVessels" :key="vessel.id" class="vessel-col">
        <el-card class="vessel-card" shadow="hover">
          <div class="vessel-header">
            <div class="vessel-icon">🚢</div>
            <div class="vessel-name-wrap">
              <div class="vessel-name">{{ vessel.name }}</div>
              <el-tag :type="VESSEL_STATUS[vessel.status]?.type" size="small">
                {{ VESSEL_STATUS[vessel.status]?.label }}
              </el-tag>
            </div>
          </div>
          <el-divider style="margin: 12px 0" />
          <div class="vessel-info">
            <div class="info-row">
              <span class="info-label">⚓ 注册号</span>
              <span class="info-value">{{ vessel.regNo }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">📋 类型</span>
              <span class="info-value">{{ vessel.type }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">⚖️ 载重吨</span>
              <span class="info-value">{{ vessel.dwt.toLocaleString() }} DWT</span>
            </div>
            <div class="info-row">
              <span class="info-label">📏 船长</span>
              <span class="info-value">{{ vessel.length }} 米</span>
            </div>
            <div class="info-row">
              <span class="info-label">📍 当前位置</span>
              <span class="info-value location">{{ vessel.location }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🏳️ 船旗</span>
              <span class="info-value">{{ vessel.flag }}</span>
            </div>
          </div>
          <div class="vessel-actions">
            <el-button size="small" type="primary" plain @click="openDialog(vessel)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="deleteVessel(vessel)">删除</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingVessel ? '编辑船舶' : '添加船舶'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="船名" prop="name">
              <el-input v-model="form.name" placeholder="请输入船名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-select v-model="form.type" style="width: 100%">
                <el-option v-for="t in vesselTypes" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="注册号" prop="regNo">
              <el-input v-model="form.regNo" placeholder="IMO 注册号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="载重吨" prop="dwt">
              <el-input-number v-model="form.dwt" :min="100" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="船长(米)" prop="length">
              <el-input-number v-model="form.length" :min="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="船旗" prop="flag">
              <el-input v-model="form.flag" placeholder="船旗国" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="当前位置" prop="location">
              <el-input v-model="form.location" placeholder="当前停靠/所在位置" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option v-for="(val, key) in VESSEL_STATUS" :key="key" :label="val.label" :value="key" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveVessel">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { VESSEL_STATUS } from '@/utils/constants'

const search = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const editingVessel = ref(null)
const saving = ref(false)
const formRef = ref(null)

const vesselTypes = ['集装箱船', '散货船', '油轮', '液化气船', '滚装船', '冷藏船', '多用途船']

const form = reactive({
  name: '', type: '', regNo: '', dwt: 5000, length: 150, flag: '中国', location: '', status: 'available'
})

const rules = {
  name: [{ required: true, message: '请输入船名', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  regNo: [{ required: true, message: '请输入注册号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const vessels = reactive([
  { id: 1, name: '东方之星', type: '集装箱船', regNo: 'IMO9876543', dwt: 28000, length: 220, flag: '中国', status: 'at_sea', location: '东海 (30.2°N, 122.8°E)' },
  { id: 2, name: '海上丝路', type: '散货船', regNo: 'IMO9765432', dwt: 45000, length: 260, flag: '中国', status: 'loading', location: '上海港' },
  { id: 3, name: '太平洋号', type: '油轮', regNo: 'IMO9654321', dwt: 80000, length: 300, flag: '中国', status: 'available', location: '宁波港' },
  { id: 4, name: '远洋一号', type: '多用途船', regNo: 'IMO9543210', dwt: 12000, length: 160, flag: '中国', status: 'docked', location: '广州港' },
  { id: 5, name: '蓝海骑士', type: '滚装船', regNo: 'IMO9432109', dwt: 18000, length: 200, flag: '中国', status: 'at_sea', location: '南海 (20.5°N, 115.3°E)' },
  { id: 6, name: '海峡使者', type: '冷藏船', regNo: 'IMO9321098', dwt: 9500, length: 145, flag: '中国', status: 'maintenance', location: '天津港干坞' }
])

const filteredVessels = computed(() => vessels.filter(v => {
  if (search.value && !v.name.includes(search.value)) return false
  if (statusFilter.value && v.status !== statusFilter.value) return false
  return true
}))

function openDialog(row = null) {
  editingVessel.value = row
  if (row) {
    Object.assign(form, { ...row })
  } else {
    Object.assign(form, { name: '', type: '', regNo: '', dwt: 5000, length: 150, flag: '中国', location: '', status: 'available' })
  }
  dialogVisible.value = true
}

async function saveVessel() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  await new Promise(r => setTimeout(r, 500))
  if (editingVessel.value) {
    const idx = vessels.findIndex(v => v.id === editingVessel.value.id)
    if (idx !== -1) Object.assign(vessels[idx], { ...form })
    ElMessage.success('船舶信息更新成功')
  } else {
    vessels.push({ id: Date.now(), ...form })
    ElMessage.success('船舶添加成功')
  }
  saving.value = false
  dialogVisible.value = false
}

async function deleteVessel(row) {
  await ElMessageBox.confirm(`确定要删除船舶「${row.name}」吗？`, '删除确认', { type: 'warning' }).catch(() => null)
  const idx = vessels.findIndex(v => v.id === row.id)
  if (idx !== -1) vessels.splice(idx, 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 16px; }
.page-title { font-size: 20px; font-weight: 700; color: #1a2f45; }
.filter-card { border-radius: 10px; border: 1px solid #e4edf5; }
:deep(.filter-card .el-card__body) { padding: 16px 20px 4px; }
.vessel-col { margin-bottom: 20px; }

.vessel-card {
  border-radius: 12px;
  border: 1px solid #e4edf5;
  transition: transform 0.2s;
}
.vessel-card:hover { transform: translateY(-3px); }

.vessel-header { display: flex; align-items: center; gap: 12px; }
.vessel-icon { font-size: 36px; }
.vessel-name { font-size: 17px; font-weight: 600; color: #1a2f45; margin-bottom: 4px; }

.vessel-info { display: flex; flex-direction: column; gap: 8px; }
.info-row { display: flex; justify-content: space-between; align-items: center; }
.info-label { font-size: 12px; color: #8a9bb0; }
.info-value { font-size: 13px; color: #2c3e50; font-weight: 500; }
.info-value.location { color: #1a6eb0; }

.vessel-actions { display: flex; gap: 8px; margin-top: 14px; justify-content: flex-end; }
</style>
