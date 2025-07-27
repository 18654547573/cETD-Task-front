<template>
  <div class="su-toc-preview">
    <div class="preview-header">
      <h3>SU ToC Preview</h3>
      <div class="preview-info">
        <el-tag v-if="submissionUnit" type="info">
          SU {{ submissionUnit.sequenceNum }} - {{ submissionUnit.suType }}
        </el-tag>
        <el-button size="small" @click="generatePreview" :loading="generating">
          <i class="el-icon-refresh"></i> 生成预览
        </el-button>
      </div>
    </div>

    <div class="preview-content">
      <!-- CoU 操作列表 -->
      <div class="cou-operations" v-if="couOperations.length > 0">
        <h4>CoU 操作列表</h4>
        <el-table :data="couOperations" size="small" border>
          <el-table-column prop="type" label="操作类型" width="100">
            <template slot-scope="scope">
              <el-tag :type="getOperationTypeColor(scope.row.type)" size="mini">
                {{ getOperationTypeText(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="nodeId" label="目标节点" width="100"></el-table-column>
          <el-table-column prop="documentPath" label="文档路径" min-width="200"></el-table-column>
          <el-table-column prop="documentTitle" label="文档标题" min-width="150"></el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <el-tag :type="scope.row.applied ? 'success' : 'warning'" size="mini">
                {{ scope.row.applied ? '已应用' : '待应用' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- ToC 预览树 -->
      <div class="toc-preview-tree">
        <div class="tree-header">
          <h4>ToC 结构预览(临时写死的)</h4>
          <div class="tree-actions">
            <el-button size="mini" @click="expandAllPreview">展开全部</el-button>
            <el-button size="mini" @click="collapseAllPreview">收起全部</el-button>
            <el-button size="mini" type="primary" @click="compareWithOriginal">对比原始结构</el-button>
          </div>
        </div>

        <el-tree
          ref="previewTree"
          :data="previewTocData"
          :props="treeProps"
          :default-expand-all="false"
          :expand-on-click-node="false"
          node-key="id"
          class="preview-tree"
        >
          <span class="custom-tree-node" slot-scope="{  data }">
            <span class="node-content">
              <i :class="getNodeIcon(data)" class="node-icon"></i>
              <span class="node-label" :class="getNodeLabelClass(data)">{{ data.name }}</span>
              <el-tag v-if="data.code" size="mini" type="info" class="node-code">{{ data.code }}</el-tag>
              <el-tag v-if="data.couOperation" :type="getOperationTypeColor(data.couOperation)" size="mini" class="node-operation">
                {{ getOperationTypeText(data.couOperation) }}
              </el-tag>
              <el-tag v-if="data.isNew" type="success" size="mini" class="node-status">新增</el-tag>
              <el-tag v-if="data.isModified" type="warning" size="mini" class="node-status">修改</el-tag>
              <el-tag v-if="data.isDeleted" type="danger" size="mini" class="node-status">删除</el-tag>
            </span>
            <span class="node-actions">
              <el-tooltip content="查看变更详情" placement="top" v-if="data.couOperation">
                <el-button size="mini" type="text" @click="showChangeDetail(data)">
                  <i class="el-icon-view"></i>
                </el-button>
              </el-tooltip>
            </span>
          </span>
        </el-tree>
      </div>
    </div>

    <!-- 变更详情对话框 -->
    <el-dialog
      title="变更详情"
      :visible.sync="changeDetailVisible"
      width="600px"
    >
      <div v-if="selectedChange">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getOperationTypeColor(selectedChange.couOperation)">
              {{ getOperationTypeText(selectedChange.couOperation) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="节点ID">{{ selectedChange.id }}</el-descriptions-item>
          <el-descriptions-item label="节点名称">{{ selectedChange.name }}</el-descriptions-item>
          <el-descriptions-item label="节点类型">{{ selectedChange.nodeType }}</el-descriptions-item>
          <el-descriptions-item label="文档路径" v-if="selectedChange.documentPath">
            {{ selectedChange.documentPath }}
          </el-descriptions-item>
          <el-descriptions-item label="文档标题" v-if="selectedChange.documentTitle">
            {{ selectedChange.documentTitle }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedChange.changeDetails" class="change-details">
          <h4>变更详情</h4>
          <div class="json-viewer">{{ formatJson(selectedChange.changeDetails) }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 结构对比对话框 -->
    <el-dialog
      title="结构对比"
      :visible.sync="compareDialogVisible"
      width="80%"
      custom-class="compare-dialog"
    >
      <div class="compare-content">
        <div class="compare-section">
          <h4>原始结构</h4>
          <div class="compare-tree original-tree">
            <ectd-toc-viewer :root-section="originalRootSection" :readonly="true" />
          </div>
        </div>
        <div class="compare-section">
          <h4>预览结构</h4>
          <div class="compare-tree preview-tree">
            <ectd-toc-viewer :root-section="previewTocData" :readonly="true" />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import EctdTocViewer from './EctdTocViewer.vue'
import { formatJson, deepClone } from '@/utils'

export default {
  name: 'SuTocPreview',
  components: {
    EctdTocViewer
  },
  props: {
    submissionUnit: {
      type: Object,
      default: null
    },
    originalRootSection: {
      type: [String, Object],
      default: "[\n" +
          "    {\n" +
          "        \"id\": 9999991,\n" +
          "        \"name\": \"1.BLA-202502\",\n" +
          "        \"children\": [\n" +
          "            {\n" +
          "                \"id\": 8159,\n" +
          "                \"lev\": \"层级\",\n" +
          "                \"code\": \"代码\",\n" +
          "                \"name\": \"1.1 行政信息（Administrative Information）\",\n" +
          "                \"type\": \"类型\",\n" +
          "                \"xpath\": \"XPath\",\n" +
          "                \"children\": [\n" +
          "                    {\n" +
          "                        \"id\": 8164,\n" +
          "                        \"lev\": \"层级\",\n" +
          "                        \"code\": \"代码\",\n" +
          "                        \"name\": \"1.1.1 申请表（Application Form）\",\n" +
          "                        \"type\": \"类型\",\n" +
          "                        \"xpath\": \"XPath\",\n" +
          "                        \"children\": [\n" +
          "                            {\n" +
          "                                \"id\": 1753438778595,\n" +
          "                                \"lev\": \"层级1\",\n" +
          "                                \"pid\": 8164,\n" +
          "                                \"name\": \"测试文档\",\n" +
          "                                \"path\": \"123\",\n" +
          "                                \"format\": \"PDF\",\n" +
          "                                \"nodeType\": \"document\"\n" +
          "                            }\n" +
          "                        ],\n" +
          "                        \"nodeType\": \"section\",\n" +
          "                        \"ectdElement\": \"eCTD元素\"\n" +
          "                    }\n" +
          "                ],\n" +
          "                \"nodeType\": \"module\",\n" +
          "                \"ectdElement\": \"eCTD元素\"\n" +
          "            },\n" +
          "            {\n" +
          "                \"id\": 8160,\n" +
          "                \"lev\": \"层级\",\n" +
          "                \"code\": \"代码\",\n" +
          "                \"name\": \"1.2. 标签和说明书（Labelling）\",\n" +
          "                \"type\": \"类型\",\n" +
          "                \"xpath\": \"XPath\",\n" +
          "                \"children\": [\n" +
          "                    {\n" +
          "                        \"id\": 8165,\n" +
          "                        \"lev\": \"层级\",\n" +
          "                        \"code\": \"代码\",\n" +
          "                        \"name\": \"1.2.1 包装说明书（Package Insert/SPC/SmPC）\",\n" +
          "                        \"type\": \"类型\",\n" +
          "                        \"xpath\": \"XPath\",\n" +
          "                        \"nodeType\": \"section\",\n" +
          "                        \"ectdElement\": \"eCTD元素\"\n" +
          "                    }\n" +
          "                ],\n" +
          "                \"nodeType\": \"module\",\n" +
          "                \"ectdElement\": \"eCTD元素\"\n" +
          "            },\n" +
          "            {\n" +
          "                \"id\": 8161,\n" +
          "                \"lev\": \"层级\",\n" +
          "                \"code\": \"代码\",\n" +
          "                \"name\": \"1.3. 专利与专营权信息（Patent & Exclusivity Data）*\",\n" +
          "                \"type\": \"类型\",\n" +
          "                \"xpath\": \"XPath\",\n" +
          "                \"children\": [\n" +
          "                    {\n" +
          "                        \"id\": 8166,\n" +
          "                        \"lev\": \"层级\",\n" +
          "                        \"code\": \"代码\",\n" +
          "                        \"name\": \"1.3.1 专利声明（Patent Declaration）\",\n" +
          "                        \"type\": \"类型\",\n" +
          "                        \"xpath\": \"XPath\",\n" +
          "                        \"nodeType\": \"section\",\n" +
          "                        \"ectdElement\": \"eCTD元素\"\n" +
          "                    }\n" +
          "                ],\n" +
          "                \"nodeType\": \"module\",\n" +
          "                \"ectdElement\": \"eCTD元素\"\n" +
          "            },\n" +
          "            {\n" +
          "                \"id\": 8162,\n" +
          "                \"lev\": \"层级\",\n" +
          "                \"code\": \"代码\",\n" +
          "                \"name\": \"1.4. 环境风险评估（Environmental Risk Assessment, ERA）\",\n" +
          "                \"type\": \"类型\",\n" +
          "                \"xpath\": \"XPath\",\n" +
          "                \"children\": [\n" +
          "                    {\n" +
          "                        \"id\": 8167,\n" +
          "                        \"lev\": \"层级\",\n" +
          "                        \"code\": \"代码\",\n" +
          "                        \"name\": \"1.4.1 Administrative information\",\n" +
          "                        \"type\": \"类型\",\n" +
          "                        \"xpath\": \"XPath\",\n" +
          "                        \"nodeType\": \"section\",\n" +
          "                        \"ectdElement\": \"eCTD元素\"\n" +
          "                    }\n" +
          "                ],\n" +
          "                \"nodeType\": \"module\",\n" +
          "                \"ectdElement\": \"eCTD元素\"\n" +
          "            },\n" +
          "            {\n" +
          "                \"id\": 8163,\n" +
          "                \"lev\": \"层级\",\n" +
          "                \"code\": \"代码\",\n" +
          "                \"name\": \"1.5. 地区特殊要求\",\n" +
          "                \"type\": \"类型\",\n" +
          "                \"xpath\": \"XPath\",\n" +
          "                \"children\": [\n" +
          "                    {\n" +
          "                        \"id\": 8168,\n" +
          "                        \"lev\": \"层级\",\n" +
          "                        \"code\": \"代码\",\n" +
          "                        \"name\": \"1.5.1 Administrative information\",\n" +
          "                        \"type\": \"类型\",\n" +
          "                        \"xpath\": \"XPath\",\n" +
          "                        \"nodeType\": \"section\",\n" +
          "                        \"ectdElement\": \"eCTD元素\"\n" +
          "                    }\n" +
          "                ],\n" +
          "                \"nodeType\": \"module\",\n" +
          "                \"ectdElement\": \"eCTD元素\"\n" +
          "            }\n" +
          "        ],\n" +
          "        \"nodeType\": \"application\"\n" +
          "    }\n" +
          "]"
    }
  },
  data () {
    return {
      generating: false,
      couOperations: [],
      previewTocData: [],
      treeProps: {
        children: 'children',
        label: 'name'
      },
      changeDetailVisible: false,
      compareDialogVisible: false,
      selectedChange: null
    }
  },
  watch: {
    submissionUnit: {
      handler () {
        this.loadCouOperations()
        this.generatePreview()
      },
      immediate: true
    }
  },
  methods: {
    loadCouOperations () {
      if (!this.submissionUnit || !this.submissionUnit.couData) {
        this.couOperations = []
        return
      }

      try {
        let couData
        if (typeof this.submissionUnit.couData === 'string') {
          couData = JSON.parse(this.submissionUnit.couData)
        } else {
          couData = this.submissionUnit.couData
        }

        this.couOperations = (couData.operations || []).map((op, index) => ({
          ...op,
          id: index,
          applied: false
        }))
      } catch (error) {
        console.error('Failed to parse CoU data:', error)
        this.couOperations = []
      }
    },

    async generatePreview () {
      if (!this.originalRootSection) {
        this.$message.warning('缺少原始Root Section数据')
        return
      }

      this.generating = true
      try {
        // 深拷贝原始结构
        let originalData
        if (typeof this.originalRootSection === 'string') {
          originalData = JSON.parse(this.originalRootSection)
        } else {
          originalData = this.originalRootSection
        }

        const previewData = deepClone(originalData)

        // 应用CoU操作
        this.applyCouOperations(previewData)

        // 确保数据是数组格式
        this.previewTocData = Array.isArray(previewData) ? previewData : [previewData]

        // 标记操作为已应用
        this.couOperations.forEach(op => {
          op.applied = true
        })

        this.$message.success('ToC预览生成成功')
      } catch (error) {
        console.error('Failed to generate preview:', error)
        this.$message.error('生成预览失败：' + error.message)
      } finally {
        this.generating = false
      }
    },

    applyCouOperations (tocData) {
      this.couOperations.forEach(operation => {
        switch (operation.type) {
          case 'add':
            this.applyAddOperation(tocData, operation)
            break
          case 'replace':
            this.applyReplaceOperation(tocData, operation)
            break
          case 'delete':
            this.applyDeleteOperation(tocData, operation)
            break
        }
      })
    },

    applyAddOperation (tocData, operation) {
      const targetNode = this.findNodeById(tocData, operation.nodeId)
      if (targetNode) {
        if (!targetNode.children) {
          targetNode.children = []
        }

        const newNode = {
          id: Date.now() + Math.random(), // 生成临时ID
          name: operation.documentTitle || `新文档 ${targetNode.children.length + 1}`,
          nodeType: 'document',
          documentPath: operation.documentPath,
          documentTitle: operation.documentTitle,
          couOperation: 'add',
          isNew: true,
          pid: targetNode.id,
          lev: (targetNode.lev || 0) + 1,
          changeDetails: operation
        }

        targetNode.children.push(newNode)
      }
    },

    applyReplaceOperation (tocData, operation) {
      const targetNode = this.findNodeById(tocData, operation.nodeId)
      if (targetNode) {
        // 标记为修改
        targetNode.isModified = true
        targetNode.couOperation = 'replace'
        targetNode.changeDetails = operation

        // 更新文档信息
        if (operation.documentPath) {
          targetNode.documentPath = operation.documentPath
        }
        if (operation.documentTitle) {
          targetNode.documentTitle = operation.documentTitle
          targetNode.name = operation.documentTitle
        }
      }
    },

    applyDeleteOperation (tocData, operation) {
      const targetNode = this.findNodeById(tocData, operation.nodeId)
      if (targetNode) {
        // 标记为删除（逻辑删除）
        targetNode.isDeleted = true
        targetNode.couOperation = 'delete'
        targetNode.changeDetails = operation
      }
    },

    findNodeById (nodes, targetId) {
      if (!Array.isArray(nodes)) {
        nodes = [nodes]
      }

      for (const node of nodes) {
        if (node.id === targetId) {
          return node
        }
        if (node.children && node.children.length > 0) {
          const found = this.findNodeById(node.children, targetId)
          if (found) {
            return found
          }
        }
      }
      return null
    },

    getNodeIcon (node) {
      const iconMap = {
        application: 'el-icon-folder-opened',
        module: 'el-icon-folder',
        section: 'el-icon-document',
        document: 'el-icon-document-copy'
      }
      return iconMap[node.nodeType] || 'el-icon-document'
    },

    getNodeLabelClass (node) {
      return {
        'node-deleted': node.isDeleted,
        'node-modified': node.isModified,
        'node-new': node.isNew
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

    expandAllPreview () {
      this.$refs.previewTree.setExpandedKeys(this.getAllNodeKeys(this.previewTocData))
    },

    collapseAllPreview () {
      this.$refs.previewTree.setExpandedKeys([])
    },

    getAllNodeKeys (nodes) {
      let keys = []
      nodes.forEach(node => {
        keys.push(node.id)
        if (node.children && node.children.length > 0) {
          keys = keys.concat(this.getAllNodeKeys(node.children))
        }
      })
      return keys
    },

    showChangeDetail (node) {
      this.selectedChange = node
      this.changeDetailVisible = true
    },

    compareWithOriginal () {
      this.compareDialogVisible = true
    },

    formatJson
  }
}
</script>

<style scoped>
.su-toc-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fafafa;
}

.preview-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.preview-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.cou-operations {
  margin-bottom: 24px;
}

.cou-operations h4 {
  margin-bottom: 12px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.toc-preview-tree {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e6e6e6;
}

.tree-header h4 {
  margin: 0;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.tree-actions {
  display: flex;
  gap: 8px;
}

.preview-tree {
  padding: 16px;
  background-color: #fff;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.node-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.node-icon {
  margin-right: 8px;
  color: #409EFF;
}

.node-label {
  margin-right: 8px;
  color: #333;
}

.node-label.node-deleted {
  text-decoration: line-through;
  color: #999;
}

.node-label.node-modified {
  color: #E6A23C;
  font-weight: 500;
}

.node-label.node-new {
  color: #67C23A;
  font-weight: 500;
}

.node-code,
.node-operation,
.node-status {
  margin-right: 4px;
}

.node-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.el-tree-node__content:hover .node-actions {
  opacity: 1;
}

.change-details {
  margin-top: 20px;
}

.change-details h4 {
  margin-bottom: 12px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.compare-content {
  display: flex;
  gap: 20px;
  height: 600px;
}

.compare-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.compare-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.compare-tree {
  flex: 1;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}

.original-tree {
  background-color: #f8f9fa;
}

.preview-tree {
  background-color: #fff;
}
</style>

<style>
.compare-dialog .el-dialog__body {
  padding: 20px;
}
</style>

