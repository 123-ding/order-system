<template>
  <div class="categories-container">
    <!-- 搜索工具栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入分类名称"
            clearable
            @clear="handleSearch"
          />
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
          新增分类
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column label="图标" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.icon"
              :src="row.icon"
              :preview-src-list="[row.icon]"
              class="category-icon"
              fit="cover"
            >
              <template #error>
                <div class="icon-error">
                  <el-icon><Grid /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="icon-error">
              <el-icon><Grid /></el-icon>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="分类名称" min-width="150" />
        
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="sort" label="排序" width="100" />
        
        <el-table-column label="菜品数量" width="120">
          <template #default="{ row }">
            <el-tag type="info">{{ row.dishCount || 0 }} 个</el-tag>
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
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            :min="0"
            :max="9999"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-upload
            class="category-uploader"
            :action="uploadAction"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <img v-if="formData.icon" :src="formData.icon" class="category-upload-img" />
            <el-icon v-else class="category-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸: 200x200 像素</div>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分类描述"
          />
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
  Grid
} from '@element-plus/icons-vue'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/api/admin'
import { useUserStore } from '@/store'

const userStore = useUserStore()

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)

const searchForm = reactive({
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const formData = reactive({
  id: null,
  name: '',
  icon: '',
  description: '',
  sort: 0
})

const formRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => {
  return formData.id ? '编辑分类' : '新增分类'
})

const uploadAction = computed(() => {
  return import.meta.env.VITE_API_BASE_URL + '/admin/upload/image'
})

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${userStore.token}`
  }
})

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const res = await getCategories(params)
    if (res.code === 200) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchCategories()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  formData.id = null
  formData.name = ''
  formData.icon = ''
  formData.description = ''
  formData.sort = 0
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  formData.id = row.id
  formData.name = row.name
  formData.icon = row.icon
  formData.description = row.description
  formData.sort = row.sort
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  if (row.dishCount > 0) {
    ElMessage.warning('该分类下还有菜品，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteCategory(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchCategories()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      const api = formData.id ? updateCategory : createCategory
      const params = formData.id ? [formData.id, formData] : [formData]
      
      const res = await api(...params)
      if (res.code === 200) {
        ElMessage.success(formData.id ? '更新成功' : '创建成功')
        dialogVisible.value = false
        fetchCategories()
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
    formData.icon = response.data.url
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
  fetchCategories()
})
</script>

<style scoped lang="scss">
.categories-container {
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

    .category-icon {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      cursor: pointer;
    }

    .icon-error {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f7fa;
      border-radius: 8px;
      color: #909399;
      font-size: 24px;
    }

    .pagination {
      margin-top: 20px;
      justify-content: flex-end;
    }
  }

  .category-uploader {
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

    .category-upload-img {
      width: 148px;
      height: 148px;
      display: block;
      object-fit: cover;
    }

    .category-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 148px;
      height: 148px;
      line-height: 148px;
      text-align: center;
    }
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
