<template>
  <div class="submission-unit-list">
    <el-card>
      <!-- Header -->
      <div slot="header" class="card-header">
        <span class="card-title">Submission Units</span>
        <el-button type="primary" size="small" @click="$router.push('/submission-units/create')">
          <i class="el-icon-plus"></i> 新建提交单元
        </el-button>
      </div>

      <!-- Search and Filter -->
      <div class="filter-section mb-20">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="searchForm.appId" placeholder="选择应用" clearable @change="handleSearch">
              <el-option
                v-for="app in applications"
                :key="app.appId"
                :label="`${app.appNumber} (${app.appType})`"
                :value="app.appId"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.suType" placeholder="提交类型" clearable @change="handleSearch">
              <el-option
                v-for="option in submissionTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.status" placeholder="状态" clearable @change="handleSearch">
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" @click="loadSubmissionUnits">刷新</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Table -->
      <el-table
        v-loading="loading"
        :data="filteredSubmissionUnits"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="suId" label="ID" width="80" sortable></el-table-column>
        <el-table-column prop="appId" label="应用" width="200">
          <template slot-scope="scope">
            <span v-if="getApplicationById(scope.row.appId)">
              {{ getApplicationById(scope.row.appId).appNumber }}
              <el-tag size="mini" type="info">{{ getApplicationById(scope.row.appId).appType }}</el-tag>
            </span>
            <span v-else>{{ scope.row.appId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sequenceNum" label="序列号" width="100" sortable></el-table-column>
        <el-table-column prop="suType" label="提交类型" width="120" sortable></el-table-column>
        <el-table-column prop="suUnitType" label="单元类型" width="120"></el-table-column>
        <el-table-column prop="effectiveDate" label="生效日期" width="120" sortable>
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
        <el-table-column prop="createdAt" label="创建时间" width="160" sortable>
          <template slot-scope="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewDetail(scope.row)">详情</el-button>
            <el-button size="mini" type="primary" @click="editSubmissionUnit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteSubmissionUnit(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-section mt-20 text-right">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import { applicationApi, submissionUnitApi } from '@/api'
import { formatDate, formatDateOnly, getStatusText, getSubmissionTypeOptions, getStatusOptions } from '@/utils'

export default {
  name: 'SubmissionUnitList',
  data () {
    return {
      loading: false,
      submissionUnits: [],
      applications: [],
      searchForm: {
        appId: null,
        suType: '',
        status: ''
      },
      currentPage: 1,
      pageSize: 20,
      total: 0,
      submissionTypeOptions: getSubmissionTypeOptions(),
      statusOptions: getStatusOptions()
    }
  },
  computed: {
    filteredSubmissionUnits () {
      let filtered = [...this.submissionUnits]
      // Filter by search criteria
      if (this.searchForm.appId) {
        filtered = filtered.filter(su => su.appId === this.searchForm.appId)
      }
      if (this.searchForm.suType) {
        filtered = filtered.filter(su => su.suType === this.searchForm.suType)
      }
      if (this.searchForm.status) {
        filtered = filtered.filter(su => su.status === this.searchForm.status)
      }

      this.total = filtered.length
      // Pagination
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return filtered.slice(start, end)
    }
  },
  created () {
    this.loadApplications()
    this.loadSubmissionUnits()
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

    async loadSubmissionUnits () {
      this.loading = true
      try {
        const data = await submissionUnitApi.getAll()
        this.submissionUnits = data || []
        this.$store.dispatch('setSubmissionUnits', this.submissionUnits)
      } catch (error) {
        console.error('Failed to load submission units:', error)
      } finally {
        this.loading = false
      }
    },

    getApplicationById (appId) {
      return this.applications.find(app => app.appId === appId)
    },

    handleSearch () {
      this.currentPage = 1
    },

    handleReset () {
      this.searchForm = {
        appId: null,
        suType: '',
        status: ''
      }
      this.currentPage = 1
    },

    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
    },

    handleCurrentChange (val) {
      this.currentPage = val
    },

    viewDetail (row) {
      this.$router.push(`/submission-units/${row.suId}/detail`)
    },

    editSubmissionUnit (row) {
      this.$router.push(`/submission-units/${row.suId}/edit`)
    },

    async deleteSubmissionUnit (row) {
      try {
        await this.$confirm(`确定要删除提交单元 "${row.suId}" 吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.loading = true
        await submissionUnitApi.delete(row.suId)
        this.$message.success('删除成功')
        this.$store.dispatch('removeSubmissionUnit', row.suId)
        await this.loadSubmissionUnits()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to delete submission unit:', error)
        }
      } finally {
        this.loading = false
      }
    },

    formatDate,
    formatDateOnly,
    getStatusText
  }
}
</script>

<style scoped>
.submission-unit-list {
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

.filter-section {
  background-color: #fafafa;
  padding: 16px;
  border-radius: 4px;
}

.pagination-section {
  margin-top: 20px;
}
</style>
