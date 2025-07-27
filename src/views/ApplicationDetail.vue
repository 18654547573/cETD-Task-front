<template>
  <div class="application-detail">
    <el-card v-loading="loading">
      <!-- Header -->
      <div slot="header" class="card-header">
        <span class="card-title">应用详情</span>
        <div>
          <el-button @click="editApplication">编辑</el-button>
          <el-button @click="$router.go(-1)">返回</el-button>
        </div>
      </div>

      <!-- Application Info -->
      <div v-if="application">
        <el-descriptions title="基本信息" :column="2" border>
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

        <!-- Root Section -->
        <div class="section-block">
          <div class="section-header">
            <h3>eCTD 4.0 结构 ToC</h3>
            <el-button size="small" @click="toggleTocView">
              {{ showTocTree ? '显示JSON' : '显示树形结构' }}
            </el-button>
          </div>
          
          <div v-if="showTocTree" class="toc-tree-container">
            <ectd-toc-viewer 
              :root-section="application.rootSection" 
              @toc-updated="handleTocUpdated"
            />
          </div>
          <div v-else class="json-viewer">{{ formatJson(application.rootSection) }}</div>
        </div>

        <!-- Submission Units -->
        <div class="section-block">
          <div class="section-header">
            <h3>关联的提交单元</h3>
            <el-button size="small" type="primary" @click="createSubmissionUnit">
              <i class="el-icon-plus"></i> 新建提交单元
            </el-button>
          </div>
          
          <el-table
            v-loading="submissionUnitsLoading"
            :data="submissionUnits"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column prop="suId" label="ID" width="80"></el-table-column>
            <el-table-column prop="sequenceNum" label="序列号" width="100"></el-table-column>
            <el-table-column prop="suType" label="提交类型" width="120"></el-table-column>
            <el-table-column prop="suUnitType" label="单元类型" width="120"></el-table-column>
            <el-table-column prop="effectiveDate" label="生效日期" width="120">
              <template slot-scope="scope">
                {{ formatDateOnly(scope.row.effectiveDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <span :class="'status-badge status-' + scope.row.status.toLowerCase()">
                  {{ getStatusText(scope.row.status) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="160">
              <template slot-scope="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-button size="mini" @click="viewSubmissionUnitDetail(scope.row)">详情</el-button>
                <el-button size="mini" type="primary" @click="editSubmissionUnit(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { applicationApi, submissionUnitApi } from '@/api'
import { formatDate, formatDateOnly, getStatusText, formatJson } from '@/utils'
import EctdTocViewer from '@/components/EctdTocViewer.vue'

export default {
  name: 'ApplicationDetail',
  components: {
    EctdTocViewer
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      submissionUnitsLoading: false,
      application: null,
      submissionUnits: [],
      showTocTree: true
    }
  },
  created () {
    this.loadApplication()
    this.loadSubmissionUnits()
  },
  methods: {
    async loadApplication () {
      this.loading = true
      try {
        const data = await applicationApi.getById(this.id)
        this.application = data
      } catch (error) {
        console.error('Failed to load application:', error)
        this.$message.error('加载应用信息失败')
        this.$router.go(-1)
      } finally {
        this.loading = false
      }
    },

    async loadSubmissionUnits () {
      this.submissionUnitsLoading = true
      try {
        const data = await submissionUnitApi.getByAppId(this.id)
        this.submissionUnits = data || []
      } catch (error) {
        console.error('Failed to load submission units:', error)
      } finally {
        this.submissionUnitsLoading = false
      }
    },

    editApplication () {
      this.$router.push(`/applications/${this.id}/edit`)
    },

    createSubmissionUnit () {
      this.$router.push({
        path: '/submission-units/create',
        query: { appId: this.id }
      })
    },

    viewSubmissionUnitDetail (row) {
      this.$router.push(`/submission-units/${row.suId}/detail`)
    },

    editSubmissionUnit (row) {
      this.$router.push(`/submission-units/${row.suId}/edit`)
    },

    toggleTocView () {
      this.showTocTree = !this.showTocTree
    },

    async handleTocUpdated (updatedTocData) {
      try {
        const rootSectionJson = JSON.stringify(updatedTocData)
        await applicationApi.updateRootSection(this.id, rootSectionJson)
        this.application.rootSection = rootSectionJson
        this.$message.success('Root Section更新成功')
      } catch (error) {
        console.error('Failed to update root section:', error)
        this.$message.error('Root Section更新失败')
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
.application-detail {
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
</style>


.toc-tree-container {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  height: 500px;
  overflow: hidden;
}

