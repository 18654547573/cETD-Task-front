<template>
  <div class="submission-unit-detail">
    <el-card v-loading="loading">
      <!-- Header -->
      <div slot="header" class="card-header">
        <span class="card-title">提交单元详情</span>
        <div>
          <el-button @click="editSubmissionUnit">编辑</el-button>
          <el-button @click="$router.go(-1)">返回</el-button>
        </div>
      </div>

      <!-- Submission Unit Info -->
      <div v-if="submissionUnit">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="提交单元ID">{{ submissionUnit.suId }}</el-descriptions-item>
          <el-descriptions-item label="序列号">{{ submissionUnit.sequenceNum }}</el-descriptions-item>
          <el-descriptions-item label="关联应用">
            <span v-if="application">
              <el-link type="primary" @click="viewApplication">
                {{ application.appNumber }} ({{ application.appType }})
              </el-link>
            </span>
            <span v-else>{{ submissionUnit.appId }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="生效日期">{{ formatDateOnly(submissionUnit.effectiveDate) }}</el-descriptions-item>
          <el-descriptions-item label="提交类型">{{ submissionUnit.suType }}</el-descriptions-item>
          <el-descriptions-item label="单元类型">{{ submissionUnit.suUnitType }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <span :class="'status-badge status-' + submissionUnit.status.toLowerCase()">
              {{ getStatusText(submissionUnit.status) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(submissionUnit.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(submissionUnit.updatedAt) }}</el-descriptions-item>
        </el-descriptions>

        <!-- CoU Data -->
        <div class="section-block">
          <div class="section-header">
            <h3>Context of Use (CoU) 数据</h3>
            <el-button size="small" @click="editCouData">编辑CoU数据</el-button>
          </div>
          <div class="json-viewer">{{ formatJson(submissionUnit.couData) }}</div>
        </div>

        <!-- Application Info -->
        <div class="section-block" v-if="application">
          <h3>关联应用信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="应用ID">{{ application.appId }}</el-descriptions-item>
            <el-descriptions-item label="应用编号">{{ application.appNumber }}</el-descriptions-item>
            <el-descriptions-item label="应用类型">{{ application.appType }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <span :class="'status-badge status-' + application.status.toLowerCase()">
                {{ getStatusText(application.status) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(application.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(application.updatedAt) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>

    <!-- Edit CoU Data Dialog -->
    <el-dialog
      title="编辑CoU数据"
      :visible.sync="couDataDialogVisible"
      width="800px"
    >
      <el-form :model="couDataForm" label-width="100px">
        <el-form-item label="CoU数据">
          <el-input
            v-model="couDataForm.couData"
            type="textarea"
            :rows="12"
            placeholder="请输入有效的JSON格式"
          ></el-input>
          <div class="form-item-tip">
            <el-button size="mini" type="text" @click="formatDialogCouData">格式化JSON</el-button>
            <el-button size="mini" type="text" @click="validateDialogCouData">验证JSON</el-button>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="couDataDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCouData" :loading="couDataLoading">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { applicationApi, submissionUnitApi } from '@/api'
import { formatDate, formatDateOnly, getStatusText, formatJson, isValidJson } from '@/utils'

export default {
  name: 'SubmissionUnitDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      couDataLoading: false,
      submissionUnit: null,
      application: null,
      couDataDialogVisible: false,
      couDataForm: {
        couData: ''
      }
    }
  },
  created () {
    this.loadSubmissionUnit()
  },
  methods: {
    async loadSubmissionUnit () {
      this.loading = true
      try {
        const data = await submissionUnitApi.getById(this.id)
        this.submissionUnit = data

        // Load related application
        if (data.appId) {
          await this.loadApplication(data.appId)
        }
      } catch (error) {
        console.error('Failed to load submission unit:', error)
        this.$message.error('加载提交单元信息失败')
        this.$router.go(-1)
      } finally {
        this.loading = false
      }
    },

    async loadApplication (appId) {
      try {
        const data = await applicationApi.getById(appId)
        this.application = data
      } catch (error) {
        console.error('Failed to load application:', error)
      }
    },

    editSubmissionUnit () {
      this.$router.push(`/submission-units/${this.id}/edit`)
    },

    viewApplication () {
      if (this.application) {
        this.$router.push(`/applications/${this.application.appId}/detail`)
      }
    },

    editCouData () {
      this.couDataForm.couData = formatJson(this.submissionUnit.couData)
      this.couDataDialogVisible = true
    },

    formatDialogCouData () {
      if (this.couDataForm.couData) {
        try {
          this.couDataForm.couData = formatJson(this.couDataForm.couData)
          this.$message.success('JSON格式化成功')
        } catch (error) {
          this.$message.error('JSON格式无效，无法格式化')
        }
      }
    },

    validateDialogCouData () {
      if (!this.couDataForm.couData) {
        this.$message.info('CoU数据为空')
        return
      }

      if (isValidJson(this.couDataForm.couData)) {
        this.$message.success('JSON格式有效')
      } else {
        this.$message.error('JSON格式无效')
      }
    },

    async saveCouData () {
      // Validate JSON format
      if (this.couDataForm.couData && !isValidJson(this.couDataForm.couData)) {
        this.$message.error('请输入有效的JSON格式')
        return
      }

      this.couDataLoading = true
      try {
        const data = await submissionUnitApi.updateCouData(this.id, this.couDataForm.couData)
        this.submissionUnit = data
        this.couDataDialogVisible = false
        this.$message.success('CoU数据更新成功')
        this.$store.dispatch('updateSubmissionUnit', data)
      } catch (error) {
        console.error('Failed to update CoU data:', error)
      } finally {
        this.couDataLoading = false
      }
    },

    formatDate,
    formatDateOnly,
    getStatusText,
    formatJson
  }
}
</script>

<style scoped>
.submission-unit-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.section-block {
  margin-top: 30px;
}

.section-block h3 {
  margin-bottom: 16px;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
}

.form-item-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.form-item-tip .el-button {
  padding: 0;
  margin-right: 12px;
}
</style>
