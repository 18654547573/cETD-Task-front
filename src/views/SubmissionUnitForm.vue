<template>
  <div class="submission-unit-form">
    <el-card>
      <!-- Header -->
      <div slot="header" class="card-header">
        <span class="card-title">{{ isEdit ? '编辑提交单元' : '新建提交单元' }}</span>
        <el-button @click="$router.go(-1)">返回</el-button>
      </div>

      <!-- Form -->
      <el-form
        ref="submissionUnitForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-form-item label="关联应用" prop="appId">
          <el-select v-model="form.appId" placeholder="请选择应用" style="width: 100%" :disabled="isEdit">
            <el-option
              v-for="app in applications"
              :key="app.appId"
              :label="`${app.appNumber} (${app.appType})`"
              :value="app.appId"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="生效日期" prop="effectiveDate">
          <el-date-picker
            v-model="form.effectiveDate"
            type="date"
            placeholder="选择生效日期"
            style="width: 100%"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="提交类型" prop="suType">
          <el-select v-model="form.suType" placeholder="请选择提交类型" style="width: 100%">
            <el-option
              v-for="option in submissionTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="单元类型" prop="suUnitType">
          <el-select v-model="form.suUnitType" placeholder="请选择单元类型" style="width: 100%">
            <el-option
              v-for="option in submissionUnitTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status" v-if="isEdit">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="CoU数据" prop="couData">
          <el-input
            v-model="form.couData"
            type="textarea"
            :rows="8"
            placeholder="请输入有效的JSON格式的CoU数据"
          ></el-input>
          <div class="form-item-tip">
            <el-button size="mini" type="text" @click="formatCouData">格式化JSON</el-button>
            <el-button size="mini" type="text" @click="validateCouData">验证JSON</el-button>
            <el-button size="mini" type="text" @click="generateSampleCouData">生成示例数据</el-button>
          </div>
        </el-form-item>

        <!-- Action Buttons -->
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="$router.go(-1)">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Sample CoU Data Dialog -->
    <el-dialog
      title="生成示例CoU数据"
      :visible.sync="sampleDialogVisible"
      width="500px"
    >
      <el-form :model="sampleForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-select v-model="sampleForm.operationType" placeholder="请选择操作类型" style="width: 100%">
            <el-option label="添加" value="add"></el-option>
            <el-option label="替换" value="replace"></el-option>
            <el-option label="删除" value="delete"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="节点ID">
          <el-input v-model="sampleForm.nodeId" placeholder="请输入节点ID"></el-input>
        </el-form-item>
        <el-form-item label="文档路径">
          <el-input v-model="sampleForm.documentPath" placeholder="请输入文档路径"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="sampleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmGenerateSample">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { applicationApi, submissionUnitApi } from '@/api'
import {
  getSubmissionTypeOptions,
  getSubmissionUnitTypeOptions,
  getStatusOptions,
  formatJson,
  isValidJson
} from '@/utils'

export default {
  name: 'SubmissionUnitForm',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      loading: false,
      applications: [],
      form: {
        appId: null,
        effectiveDate: '',
        suType: '',
        suUnitType: 'ectd-4-0',
        status: 'DRAFT',
        couData: ''
      },
      rules: {
        appId: [
          { required: true, message: '请选择关联应用', trigger: 'change' }
        ],
        effectiveDate: [
          { required: true, message: '请选择生效日期', trigger: 'change' }
        ],
        suType: [
          { required: true, message: '请选择提交类型', trigger: 'change' }
        ],
        suUnitType: [
          { required: true, message: '请选择单元类型', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        couData: [
          { validator: this.validateJsonField, trigger: 'blur' }
        ]
      },
      submissionTypeOptions: getSubmissionTypeOptions(),
      submissionUnitTypeOptions: getSubmissionUnitTypeOptions(),
      statusOptions: getStatusOptions(),
      sampleDialogVisible: false,
      sampleForm: {
        operationType: 'add',
        nodeId: '8154',
        documentPath: '/m1/admin-info.pdf'
      }
    }
  },
  computed: {
    isEdit () {
      return !!this.id
    }
  },
  created () {
    this.loadApplications()
    if (this.isEdit) {
      this.loadSubmissionUnit()
    } else {
      // Check if appId is provided in query params
      const appId = this.$route.query.appId
      if (appId) {
        this.form.appId = parseInt(appId)
      }
    }
  },
  methods: {
    async loadApplications () {
      try {
        const data = await applicationApi.getAll()
        this.applications = data || []
      } catch (error) {
        console.error('Failed to load applications:', error)
      }
    },

    async loadSubmissionUnit () {
      this.loading = true
      try {
        const data = await submissionUnitApi.getById(this.id)
        this.form = {
          appId: data.appId,
          effectiveDate: data.effectiveDate,
          suType: data.suType,
          suUnitType: data.suUnitType,
          status: data.status,
          couData: formatJson(data.couData)
        }
      } catch (error) {
        console.error('Failed to load submission unit:', error)
        this.$message.error('加载提交单元信息失败')
        this.$router.go(-1)
      } finally {
        this.loading = false
      }
    },

    async submitForm () {
      try {
        await this.$refs.submissionUnitForm.validate()

        this.loading = true

        if (this.isEdit) {
          // Update submission unit
          const updateData = {
            appId: this.form.appId,
            effectiveDate: this.form.effectiveDate,
            suType: this.form.suType,
            suUnitType: this.form.suUnitType,
            status: this.form.status,
            couData: this.form.couData
          }
          const data = await submissionUnitApi.update(this.id, updateData)
          this.$message.success('更新成功')
          this.$store.dispatch('updateSubmissionUnit', data)
        } else {
          // Create submission unit
          const createData = {
            appId: this.form.appId,
            effectiveDate: this.form.effectiveDate,
            suType: this.form.suType,
            suUnitType: this.form.suUnitType,
            couData: this.form.couData
          }
          const data = await submissionUnitApi.create(createData)
          this.$message.success('创建成功')
          this.$store.dispatch('addSubmissionUnit', data)
        }

        this.$router.push('/submission-units')
      } catch (error) {
        if (error.message !== 'validation failed') {
          console.error('Failed to submit form:', error)
        }
      } finally {
        this.loading = false
      }
    },

    resetForm () {
      this.$refs.submissionUnitForm.resetFields()
      if (!this.isEdit) {
        this.form = {
          appId: null,
          effectiveDate: '',
          suType: '',
          suUnitType: 'ectd-4-0',
          status: 'DRAFT',
          couData: ''
        }
        // Restore appId from query params if exists
        const appId = this.$route.query.appId
        if (appId) {
          this.form.appId = parseInt(appId)
        }
      }
    },

    formatCouData () {
      if (this.form.couData) {
        try {
          this.form.couData = formatJson(this.form.couData)
          this.$message.success('JSON格式化成功')
        } catch (error) {
          this.$message.error('JSON格式无效，无法格式化')
        }
      }
    },

    validateCouData () {
      if (!this.form.couData) {
        this.$message.info('CoU数据为空')
        return
      }

      if (isValidJson(this.form.couData)) {
        this.$message.success('JSON格式有效')
      } else {
        this.$message.error('JSON格式无效')
      }
    },

    generateSampleCouData () {
      this.sampleDialogVisible = true
    },

    async confirmGenerateSample () {
      try {
        const data = await submissionUnitApi.createSampleCouData({
          operationType: this.sampleForm.operationType,
          nodeId: this.sampleForm.nodeId,
          documentPath: this.sampleForm.documentPath
        })
        this.form.couData = formatJson(data.couData)
        this.sampleDialogVisible = false
        this.$message.success('示例数据生成成功')
      } catch (error) {
        console.error('Failed to generate sample CoU data:', error)
      }
    },

    validateJsonField (rule, value, callback) {
      if (value && !isValidJson(value)) {
        callback(new Error('请输入有效的JSON格式'))
      } else {
        callback()
      }
    }
  }
}
</script>

<style scoped>
.submission-unit-form {
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
