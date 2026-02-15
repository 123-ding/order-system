<template>
  <div class="reviews-container">
    <!-- 搜索工具栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="菜品名称">
          <el-input
            v-model="searchForm.dishName"
            placeholder="请输入菜品名称"
            clearable
            style="width: 200px"
            @clear="handleSearch"
          />
        </el-form-item>

        <el-form-item label="评分">
          <el-select
            v-model="searchForm.rating"
            placeholder="请选择评分"
            clearable
            style="width: 150px"
          >
            <el-option label="5星" :value="5" />
            <el-option label="4星" :value="4" />
            <el-option label="3星" :value="3" />
            <el-option label="2星" :value="2" />
            <el-option label="1星" :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="toolbar">
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
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

        <el-table-column prop="dishName" label="菜品名称" min-width="150" />
        
        <el-table-column label="评分" width="120">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled show-score />
          </template>
        </el-table-column>

        <el-table-column prop="content" label="评价内容" min-width="250" show-overflow-tooltip />

        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <div v-if="row.images && row.images.length > 0" class="review-images">
              <el-image
                v-for="(img, index) in row.images.slice(0, 3)"
                :key="index"
                :src="img"
                :preview-src-list="row.images"
                class="review-image"
                fit="cover"
              />
              <span v-if="row.images.length > 3" class="more-images">
                +{{ row.images.length - 3 }}
              </span>
            </div>
            <span v-else class="no-images">无</span>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="评价时间" min-width="160" />

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link size="small" :icon="Delete" @click="handleDelete(row)">
              删除
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Delete,
  UserFilled
} from '@element-plus/icons-vue'
import {
  getReviews,
  deleteReview,
  batchDeleteReviews
} from '@/api/admin'

const loading = ref(false)

const searchForm = reactive({
  dishName: '',
  rating: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])
const selectedIds = ref([])

// 获取评价列表
const fetchReviews = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const res = await getReviews(params)
    if (res.code === 200) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('获取评价列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchReviews()
}

// 重置
const handleReset = () => {
  searchForm.dishName = ''
  searchForm.rating = ''
  handleSearch()
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该评价吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteReview(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchReviews()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条评价吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await batchDeleteReviews(selectedIds.value)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      selectedIds.value = []
      fetchReviews()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 选择变更
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped lang="scss">
.reviews-container {
  .search-card {
    margin-bottom: 20px;
    border-radius: 12px;

    .search-form {
      margin-bottom: 0;
    }

    .toolbar {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
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

    .review-images {
      display: flex;
      gap: 4px;
      align-items: center;

      .review-image {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        cursor: pointer;
      }

      .more-images {
        font-size: 12px;
        color: #909399;
      }
    }

    .no-images {
      color: #909399;
      font-size: 12px;
    }

    .pagination {
      margin-top: 20px;
      justify-content: flex-end;
    }
  }
}
</style>
