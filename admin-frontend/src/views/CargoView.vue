<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">📋 货物管理</h2>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="货物编号">
          <el-input v-model="search" placeholder="搜索货物编号/描述" clearable style="width: 200px" :prefix-icon="Search" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="typeFilter" placeholder="全部类型" clearable style="width: 130px">
            <el-option v-for="t in CARGO_TYPES" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 130px">
            <el-option v-for="(val, key) in CARGO_STATUS" :key="key" :label="val.label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Plus" @click="openDialog()">新增货物</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <span class="record-count">共 <strong>{{ filteredCargo.length }}</strong> 条</span>
        </div>
      </template>
      <el-table :data="filteredCargo" stripe border>
        <el-table-column prop="cargoNo" label="货物编号" width="160" />
        <el-table-column prop="orderNo" label="所属订单" width="165">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="$router.push(`/orders/${row.orderId}`)">
              {{ row.orderNo }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="货物描述" min-width="160" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(吨)" width="110" align="right" />
        <el-table-column prop="volume" label="体积(m³)" width="110" align="right" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="CARGO_STATUS[row.status]?.type" size="small">
              {{ CARGO_STATUS[row.status]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="origin" label="起始港" width="100" />
        <el-table-column prop="destination" label="目的港" width="100" />
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="deleteCargo(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredCargo.length"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingCargo ? '编辑货物' : '新增货物'"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="货物描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入货物描述" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="货物类型" prop="type">
              <el-select v-model="form.type" style="width: 100%">
                <el-option v-for="t in CARGO_TYPES" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option v-for="(val, key) in CARGO_STATUS" :key="key" :label="val.label" :value="key" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="重量(吨)" prop="weight">
              <el-input-number v-model="form.weight" :min="0.1" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体积(m³)">
              <el-input-number v-model="form.volume" :min="0.1" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveCargo">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { CARGO_STATUS, CARGO_TYPES } from '@/utils/constants'

const search = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const editingCargo = ref(null)
const saving = ref(false)
const formRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

const form = reactive({ description: '', type: '', status: 'pending', weight: 100, volume: 120 })

const rules = {
  description: [{ required: true, message: '请输入货物描述', trigger: 'blur' }],
  type: [{ required: true, message: '请选择货物类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const cargoList = reactive([
  { id: 1, cargoNo: 'CGO-2024-001128', orderId: 1, orderNo: 'ORD-2024-001284', description: '电子设备整柜', type: '集装箱', weight: 18.5, volume: 33.2, status: 'in_transit', origin: '上海港', destination: '广州港' },
  { id: 2, cargoNo: 'CGO-2024-001127', orderId: 2, orderNo: 'ORD-2024-001283', description: '大豆散货', type: '散货', weight: 3400, volume: 4200, status: 'loaded', origin: '深圳港', destination: '青岛港' },
  { id: 3, cargoNo: 'CGO-2024-001126', orderId: 3, orderNo: 'ORD-2024-001282', description: '原油', type: '液体货', weight: 2100, volume: 2450, status: 'in_transit', origin: '天津港', destination: '上海港' },
  { id: 4, cargoNo: 'CGO-2024-001125', orderId: 4, orderNo: 'ORD-2024-001281', description: '汽车整车', type: '滚装货物', weight: 890, volume: 1200, status: 'unloading', origin: '宁波港', destination: '大连港' },
  { id: 5, cargoNo: 'CGO-2024-001124', orderId: 5, orderNo: 'ORD-2024-001280', description: '服装纺织品', type: '集装箱', weight: 1560, volume: 2800, status: 'delivered', origin: '福州港', destination: '天津港' },
  { id: 6, cargoNo: 'CGO-2024-001123', orderId: 6, orderNo: 'ORD-2024-001279', description: '冷冻海鲜', type: '冷藏货', weight: 620, volume: 780, status: 'pending', origin: '广州港', destination: '宁波港' },
  { id: 7, cargoNo: 'CGO-2024-001122', orderId: 7, orderNo: 'ORD-2024-001278', description: '机械设备', type: '集装箱', weight: 2800, volume: 3100, status: 'in_transit', origin: '青岛港', destination: '深圳港' },
  { id: 8, cargoNo: 'CGO-2024-001121', orderId: 8, orderNo: 'ORD-2024-001277', description: '铁矿石', type: '散货', weight: 4100, volume: 5200, status: 'delivered', origin: '大连港', destination: '上海港' },
  { id: 9, cargoNo: 'CGO-2024-001120', orderId: 10, orderNo: 'ORD-2024-001275', description: '化肥散货', type: '散货', weight: 5200, volume: 6100, status: 'loaded', origin: '武汉港', destination: '上海港' },
  { id: 10, cargoNo: 'CGO-2024-001119', orderId: 11, orderNo: 'ORD-2024-001274', description: '日用品杂货', type: '集装箱', weight: 980, volume: 1650, status: 'in_transit', origin: '上海港', destination: '福州港' }
])

const filteredCargo = computed(() => cargoList.filter(c => {
  if (search.value && !c.cargoNo.includes(search.value) && !c.description.includes(search.value)) return false
  if (typeFilter.value && c.type !== typeFilter.value) return false
  if (statusFilter.value && c.status !== statusFilter.value) return false
  return true
}))

function openDialog(row = null) {
  editingCargo.value = row
  if (row) {
    Object.assign(form, { description: row.description, type: row.type, status: row.status, weight: row.weight, volume: row.volume })
  } else {
    Object.assign(form, { description: '', type: '', status: 'pending', weight: 100, volume: 120 })
  }
  dialogVisible.value = true
}

async function saveCargo() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  await new Promise(r => setTimeout(r, 500))
  if (editingCargo.value) {
    const idx = cargoList.findIndex(c => c.id === editingCargo.value.id)
    if (idx !== -1) Object.assign(cargoList[idx], { ...form })
    ElMessage.success('货物信息更新成功')
  } else {
    const newId = Math.max(...cargoList.map(c => c.id)) + 1
    const pad = String(1128 + newId).padStart(6, '0')
    cargoList.unshift({ id: newId, cargoNo: `CGO-2024-${pad}`, orderId: 0, orderNo: '-', origin: '-', destination: '-', ...form })
    ElMessage.success('货物添加成功')
  }
  saving.value = false
  dialogVisible.value = false
}

async function deleteCargo(row) {
  await ElMessageBox.confirm(`确定要删除货物「${row.cargoNo}」吗？`, '删除确认', { type: 'warning' }).catch(() => null)
  const idx = cargoList.findIndex(c => c.id === row.id)
  if (idx !== -1) cargoList.splice(idx, 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 16px; }
.page-title { font-size: 20px; font-weight: 700; color: #1a2f45; }
.filter-card { border-radius: 10px; border: 1px solid #e4edf5; }
:deep(.filter-card .el-card__body) { padding: 16px 20px 4px; }
.table-card { border-radius: 10px; border: 1px solid #e4edf5; }
.table-header { display: flex; align-items: center; justify-content: space-between; }
.record-count { font-size: 13px; color: #6a8aaa; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
