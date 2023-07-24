<template>
  <div id="doctors">
    <!--功能列表-->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('doctor.index.operateTitle')}}</span>
      <el-button style="float: right; margin: 0px 5px" size="small" type="danger" @click="remove">{{$t('delBtn')}}</el-button>
      <el-button style="float: right; margin: 0px 5px" size="small" @click="addLink">{{$t('addBtn')}}</el-button>
    </el-card>
    <!--主列表-->
    <el-row class="table-container">
      <el-col :span="24">
        <el-table ref="multipleTable" v-loading="loading" :data="list" style="width: 100%" border @selection-change="tableSelect">
          <el-table-column align="center" type="selection" />
          <el-table-column align="center" :label="$t('username')">
            <template slot-scope="scope">
              <el-button type="text" @click="showDoctorDetail(scope.row)">
                {{ scope.row.username }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('name')">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="goodcount" :label="$t('doctor.index.goodsRevenue')">
            <template slot-scope="scope">
              <el-button type="text" @click="showSetProportion(scope.row)">
                {{ scope.row.proportion }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="hospital" :label="$t('hospital')">
            <template slot-scope="scope">
              {{ scope.row.hospitalDetail | filterHospital }}
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('phone')">
            <template slot-scope="scope">
              {{ scope.row.phone }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="openFlag" :label="$t('status')" width="100">
            <template slot-scope="scope">
              <el-tooltip effeck="dark" placement="top" :open-delay="400" :content="getStatus(scope.row.status)">
                <el-switch v-model="scope.row.status" :disabled="scope.row.statusFlag" :active-value="1" :inactive-value="0" @change="changeStatus($event, scope.row)" />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column  align="center" fixed="right" width="210" :label="$t('action')">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="showSetPassword(scope.row)">{{$t('agent.index.resetPassword')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
        </div>
      </el-col>
    </el-row>
    <!--设置商品分成弹框-->
    <el-dialog :title="$t('resetBtn')" :visible.sync="proportionFlag" v-if="proportionFlag" width="40%">
      <el-form ref="proportionForm" :rules="rules" :model="proportionObj" label-width="120px">
        <el-form-item :label="$t('doctor.index.goodsRevenues')" prop="proportion">
          <el-input-number v-model="proportionObj.proportion" :precision="0" :min="0" :max="100" />
        </el-form-item>
        <el-form-item class="reset-btn-group">
          <el-button type="primary" size="small" @click="handleSetProportion">{{$t('setBtn')}}</el-button>
          <el-button size="small" @click="cancelSetProportion">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--修改密码弹框-->
    <el-dialog :title="$t('agent.index.resetPassword')" :before-close="setPassClosing" :visible.sync="passwordFlag" v-if="passwordFlag" width="40%">
      <el-form ref="passwordForm" :model="setPasswordObj" :rules="rules" size="small" class="sysuserFormRef" label-width="100px">
        <el-form-item :label="$t('agent.index.dialogResetOld')" prop="oldPassword">
          <el-input v-model.trim="setPasswordObj.oldPassword" :placeholder="$t('oldPassPlace')" class="input-width" clearable show-password />
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogResetNew')" prop="newPassword">
          <el-input v-model.trim="setPasswordObj.newPassword" :placeholder="$t('newPassPlace')" class="input-width" clearable show-password />
        </el-form-item>
        <el-form-item :label="$t('repeatPassword') + '：'" prop="repeatPassword">
          <el-input v-model.trim="setPasswordObj.repeatPassword" :placeholder="$t('repeatPassPlace')" class="input-width" clearable show-password />
        </el-form-item>
        <el-form-item class="reset-btn-group">
          <el-button type="primary" size="small" @click="handleSetPassword">{{$t('setBtn')}}</el-button>
          <el-button size="small" @click="cancelSetPassword">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--医生详细信息弹框-->
    <el-dialog :title="$t('agent.agentModel.agentDetailTitle')" :visible.sync="detailFlag" v-if="detailFlag" width="40%">
      <el-form :model="detailObj" label-width="120px" label-position="right">
        <el-form-item :label="$t('agent.index.dialogDetailUsername')">
          <span>{{ detailObj.username }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogDetailName')">
          <span>{{ detailObj.name }}</span>
        </el-form-item>
        <el-form-item :label="$t('doctor.index.age')">
          <span>{{ detailObj.age }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogDetailStatus')">
          <span>{{ getStatus(detailObj.status) }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogDetailEmail')">
          <span>{{ detailObj.email }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogDetailPhone')">
          <span>{{ detailObj.phone }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.hospital')">
          <span>{{ detailObj.hospitalDetail | filterHospital }}</span>
        </el-form-item>
        <el-form-item :label="$t('doctor.index.department')">
          <span>{{ getMessage(detailObj.departments, 'name') }}</span>
        </el-form-item>
        <el-form-item :label="$t('doctor.index.proportion')">
          <span>{{ detailObj.proportion }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
// 引入验证规则
import * as rule from '@/utils/rules'
import * as api from '@/api/Doctors/doctors.js'
import * as hospitalApi from '@/api/Hospital/hospital.js'
import * as status from '@/utils/status.js'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'
import { getUserId, getWorker, getAgent } from '@/utils/auth'
import { i18n } from '@/assets/languages/i18n'

// 匹配验证规则
const rules = {
  oldPassword: rule.unpasswordRules,
  newPassword: rule.passwordRules,
  repeatPassword: rule.passwordRules,
  username: rule.accountnameRules,
  realname: rule.nameRules,
  email: rule.emailRules,
  phone: rule.phoneRules,
  proportion: rule.areaRules
}

// 修改密码弹框绑定对象默认值
const defaultPassword = {
  id: null,
  oldPassword: null,
  newPassword: null,
  repeatPassword: null
}

// 编辑分成弹框默认对象
const defaultProportion = {
  id: null,
  proportion: null
}

// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC'
  // status: -1
}

export default {
  name: 'Doctors',
  components: {
    pagination
  },
  data() {
    return {
      userId: null,
      // 注册验证规则
      rules,
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 分页组件传入的显示页数
      pageCount: 1,
      // 分页防抖开关
      flag: false,
      // 删除后拉取数据开关
      removeFlag: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 列表加载开关
      loading: false,
      // 医生详情弹框开关
      detailFlag: false,
      // 编辑商品分成开关
      proportionFlag: false,
      // 修改密码弹框开关
      passwordFlag: false,
      // 主列表勾选项数组
      tableSelections: [],
      // 主列表数据
      list: [],
      // 详情弹框绑定对象
      detailObj: {},
      // 编辑分成弹框绑定对象
      proportionObj: Object.assign({}, defaultProportion),
      // 编辑分成保存节点
      saveProportionNode: null,
      // 修改密码弹框绑定对象
      setPasswordObj: Object.assign({}, defaultPassword),
      // 修改密码保存节点
      savePasswordNode: null
    }
  },
  computed: {
    getStatus() {
      return status.doctorStatus
    },
    getMessage() {
      return function (obj, key) {
        return obj ? obj[key] : i18n.t('noDate')
      }
    }
  },
  created() {
    if (getWorker() == 'worker') {
      this.userId = JSON.parse(getAgent()).id
    } else {
      this.userId = typeof this.$store.state.user.userId === 'number' ? this.$store.state.user.userId : getUserId()
    }
    this.initList(this.params)
  },
  filters: {
    filterHospital(hospital) {
      let name
      if (hospital !== null && hospital.name) {
        name = hospital.name
      } else {
        name = i18n.t('doctor.searchOrder.filterHospital')
      }
      return name
    }
  },
  methods: {
    initList(params) {
      this.loading = true
      api.getDoctorsOfAgent(this.userId, params)
      .then(res => {
        console.log(res)
        const list = []
        if (res.code === 20000) {
          this.removeFlag = false
          for (const [index, item] of res.data.entries()) {
            const promiseItem = new Promise((resolve, reject) => {
              hospitalApi.getSingleHospital(item.departments.hospital.id)
                .then(res => {
                  if (res.code === 20000) {
                    Vue.set(item, 'hospitalDetail', res.data)
                    Vue.set(item, 'statusFlag', false)
                    Vue.set(item, 'setPasswordFlag', false)
                    Vue.set(item, 'setProportionFlag', false)
                    Vue.set(item, 'removeFlag', false)
                    resolve(item)
                  } else if (res.code === 20004) {
                    Vue.set(item, 'hospitalDetail', null)
                    Vue.set(item, 'statusFlag', false)
                    Vue.set(item, 'setPasswordFlag', false)
                    Vue.set(item, 'setProportionFlag', false)
                    Vue.set(item, 'removeFlag', false)
                    resolve(item)
                  }
                })
                .catch(err => {
                  reject(err)
                })
            })
            list.push(promiseItem)
          }
          Promise.all(list)
            .then(result => {
              this.list = result
              console.log(this.list)
              this.loading = false
              this.sortList()
              this.flag = false
            })
            .catch(err => {
              this.flag = false
              this.loading = false
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
            })
        } else if (res.code === 20004) {
          this.$message({
            message: this.$t('noMoreMes'),
            type: 'warning',
            duration: 1500
          })
          if (this.removeFlag) {
            this.list = []
          }
          this.flag = false
          this.loading = false
          if (this.params.sortMode === 'DESC') {
            this.pageCount !== 1 && this.pageCount--;
          } else {
            this.pageCount !== 1 && this.pageCount++;
          }
        }
      })
      .catch(err => {
        this.flag = false
        this.removeFlag = false
        this.loading = false
        if (this.params.sortMode === 'DESC') {
          this.pageCount !== 1 && this.pageCount--;
        } else {
          this.pageCount !== 1 && this.pageCount++;
        }
        this.$message({
          message: err,
          type: err,
          duration: 1500
        })
      })
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
    // 分页组件点击下一页事件
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
    // 分页组件选择每页条数触发事件
    pageSizeChange(e) {
      // this.params = Object.assign(this.params, defaultParams)
      this.params.pkId = 0
      this.params.sortMode = 'DESC'
      this.params.size = e
      this.pageCount = 1
      this.initList(this.params)
    },
    // 点击医生账号显示弹框事件
    showDoctorDetail(item) {
      this.detailFlag = true
      this.detailObj = Object.assign({}, item)
    },
    // 点击分成显示分成编辑弹框
    showSetProportion(item) {
      this.saveProportionNode = item
      this.proportionObj = Object.assign({}, item)
      this.proportionFlag = true
    },
    // 点击分成编辑弹框修改事件
    handleSetProportion() {
      if (this.saveProportionNode.setProportionFlag) {
        return
      }
      this.saveProportionNode.setProportionFlag = true
      this.$refs.proportionForm.validate(valid => {
        if (valid) {
          api.setDoctorProportion(this.proportionObj.id, this.proportionObj.proportion)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('setSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.saveProportionNode.setProportionFlag = false
                this.saveProportionNode.proportion = this.proportionObj.proportion
                this.saveProportionNode = null
                this.proportionObj = Object.assign({}, defaultProportion)
                this.proportionFlag = false
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.saveProportionNode.setProportionFlag = false
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.saveProportionNode.setProportionFlag = false
        }
      })
    },
    // 点击分成编辑弹框取消事件
    cancelSetProportion() {
      this.saveProportionNode = null
      this.proportionObj = Object.assign({}, defaultProportion)
      this.proportionFlag = false
    },
    // 修改状态事件
    changeStatus(e, item) {
      if (item.statusFlag) {
        return
      }
      item.statusFlag = true
      api.setDoctorStatus(item.id, e)
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('agent.index.setStatusSucMes'),
              type: 'success',
              duration: 1500
            })
            item.statusFlag = false
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
          item.status = e == 0 ? 1 : 0
          item.statusFlag = false
        })
    },
    // 主列表勾选事件
    tableSelect(e) {
      this.tableSelections = e
    },
    // 点击删除事件
    remove() {
      if (this.tableSelections.length === 0) {
        this.$message({
          message: this.$t('doctor.index.delDoctorWarning'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      for (const item of this.tableSelections) {
        if (item.status === 1) {
          this.$message({
            message: this.$t('doctor.index.delDocSelectWarning'),
            type: 'warning',
            duration: 2000
          })
          return
        }
      }
      this.$confirm(this.$t('doctor.index.delDocConfirmWarn'), this.$t('warning'), {
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
              api.delDoctor(item.id)
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
            message: this.$t('doctor.index.cancelDelDocMes'),
            type: 'warning',
            duration: 1500
          })
        })
    },
    // 点击重置密码事件
    showSetPassword(item) {
      this.savePasswordNode = item
      this.setPasswordObj = Object.assign({}, defaultPassword)
      this.setPasswordObj.id = item.id
      this.passwordFlag = true
    },
    // 修改密码弹框点击确认事件
    handleSetPassword() {
      if (this.savePasswordNode.setPasswordFlag) {
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
      this.savePasswordNode.setPasswordFlag = true
      this.$refs.passwordForm.validate(valid => {
        if (valid) {
          const data = {
            useId: this.setPasswordObj.id,
            oldPassword: this.setPasswordObj.oldPassword,
            newPassword: this.setPasswordObj.newPassword
          }
          api.setDoctorPassword(this.setPasswordObj.id, data)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('agent.index.resetPassSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.savePasswordNode.setPasswordFlag = false
                this.savePasswordNode = null
                this.setPasswordObj = Object.assign({}, defaultPassword)
                this.passwordFlag = false
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.savePasswordNode.setPasswordFlag = false
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.savePasswordNode.setPasswordFlag = false
        }
      })
    },
    // 修改密码弹框取消事件
    cancelSetPassword() {
      this.savePasswordNode = null
      this.setPasswordObj = Object.assign({}, defaultPassword)
      this.passwordFlag = false
    },
    addLink() {
      this.$router.push({
        path: '/doctors/addDoctor'
      })
    },
    setPassClosing(done) {
      this.$refs.passwordForm.clearValidate()
      done()
    }
  }
}
</script>
<style lang="scss" scoped>
#doctors {
  padding: 20px;
}

.pagination-container {
  float: right;
  margin-top: 10px;
}

.operate-container {
  margin-top: 30px;
}

.table-container {
  margin-top: 30px;
}

.el-pagination {
  float: right;
  margin-top: 20px;
}
.filter-container .el-form-item {
  margin-right: 30px;
}
.input-width {
  width: 60%;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
