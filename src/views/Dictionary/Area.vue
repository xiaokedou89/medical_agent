<template>
  <div class="area">
    <!--功能列表-->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('dictionary.area.operateTitle')}}</span>
      <el-button style="float: right; margin: 0px 5px" size="small" @click="showAdd = true">{{$t('dictionary.area.addBtn')}}</el-button>
    </el-card>
    <!--主列表-->
    <el-card v-loading="loading" class="table-container">
      <el-tree
        ref="tree"
        :data="areaObj.children"
        :props="{label: 'name',children: 'children'}"
        node-key="id"
        :expand-on-click-node="false"
      >
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <span>
            <el-button type="text" @click="openSetArea(node, data)">{{ data.name }}</el-button>
          </span>
          <span>
            <el-button type="text" size="mini" @click="showAddSonArea(data)">{{$t('dictionary.area.addSonBtn')}}</el-button>
            <el-button type="text" size="mini" @click="remove(node, data)">{{$t('dictionary.area.delBtn')}}</el-button>
          </span>
        </span>
      </el-tree>
    </el-card>
    <!--添加区域-->
    <el-dialog :visible.sync="showAdd" :title="$t('dictionary.area.dialogAddTitle')" width="50%">
      <el-form ref="addForm" :model="addObj" :rules="rules" label-width="80px" label-position="right">
        <el-form-item :label="$t('dictionary.area.dialogAddName')" prop="name">
          <el-input v-model.trim="addObj.name" :placeholder="$t('dictionary.area.dialogAddNamePlace')" style="width: 60%" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="add">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancel">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--编辑区域-->
    <el-dialog :visible.sync="showSetArea" :title="$t('dictionary.area.dialogSetTitle')" width="50%">
      <el-form ref="setForm" :model="setObj" :rules="rules" label-width="80px" label-position="right">
        <el-form-item :label="$t('dictionary.area.dialogSetName')" prop="name">
          <el-input v-model.trim="setObj.name" :placeholder="$t('dictionary.area.dialogSetNamePlace')" style="width: 60%" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="setArea">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelSet">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as rule from '@/utils/rules'
import * as api from '@/api/Area/area'
import Vue from 'vue'
const rules = {
  name: rule.rolenameRules
}
// 添加区域表单绑定对象默认值
const defaultAddObj = {
  id: null,
  name: '',
  parentId: null
}
// 编辑区域表单绑定对象默认值
const defaultSetObj = {
  id: null,
  name: '',
  parentId: null
}
export default {
  name: 'Area',
  data() {
    return {
      // 表单验证规则
      rules,
      // 添加区域防抖开关
      addFlag: false,
      // 删除区域防抖开关
      removeFlag: false,
      // 主列表加载开关
      loading: false,
      // 添加区域弹框开关
      showAdd: false,
      showSetArea: false,
      setObj: Object.assign({}, defaultSetObj),
      // 添加区域表单绑定对象
      addObj: Object.assign({}, defaultAddObj),
      // 打开添加子区域保存值
      parentId: null,
      // 主列表绑定数组
      areaObj: {},
      // 添加子区域拷贝父节点
      parentNode: null,
      // 编辑区域保存节点
      saveSetNode: null
    }
  },
  created() {
    this.initArea(this.areaObj, 0)
  },
  methods: {
    initArea(obj, id) {
      api.searchAllSonArea(id)
        .then(res => {
          if (res.code === 20000 && res.data.length > 0) {
            Vue.set(obj, 'children', res.data)
            for (let item of res.data) {
              Vue.set(item, 'setFlag', false)
              this.initArea(item, item.id)
            }
          } else if (res.code === 20004) {
            Vue.set(obj, 'children', [])
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 验证表单函数
    validate(formName, success, fail = function() { return }) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          success()
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          fail()
          return false
        }
      })
    },
    // 添加区域表单验证成功后
    addArea() {
      this.addObj.parentId = this.parentNode === null ? 0 : this.parentNode.id
      api.addArea(this.addObj)
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('addSucMes'),
              type: 'success',
              duration: 1500
            })
            this.addObj.id = res.data
            // 添加子区域拷贝的父节点为空，添加的是一级区域
            if (this.parentNode === null) {
              this.areaObj.children.push(this.addObj)
              // this.$refs.tree.append(this.addObj, this.$refs.tree)
            } else if (!this.parentNode.children) {
              this.$set(this.parentNode, 'children', [])
              this.parentNode.children.push(this.addObj)
            } else {
              this.parentNode.children.push(this.addObj)
            }
            this.$set(this.addObj, 'children', [])
            this.addObj = Object.assign({}, defaultAddObj)
            this.parentNode = null
            this.addFlag = false
            this.showAdd = false
          }
        })
        .catch(err => {
          this.$message({
            message: this.$t('dictionary.area.addAreaFailMes') + err,
            type: 'error',
            duration: 1500
          })
          this.addObj = Object.assign({}, defaultAddObj)
          this.parentNode = null
          this.addFlag = false
          this.showAdd = false
        })
    },
    // 添加区域表单验证失败
    addFail() {
      this.addFlag = false
      return
    },
    // 添加子区域点击
    showAddSonArea(data) {
      this.showAdd = true
      this.parentNode = data
    },
    // 添加总区域弹框确认
    add() {
      if (this.addFlag) {
        return
      }
      this.addFlag = true
      this.validate('addForm', this.addArea, this.addFail)
    },
    // 添加总区域弹框取消
    cancel() {
      this.addObj = Object.assign({}, defaultAddObj)
      this.parentNode = null
      this.showAdd = false
    },
    // 删除区域事件
    remove(node, data) {
      if (this.removeFlag) {
        return
      }
      this.removeFlag = true
      this.$confirm(this.$t('dictionary.area.removeAreaMes') + data.name, this.$t('warning'), {
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warining'
      })
      .then(() => {
        api.delArea(data.id)
          .then(res => {
            if (res.code === 20000) {
              const parent = node.parent
              const children = parent.data.children || parent.data
              const index = children.findIndex(d => d.id === data.id)
              children.splice(index, 1)
              parent.childNodes.splice(index, 1)
              this.$message({
                message: this.$t('dictionary.area.delAreaSucMes'),
                type: 'success',
                duration: 1500
              })
              this.removeFlag = false
            }
          })
          .catch(err => {
            this.$message({
              message: err,
              type: 'error',
              duration: 1500
            })
            this.removeFlag = false
          })
      })
      .catch(() => {
        this.$message({
          message: this.$t('dictionary.area.delAreaCancelMes'),
          type: 'warning',
          duration: 1500
        })
        this.removeFlag = false
      })
    },
    // 点击编辑区域
    openSetArea(node, data) {
      const { id, name, parentId } = data
      this.setObj = { id, name, parentId }
      this.saveSetNode = data
      this.showSetArea = true
    },
    // 取消编辑
    cancelSet() {
      this.showSetArea = false
      this.setObj = Object.assign({}, defaultSetObj)
      this.saveSetNode = null
    },
    // 编辑区域表单验证成功后
    dealSet() {
      api.setArea(this.setObj.id, this.setObj.name)
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('setSucMes'),
              type: 'success',
              duration: 1500
            })
            this.saveSetNode.setFlag = false
            this.saveSetNode.name = this.setObj.name
            this.saveSetNode = null
            this.setObj = Object.assign({}, defaultSetObj)
            this.showSetArea = false
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
          this.saveSetNode.setFlag = false
        })
    },
    // 编辑区域表单验证失败
    setFail() {
      this.saveSetNode.setFlag = false
      return
    },
    // 确认编辑
    setArea() {
      if (this.saveSetNode.setFlag) {
        return
      }
      this.saveSetNode.setFlag = true
      this.validate('setForm', this.dealSet)
    }
  }
}
</script>
<style lang="scss" scoped>
.area {
  padding: 30px;
}
.operate-container {
  margin-top: 20px;
}
.table-container {
  margin-top: 20px;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  padding-right: 8px;
}
</style>
