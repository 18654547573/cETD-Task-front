<template>
  <div class="submission-unit-detail">
    <div class="detail-header">
      <h2>Submission Unit 详情</h2>
      <div class="header-actions">
        <el-button @click="goBack">
          <i class="el-icon-arrow-left"></i> 返回
        </el-button>
        <el-button type="primary" @click="saveSubmissionUnit" :loading="saving">
          <i class="el-icon-check"></i> 保存
        </el-button>
      </div>
    </div>

    <div class="detail-content" v-if="submissionUnit">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="submissionUnit" label-width="150px" class="detail-form">
            <el-form-item label="SU ID">
              <el-input v-model="submissionUnit.suId" disabled></el-input>
            </el-form-item>
            <el-form-item label="应用ID">
              <el-input v-model="submissionUnit.appId" disabled></el-input>
            </el-form-item>
            <el-form-item label="序列号">
              <el-input v-model="submissionUnit.sequenceNum" disabled></el-input>
            </el-form-item>
            <el-form-item label="生效日期">
              <el-date-picker
                v-model="submissionUnit.effectiveDate"
                type="date"
                placeholder="选择生效日期"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="提交类型">
              <el-select v-model="submissionUnit.suType" placeholder="请选择提交类型" style="width: 100%">
                <el-option label="Original" value="original"></el-option>
                <el-option label="Amendment" value="amendment"></el-option>
                <el-option label="Supplement" value="supplement"></el-option>
                <el-option label="Response" value="response"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="单元类型">
              <el-select v-model="submissionUnit.suUnitType" placeholder="请选择单元类型" style="width: 100%">
                <el-option label="Module 1" value="m1"></el-option>
                <el-option label="Module 2" value="m2"></el-option>
                <el-option label="Module 3" value="m3"></el-option>
                <el-option label="Module 4" value="m4"></el-option>
                <el-option label="Module 5" value="m5"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="submissionUnit.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="草稿" value="DRAFT"></el-option>
                <el-option label="已提交" value="SUBMITTED"></el-option>
                <el-option label="已批准" value="APPROVED"></el-option>
                <el-option label="已拒绝" value="REJECTED"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <!-- CoU操作管理 -->
        <el-tab-pane label="CoU操作管理" name="cou-operations">
          <cou-operation-manager
            :submission-unit-id="submissionUnit.suId"
            @operations-updated="handleOperationsUpdated"
            ref="couOperationManager"
          />
        </el-tab-pane>
        <!-- eCTD结构编辑 -->
        <el-tab-pane label="eCTD结构编辑" name="ectd-structure">
          <div class="structure-editor">
            <div class="editor-header">
              <h3>eCTD 结构编辑器</h3>
              <p class="editor-description">
                在此模式下，对文档的添加、修改、删除操作将自动生成CoU操作记录，而不会直接修改Application的Root Section。
              </p>
            </div>
            <ectd-toc-viewer
              :root-section="applicationRootSection"
              :readonly="false"
              mode="submissionUnit"
              :submission-unit-id="submissionUnit.suId"
              @cou-operation="handleCouOperation"
            />
          </div>
        </el-tab-pane>
        <!-- SU ToC预览 -->
        <el-tab-pane label="SU ToC预览" name="su-toc-preview">
          <su-toc-preview
            :submission-unit="submissionUnit"
            :application-root-section="applicationRootSection"
          />
        </el-tab-pane>
        <!-- CoU数据编辑 -->
        <el-tab-pane label="CoU数据编辑" name="cou-data">
          <div class="cou-data-editor">
            <div class="editor-header">
              <h3>CoU 数据编辑器</h3>
              <div class="editor-actions">
                <el-button size="small" @click="formatCouData">
                  <i class="el-icon-magic-stick"></i> 格式化
                </el-button>
                <el-button size="small" @click="validateCouData">
                  <i class="el-icon-check"></i> 验证
                </el-button>
                <el-button size="small" type="primary" @click="saveCouData" :loading="savingCouData">
                  <i class="el-icon-document"></i> 保存CoU数据
                </el-button>
              </div>
            </div>
            <el-input
              v-model="couDataText"
              type="textarea"
              :rows="20"
              placeholder="请输入CoU数据的JSON格式..."
              class="cou-data-textarea"
            ></el-input>
            <div class="cou-data-info">
              <p><strong>说明：</strong>CoU数据应为CoU操作对象的JSON数组。每个操作对象包含操作类型、目标节点、文档信息等字段。</p>
              <p><strong>示例：</strong></p>
              <pre class="cou-data-example">{{ couDataExample }}</pre>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div v-else class="loading-container">
      <el-loading-text>加载中...</el-loading-text>
    </div>
  </div>
</template>

<script>
import { submissionUnitApi, applicationApi } from '@/api'
import { formatJson } from '@/utils'
import SuTocPreview from '@/components/SuTocPreview.vue'
import EctdTocViewer from '@/components/EctdTocViewer.vue'
import CouOperationManager from '@/components/CouOperationManager.vue'

export default {
  name: 'SubmissionUnitDetail',
  components: {
    SuTocPreview,
    EctdTocViewer,
    CouOperationManager
  },
  data () {
    return {
      submissionUnit: null,
      applicationRootSection: null,
      activeTab: 'basic',
      saving: false,
      savingCouData: false,
      couDataText: '',
      couDataExample: JSON.stringify([
        {
          "cou_id": "COU_1234567890_123",
          "operation": "add",
          "su_id": "214214",
          "target_node_id": 8164,
          "target_xpath": "us_1/us_1.1",
          "document": {
            "file_id": "doc-98765",
            "title": "临床研究报告",
            "format": "PDF",
            "path": "/m5/clinical-study-report.pdf"
          },
          "timestamp": "2024-01-15 10:30:00",
          "operator": "张三",
          "description": "在节点1.1下添加新的临床研究报告"
        }
      ], null, 2)
    }
  },
  async created () {
    await this.loadSubmissionUnit()
    await this.loadApplicationRootSection()
  },
  methods: {
    async loadSubmissionUnit () {
      try {
        const suId = this.$route.params.id
        this.submissionUnit = await submissionUnitApi.getById(suId)

        // 初始化CoU数据文本
        if (this.submissionUnit.couData) {
          this.couDataText = typeof this.submissionUnit.couData === 'string'
            ? this.submissionUnit.couData
            : JSON.stringify(this.submissionUnit.couData, null, 2)
        } else {
          this.couDataText = '[]'
        }
      } catch (error) {
        console.error('Failed to load submission unit:', error)
        this.$message.error('加载Submission Unit失败')
      }
    },

    async loadApplicationRootSection () {
      if (!this.submissionUnit || !this.submissionUnit.appId) {
        return
      }

      try {
        const application = await applicationApi.getById(this.submissionUnit.appId)
        this.applicationRootSection = application.rootSection
      } catch (error) {
        console.error('Failed to load application root section:', error)
        this.$message.error('加载Application Root Section失败')
      }
    },

    async saveSubmissionUnit () {
      this.saving = true
      try {
        await submissionUnitApi.update(this.submissionUnit.suId, this.submissionUnit)
        this.$message.success('保存成功')
      } catch (error) {
        console.error('Failed to save submission unit:', error)
        this.$message.error('保存失败')
      } finally {
        this.saving = false
      }
    },

    async saveCouData () {
      this.savingCouData = true
      try {
        // 验证JSON格式
        JSON.parse(this.couDataText)
        await submissionUnitApi.updateCouData(this.submissionUnit.suId, this.couDataText)
        this.submissionUnit.couData = this.couDataText
        this.$message.success('CoU数据保存成功')
        // 刷新CoU操作管理器
        if (this.$refs.couOperationManager) {
          this.$refs.couOperationManager.refreshOperations()
        }
      } catch (error) {
        console.error('Failed to save CoU data:', error)
        if (error instanceof SyntaxError) {
          this.$message.error('JSON格式错误，请检查语法')
        } else {
          this.$message.error('保存CoU数据失败')
        }
      } finally {
        this.savingCouData = false
      }
    },

    formatCouData () {
      try {
        const parsed = JSON.parse(this.couDataText)
        this.couDataText = JSON.stringify(parsed, null, 2)
        this.$message.success('格式化成功')
      } catch (error) {
        this.$message.error('JSON格式错误，无法格式化')
      }
    },

    validateCouData () {
      try {
        const parsed = JSON.parse(this.couDataText)
        if (Array.isArray(parsed)) {
          this.$message.success('CoU数据格式正确')
        } else {
          this.$message.warning('CoU数据应为数组格式')
        }
      } catch (error) {
        this.$message.error('JSON格式错误')
      }
    },

    async handleCouOperation (couOperation) {
      try {
        // 通过CoU操作管理器添加操作
        if (this.$refs.couOperationManager) {
          await this.$refs.couOperationManager.addCouOperation(couOperation)
        }
      } catch (error) {
        console.error('Failed to handle CoU operation:', error)
        this.$message.error('处理CoU操作失败')
      }
    },

    handleOperationsUpdated () {
      // 当CoU操作更新时，重新加载Submission Unit数据
      this.loadSubmissionUnit()
    },

    goBack () {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.submission-unit-detail {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.detail-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.detail-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.detail-form {
  max-width: 600px;
  padding: 20px;
}

.structure-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fafafa;
}

.editor-header h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.editor-description {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.cou-data-editor {
  padding: 20px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e6e6e6;
}

.editor-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.cou-data-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.cou-data-info {
  margin-top: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.cou-data-info p {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.5;
}

.cou-data-info p:last-child {
  margin-bottom: 0;
}

.cou-data-example {
  background-color: #2d3748;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  margin: 8px 0 0 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

/* Tab样式调整 */
.el-tabs--border-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.el-tabs--border-card > .el-tabs__content {
  padding: 0;
}

.el-tab-pane {
  height: calc(100vh - 200px);
  overflow-y: auto;
}
</style>
