# eCTD 4.0 Application Management Frontend

基于 Vue 2 + Element UI 的 eCTD 4.0 应用管理前端系统。

## 项目概述

本项目是 eCTD 4.0 应用管理系统的前端部分，提供了直观的用户界面来管理 eCTD 应用程序和提交单元，主要功能包括：

- eCTD Application 管理（创建、查看、编辑、删除）
- Submission Unit 管理（创建、查看、编辑、删除）
- Root Section 树形结构可视化
- Context of Use (CoU) 数据管理
- 响应式设计，支持桌面和移动设备

## 技术栈

- **Vue.js**: 2.6.14
- **Element UI**: 2.15.13
- **Vue Router**: 3.5.1
- **Vuex**: 3.6.2
- **Axios**: 1.4.0
- **Moment.js**: 2.29.4

## 项目结构

```
ectd-frontend/
├── public/
│   └── index.html           # HTML 模板
├── src/
│   ├── api/                 # API 接口
│   │   └── index.js
│   ├── assets/              # 静态资源
│   │   └── css/
│   │       └── global.css   # 全局样式
│   ├── components/          # 公共组件
│   ├── router/              # 路由配置
│   │   └── index.js
│   ├── store/               # Vuex 状态管理
│   │   └── index.js
│   ├── utils/               # 工具函数
│   │   └── index.js
│   ├── views/               # 页面组件
│   │   ├── ApplicationList.vue      # 应用列表
│   │   ├── ApplicationForm.vue      # 应用表单
│   │   ├── ApplicationDetail.vue    # 应用详情
│   │   ├── SubmissionUnitList.vue   # 提交单元列表
│   │   ├── SubmissionUnitForm.vue   # 提交单元表单
│   │   └── SubmissionUnitDetail.vue # 提交单元详情
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── package.json
├── vue.config.js            # Vue CLI 配置
└── README.md
```

## 功能特性

### 应用管理 (Applications)
- **列表页面**: 显示所有 eCTD 应用，支持搜索和筛选
- **创建应用**: 创建新的 eCTD 应用，自动生成初始 Root Section 结构
- **编辑应用**: 修改应用信息和 Root Section 结构
- **应用详情**: 查看应用详细信息和关联的提交单元
- **删除应用**: 删除应用及其关联数据

### 提交单元管理 (Submission Units)
- **列表页面**: 显示所有提交单元，支持按应用筛选
- **创建提交单元**: 创建新的提交单元，支持 CoU 数据编辑
- **编辑提交单元**: 修改提交单元信息和 CoU 数据
- **提交单元详情**: 查看提交单元详细信息和关联应用
- **CoU 数据管理**: 支持 JSON 格式的 CoU 数据编辑和验证

### 用户体验
- **响应式设计**: 适配桌面和移动设备
- **实时验证**: 表单字段实时验证，JSON 格式验证
- **状态管理**: 使用 Vuex 管理全局状态
- **错误处理**: 友好的错误提示和处理
- **加载状态**: 数据加载时显示加载动画

## 快速开始

### 1. 环境准备

- Node.js 14+
- npm 6+ 或 yarn 1.22+

### 2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 3. 开发环境运行

```bash
# 启动开发服务器
npm run serve

# 或
yarn serve
```

应用将在 `http://localhost:8081` 启动。

### 4. 构建生产版本

```bash
# 构建生产版本
npm run build

# 或
yarn build
```

构建文件将输出到 `dist/` 目录。

## 配置说明

### API 代理配置

在 `vue.config.js` 中配置了开发环境的 API 代理：

```javascript
devServer: {
  port: 8081,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      }
    }
  }
}
```

### 环境变量

可以通过环境变量配置不同环境的 API 地址：

- 开发环境：通过代理访问 `http://localhost:8080`
- 生产环境：需要配置实际的后端 API 地址

## API 接口

### Application APIs
- `GET /api/applications` - 获取所有应用
- `POST /api/applications` - 创建新应用
- `GET /api/applications/{id}` - 获取应用详情
- `PUT /api/applications/{id}` - 更新应用
- `DELETE /api/applications/{id}` - 删除应用

### Submission Unit APIs
- `GET /api/submission-units` - 获取所有提交单元
- `POST /api/submission-units` - 创建新提交单元
- `GET /api/submission-units/{id}` - 获取提交单元详情
- `PUT /api/submission-units/{id}` - 更新提交单元
- `DELETE /api/submission-units/{id}` - 删除提交单元

## 页面路由

- `/applications` - 应用列表页
- `/applications/create` - 创建应用页
- `/applications/:id/edit` - 编辑应用页
- `/applications/:id/detail` - 应用详情页
- `/submission-units` - 提交单元列表页
- `/submission-units/create` - 创建提交单元页
- `/submission-units/:id/edit` - 编辑提交单元页
- `/submission-units/:id/detail` - 提交单元详情页

## 数据格式

### Application 数据结构
```json
{
  "appId": 1,
  "appNumber": "NDA-202501",
  "appType": "NDA",
  "status": "DRAFT",
  "rootSection": "{...}",
  "createdAt": "2025-01-15T10:00:00",
  "updatedAt": "2025-01-15T10:00:00"
}
```

### Submission Unit 数据结构
```json
{
  "suId": 1,
  "appId": 1,
  "sequenceNum": 1,
  "effectiveDate": "2025-01-15",
  "suType": "original",
  "suUnitType": "ectd-4-0",
  "couData": "{...}",
  "status": "DRAFT",
  "createdAt": "2025-01-15T10:00:00",
  "updatedAt": "2025-01-15T10:00:00"
}
```

## 开发指南

### 添加新页面
1. 在 `src/views/` 目录下创建新的 Vue 组件
2. 在 `src/router/index.js` 中添加路由配置
3. 如需要，在 `src/api/index.js` 中添加对应的 API 接口

### 添加新的 API 接口
1. 在 `src/api/index.js` 中添加新的 API 方法
2. 使用 axios 实例进行 HTTP 请求
3. 处理错误和响应数据

### 状态管理
使用 Vuex 管理全局状态，主要包括：
- 应用列表数据
- 提交单元列表数据
- 加载状态
- 错误状态

## 部署

### 使用 Nginx 部署
1. 构建生产版本：`npm run build`
2. 将 `dist/` 目录下的文件部署到 Nginx 服务器
3. 配置 Nginx 反向代理到后端 API

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend-server:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 许可证

本项目仅用于面试演示目的。

