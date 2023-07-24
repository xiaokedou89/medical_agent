<template>
  <div id="roles-list">
    <!-- <el-card class="filter-container">
      <div style="margin-top: 30px">
        <el-form :inline="true" size="small">
          <el-form-item :label="$t('userTypeFilter')">
            <el-select v-model="params.userType" clearable :placeholder="$t('userTypePlace')" @change="changeParamsUserType">
              <el-option
                v-for="item in userArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card> -->
    <!--功能列表-->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('routerTitle.manageRole')}}</span>
      <!-- <el-button style="float: right; margin: 0px 5px" size="small" type="danger" @click="remove">{{$t('delBtn')}}</el-button>
      <router-link to="/manage/addrole">
        <el-button style="float: right; margin: 0px 5px" size="small">{{$t('addBtn')}}</el-button>
      </router-link> -->
    </el-card>
    <!--主列表-->
    <el-row class="table-container">
      <el-col :span="24">
        <el-table v-loading="loading" :data="rolesList" style="width: 100%" border @selection-change="tableSelect">
          <!-- <el-table-column align="center" type="selection" /> -->
          <el-table-column align="center" :label="$t('name')" prop="name">
            <!-- <template slot-scope="scope">
              <el-button type="text" @click="openSetRole(scope.row)">
                {{ scope.row.name }}
              </el-button>
            </template> -->
          </el-table-column>
          <el-table-column align="center" :label="$t('description')">
            <template slot-scope="scope">
              {{ scope.row.notes }}
            </template>
          </el-table-column>
          <el-table-column v-if="true" align="center" fixed="right" width="210" :label="$t('userType')">
            <template slot-scope="scope">
              {{ getUserType(scope.row.userType) }}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!--分页-->
    <div class="pagination-container">
      <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
    </div>
    <!--添加/修改-->
    <el-dialog :title="$t('set')" :visible.sync="setRolesFlag" width="40%">
      <el-form ref="setForm" :model="setObj" label-position="right" :rules="rules" size="small" class="sysuserFormRef" label-width="100px">
        <el-form-item :label="$t('name') + '：'" prop="name">
          <el-input v-model.trim="setObj.name" style="width: 70%" />
        </el-form-item>
        <el-form-item :label="$t('description') + '：'" prop="notes">
          <el-input v-model.trim="setObj.notes" style="width: 70%" />
        </el-form-item>
        <el-form-item class="reset-btn-group">
          <el-button type="primary" size="small" @click="handleSet">{{$t('setBtn')}}</el-button>
          <el-button size="small" @click="cancelSet">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
// 验证规则
import * as rule from '@/utils/rules'
import * as api from '@/api/Roles/roles'
import * as status from '@/utils/status.js'
import { getUserId } from '@/utils/auth'
// 分页组件
import pagination from '@/components/common/pagination/pagination.vue'
import Vue from 'vue'
const rules = {
  name: rule.rolenameRules,
  notes: rule.descriptionRules,
  userType: rule.areaRules
}
// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  // 代理商子账号为6
  // userType: 4,
  sortMode: 'DESC'
}
// 编辑弹框默认对象
const defaultSetObj = {
  id: null,
  name: '',
  notes: '',
  userType: null,
  authority: null,
  agentId: null,
  permissons: null
}

export default {
  name: 'Roles',
  components: {
    pagination
  },
  data() {
    return {
      userId: null,
      rules,
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 列表选择项数组
      tableSelections: [],
      // 主列表角色数组
      rolesList: [Object.assign({}, defaultSetObj)],
      // 分页防抖开关
      flag: false,
      // 编辑角色防抖开关
      setFlag: false,
      // 删除角色防抖开关
      removeFlag: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 列表加载开关
      loading: false,
      // 分页page显示页数
      pageCount: 1,
      // 编辑弹框开关
      setRolesFlag: false,
      // 编辑角色保存节点
      saveSetNode: null,
      // 编辑弹框绑定对象
      setObj: Object.assign({}, defaultSetObj),
      // 编辑角色选择框选项数组
      options: status.userTypeArr,
    }
  },
  created() {
    this.userId = typeof this.$store.state.user.userId === 'number' ? this.$store.state.user.userId : getUserId();
    this.initList(this.params)
  },
  computed: {
    // 根据userType获取对应的用户类型名称
    getUserType() {
      return function (userType) {
        return status.userType(userType)
      }
    }
  },
  methods: {
    // 初始化主列表数据
    initList(params) {
      this.loading = true
      api.getRolesByUserType(6, params)
        .then(res => {
          if (res.code === 20000) {
            this.removeFlag = false
            this.rolesList = res.data
            for (const item of this.rolesList) {
              Vue.set(item, 'removeFlag', false)
              Vue.set(item, 'setFlag', false)
            }
            this.loading = false
            this.sortList()
            this.flag = false
            console.log(this.rolesList)
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            this.flag = false
            this.loading = false
            this.removeFlag && (this.rolesList = []);
            if (this.params.sortMode === 'DESC') {
              this.pageCount !== 1 && this.pageCount--;
            } else {
              this.pageCount !== 1 && this.pageCount++;
            }
          }
        })
        .catch(err => {
          this.loading = false
          this.flag = false
          this.removeFlag = false
          if (this.params.sortMode === 'DESC') {
            this.pageCount !== 1 && this.pageCount--;
          } else {
            this.pageCount !== 1 && this.pageCount++;
          }
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 分页组件点击下页事件
    nextPage() {
      if (!this.flag) {
        this.flag = true
        this.pageCount++
        this.params.sortMode = 'DESC'
        this.params.pkId = this.minId
        this.initList(this.params)
      } else {
        return
      }
    },
    // 分页组件点击上一页事件
    prevPage() {
      if (this.pageCount <= 1) {
        return
      } else {
        if (!this.flag) {
          this.flag = true
          this.pageCount--
          this.params.sortMode = 'ASC'
          this.params.pkId = this.maxId
          this.initList(this.params)
        } else {
          return
        }
      }
    },
    // 改变每页显示条数事件
    pageSizeChange(e) {
      if (this.flag) {
        return
      }
      this.flag = true
      this.params.size = e
      this.params.sortMode = 'DESC'
      this.params.pkId = 0
      this.pageCount = 1
      this.initList(this.params)
    },
    // 排序列表数组保存当前数组最大最小id
    sortList() {
      this.rolesList.sort((a, b) => {
        if (a.id > b.id) {
          return -1
        } else if (a.id < b.id) {
          return 1
        } else {
          return 0
        }
      })
      this.maxId = this.rolesList[0].id
      this.minId = this.rolesList[this.rolesList.length - 1].id
    },
    // 列表选择事件
    tableSelect(value) {
      this.tableSelections = value
    },
    // 点击删除按钮事件
    remove() {
      if (this.tableSelections.length === 0) {
        this.$message({
          message: this.$t('manage.roles.delSelectWarn'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.$confirm(this.$t('manage.roles.delWarn'), this.$t('warning'), {
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warning'
      })
        .then(() => {
          this.removeFlag = true
          const list = []
          for (const item of this.tableSelections) {
            if (item.removeFlag) {
              continue
            }
            item.removeFlag = true
            const promiseItem = new Promise((resolve, reject) => {
              api.delRoles(item.id)
                .then(res => {
                  if (res.code === 20000) {
                    this.$message({
                      message: this.$t('delSucMes'),
                      type: 'success',
                      duration: 1500
                    })
                    item.removeFlag = false
                    resolve(res.data)
                  }
                })
                .catch(err => {
                  this.$message({
                    message: err,
                    type: 'error',
                    duration: 1500
                  })
                  item.removeFlag = false
                  reject(err)
                })
            })
            list.push(promiseItem)
          }
          Promise.allSettled(list)
            .then(() => {
              this.params.pkId = this.maxId + 1
              this.params.sortMode = 'DESC'
              this.initList(this.params)
            })
        })
        .catch(() => {
          this.$message({
            message: this.$t('manage.roles.delCancelMes'),
            type: 'warning',
            duration: 1500
          })
        })
    },
    // 点击名称打开编辑弹框
    openSetRole(item) {
      console.log(item)
      this.saveSetNode = item
      this.setObj = Object.assign({}, this.saveSetNode)
      this.setRolesFlag = true
    },
    // 编辑弹框确认编辑
    handleSet() {
      if (this.saveSetNode.setFlag) {
        return
      }
      this.saveSetNode.setFlag = true
      this.$refs.setForm.validate(valid => {
        if (valid) {
          api.setRoles(this.setObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('setSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.saveSetNode.setFlag = false
                this.saveSetNode.name = this.setObj.name
                this.saveSetNode.notes = this.setObj.notes
                this.saveSetNode.userType = this.setObj.userType
                this.saveSetNode = null
                this.setObj = Object({}, defaultSetObj)
                this.setRolesFlag = false
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
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.saveSetNode.setFlag = false
        }
      })
    },
    // 编辑弹框取消事件
    cancelSet() {
      this.saveSetNode = null
      this.setObj = Object({}, defaultSetObj)
      this.setRolesFlag = false
    }
  }
}
</script>
<style lang="scss" scoped>
#roles-list {
  padding: 30px;
}
.operate-container {
  margin-top: 20px;
}
.table-container {
  margin-top: 20px;
}
.pagination-container {
  float: right;
}
.el-tag {
  margin: 2px;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
