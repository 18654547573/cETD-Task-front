<template>
  <div id="app">
    <el-container>
      <!-- Header -->
      <el-header class="app-header">
        <div class="header-content">
          <h1 class="app-title">eCTD 4.0 Application Management</h1>
          <div class="header-nav">
            <el-menu
              :default-active="$route.path"
              mode="horizontal"
              router
              background-color="#409EFF"
              text-color="#fff"
              active-text-color="#ffd04b"
            >
              <el-menu-item index="/applications">Applications(药品申请)</el-menu-item>
              <el-menu-item index="/submission-units">Submission Units(SU，提交单元)</el-menu-item>
            </el-menu>
          </div>
        </div>
      </el-header>

      <!-- Main Content -->
      <el-main class="app-main">
        <router-view />
      </el-main>

      <!-- Footer -->
      <el-footer class="app-footer">
        <p>&copy; 2025 eCTD 4.0 Application Management System</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
}

.app-header {
  background-color: #409EFF;
  color: white;
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.header-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.app-main {
  background-color: #f5f5f5;
  min-height: calc(100vh - 120px);
}

.app-footer {
  background-color: #f8f9fa;
  text-align: center;
  color: #666;
  font-size: 14px;
  line-height: 60px;
  height: 60px;
}

.app-footer p {
  margin: 0;
}
</style>
