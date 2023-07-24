<template>
  <div id="manage-list">
    <el-card class="filter-container">
      <div style="margin-top: 30px">
        <el-form :inline="true" size="small">
          <el-form-item :label="$t('statusFilter') + '：'">
            <el-select v-model="listQuery.status" :placeholder="$t('all')" @change="statusQueryChange" clearable>
              <el-option
                v-for="item in patientStatusArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <!--功能列表-->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('manage.index.operateTitle')}}</span>
      <el-button style="float: right; margin: 0px 5px" size="small" type="danger" @click="remove">{{$t('delBtn')}}</el-button>
      <router-link to="/manage/addmanager">
        <el-button style="float: right; margin: 0px 5px" size="small" >{{$t('addBtn')}}</el-button>
      </router-link>
    </el-card>
    <!--主列表-->
    <el-row class="table-container">
      <el-col :span="24">
        <el-table v-loading="loading" :data="list" :fit="true" style="width: 100%" @selection-change="tableSelect" border>
          <el-table-column align="center" type="selection" />
          <el-table-column align="center" :label="$t('username')">
            <template slot-scope="scope">
              {{ scope.row.username }}
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('name')">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('roleSelect')">
            <template slot-scope="scope">
              <el-button type="text" @click="showChangeRole(scope.row)">{{ scope.row.roles[0] | getRoleName }}</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('status')">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="getStatus(scope.row.status)" placement="top">
                <el-switch
                  v-model="scope.row.status"
                  :disabled="scope.row.statusFlag"
                  :active-value="1"
                  :inactive-value="0"
                  @change="changeStatus($event, scope.row)"
                />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column v-if="true" align="center" fixed="right" width="250" :label="$t('action')">
            <template slot-scope="scope">
              <el-button size="small" type="danger" @click="showSetPassword(scope.row)">{{$t('agent.index.setPassword')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!--分页-->
    <div class="pagination-container">
      <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
    </div>
    <!--角色分配-->
    <el-dialog :title="$t('set')" :visible.sync="showSetRole" v-if="showSetRole" width="30%">
      <el-form ref="setRoleForm"  label-position="right" :rule="rules" size="small" label-width="100px">
        <!-- <el-form-item :label="$t('roleSelect') + '：'" prop="roleId">
          <el-select v-model="setRoleObj.roleId" :placeholder="$t('roleSelectPlace')">
            <el-option
              v-for="item in roleArr"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item :label="$t('roleSelect') + '：'" >
          <el-checkbox :indeterminate="roleSaveNode.indeterFlag" v-model="roleSaveNode.allRoleFlag" @change="handleCheckAll">{{ $t('allCheck') }}</el-checkbox>
          <el-checkbox-group v-model="setRoleObj" @change="setRoleObjChange">
            <el-checkbox v-for="item in roleArr" :label="item.id" :key="item.id">
              <el-tooltip :content="item.notes" placement="top">
                <span>{{ item.name }}</span>
              </el-tooltip>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item class="reset-btn-group">
          <el-button type="primary" size="small" @click="handleSetRole">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelSetRole">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--重置密码-->
    <el-dialog
      :visible.sync="setPasswordFlag"
      v-if="setPasswordFlag"
      :before-close="setPassClosing"
      :title="$t('resetPassword')"
      width="40%"
    >
      <el-form :model="setPasswordObj" ref="setPasswordForm" :rules="rules" size="small" label-width="120px">
        <el-form-item :label="$t('oldPassword') + '：'" prop="oldPassword">
          <el-input v-model="setPasswordObj.oldPassword" :placeholder="$t('oldPassPlace')" style="width: 70%" show-password />
        </el-form-item>
        <el-form-item :label="$t('newPassword') + '：'" prop="newPassword">
          <el-input v-model="setPasswordObj.newPassword" :placeholder="$t('newPassPlace')" style="width: 70%" show-password />
        </el-form-item>
        <el-form-item :label="$t('repeatPassword') + '：'" prop="repeatPassword">
          <el-input v-model.trim="setPasswordObj.repeatPassword" :placeholder="$t('repeatPassPlace')" clearable show-password style="width: 70%" />
        </el-form-item>
        <el-form-item class="price-dialog-btn">
          <el-button size="small" type="primary" @click="handleSetPassword">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelSetPassword">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as rule from '@/utils/rules'
import * as api from '@/api/Admin/admin'
import * as roleApi from '@/api/Roles/roles'
import * as status from '@/utils/status'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'
import { getUserId, getWorker, getAgent } from '@/utils/auth'
import { i18n } from '@/assets/languages/i18n.js'
const rules = {
  username: rule.accountnameRules,
  name: rule.nameRules,
  password: rule.passwordRules,
  oldPassword: rule.unpasswordRules,
  newPassword: rule.passwordRules,
  repeatPassword: rule.passwordRules,
  roleId: rule.ladderRules
}

// 默认拉取列表数据参数对象
const defaultParams = {
  size: status.size,
  sortMode: 'DESC',
  pkId: 0,
  status: -1
}

// 默认角色分配弹框绑定对象
const defaultRoleObj = {
  id: null,
  userId: null,
  roleId: null,
  userType: 6
}

// 默认重置密码弹框绑定对象
const defaultPasswordObj = {
  userId: null,
  oldPassword: null,
  newPassword: null,
  repeatPassword: null
}

export default {
  name: 'ManageList',
  data() {
    return {
      checkedArr: [],
      testFlag: false,
      checkStyle: true,
      userId: null,
      rules,
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 列表选择项数组
      tableSelections: [],
      // 主列表绑定数组
      list: [],
      // 分页防抖开关
      flag: false,
      // 列表加载开关
      loading: false,
      // 删除功能拉取数据判断开关
      removeFlag: false,
      // 角色分配弹框开关
      showSetRole: false,
      // 重置密码开关
      setPasswordFlag: false,
      // 筛选模块状态筛选开关
      statusQueryFlag: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 分页page显示页数
      pageCount: 1,
      // 角色编辑下拉选择框绑定数组
      roleArr: [],
      // 编辑角色保存节点
      roleSaveNode: null,
      // 角色弹框绑定对象
      setRoleObj: JSON.parse(JSON.stringify(defaultRoleObj)),
      // 重置密码保存节点
      passwordSaveNode: null,
      // 重置密码弹框绑定对象
      setPasswordObj: Object.assign({}, defaultPasswordObj),
      // 筛选模块状态下拉选择框绑定数组
      patientStatusArr: status.patientStatusArr,
      // 筛选模块对象
      listQuery: {
        status: -1
      }
    }
  },
  components: {
    pagination
  },
  created() {
    if (getWorker() == 'worker') {
      this.userId = JSON.parse(getAgent()).id
    } else {
      this.userId = typeof this.$store.state.user.userId === 'number' ? this.$store.state.user.userId : getUserId()
    }
    this.initRoleArr()
    this.initList(this.params)
  },
  computed: {
    getStatus() {
      return status.adminStatus
    }
  },
  filters: {
    getRoleName(role) {
      let name = typeof role === 'undefined' ? i18n.t('noRole') : role.name
      return name
    }
  },
  methods: {
    // 初始化角色编辑下拉选择框绑定数组
    initRoleArr() {
      roleApi.getRoles(this.userId, {
        pkId: 0,
        sortMode: 'DESC',
        userType: 6,
        size: 1000
      })
        .then(res => {
          if (res.code === 20000 && res.data.length > 0) {
            this.roleArr = res.data
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('manage.index.initRoleFail'),
              type: 'warning',
              duration: 2000
            })
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
    //初始化列表数据
    initList(params) {
      this.loading = true
      api.getAgentWorkers(this.userId, params)
        .then(res => {
          console.log(res.data)
          if (res.code === 20000) {
            this.list = res.data
            this.loading = false
            this.sortList()
            this.flag = false
            this.statusQueryFlag = false
            for (const item of this.list) {
              Vue.set(item, 'statusFlag', false)
              Vue.set(item, 'removeFlag', false)
              Vue.set(item, 'setRoleFlag', false)
              if (item.roles.length > 0) {
                Vue.set(item, 'indeterFlag', true)
              } else {
                Vue.set(item, 'indeterFlag', false)
              }
              Vue.set(item, 'allRoleFlag', false)
              Vue.set(item, 'setPasswordFlag', false)
            }
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            this.flag = false
            this.loading = false
            if (this.statusQueryFlag || this.removeFlag) {
              this.list = []
            }
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
          this.statusQueryFlag = false
          if (params.sortMode === 'DESC') {
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
      this.params.sortMode = 'DESC';
      this.params.pkId = 0;
      this.params.size = e
      this.pageCount = 1
      this.initList(this.params)
    },
    // 管理员状态筛选框值改变事件
    statusQueryChange(e) {
      this.statusQueryFlag = true
      if (typeof e === 'number') {
        this.params.status = e
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.pageCount = 1
        this.initList(this.params)
      } else {
        this.params.status = -1
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.pageCount = 1
        this.initList(this.params)
      }
    },
    // 排序列表数组保存当前数组最大最小id
    sortList() {
      this.list.sort((a, b) => {
        if (a.id > b.id) {
          return -1
        } else if (a.id < b.id) {
          return 1
        } else {
          return 0
        }
      })
      this.maxId = this.list[0].id
      this.minId = this.list[this.list.length - 1].id
    },
    // 状态滑块改变值事件
    changeStatus(e, item) {
      if (item.statusFlag) {
        return
      }
      item.statusFlag = true
      api.changeWorkerStatus(item.id, e)
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('manage.index.setStatusSuc'),
              type: 'success',
              duration: 1500
            })
            item.statusFlag = false
          } else {
            this.$message({
              message: res.message,
              type: 'error',
              duration: 1500
            })
            item.statusFlag = false
            item.status = item.status === 0 ? 1 : 0
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
          item.statusFlag = false
          item.status = item.status === 0 ? 1 : 0
        })
    },
    // 列表选择事件
    tableSelect(value) {
      this.tableSelections = value
    },
    // 点击删除事件
    remove() {
      if (this.tableSelections.length === 0) {
        this.$message({
          message: this.$t('manage.index.delSelectWarn'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      for (const item of this.tableSelections) {
        if (item.status === 1) {
          this.$message({
            message: this.$t('manage.index.delReturnWarn'),
            type: 'warning',
            duration: 2000
          })
          return
        }
      }
      this.$confirm(this.$t('manage.index.delWarn'), this.$t('warning'), {
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
              api.delWorker(item.id)
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
          message: this.$t('manage.index.delCancel'),
          type: 'warning',
          duration: 1500
        })
      })
    },
    // 点击角色名称打开角色分配弹框
    // showChangeRole(item) {
    //   console.log(item)
    //   this.roleSaveNode = item
    //   this.setRoleObj.userId = item.id
    //   if (item.roles.length > 0) {
    //     this.setRoleObj.roleId = item.roles[0].id
    //   }

    //   // this.setRoleObj.userType = item.roles[0].userType
    //   this.showSetRole = true
    // },
    showChangeRole(item) {
      // 保存修改的管理员对象
      this.roleSaveNode = item
      // 赋值多选框绑定数组，回显
      let checkedRoles = []
      item.roles.forEach(item => {
        checkedRoles.push(item.id)
      })
      this.setRoleObj = checkedRoles
      // 判断是不是全选及全选按钮样式
      this.roleSaveNode.allRoleFlag = this.setRoleObj.length == this.roleArr.length ? true : false
      this.roleSaveNode.indeterFlag = this.setRoleObj.length > 0 && this.setRoleObj.length < this.roleArr.length
      this.showSetRole = true
    },
    // 全选按钮值改变
    handleCheckAll(val) {
      let allRoles = []
      this.roleArr.forEach(item => {
        allRoles.push(item.id)
      })
      this.setRoleObj = val ? allRoles : []
      this.roleSaveNode.indeterFlag = false
    },
    // 选中角色改变
    setRoleObjChange(val) {
      let checkedLength = val.length
      this.roleSaveNode.allRoleFlag = checkedLength == this.roleArr.length
      this.roleSaveNode.indeterFlag = checkedLength > 0 && checkedLength < this.roleArr.length
    },
    // 角色分配弹框点击确认事件
    handleSetRole() {
      if (this.roleSaveNode.setRoleFlag) {
        return
      }
      this.roleSaveNode.setRoleFlag = true
      let oldRoles = []
      this.roleSaveNode.roles.forEach(item => {
        oldRoles.push(item.id)
      })
      console.log('old',oldRoles)
      console.log('new',this.setRoleObj)
      let addRoles = [],
          delRoles = []
      this.setRoleObj.forEach(item => {
        if (!oldRoles.includes(item)) {
          addRoles.push(item)
        }
      })
      oldRoles.forEach(item => {
        if (!this.setRoleObj.includes(item)) {
          delRoles.push(item)
        }
      })
      const allRolesRequest = []
      if (addRoles.length > 0) {
        addRoles.forEach(item => {
          allRolesRequest.push(new Promise((resolve, reject) => {
            roleApi.addRole({
              roleId: item,
              userId: this.roleSaveNode.id,
              userType: status.userTypeObj.worker
            })
            .then(res => {
              console.log('addRes', res)
              if (res.code === 20000) {
                resolve(res.data)
              } else {
                reject(res.message)
              }
            })
            .catch(err => {
              reject(err)
            })
          }))
        })
      }
      if (delRoles.length > 0) {
        delRoles.forEach(item => {
          allRolesRequest.push(new Promise((resolve, reject) => {
            roleApi.delRole({
              userType: status.userTypeObj.worker,
              roleId: item,
              userId: this.roleSaveNode.id
            })
            .then(res => {
              console.log('delRes', res)
              if (res.code === 20000) {
                resolve(res.data)
              } else {
                reject(res.message)
              }
            })
            .catch(err => {
              reject(err)
            })
          }))
        })
      }
      if (allRolesRequest.length > 0) {
        Promise.allSettled(allRolesRequest)
          .then(resultArr => {
            this.$message({
              message: this.$t('setSucMes'),
              type: 'success',
              duration: 1500
            })
            this.initList(this.params)
            this.roleSaveNode.setRoleFlag = false
            this.roleSaveNode = null
            this.showSetRole = false
          })
      } else {
        this.roleSaveNode.setRoleFlag = false
        this.roleSaveNode = null
        this.showSetRole = false
      }
    },
    // handleSetRole() {
    //   if (this.roleSaveNode.setRoleFlag) {
    //     return
    //   }
    //   this.roleSaveNode.setRoleFlag = true
    //   this.$refs.setRoleForm.validate(valid => {
    //     if (valid) {
    //       console.log(this.setRoleObj)
    //       roleApi.addRole(this.setRoleObj)
    //         .then(res => {
    //           if (res.code === 20000) {
    //             this.$message({
    //               message: this.$t('setSucMes'),
    //               type: 'success',
    //               duration: 1500
    //             })
    //             this.roleSaveNode.setRoleFlag = false
    //             for (let item of this.roleArr) {
    //               if (this.setRoleObj.roleId === item.id) {
    //                 this.roleSaveNode.roles.splice(0, 1, Object.assign({}, item))
    //               }
    //             }
    //             this.setRoleObj = Object.assign({}, defaultRoleObj)
    //             this.roleSaveNode = null
    //             this.showSetRole = false
    //           } else {
    //             return new Error(res.message)
    //           }
    //         })
    //         .catch(err => {
    //           this.$message({
    //             message: err,
    //             type: 'error',
    //             duration: 1500
    //           })
    //           this.roleSaveNode.setRoleFlag = false
    //         })
    //     } else {
    //       this.$message({
    //         message: this.$t('validFailMes'),
    //         type: 'warning',
    //         duration: 1500
    //       })
    //       this.roleSaveNode.setRoleFlag = false
    //     }
    //   })

    // },
    // 角色分配弹框点击取消事件
    cancelSetRole() {
      this.showSetRole = false
    },
    // cancelSetRole() {
    //   this.setRoleObj = Object.assign({}, defaultRoleObj)
    //   this.roleSaveNode = null
    //   this.showSetRole = false
    // },
    // 点击重置密码事件
    showSetPassword(item) {
      this.passwordSaveNode = item
      this.setPasswordObj = Object.assign({}, defaultPasswordObj)
      this.setPasswordObj.userId = item.id
      this.setPasswordFlag = true
    },
    // 重置密码弹框点击确定事件
    handleSetPassword() {
      if (this.passwordSaveNode.setPasswordFlag) {
        return
      }
      if (this.setPasswordObj.newPassword != this.setPasswordObj.repeatPassword) {
        this.$message({
          message: this.$t('repeatFail'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.passwordSaveNode.setPasswordFlag = true
      this.$refs.setPasswordForm.validate(valid => {
        if (valid) {
          api.resetWorkerPassword(this.setPasswordObj.userId, this.setPasswordObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('manage.index.setPasswordSuc'),
                  type: 'success',
                  duration: 1500
                })
                this.passwordSaveNode.setPasswordFlag = false
                this.passwordSaveNode = null
                this.setPasswordObj = Object.assign({}, defaultPasswordObj)
                this.setPasswordFlag = false
              } else {
                this.$message({
                  message: res.message,
                  type: 'error',
                  duration: 1500
                })
                this.passwordSaveNode.setPasswordFlag = false
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.passwordSaveNode.setPasswordFlag = false
              this.passwordSaveNode = null
              this.setPasswordObj = Object.assign({}, defaultPasswordObj)
              this.setPasswordFlag = false
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'warning',
            duration: 1500
          })
          this.passwordSaveNode.setPasswordFlag = false
        }
      })
    },
    // 重置密码弹框点击取消事件
    cancelSetPassword() {
      this.passwordSaveNode = null
      this.setPasswordObj = Object.assign({}, defaultPasswordObj)
      this.setPasswordFlag = false
    },
    setPassClosing(done) {
      this.$refs.setPasswordForm.clearValidate()
      done()
    }
  }
}
</script>
<style lang="scss" scoped>
#manage-list {
  padding: 30px;
}
.operate-container {
  margin-top: 20px;
}
.el-switch {
  margin-left: 10px;
}
.table-container {
  margin-top: 20px;
}
.pagination-container {
  float: right;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
