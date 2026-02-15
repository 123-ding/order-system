<template>
  <div class="orders-container">
    <!-- 搜索工具栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="订单号/用户名"
            clearable
            style="width: 200px"
            @clear="handleSearch"
          />
        </el-form-item>

        <el-form-item label="订单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="待支付" :value="0" />
            <el-option label="待接单" :value="1" />
            <el-option label="制作中" :value="2" />
            <el-option label="配送中" :value="3" />
            <el-option label="已完成" :value="4" />
            <el-option label="已取消" :value="5" />
          </el-select>
        </el-form-item>

        <el-form-item label="下单时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-label">今日订单</div>
          <div class="stat-value">{{ stats.todayOrders }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">今日销售额</div>
          <div class="stat-value">¥{{ stats.todaySales }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">待处理订单</div>
          <div class="stat-value pending">{{ stats.pendingOrders }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">已完成订单</div>
          <div class="stat-value">{{ stats.completedOrders }}</div>
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单号" min-width="150" fixed="left" />
        
        <el-table-column prop="userName" label="用户" min-width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.userAvatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <span>{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="菜品" min-width="200">
          <template #default="{ row }">
            <div class="dishes-info">
              <div v-for="item in row.items?.slice(0, 2)" :key="item.id" class="dish-item">
                {{ item.dishName }} x{{ item.quantity }}
              </div>
              <div v-if="row.items?.length > 2" class="more-dishes">
                等{{ row.items.length }}个菜品
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="金额" min-width="120">
          <template #default="{ row }">
            <div class="amount-info">
              <div class="total-amount">¥{{ row.totalAmount }}</div>
              <div class="original-amount" v-if="row.originalAmount > row.totalAmount">
                原价: ¥{{ row.originalAmount }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="deliveryAddress" label="配送地址" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="createdAt" label="下单时间" min-width="160" />

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :icon="View" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="success"
              link
              size="small"
              :icon="Check"
              @click="acceptOrder(row)"
            >
              接单
            </el-button>
            <el-button
              v-if="row.status === 2"
              type="warning"
              link
              size="small"
              :icon="Ship"
              @click="deliverOrder(row)"
            >
              配送
            </el-button>
            <el-button
              v-if="[1, 2].includes(row.status)"
              type="danger"
              link
              size="small"
              :icon="Close"
              @click="cancelOrder(row)"
            >
              取消
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

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="700px"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            {{ currentOrder.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户姓名">
            {{ currentOrder.userName }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ currentOrder.userPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="配送地址" :span="2">
            {{ currentOrder.deliveryAddress }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ currentOrder.remark || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="下单时间" :span="2">
            {{ currentOrder.createdAt }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>菜品明细</el-divider>

        <el-table :data="currentOrder.items" border>
          <el-table-column prop="dishName" label="菜品名称" min-width="150" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column label="小计" width="100">
            <template #default="{ row }">
              ¥{{ (row.price * row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="order-summary">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="summary-item">
                <span class="label">商品总额:</span>
                <span class="value">¥{{ currentOrder.originalAmount }}</span>
              </div>
              <div class="summary-item" v-if="currentOrder.discountAmount > 0">
                <span class="label">优惠金额:</span>
                <span class="value discount">-¥{{ currentOrder.discountAmount }}</span>
              </div>
              <div class="summary-item">
                <span class="label">配送费:</span>
                <span class="value">¥{{ currentOrder.deliveryFee || 0 }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="total-amount-box">
                <div class="label">实付金额</div>
                <div class="amount">¥{{ currentOrder.totalAmount }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>

    <!-- 取消订单对话框 -->
    <el-dialog
      v-model="cancelVisible"
      title="取消订单"
      width="500px"
    >
      <el-form :model="cancelForm" label-width="80px">
        <el-form-item label="取消原因">
          <el-input
            v-model="cancelForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入取消原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmCancel">确定取消</el-button>
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
  Check,
  Close,
  Ship,
  UserFilled
} from '@element-plus/icons-vue'
import {
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  cancelOrder as cancelOrderApi
} from '@/api/admin'

const loading = ref(false)
const detailVisible = ref(false)
const cancelVisible = ref(false)

const searchForm = reactive({
  keyword: '',
  status: '',
  startDate: '',
  endDate: ''
})

const dateRange = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const stats = reactive({
  todayOrders: 0,
  todaySales: 0,
  pendingOrders: 0,
  completedOrders: 0
})

const tableData = ref([])
const currentOrder = ref(null)

const cancelForm = reactive({
  orderId: null,
  reason: ''
})

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const res = await getOrders(params)
    if (res.code === 200) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
      
      // 更新统计数据
      if (res.data.stats) {
        Object.assign(stats, res.data.stats)
      }
    }
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    searchForm.startDate = dateRange.value[0]
    searchForm.endDate = dateRange.value[1]
  } else {
    searchForm.startDate = ''
    searchForm.endDate = ''
  }
  pagination.page = 1
  fetchOrders()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.startDate = ''
  searchForm.endDate = ''
  dateRange.value = []
  handleSearch()
}

// 查看详情
const viewDetail = async (row) => {
  try {
    const res = await getOrderDetail(row.id)
    if (res.code === 200) {
      currentOrder.value = res.data
      detailVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取订单详情失败')
  }
}

// 接单
const acceptOrder = async (row) => {
  try {
    await ElMessageBox.confirm('确定要接受该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    const res = await updateOrderStatus(row.id, 2)
    if (res.code === 200) {
      ElMessage.success('接单成功')
      fetchOrders()
    } else {
      ElMessage.error(res.message || '接单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('接单失败')
    }
  }
}

// 配送
const deliverOrder = async (row) => {
  try {
    await ElMessageBox.confirm('确定要开始配送该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    const res = await updateOrderStatus(row.id, 3)
    if (res.code === 200) {
      ElMessage.success('已开始配送')
      fetchOrders()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 取消订单
const cancelOrder = (row) => {
  cancelForm.orderId = row.id
  cancelForm.reason = ''
  cancelVisible.value = true
}

// 确认取消
const confirmCancel = async () => {
  if (!cancelForm.reason.trim()) {
    ElMessage.warning('请输入取消原因')
    return
  }

  try {
    const res = await cancelOrderApi(cancelForm.orderId, cancelForm.reason)
    if (res.code === 200) {
      ElMessage.success('订单已取消')
      cancelVisible.value = false
      fetchOrders()
    } else {
      ElMessage.error(res.message || '取消失败')
    }
  } catch (error) {
    ElMessage.error('取消失败')
  }
}

// 状态类型
const getStatusType = (status) => {
  const types = {
    0: 'info',
    1: 'warning',
    2: 'primary',
    3: '',
    4: 'success',
    5: 'danger'
  }
  return types[status] || 'info'
}

// 状态文本
const getStatusText = (status) => {
  const texts = {
    0: '待支付',
    1: '待接单',
    2: '制作中',
    3: '配送中',
    4: '已完成',
    5: '已取消'
  }
  return texts[status] || '未知'
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped lang="scss">
.orders-container {
  .search-card {
    margin-bottom: 20px;
    border-radius: 12px;

    .search-form {
      margin-bottom: 0;
    }

    .stats-bar {
      display: flex;
      gap: 20px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;

      .stat-item {
        flex: 1;
        padding: 12px;
        background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
        border-radius: 8px;
        text-align: center;

        .stat-label {
          font-size: 13px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 600;
          color: #303133;

          &.pending {
            color: #f56c6c;
          }
        }
      }
    }
  }

  .table-card {
    border-radius: 12px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;

      span {
        font-size: 14px;
      }
    }

    .dishes-info {
      .dish-item {
        font-size: 13px;
        color: #606266;
        margin-bottom: 4px;
      }

      .more-dishes {
        font-size: 12px;
        color: #909399;
      }
    }

    .amount-info {
      .total-amount {
        font-size: 16px;
        font-weight: 600;
        color: #f56c6c;
      }

      .original-amount {
        font-size: 12px;
        color: #909399;
        text-decoration: line-through;
      }
    }

    .pagination {
      margin-top: 20px;
      justify-content: flex-end;
    }
  }

  .order-detail {
    .order-summary {
      margin-top: 20px;
      padding: 20px;
      background-color: #f5f7fa;
      border-radius: 8px;

      .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 14px;

        .label {
          color: #606266;
        }

        .value {
          font-weight: 500;
          color: #303133;

          &.discount {
            color: #67c23a;
          }
        }
      }

      .total-amount-box {
        text-align: right;

        .label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .amount {
          font-size: 28px;
          font-weight: 600;
          color: #f56c6c;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .stats-bar {
    flex-wrap: wrap;

    .stat-item {
      min-width: calc(50% - 10px);
    }
  }
}
</style>
