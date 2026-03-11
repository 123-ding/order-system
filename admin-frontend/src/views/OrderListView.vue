<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <h2 class="page-title">📦 订单管理</h2>
    </div>

    <!-- Filter Bar -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filters" inline>
        <el-form-item label="订单号">
          <el-input v-model="filters.orderNo" placeholder="输入订单号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 130px">
            <el-option
              v-for="(val, key) in ORDER_STATUS"
              :key="key"
              :label="val.label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="起始港">
          <el-select v-model="filters.origin" placeholder="全部港口" clearable style="width: 130px">
            <el-option v-for="p in PORTS" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table Card -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <span class="record-count">共 <strong>{{ filteredOrders.length }}</strong> 条记录</span>
          <el-button type="primary" :icon="Plus" @click="openDialog()">新建订单</el-button>
        </div>
      </template>

      <el-table :data="pagedOrders" stripe border style="width: 100%" v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" width="165" fixed />
        <el-table-column prop="customer" label="客户" width="110" />
        <el-table-column prop="origin" label="起始港" width="100" />
        <el-table-column prop="destination" label="目的港" width="100" />
        <el-table-column prop="cargo" label="货物类型" width="100" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="ORDER_STATUS[row.status]?.type" size="small">
              {{ ORDER_STATUS[row.status]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vessel" label="船舶" width="110" />
        <el-table-column prop="weight" label="重量(吨)" width="100" align="right" />
        <el-table-column prop="freight" label="运费(元)" width="120" align="right">
          <template #default="{ row }">
            <span class="freight-text">{{ row.freight.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="120" />
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="$router.push(`/orders/${row.id}`)">查看</el-button>
            <el-button type="warning" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="deleteOrder(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredOrders.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingOrder ? '编辑订单' : '新建订单'"
      width="680px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customer">
              <el-input v-model="form.customer" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货物类型" prop="cargo">
              <el-select v-model="form.cargo" placeholder="请选择" style="width: 100%">
                <el-option v-for="t in CARGO_TYPES" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="起始港" prop="origin">
              <el-select v-model="form.origin" placeholder="请选择" style="width: 100%">
                <el-option v-for="p in PORTS" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目的港" prop="destination">
              <el-select v-model="form.destination" placeholder="请选择" style="width: 100%">
                <el-option v-for="p in PORTS" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="使用船舶" prop="vessel">
              <el-select v-model="form.vessel" placeholder="请选择" style="width: 100%">
                <el-option v-for="v in vessels" :key="v" :label="v" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货物重量" prop="weight">
              <el-input-number v-model="form.weight" :min="1" :max="99999" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="运费(元)" prop="freight">
              <el-input-number v-model="form.freight" :min="0" :step="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="(val, key) in ORDER_STATUS"
                  :key="key"
                  :label="val.label"
                  :value="key"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选备注信息" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveOrder">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ORDER_STATUS, PORTS, CARGO_TYPES } from '@/utils/constants'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingOrder = ref(null)
const formRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

const vessels = ['东方之星', '海上丝路', '太平洋号', '远洋一号', '蓝海骑士', '海峡使者']

const filters = reactive({ orderNo: '', status: '', origin: '', dateRange: null })

const form = reactive({
  customer: '', cargo: '', origin: '', destination: '',
  vessel: '', weight: 100, freight: 10000, status: 'pending', remark: ''
})

const rules = {
  customer: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  cargo: [{ required: true, message: '请选择货物类型', trigger: 'change' }],
  origin: [{ required: true, message: '请选择起始港', trigger: 'change' }],
  destination: [{ required: true, message: '请选择目的港', trigger: 'change' }],
  vessel: [{ required: true, message: '请选择船舶', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const mockOrders = reactive([
  { id: 1, orderNo: 'ORD-2024-001284', customer: '远洋贸易有限公司', origin: '上海港', destination: '广州港', cargo: '集装箱', vessel: '东方之星', weight: 1200, status: 'in_transit', freight: 48500, createdAt: '2024-06-01' },
  { id: 2, orderNo: 'ORD-2024-001283', customer: '华南物流集团', origin: '深圳港', destination: '青岛港', cargo: '散货', vessel: '海上丝路', weight: 3400, status: 'loading', freight: 32000, createdAt: '2024-06-01' },
  { id: 3, orderNo: 'ORD-2024-001282', customer: '北方运输公司', origin: '天津港', destination: '上海港', cargo: '液体货', vessel: '太平洋号', weight: 2100, status: 'confirmed', freight: 65200, createdAt: '2024-05-31' },
  { id: 4, orderNo: 'ORD-2024-001281', customer: '东海航运有限公司', origin: '宁波港', destination: '大连港', cargo: '滚装货物', vessel: '远洋一号', weight: 890, status: 'arrived', freight: 28800, createdAt: '2024-05-31' },
  { id: 5, orderNo: 'ORD-2024-001280', customer: '福建货运集团', origin: '福州港', destination: '天津港', cargo: '集装箱', vessel: '蓝海骑士', weight: 1560, status: 'completed', freight: 54100, createdAt: '2024-05-30' },
  { id: 6, orderNo: 'ORD-2024-001279', customer: '南海航线有限公司', origin: '广州港', destination: '宁波港', cargo: '冷藏货', vessel: '海峡使者', weight: 620, status: 'pending', freight: 38600, createdAt: '2024-05-30' },
  { id: 7, orderNo: 'ORD-2024-001278', customer: '中远集运', origin: '青岛港', destination: '深圳港', cargo: '集装箱', vessel: '东方之星', weight: 2800, status: 'in_transit', freight: 72400, createdAt: '2024-05-29' },
  { id: 8, orderNo: 'ORD-2024-001277', customer: '大连港务集团', origin: '大连港', destination: '上海港', cargo: '散货', vessel: '海上丝路', weight: 4100, status: 'completed', freight: 41300, createdAt: '2024-05-29' },
  { id: 9, orderNo: 'ORD-2024-001276', customer: '厦门远洋运输', origin: '厦门港', destination: '天津港', cargo: '危险品', vessel: '太平洋号', weight: 350, status: 'cancelled', freight: 98000, createdAt: '2024-05-28' },
  { id: 10, orderNo: 'ORD-2024-001275', customer: '武汉内河航运', origin: '武汉港', destination: '上海港', cargo: '散货', vessel: '远洋一号', weight: 5200, status: 'confirmed', freight: 26800, createdAt: '2024-05-28' },
  { id: 11, orderNo: 'ORD-2024-001274', customer: '上海集装箱公司', origin: '上海港', destination: '福州港', cargo: '集装箱', vessel: '蓝海骑士', weight: 980, status: 'in_transit', freight: 22400, createdAt: '2024-05-27' },
  { id: 12, orderNo: 'ORD-2024-001273', customer: '深圳货运代理', origin: '深圳港', destination: '宁波港', cargo: '液体货', vessel: '海峡使者', weight: 1750, status: 'loading', freight: 58900, createdAt: '2024-05-27' }
])

const filteredOrders = computed(() => {
  return mockOrders.filter(o => {
    if (filters.orderNo && !o.orderNo.includes(filters.orderNo)) return false
    if (filters.status && o.status !== filters.status) return false
    if (filters.origin && o.origin !== filters.origin) return false
    return true
  })
})

const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredOrders.value.slice(start, start + pageSize.value)
})

function handleSearch() {
  currentPage.value = 1
}

function resetFilters() {
  filters.orderNo = ''
  filters.status = ''
  filters.origin = ''
  filters.dateRange = null
  currentPage.value = 1
}

function openDialog(row = null) {
  editingOrder.value = row
  if (row) {
    Object.assign(form, { ...row })
  } else {
    Object.assign(form, {
      customer: '', cargo: '', origin: '', destination: '',
      vessel: '', weight: 100, freight: 10000, status: 'pending', remark: ''
    })
  }
  dialogVisible.value = true
}

async function saveOrder() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  await new Promise(r => setTimeout(r, 600))

  if (editingOrder.value) {
    const idx = mockOrders.findIndex(o => o.id === editingOrder.value.id)
    if (idx !== -1) Object.assign(mockOrders[idx], { ...form })
    ElMessage.success('订单更新成功')
  } else {
    const newId = Math.max(...mockOrders.map(o => o.id)) + 1
    const pad = String(1284 + newId).padStart(6, '0')
    mockOrders.unshift({
      id: newId,
      orderNo: `ORD-2024-${pad}`,
      createdAt: new Date().toISOString().slice(0, 10),
      ...form
    })
    ElMessage.success('订单创建成功')
  }
  saving.value = false
  dialogVisible.value = false
}

async function deleteOrder(row) {
  await ElMessageBox.confirm(`确定要删除订单 ${row.orderNo} 吗？`, '删除确认', {
    type: 'warning'
  }).catch(() => null)
  const idx = mockOrders.findIndex(o => o.id === row.id)
  if (idx !== -1) mockOrders.splice(idx, 1)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a2f45;
}

.filter-card {
  border-radius: 10px;
  border: 1px solid #e4edf5;
}

:deep(.filter-card .el-card__body) {
  padding: 16px 20px 4px;
}

.table-card {
  border-radius: 10px;
  border: 1px solid #e4edf5;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.record-count {
  font-size: 13px;
  color: #6a8aaa;
}

.freight-text {
  color: #0d6e4f;
  font-weight: 500;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
