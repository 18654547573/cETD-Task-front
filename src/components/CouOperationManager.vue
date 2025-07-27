<template>
  <div class="cou-operation-manager">
    <div class="manager-header">
      <h3>CoU 操作管理</h3>
      <div class="header-actions">
        <el-button size="small" @click="refreshOperations">
          <i class="el-icon-refresh"></i> 刷新
        </el-button>
        <el-button size="small" type="primary" @click="showAddOperationDialog">
          <i class="el-icon-plus"></i> 手动添加操作
        </el-button>
      </div>
    </div>

    <div class="operations-content">
      <!-- 操作列表 -->
      <el-table
        :data="couOperations"
        v-loading="loading"
        size="small"
        border
        empty-text="暂无CoU操作记录"
      >
        <el-table-column prop="couId" label="操作ID" width="150">
          <template slot-scope="scope">
            <el-tag size="mini" type="info">{{ scope.row.couId }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="operation" label="操作类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getOperationTypeColor(scope.row.operation)" size="mini">
              {{ getOperationTypeText(scope.row.operation) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="targetNodeId" label="目标节点" width="100"></el-table-column>

        <el-table-column label="文档信息" min-width="200">
          <template slot-scope="scope">
            <div v-if="scope.row.document">
              <div class="document-title">{{ scope.row.document.title }}</div>
              <div class="document-meta">
                <el-tag size="mini">{{ scope.row.document.format }}</el-tag>
                <span class="document-path">{{ scope.row.document.path }}</span>
              </div>
            </div>
            <span v-else class="no-document">无文档信息</span>
          </template>
        </el-table-column>

        <el-table-column prop="timestamp" label="操作时间" width="160">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.timestamp) }}
          </template>
        </el-table-column>

        <el-table-column prop="operator" label="操作人" width="100">
          <template slot-scope="scope">
            {{ scope.row.operator || '系统' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="viewOperationDetail(scope.row)">
              <i class="el-icon-view"></i> 详情
            </el-button>
            <el-button size="mini" type="text" @click="removeOperation(scope.row)" style="color: #f56c6c">
              <i class="el-icon-delete"></i> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 操作详情对话框 -->
    <el-dialog
      title="CoU操作详情"
      :visible.sync="detailDialogVisible"
      width="600px"
    >
      <div v-if="selectedOperation">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作ID">{{ selectedOperation.couId }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getOperationTypeColor(selectedOperation.operation)">
              {{ getOperationTypeText(selectedOperation.operation) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="目标节点ID">{{ selectedOperation.targetNodeId }}</el-descriptions-item>
          <el-descriptions-item label="目标XPath">{{ selectedOperation.targetXpath || 'N/A' }}</el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ formatDateTime(selectedOperation.timestamp) }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ selectedOperation.operator || '系统' }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedOperation.document" class="document-section">
          <h4>文档信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="文件ID">{{ selectedOperation.document.fileId }}</el-descriptions-item>
            <el-descriptions-item label="文档标题">{{ selectedOperation.document.title }}</el-descriptions-item>
            <el-descriptions-item label="文档格式">{{ selectedOperation.document.format }}</el-descriptions-item>
            <el-descriptions-item label="文档路径">{{ selectedOperation.document.path }}</el-descriptions-item>
            <el-descriptions-item label="文件大小" v-if="selectedOperation.document.size">
              {{ formatFileSize(selectedOperation.document.size) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div v-if="selectedOperation.description" class="description-section">
          <h4>操作描述</h4>
          <p>{{ selectedOperation.description }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- 手动添加操作对话框 -->
    <el-dialog
      title="手动添加CoU操作"
      :visible.sync="addOperationDialogVisible"
      width="600px"
    >
      <el-form :model="operationForm" :rules="operationRules" ref="operationForm" label-width="120px">
        <el-form-item label="操作类型" prop="operation">
          <el-select v-model="operationForm.operation" placeholder="请选择操作类型" style="width: 100%">
            <el-option label="添加文档" value="add"></el-option>
            <el-option label="替换文档" value="replace"></el-option>
            <el-option label="删除文档" value="delete"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="目标节点ID" prop="targetNodeId">
          <el-input v-model.number="operationForm.targetNodeId" placeholder="请输入目标节点ID"></el-input>
        </el-form-item>

        <el-form-item label="目标XPath">
          <el-input v-model="operationForm.targetXpath" placeholder="请输入目标XPath（可选）"></el-input>
        </el-form-item>

        <div v-if="operationForm.operation !== 'delete'">
          <el-form-item label="文档标题" prop="documentTitle">
            <el-input v-model="operationForm.documentTitle" placeholder="请输入文档标题"></el-input>
          </el-form-item>

          <el-form-item label="文档格式" prop="documentFormat">
            <el-select v-model="operationForm.documentFormat" placeholder="请选择文档格式" style="width: 100%">
              <el-option label="PDF" value="PDF"></el-option>
              <el-option label="Word" value="DOCX"></el-option>
              <el-option label="Excel" value="XLSX"></el-option>
              <el-option label="PowerPoint" value="PPTX"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="文档路径" prop="documentPath">
            <el-input v-model="operationForm.documentPath" placeholder="请输入文档路径"></el-input>
          </el-form-item>
        </div>

        <el-form-item label="操作描述">
          <el-input
            v-model="operationForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入操作描述（可选）"
          ></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addOperationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddOperation" :loading="addingOperation">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { submissionUnitApi } from '@/api'
import { formatDateTime, formatFileSize } from '@/utils'

export default {
  name: 'CouOperationManager',
  props: {
    submissionUnitId: {
      type: [String, Number],
      required: true
    }
  },
  data () {
    return {
      loading: false,
      addingOperation: false,
      couOperations: [],
      detailDialogVisible: false,
      addOperationDialogVisible: false,
      selectedOperation: null,
      operationForm: {
        operation: '',
        targetNodeId: null,
        targetXpath: '',
        documentTitle: '',
        documentFormat: 'PDF',
        documentPath: '',
        description: ''
      },
      operationRules: {
        operation: [
          { required: true, message: '请选择操作类型', trigger: 'change' }
        ],
        targetNodeId: [
          { required: true, message: '请输入目标节点ID', trigger: 'blur' },
          { type: 'number', message: '目标节点ID必须为数字', trigger: 'blur' }
        ],
        documentTitle: [
          { required: true, message: '请输入文档标题', trigger: 'blur' }
        ],
        documentFormat: [
          { required: true, message: '请选择文档格式', trigger: 'change' }
        ],
        documentPath: [
          { required: true, message: '请输入文档路径', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.loadCouOperations()
  },
  methods: {
    async loadCouOperations () {
      this.loading = true
      try {
        const operations = await submissionUnitApi.getCouOperations(this.submissionUnitId)
        this.couOperations = operations || []
      } catch (error) {
        console.error('Failed to load CoU operations:', error)
        this.$message.error('加载CoU操作失败')
      } finally {
        this.loading = false
      }
    },

    async addCouOperation (couOperation) {
      try {
        await submissionUnitApi.addCouOperation(this.submissionUnitId, couOperation)
        await this.loadCouOperations()
        this.$message.success('CoU操作添加成功')
        this.$emit('operations-updated')
      } catch (error) {
        console.error('Failed to add CoU operation:', error)
        this.$message.error('添加CoU操作失败')
      }
    },

    async removeOperation (operation) {
      try {
        await this.$confirm('确定要删除这个CoU操作吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await submissionUnitApi.removeCouOperation(this.submissionUnitId, operation.couId)
        await this.loadCouOperations()
        this.$message.success('CoU操作删除成功')
        this.$emit('operations-updated')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to remove CoU operation:', error)
          this.$message.error('删除CoU操作失败')
        }
      }
    },

    refreshOperations () {
      this.loadCouOperations()
    },

    viewOperationDetail (operation) {
      this.selectedOperation = operation
      this.detailDialogVisible = true
    },

    showAddOperationDialog () {
      this.operationForm = {
        operation: '',
        targetNodeId: null,
        targetXpath: '',
        documentTitle: '',
        documentFormat: 'PDF',
        documentPath: '',
        description: ''
      }
      this.addOperationDialogVisible = true
    },

    async confirmAddOperation () {
      try {
        await this.$refs.operationForm.validate()

        this.addingOperation = true

        const couOperation = {
          operation: this.operationForm.operation,
          targetNodeId: this.operationForm.targetNodeId,
          targetXpath: this.operationForm.targetXpath || null,
          description: this.operationForm.description || null
        }

        if (this.operationForm.operation !== 'delete') {
          couOperation.document = {
            fileId: 'doc_' + Date.now(),
            title: this.operationForm.documentTitle,
            format: this.operationForm.documentFormat,
            path: this.operationForm.documentPath
          }
        }

        await this.addCouOperation(couOperation)
        this.addOperationDialogVisible = false

      } catch (error) {
        if (error !== false) { // 不是表单验证错误
          console.error('Failed to add operation:', error)
        }
      } finally {
        this.addingOperation = false
      }
    },

    getOperationTypeText (type) {
      const textMap = {
        add: '添加',
        replace: '替换',
        delete: '删除'
      }
      return textMap[type] || type
    },

    getOperationTypeColor (type) {
      const colorMap = {
        add: 'success',
        replace: 'warning',
        delete: 'danger'
      }
      return colorMap[type] || 'info'
    },

    formatDateTime,
    formatFileSize
  }
}
</script>

<style scoped>
.cou-operation-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fafafa;
}

.manager-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.operations-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.document-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.document-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.document-path {
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 2px;
}

.no-document {
  color: #999;
  font-style: italic;
}

.document-section,
.description-section {
  margin-top: 20px;
}

.document-section h4,
.description-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.description-section p {
  margin: 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #666;
  line-height: 1.5;
}
</style>

