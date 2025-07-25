<template>
  <div class="application-form">
    <el-card>
      <!-- Header -->
      <div slot="header" class="card-header">
        <span class="card-title">{{ isEdit ? '编辑应用' : '新建应用' }}</span>
        <el-button @click="$router.go(-1)">返回</el-button>
      </div>

      <!-- Form -->
      <el-form
        ref="applicationForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-form-item label="应用编号" prop="appNumber">
          <el-input
            v-model="form.appNumber"
            placeholder="请输入应用编号，如：NDA-202501"
            :disabled="isEdit"
          ></el-input>
        </el-form-item>

        <el-form-item label="应用类型" prop="appType">
          <el-select v-model="form.appType" placeholder="请选择应用类型" style="width: 100%">
            <el-option
              v-for="option in applicationTypeOptions"
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

        <el-form-item label="根节点结构" prop="rootSection" v-if="isEdit">
          <el-input
            v-model="form.rootSection"
            type="textarea"
            :rows="10"
            placeholder="请输入有效的JSON格式"
          ></el-input>
          <div class="form-item-tip">
            <el-button size="mini" type="text" @click="formatRootSection">格式化JSON</el-button>
            <el-button size="mini" type="text" @click="validateRootSection">验证JSON</el-button>
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
  </div>
</template>

<script>
import { applicationApi } from '@/api'
import { getApplicationTypeOptions, getStatusOptions, formatJson, isValidJson } from '@/utils'

export default {
  name: 'ApplicationForm',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      loading: false,
      form: {
        appNumber: '',
        appType: '',
        status: 'DRAFT',
        rootSection: ''
      },
      rules: {
        appNumber: [
          { required: true, message: '请输入应用编号', trigger: 'blur' },
          { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
        ],
        appType: [
          { required: true, message: '请选择应用类型', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        rootSection: [
          { validator: this.validateJsonField, trigger: 'blur' }
        ]
      },
      applicationTypeOptions: getApplicationTypeOptions(),
      statusOptions: getStatusOptions()
    }
  },
  computed: {
    isEdit () {
      return !!this.id
    }
  },
  created () {
    if (this.isEdit) {
      this.loadApplication()
    }
  },
  methods: {
    async loadApplication () {
      this.loading = true
      try {
        const data = await applicationApi.getById(this.id)
        this.form = {
          appNumber: data.appNumber,
          appType: data.appType,
          status: data.status,
          rootSection: formatJson(data.rootSection)
        }
      } catch (error) {
        console.error('Failed to load application:', error)
        this.$message.error('加载应用信息失败')
        this.$router.go(-1)
      } finally {
        this.loading = false
      }
    },

    async submitForm () {
      try {
        await this.$refs.applicationForm.validate()
        this.loading = true
        if (this.isEdit) {
          const updateData = {
            appNumber: this.form.appNumber,
            appType: this.form.appType,
            status: this.form.status,
            rootSection: this.form.rootSection
          }
          const data = await applicationApi.update(this.id, updateData)
          this.$message.success('更新成功')
          this.$store.dispatch('updateApplication', data)
        } else {
          // Create application
          const createData = {
            appNumber: this.form.appNumber,
            appType: this.form.appType
          }
          const data = await applicationApi.create(createData)
          this.$message.success('创建成功')
          this.$store.dispatch('addApplication', data)
        }

        this.$router.push('/applications')
      } catch (error) {
        if (error.message !== 'validation failed') {
          console.error('Failed to submit form:', error)
        }
      } finally {
        this.loading = false
      }
    },

    resetForm () {
      this.$refs.applicationForm.resetFields()
      if (!this.isEdit) {
        this.form = {
          appNumber: '',
          appType: '',
          status: 'DRAFT',
          rootSection: ''
        }
      }
    },

    formatRootSection () {
      if (this.form.rootSection) {
        try {
          this.form.rootSection = formatJson(this.form.rootSection)
          this.$message.success('JSON格式化成功')
        } catch (error) {
          this.$message.error('JSON格式无效，无法格式化')
        }
      }
    },

    validateRootSection () {
      if (!this.form.rootSection) {
        this.$message.info('根节点结构为空')
        return
      }

      if (isValidJson(this.form.rootSection)) {
        this.$message.success('JSON格式有效')
      } else {
        this.$message.error('JSON格式无效')
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
.application-form {
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
