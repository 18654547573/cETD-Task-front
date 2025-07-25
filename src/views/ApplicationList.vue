<template>
  <div class="application-list">
    <el-card>
      <!-- Header -->
      <div slot="header" class="card-header">
        <span class="card-title">eCTD Applications</span>
        <el-button type="primary" size="small" @click="$router.push('/applications/create')">
          <i class="el-icon-plus"></i> 新建应用
        </el-button>
      </div>

      <!-- Search and Filter -->
      <div class="filter-section mb-20">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchForm.appNumber"
              placeholder="搜索应用编号"
              clearable
              @clear="handleSearch"
              @keyup.enter.native="handleSearch"
            >
              <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.appType" placeholder="应用类型" clearable @change="handleSearch">
              <el-option
                v-for="option in applicationTypeOptions"
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
            <el-button type="primary" @click="loadApplications">刷新</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Table -->
      <el-table
        v-loading="loading"
        :data="filteredApplications"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="appId" label="ID" width="80" sortable></el-table-column>
        <el-table-column prop="appNumber" label="应用编号" width="150" sortable></el-table-column>
        <el-table-column prop="appType" label="应用类型" width="120" sortable></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <span :class="'status-badge status-' + scope.row.status.toLowerCase()">
              {{ getStatusText(scope.row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" sortable>
          <template slot-scope="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" sortable>
          <template slot-scope="scope">
            {{ formatDate(scope.row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewDetail(scope.row)">详情</el-button>
            <el-button size="mini" type="primary" @click="editApplication(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteApplication(scope.row)">删除</el-button>
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
import { applicationApi } from '@/api'
import { formatDate, getStatusText, getApplicationTypeOptions, getStatusOptions } from '@/utils'

export default {
  name: 'ApplicationList',
  data () {
    return {
      loading: false,
      applications: [],
      searchForm: {
        appNumber: '',
        appType: '',
        status: ''
      },
      currentPage: 1,
      pageSize: 20,
      total: 0,
      applicationTypeOptions: getApplicationTypeOptions(),
      statusOptions: getStatusOptions()
    }
  },
  computed: {
    filteredApplications () {
      let filtered = [...this.applications]

      // Filter by search criteria
      if (this.searchForm.appNumber) {
        filtered = filtered.filter(app =>
          app.appNumber.toLowerCase().includes(this.searchForm.appNumber.toLowerCase())
        )
      }
      if (this.searchForm.appType) {
        filtered = filtered.filter(app => app.appType === this.searchForm.appType)
      }
      if (this.searchForm.status) {
        filtered = filtered.filter(app => app.status === this.searchForm.status)
      }

      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.total = filtered.length

      // Pagination
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return filtered.slice(start, end)
    }
  },
  created () {
    this.loadApplications()
  },
  methods: {
    async loadApplications () {
      this.loading = true
      try {
        const data = await applicationApi.getAll()
        this.applications = data || []
        this.$store.dispatch('setApplications', this.applications)
      } catch (error) {
        console.error('Failed to load applications:', error)
      } finally {
        this.loading = false
      }
    },

    handleSearch () {
      this.currentPage = 1
    },

    handleReset () {
      this.searchForm = {
        appNumber: '',
        appType: '',
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
      this.$router.push(`/applications/${row.appId}/detail`)
    },

    editApplication (row) {
      this.$router.push(`/applications/${row.appId}/edit`)
    },

    async deleteApplication (row) {
      try {
        await this.$confirm(`确定要删除应用 "${row.appNumber}" 吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.loading = true
        await applicationApi.delete(row.appId)
        this.$message.success('删除成功')
        this.$store.dispatch('removeApplication', row.appId)
        await this.loadApplications()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to delete application:', error)
        }
      } finally {
        this.loading = false
      }
    },

    formatDate,
    getStatusText
  }
}
</script>

<style scoped>
.application-list {
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
