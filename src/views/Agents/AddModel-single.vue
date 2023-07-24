<template>
  <div class="add-model">
    <!-- 代理商信息框 -->
    <el-card class="form-container">
      <ul class="agent-message">
        <li>
          <span>{{$t('agent.index.dialogDetailUsername')}}</span>
          <span>{{ agentObj.username }}</span>
        </li>
        <li>
          <span>{{$t('agent.index.dialogDetailName')}}</span>
          <span>{{ agentObj.name }}</span>
        </li>
      </ul>
    </el-card>
    <!-- 合作模式编辑框 -->
    <el-card class="form-container">
      <span>{{$t('agentModel')}}</span>
      <el-form
        class="pay-style-form"
        label-width="150px"
        size="small"
      >
        <!-- <el-form-item :label="$t('agent.agentModel.dialogDetailType')">
          <span>{{ getSettleMode(agentObj.settleMode) }}</span>
        </el-form-item> -->
        <el-form-item :label="$t('agent.addModel.countSet')">
          <el-input-number
            v-model="agentObj.settleDetail.discount"
            :min="0"
            :max="100"
            controls-position="right"
            size="small"
            class="el-count-input"
          />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleSet">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelSet">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import * as api from '@/api/Agent/agent.js'
import * as settleModeApi from '@/api/SettleMode/settleMode.js'
import * as status from '@/utils/status.js'
import * as rule from '@/utils/rules.js'
import Vue from 'vue'

// 主列表数据详情默认对象
const defaultDetail = {
  address: '',
  contact: '',
  contactPhone: '',
  email: '',
  id: null,
  leader: '',
  leaderPhone: '',
  name: '',
  parentId: null,
  password: '',
  phone: '',
  photo: '',
  settleMode: '',
  status: '',
  username: '',
  area: {
    id: null,
    name: '',
    parentId: null
  },
  settleDetail: {
    agentId: null,
    id: null,
    discount: null
  }
}

const defaultSettleDetail = {
  agentId: null,
  id: null,
  discount: null
}

export default {
  name: 'AddAgentModel',
  data() {
    return {
      agentId: null,
      settleMode: null,
      hasSettleFlag: false,
      agentObj: Object.assign({}, defaultDetail),
      addFlag: false
    }
  },
  created() {
    if (this.$route.query.id !== undefined && this.$route.query.id !== null) {
      this.agentId = + this.$route.query.id
      defaultSettleDetail.agentId = + this.$route.query.id
    } else {
      this.$message({
        message: this.$t('agent.agentModel.initAgentFail'),
        type: 'error',
        duration: 1500
      })
      this.$router.back(-1)
    }
    if (this.$route.query.settleMode !== undefined && this.$route.query.settleMode !== null) {
      this.settleMode = + this.$route.query.settleMode
      this.settleMode != 1 && (this.$router.back(-1))
    } else {
      this.$message({
        message: this.$t('agent.agentModel.initSettleFail'),
        type: 'error',
        duration: 1500
      })
      this.$router.back(-1)
    }
    this.init()
  },
  computed: {
    getSettleMode() {
      return status.settleMode
    }
  },
  methods: {
    init() {
      api.getAgentDetail(this.agentId)
        .then(res => {
          if (res.code === 20000) {
            // this.agentObj = res.data
            settleModeApi.getCountMode(this.agentId)
              .then(result => {
                this.agentObj = res.data
                if (result.code === 20000) {
                  Vue.set(this.agentObj, 'settleDetail', result.data)
                  this.hasSettleFlag = true
                } else if (result.code === 20004) {
                  Vue.set(this.agentObj, 'settleDetail', defaultSettleDetail)
                  this.hasSettleFlag = false
                } else {
                  this.$message({
                    message: this.$t('agent.agentModel.initSettleFail'),
                    type: 'error',
                    duration: 1500
                  })
                  this.$router.back(-1)
                }
              })
              .catch(err => {
                this.$message({
                  message: err,
                  type: 'error',
                  duration: 1500
                })
                this.$router.back(-1)
              })
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('agent.addModel.initFailMes'),
              type: 'error',
              duration: 1500
            })
            this.$router.back(-1)
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
          this.$router.back(-1)
        })
    },
    setCountMode() {
      if (!this.hasSettleFlag) {
        settleModeApi.addCountMode(this.agentObj.settleDetail)
          .then(res => {
            this.addFlag = false
            if (res.code === 20000) {
              this.$message({
                message: this.$t('agent.addModel.setCountSucMes'),
                type: 'success',
                duration: 1500
              })
              this.$router.back(-1)
            } else {
              this.$message({
              message: this.$t('agent.addModel.setCountFail'),
                type: 'error',
                duration: 1500
              })
            }
          })
          .catch(err => {
            this.addFlag = false
            this.$message({
              message: err,
              type: 'error',
              duration: 1500
            })
          })
      } else {
        settleModeApi.setCountMode(this.agentObj.settleDetail.id, this.agentObj.settleDetail)
          .then(res => {
            this.addFlag = false
            if (res.code === 20000) {
              this.$message({
                message: this.$t('agent.addModel.setCountSucMes'),
                type: 'success',
                duration: 1500
              })
              this.$router.back(-1)
            } else {
              this.$message({
                message: this.$t('agent.addModel.setCountFail'),
                type: 'error',
                duration: 1500
              })
            }
          })
          .catch(err => {
            this.addFlag = false
            this.$message({
              message: err,
              type: 'error',
              duration: 1500
            })
          })
      }
    },
    handleSet() {
      this.$confirm(this.$t('agent.addModel.handleSetWarning'), this.$t('warning'), {
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warning'
      })
      .then(() => {
        if (this.addFlag) {
          return
        }
        this.addFlag = true
        this.setCountMode()
      })
      .catch(() => {
        this.$message({
          message: this.$t('agent.addModel.setCancel'),
          type: 'warning',
          duration: 1500
        })
      })
    },
    cancelSet() {
      this.$router.back(-1)
    }
  }
}
</script>
<style lang="scss" scoped>
.add-model {
  padding: 20px;
  .form-container {
    margin-bottom: 20px;
    .agent-message li {
      width: 30%;
      display: flex;
      justify-content: space-around;
      font-size: 16px;
      margin-top: 20px;
    }
    .agent-message li span {
      color: #606266;
      flex: 1;
    }
    .pay-style-form {
      margin-top: 15px;
    }
  }
}
</style>
