<template>
  <div id="agents">
    <!--筛选代理商模块-->
    <el-card class="filter-container">
      <div class="filter-box" style="margin-top: 20px">
        <el-form :inline="true" size="small">
          <el-form-item :label="$t('agent.index.statusFilterTitle')">
            <el-select v-model="listQuery.status" :placeholder="$t('agent.index.statusFilterPlace')" @change="statusQueryChange" clearable>
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
      <span>{{$t('agent.index.operateTitle')}}</span>
      <!-- <el-button style="float: right; margin: 0px 5px;" type="danger" size="small" @click="remove">删除</el-button> -->
      <router-link to="/agents/addAgent">
        <el-button style="float: right; margin: 0px 5px" size="small">{{$t('addBtn')}}</el-button>
      </router-link>
    </el-card>
    <!--主列表-->
    <el-row class="table-container">
      <el-col :span="24">
        <el-table v-loading="loading" :data="list" style="width: 100%" border>

          <el-table-column align="center" prop="username" :label="$t('username')">
            <template slot-scope="scope">
              <el-button type="text" @click="showAgentDetail(scope.row)">
                {{ scope.row.username }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="name" :label="$t('name')">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="phone" :label="$t('phone')">
            <template slot-scope="scope">
              {{ scope.row.phone }}
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('area')" prop="area.name" width="100">
            <template slot-scope="scope">
              {{ getMessage(scope.row.area, 'name') }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="status" :label="$t('status')" width="100">
            <template slot-scope="scope">
              <el-tooltip effeck="dark" placement="top" :open-delay="400" :content="getStatus(scope.row.status)">
                <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" :disabled="scope.row.statusFlag" @change="changeStatus($event, scope.row)" />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column v-if="true" align="center" fixed="right" width="240" :label="$t('action')">
            <template slot-scope="scope">
              <el-button v-show="!scope.row.status" size="mini" type="primary" @click="showChangeAgent(scope.row)">{{$t('agent.index.changeAgentBtn')}}</el-button>
              <el-button size="mini" type="danger" @click="showSetPassword(scope.row)">{{$t('agent.index.setPassword')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--分页-->
        <div class="pagination-container">
          <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
        </div>
      </el-col>
    </el-row>
    <!--重置密码弹出框-->
    <el-dialog :title="$t('agent.index.dialogResetTitle')" :before-close="resetPassClosing" :visible.sync="passwordFlag" v-if="passwordFlag" width="40%">
      <el-form ref="passwordForm" :model="setPasswordObj" :rules="rules" size="small" class="sysuserFormRef" label-width="100px">
        <el-form-item :label="$t('agent.index.dialogResetOld')" prop="oldPassword">
          <el-input v-model.trim="setPasswordObj.oldPassword" :placeholder="$t('oldPassPlace')" clearable show-password style="width: 70%" />
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogResetNew')" prop="newPassword">
          <el-input v-model.trim="setPasswordObj.newPassword" :placeholder="$t('newPassPlace')"  clearable show-password style="width: 70%" />
        </el-form-item>
        <el-form-item :label="$t('repeatPassword') + '：'" prop="repeatPassword">
          <el-input v-model.trim="setPasswordObj.repeatPassword" :placeholder="$t('repeatPassPlace')" clearable show-password style="width: 70%" />
        </el-form-item>
        <el-form-item class="reset-btn-group">
          <el-button type="primary" size="small" @click="handleSetPassword">{{$t('setBtn')}}</el-button>
          <el-button size="small" @click="cancelSetPassword">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--代理商详细信息弹出框-->
    <el-dialog :title="$t('agent.index.dialogDetailTitle')" :visible.sync="detailFlag" v-if="detailFlag" width="40%">
      <el-form :model="detailObj" :rules="rules" class="agent-detail" label-width="120px" label-position="right">
        <el-form-item :label="$t('agent.index.dialogDetailUsername')">
          <span>{{ detailObj.username }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogDetailName')">
          <span>{{ detailObj.name }}</span>
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
        <el-form-item :label="$t('agent.index.dialogDetailAddress')">
          <span>{{ detailObj.address }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogDetailArea')">
          <span>{{ getMessage(detailObj.area, 'name') }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogDetailLeader')">
          <span>{{ detailObj.leader }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogDetailLeaderPhone')">
          <span>{{ detailObj.leaderPhone }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogDetailContact')">
          <span>{{ detailObj.contact }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogDetailContactPhone')">
          <span>{{ detailObj.contactPhone }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--更换代理弹出框-->
    <el-dialog :title="$t('agent.index.dialogChangeTitle')" :before-close="changeAgentClosing" :visible.sync="changeAgentFlag" v-if="changeAgentFlag" width="40%">
      <el-form
        ref="changeAgentForm"
        :model="changeAgentObj"
        class="change-agent"
        :rules="rules"
        label-width="150px"
        size="small"
      >
        <el-form-item prop="name" :label="$t('agent.index.dialogDetailName')">
          <el-input v-model.trim="changeAgentObj.name" placeholder="姓名" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="phone" :label="$t('agent.index.dialogDetailPhone')">
          <el-input v-model.trim="changeAgentObj.phone" :placeholder="$t('agent.index.dialogChangePhonePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="leader" :label="$t('agent.index.dialogDetailLeader')">
          <el-input v-model.trim="changeAgentObj.leader" :placeholder="$t('agent.index.dialogChangeLeaderPlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="leaderPhone" :label="$t('agent.index.dialogDetailLeaderPhone')">
          <el-input v-model.trim="changeAgentObj.leaderPhone" :placeholder="$t('agent.index.dialogChangeLeaderPhonePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="contact" :label="$t('agent.index.dialogDetailContact')">
          <el-input v-model.trim="changeAgentObj.contact" :placeholder="$t('agent.index.dialogChangeContactPlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="contactPhone" :label="$t('agent.index.dialogDetailContactPhone')">
          <el-input v-model.trim="changeAgentObj.contactPhone" :placeholder="$t('agent.index.dialogChangeContactPhonePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="email" :label="$t('agent.index.dialogDetailEmail')">
          <el-input v-model.trim="changeAgentObj.email" :placeholder="$t('agent.index.dialogChangeEmailPlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="address" :label="$t('agent.index.dialogDetailAddress')">
          <el-input v-model.trim="changeAgentObj.address" :placeholder="$t('agent.index.dialogChangeAddressPlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleChangeAgent">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelChangeAgent">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as rule from '@/utils/rules'
import * as api from '@/api/Agent/agent.js'
import * as areaApi from '@/api/Area/area.js'
import * as status from '@/utils/status.js'
import { i18n } from '@/assets/languages/i18n.js'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'
const rules = {
  oldPassword: rule.unpasswordRules,
  newPassword: rule.passwordRules,
  repeatPassword: rule.passwordRules,
  username: rule.accountnameRules,
  name: rule.nameRules,
  leader: rule.unnameRules,
  leaderPhone: rule.freephoneRules,
  contact: rule.unnameRules,
  contactPhone: rule.freephoneRules,
  phone: rule.phoneRules,
  email: rule.emailRules,
  area: rule.areaRules
  // address: rule.addressRules
}

// 修改密码弹框绑定对象默认值
const defaultPassword = {
  userId: null,
  oldPassword: null,
  newPassword: null,
  repeatPassword: null
}

// 更换代理商绑定对象默认值
const defaultChange = {
  id: null,
  name: '',
  phone: '',
  email: '',
  address: '',
  leader: '',
  leaderPhone: '',
  contact: '',
  contactPhone: ''
}

// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC',
  status: -1
}

export default {
  name: 'Agents',
  components: {
    pagination
  },
  data() {
    return {
      // 验证规则
      rules,
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 分页组件传入的显示页数
      pageCount: 1,
      // 列表加载开关
      loading: false,
      // 分页防抖开关
      flag: false,
      statusQueryFlag: false,
      // 代理商详情弹框开关
      detailFlag: false,
      // 修改密码弹框开关
      passwordFlag: false,
      // 更换代理商弹框开关
      changeAgentFlag: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 主列表数据
      list: [],
      // 状态筛选框绑定数组
      patientStatusArr: status.patientStatusArr,
      // 详情弹框绑定对象
      detailObj: {},
      // 修改密码弹框绑定对象
      setPasswordObj: Object.assign({}, defaultPassword),
      // 修改密码保存节点
      savePasswordNode: null,
      // 更换代理商弹框绑定对象
      changeAgentObj: JSON.parse(JSON.stringify(defaultChange)),
      // 更换代理商弹框保存节点
      saveChangeAgentNode: null,
      // 筛选功能绑定对象
      listQuery: {
        sysuserCondition: '',
        status: -1
      }
    }
  },
  computed: {
    getStatus() {
      return status.agentStatus
    },
    getMessage() {
      return function (obj, key) {
        return obj ? obj[key] : i18n.t('noData')
      }
    }
  },
  created() {
    this.initList(this.params)
  },
  methods: {
    // 初始化主列表数据
    initList(params) {
      this.loading = true
      api.getAllSubAgents(params)
        .then(res => {
          if (res.code === 20000) {
            for (let item of res.data) {
              Vue.set(item, 'statusFlag', false)
              Vue.set(item, 'setPasswordFlag', false)
              Vue.set(item, 'changeInfoFlag', false)
            }
            this.list = res.data
            this.statusQueryFlag = false
            this.sortList()
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            this.statusQueryFlag && (this.list = []);
            if (this.params.sortMode === 'DESC') {
              this.pageCount !== 1 && this.pageCount--;
            } else {
              this.pageCount !== 1 && this.pageCount++;
            }
          }
          this.loading = false
          this.flag = false
        })
        .catch(err => {
          this.loading = false
          this.flag = false
          this.statusQueryFlag = false
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
        this.params.pkId = this.minId
        if (this.params.pkId === 0) {
          this.flag = false
          this.$message({
            message: this.$t('noMoreMes'),
            type: 'warning',
            duration: 1500
          })
          return
        }
        this.pageCount++
        this.params.sortMode = 'DESC'
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
      this.params.pkId = 0
      this.params.sortMode = 'DESC'
      this.params.size = e
      this.pageCount = 1
      this.initList(this.params)
    },
    // 代理商状态筛选框值改变事件
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
    // 点击代理商账号显示弹框事件
    showAgentDetail(item) {
      this.detailFlag = true
      this.detailObj = Object.assign({}, item)
    },
    // 点击重置密码按钮事件
    showSetPassword(item) {
      this.savePasswordNode = item
      this.setPasswordObj = Object.assign({}, defaultPassword)
      this.setPasswordObj.userId = item.id
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
          api.setAgentPassword(this.setPasswordObj.userId, this.setPasswordObj)
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
    // 更改代理商状态事件
    changeStatus(e, item) {
      if (item.statusFlag) {
        return
      }
      item.statusFlag = true
      api.setAgentStatus(item.id, e)
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
    // 点击更换代理按钮
    showChangeAgent(item) {
      this.saveChangeAgentNode = item
      this.changeAgentObj = JSON.parse(JSON.stringify(defaultChange))
      this.changeAgentFlag = true
    },
    // 更换代理商确定事件
    handleChangeAgent() {
      if (this.saveChangeAgentNode.changeInfoFlag) {
        return
      }
      this.saveChangeAgentNode.changeInfoFlag = true
      this.$refs.changeAgentForm.validate(valid => {
        if (valid) {
          this.changeAgentObj.id = this.saveChangeAgentNode.id
          api.changeAgent(this.saveChangeAgentNode.id, this.changeAgentObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('agent.index.changeSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.saveChangeAgentNode = Object.assign(this.saveChangeAgentNode, this.changeAgentObj)
                this.saveChangeAgentNode.changeInfoFlag = false
                this.changeAgentObj = JSON.parse(JSON.stringify(defaultChange))
                this.changeAgentFlag = false
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.saveChangeAgentNode.changeInfoFlag = false
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.saveChangeAgentNode.changeInfoFlag = false
        }
      })
    },
    // 更换代理商取消事件
    cancelChangeAgent() {
      this.changeAgentFlag = false
      this.changeAgentObj = Object.assign({}, defaultChange)
    },
    resetPassClosing(done) {
      this.$refs.passwordForm.clearValidate()
      done()
    },
    changeAgentClosing(done) {
      this.$refs.changeAgentForm.clearValidate()
      done()
    }
  }
}
</script>
<style lang="scss" scoped>
#agents {
  padding: 20px;
}
.pagination-container {
  float: right;
  margin-top: 10px;
}
.filter-container {
  height: 100px;
}
.filter-container .filter-box {
  height: 100%;
  padding: 0;
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
.filter-input {
  position: relative;
  width: 200px;
}
.filter-select {
  position: relative;
  width: 150px;
  margin-left: 10px;
}
.sysuserFormRef .el-input {
  width: 70%;
}
.reset-btn-group {
  margin-top: 30px;
}
.input-width {
  width: 60%;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

</style>
