<template>
  <div class="ectd-toc-viewer">
    <div class="toc-header">
      <h3>eCTD 4.0 Structure ToC</h3>
      <div class="toc-actions">
        <el-button size="small" @click="expandAll">展开全部</el-button>
        <el-button size="small" @click="collapseAll">收起全部</el-button>
        <el-button size="small" type="primary" @click="refreshToc">刷新</el-button>
      </div>
    </div>

    <div class="toc-content">
      <el-tree
        ref="tocTree"
        :data="tocData"
        :props="treeProps"
        :default-expand-all="false"
        :expand-on-click-node="false"
        node-key="id"
        class="ectd-tree"
      >
        <span class="custom-tree-node" slot-scope="{  data }">
          <span class="node-content">
            <i :class="getNodeIcon(data)" class="node-icon"></i>
            <span class="node-label">{{ data ? data.name : '' }}</span>
            <el-tag v-if="data && data.code" size="mini" type="info" class="node-code">{{ data.code }}</el-tag>
            <el-tag v-if="data && data.ectdElement" size="mini" type="success" class="node-element">{{ data.ectdElement }}</el-tag>
          </span>
          <span class="node-actions">
            <el-tooltip content="节点详情" placement="top">
              <el-button size="mini" type="text" @click="showNodeDetail(data)">
                <i class="el-icon-info"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip v-if="data && data.nodeType === 'section' && !readonly" content="添加文档" placement="top">
              <el-button size="mini" type="text" @click="addDocument(data)">
                <i class="el-icon-document-add"></i>
              </el-button>
            </el-tooltip>
          </span>
        </span>
      </el-tree>
    </div>

    <!-- 节点详情对话框 -->
    <el-dialog
      title="节点详情"
      :visible.sync="nodeDetailVisible"
      width="600px"
    >
      <div v-if="selectedNode">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="节点ID">{{ selectedNode.id }}</el-descriptions-item>
          <el-descriptions-item label="节点名称">{{ selectedNode.name }}</el-descriptions-item>
          <el-descriptions-item label="节点类型">{{ getNodeTypeText(selectedNode.nodeType) }}</el-descriptions-item>
          <el-descriptions-item label="层级">{{ selectedNode.lev || 'N/A' }}</el-descriptions-item>
          <el-descriptions-item label="代码">{{ selectedNode.code || 'N/A' }}</el-descriptions-item>
          <el-descriptions-item label="eCTD元素">{{ selectedNode.ectdElement || 'N/A' }}</el-descriptions-item>
          <el-descriptions-item label="XPath">{{ selectedNode.xpath || 'N/A' }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ selectedNode.type || 'N/A' }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedNode.keywordTypeApplied" class="keyword-section">
          <h4>关键字类型</h4>
          <div class="json-viewer">{{ formatJson(selectedNode.keywordTypeApplied) }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 添加文档对话框 -->
    <el-dialog
      title="添加文档"
      :visible.sync="addDocumentVisible"
      width="500px"
    >
      <el-form :model="documentForm" label-width="100px">
        <el-form-item label="文档标题">
          <el-input v-model="documentForm.title" placeholder="请输入文档标题"></el-input>
        </el-form-item>
        <el-form-item label="文档类型">
          <el-select v-model="documentForm.format" placeholder="请选择文档类型" style="width: 100%">
            <el-option label="PDF" value="PDF"></el-option>
            <el-option label="Word" value="DOCX"></el-option>
            <el-option label="Excel" value="XLSX"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文档路径">
          <el-input v-model="documentForm.path" placeholder="请输入文档路径"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDocumentVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddDocument">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { formatJson } from '@/utils'

export default {
  name: 'EctdTocViewer',
  props: {
    rootSection: {
      type: [String, Object],
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'application', // 'application' 或 'submissionUnit'
      validator: value => ['application', 'submissionUnit'].includes(value)
    },
    submissionUnitId: {
      type: [String, Number],
      default: null
    }
  },
  data () {
    return {
      tocData: [],
      treeProps: {
        children: 'children',
        label: 'name'
      },
      nodeDetailVisible: false,
      addDocumentVisible: false,
      selectedNode: null,
      documentForm: {
        title: '',
        format: 'PDF',
        path: ''
      }
    }
  },
  watch: {
    rootSection: {
      handler (newVal) {
        this.loadTocData()
      },
      immediate: true
    }
  },
  methods: {
    loadTocData () {
      if (!this.rootSection) {
        this.tocData = []
        return
      }

      try {
        let data
        if (typeof this.rootSection === 'string') {
          data = JSON.parse(this.rootSection)
        } else {
          data = this.rootSection
        }

        // 确保数据是数组格式
        this.tocData = Array.isArray(data) ? data : [data]
      } catch (error) {
        console.error('Failed to parse root section data:', error)
        this.tocData = []
      }
    },

    getNodeIcon (node) {
      if (!node || !node.nodeType) {
        return
      }
      const iconMap = {
        application: 'el-icon-folder-opened',
        module: 'el-icon-folder',
        section: 'el-icon-document',
        document: 'el-icon-document-copy'
      }
      return iconMap[node.nodeType] || 'el-icon-document'
    },

    getNodeTypeText (nodeType) {
      const typeMap = {
        application: '应用程序',
        module: '模块',
        section: '章节',
        document: '文档'
      }
      return typeMap[nodeType] || nodeType
    },

    expandAll () {
      this.$refs.tocTree.setExpandedKeys(this.getAllNodeKeys(this.tocData))
    },

    collapseAll () {
      this.$refs.tocTree.setExpandedKeys([])
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

    refreshToc () {
      this.loadTocData()
      this.$message.success('ToC结构已刷新')
    },

    showNodeDetail (node) {
      this.selectedNode = node
      this.nodeDetailVisible = true
    },

    addDocument (node) {
      if (this.readonly) {
        this.$message.warning('只读模式下无法添加文档')
        return
      }

      this.selectedNode = node
      this.documentForm = {
        title: '',
        format: 'PDF',
        path: ''
      }
      this.addDocumentVisible = true
    },

    confirmAddDocument () {
      if (!this.documentForm.title || !this.documentForm.path) {
        this.$message.error('请填写完整的文档信息')
        return
      }

      if (this.mode === 'submissionUnit' && this.submissionUnitId) {
        // Submission Unit 模式：生成CoU操作
        this.addCouOperation()
      } else {
        // Application 模式：直接修改Root Section
        this.addDocumentToRootSection()
      }
    },

    addCouOperation () {
      // 创建CoU操作对象
      const couOperation = {
        operation: 'add',
        targetNodeId: this.selectedNode.id,
        targetXpath: this.selectedNode.xpath,
        document: {
          fileId: 'doc_' + Date.now(),
          title: this.documentForm.title,
          format: this.documentForm.format,
          path: this.documentForm.path
        },
        description: `在节点 ${this.selectedNode.name} 下添加文档 ${this.documentForm.title}`
      }

      // 触发CoU操作事件，让父组件处理
      this.$emit('cou-operation', couOperation)

      this.addDocumentVisible = false
      this.$message.success('CoU操作已添加')
    },

    addDocumentToRootSection () {
      // 创建新的文档节点
      const newDocument = {
        id: Date.now(), // 临时ID
        name: this.documentForm.title,
        nodeType: 'document',
        format: this.documentForm.format,
        path: this.documentForm.path,
        pid: this.selectedNode.id,
        lev: (this.selectedNode.lev || 0) + 1
      }

      // 添加到选中节点的children中
      if (!this.selectedNode.children) {
        this.$set(this.selectedNode, 'children', [])
      }
      this.selectedNode.children.push(newDocument)

      this.addDocumentVisible = false
      this.$message.success('文档添加成功')

      // 触发更新事件
      this.$emit('toc-updated', this.tocData)
    },

    formatJson
  }
}
</script>

<style scoped>
.ectd-toc-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fafafa;
}

.toc-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.toc-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.ectd-tree {
  background-color: transparent;
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

.node-code {
  margin-right: 4px;
}

.node-element {
  margin-right: 4px;
}

.node-actions {
  display: flex;
  align-items: center;
}

.node-actions .el-button {
  padding: 4px;
  margin-left: 4px;
}

.keyword-section {
  margin-top: 20px;
}

.keyword-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

/* Tree node hover effect */
.el-tree-node__content:hover .node-actions {
  opacity: 1;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.el-tree-node__content:hover .node-actions {
  opacity: 1;
}

/* Tree node level indentation */
.el-tree-node__children {
  overflow: visible;
}

/* Custom tree node styling */
.el-tree-node__content {
  height: auto;
  min-height: 32px;
  padding: 4px 0;
}

.el-tree-node__expand-icon {
  color: #409EFF;
}
</style>

