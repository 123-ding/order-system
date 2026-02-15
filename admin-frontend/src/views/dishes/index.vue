<template>
  <div class="dishes-container">
    <!-- 搜索工具栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入菜品名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>

        <el-form-item label="分类">
          <el-select
            v-model="searchForm.categoryId"
            placeholder="请选择分类"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
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
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增菜品
        </el-button>
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
        
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.image"
              :preview-src-list="[row.image]"
              class="dish-image"
              fit="cover"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="菜品名称" min-width="150" />
        
        <el-table-column prop="categoryName" label="分类" min-width="100" />
        
        <el-table-column label="价格" min-width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        
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

        <el-table-column prop="createdAt" label="创建时间" min-width="160" />

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜品名称" />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            :step="1"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="图片" prop="image">
          <el-upload
            class="dish-uploader"
            :action="uploadAction"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <img v-if="formData.image" :src="formData.image" class="dish-upload-img" />
            <el-icon v-else class="dish-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入菜品描述"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Edit,
  Picture
} from '@element-plus/icons-vue'
import {
  getDishes,
  createDish,
  updateDish,
  deleteDish,
  batchDeleteDishes,
  updateDishStatus,
  getAllCategories
} from '@/api/admin'
import { useUserStore } from '@/store'

const userStore = useUserStore()

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)

const searchForm = reactive({
  keyword: '',
  categoryId: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])
const categories = ref([])
const selectedIds = ref([])

const formData = reactive({
  id: null,
  name: '',
  categoryId: '',
  price: 0,
  image: '',
  description: '',
  status: 1
})

const formRules = {
  name: [
    { required: true, message: '请输入菜品名称', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传菜品图片', trigger: 'change' }
  ]
}

const dialogTitle = computed(() => {
  return formData.id ? '编辑菜品' : '新增菜品'
})

const uploadAction = computed(() => {
  return import.meta.env.VITE_API_BASE_URL + '/admin/upload/image'
})

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${userStore.token}`
  }
})

// 获取菜品列表
const fetchDishes = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const res = await getDishes(params)
    if (res.code === 200) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('获取菜品列表失败')
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getAllCategories()
    if (res.code === 200) {
      categories.value = res.data || []
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchDishes()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.categoryId = ''
  searchForm.status = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  formData.id = null
  formData.name = ''
  formData.categoryId = ''
  formData.price = 0
  formData.image = ''
  formData.description = ''
  formData.status = 1
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  formData.id = row.id
  formData.name = row.name
  formData.categoryId = row.categoryId
  formData.price = row.price
  formData.image = row.image
  formData.description = row.description
  formData.status = row.status
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该菜品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteDish(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchDishes()
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
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个菜品吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await batchDeleteDishes(selectedIds.value)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      selectedIds.value = []
      fetchDishes()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 状态变更
const handleStatusChange = async (row) => {
  try {
    const res = await updateDishStatus(row.id, row.status)
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

// 选择变更
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      const api = formData.id ? updateDish : createDish
      const params = formData.id ? [formData.id, formData] : [formData]
      
      const res = await api(...params)
      if (res.code === 200) {
        ElMessage.success(formData.id ? '更新成功' : '创建成功')
        dialogVisible.value = false
        fetchDishes()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 上传成功
const handleUploadSuccess = (response) => {
  if (response.code === 200) {
    formData.image = response.data.url
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 上传前检查
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

onMounted(() => {
  fetchDishes()
  fetchCategories()
})
</script>

<style scoped lang="scss">
.dishes-container {
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

    .dish-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      cursor: pointer;
    }

    .image-error {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f7fa;
      border-radius: 8px;
      color: #909399;
    }

    .price {
      font-weight: 600;
      color: #f56c6c;
      font-size: 16px;
    }

    .pagination {
      margin-top: 20px;
      justify-content: flex-end;
    }
  }

  .dish-uploader {
    :deep(.el-upload) {
      width: 148px;
      height: 148px;
      border: 1px dashed #d9d9d9;
      border-radius: 8px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;

      &:hover {
        border-color: #409EFF;
      }
    }

    .dish-upload-img {
      width: 148px;
      height: 148px;
      display: block;
      object-fit: cover;
    }

    .dish-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 148px;
      height: 148px;
      line-height: 148px;
      text-align: center;
    }
  }
}
</style>
