<template>
  <div class="add-agent">
    <!--代理商信息-->
    <el-card class="form-container">
      <el-form
        ref="agentForm"
        :model="agentObj"
        :rules="rules"
        class="agent-messsage"
        label-width="150px"
        size="small"
      >
        <el-form-item prop="username" :label="$t('agent.index.dialogDetailUsername')">
          <el-input v-model.trim="agentObj.username" :placeholder="$t('agent.addAgent.usernamePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="password" :label="$t('agent.addAgent.password')">
          <el-input v-model.trim="agentObj.password" :placeholder="$t('agent.addAgent.passwordPlace')" class="input-width" :clearable="true" show-password/>
        </el-form-item>
        <el-form-item prop="repeatPassword" :label="$t('repeatPassword') + ':'">
          <el-input v-model.trim="agentObj.repeatPassword" :placeholder="$t('repeatPassPlace')"  class="input-width" :clearable="true" show-password />
        </el-form-item>
        <el-form-item prop="name" :label="$t('agent.index.dialogDetailName')">
          <el-input v-model.trim="agentObj.name" :placeholder="$t('name')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="phone" :label="$t('agent.addAgent.phone')">
          <el-input v-model.trim="agentObj.phone" :placeholder="$t('agent.index.dialogChangePhonePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <!-- <el-form-item prop="phto" :label="$t('agent.addAgent.photo')">
          <el-input v-model.trim="agentObj.photo" :placeholder="$t('agent.addAgent.photoPlace')"  class="input-width" :clearable="true" />
        </el-form-item> -->
        <el-form-item prop="leader" :label="$t('agent.index.dialogDetailLeader')">
          <el-input v-model.trim="agentObj.leader" :placeholder="$t('agent.index.dialogChangeLeaderPlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="leaderPhone" :label="$t('agent.index.dialogDetailLeaderPhone')">
          <el-input v-model.trim="agentObj.leaderPhone" :placeholder="$t('agent.index.dialogChangeLeaderPhonePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="contact" :label="$t('agent.index.dialogDetailContact')">
          <el-input v-model.trim="agentObj.contact" :placeholder="$t('agent.index.dialogChangeContactPlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="contactPhone" :label="$t('agent.index.dialogDetailContactPhone')">
          <el-input v-model.trim="agentObj.contactPhone" :placeholder="$t('agent.index.dialogChangeContactPhonePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="email" :label="$t('agent.index.dialogDetailEmail')">
          <el-input v-model.trim="agentObj.email" :placeholder="$t('agent.index.dialogChangeEmailPlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="address" :label="$t('agent.index.dialogDetailAddress')">
          <el-input v-model.trim="agentObj.address" :placeholder="$t('agent.index.dialogChangeAddressPlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="settleMode" :label="$t('agent.addAgent.settleMode')">
            <el-select :disabled="settleDisabled" v-model="agentObj.settleMode" :placeholder="$t('settleMode')" @change="settleModeChange" clearable>
              <el-option
                v-for="item in settleModeArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        <el-form-item prop="area.id" :label="$t('agent.index.dialogDetailArea')">
          <el-cascader v-model="agentObj.area.id" clearable :options="areaList" :props="areaProps" @change="areaChange" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" :loading="loading" @click="handleAdd">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelAdd">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import * as api from '@/api/Agent/agent'
import * as areaApi from '@/api/Area/area.js'
import * as rule from '@/utils/rules'
import * as status from '@/utils/status'
import { getUserId, getWorker, getAgent } from '@/utils/auth'
import Vue from 'vue'
const rules = {
  username: rule.accountnameRules,
  password: rule.passwordRules,
  repeatPassword: rule.passwordRules,
  name: rule.nameRules,
  leader: rule.nameRules,
  leaderPhone: rule.freephoneRules,
  contact: rule.unnameRules,
  contactPhone: rule.freephoneRules,
  phone: rule.phoneRules,
  email: rule.emailRules,
  "area.id": rule.areaRules,
  settleMode: rule.areaRules
}
const defaultAgent = {
  id: null,
  parentId: null,
  name: '',
  username: '',
  password: '',
  repeatPassword: '',
  leader: '',
  email: '',
  address: '',
  phone: '',
  photo: '',
  leaderPhone: '',
  contact: '',
  contactPhone: '',
  area: {
    id: null,
    name: '',
    parentId: null
  },
  settleMode: null,
  photo: '',
  status: 1,
  userType: 4
}

// 区域默认对象
const defaultArea = {
  id: null,
  name: '',
  parentId: null
}

export default {
  name: 'AddAgents',
  data() {
    return {
      settleDisabled: false,
      userId: null,
      // 点击确定loading开关
      loading: false,
      // 注册表单验证规则
      rules,
      addFlag: false,
      // 表单绑定对象
      agentObj: Object.assign({}, defaultAgent),
      // 区域列表数据
      areaList: [Object.assign({}, defaultArea)],
      // 代理商合作模式绑定数组
      settleModeArr: status.settleModeNormalArr,
      // 区域练级框配置对象
      areaProps: {
        label: 'name',
        value: 'id',
        children: 'children',
        lazy: true,
        lazyLoad: this.loadArea,
        checkStrictly: true
      }
    }
  },
  created() {
    if (getWorker() == 'worker') {
      this.userId = JSON.parse(getAgent()).id
    } else {
      this.userId = typeof this.$store.state.user.userId === 'number' ? this.$store.state.user.userId : getUserId()
    }

    this.checkSettle()
    this.initAreaList(0)
  },
  methods: {

    // 初始化区域列表数据
    initAreaList(id) {
      areaApi.searchAllSonArea(id)
        .then(res => {
          if (res.code === 20000) {
            this.areaList = res.data
            for (const item of res.data) {
              Vue.set(item, 'children', [])
            }
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('addAgent.areaNullMes'),
              type: 'error',
              duration: 1500
            })
            this.$router.back(-1)
          }
        })
        .catch(err => {
          this.$message({
            message: this.$t('addAgent.areaInitFail') + err,
            type: 'error',
            duration: 1500
          })
          this.$router.back(-1)
        })
    },
    // 懒加载区域列表子树事件
    loadArea(node, resolve) {
      areaApi.searchAllSonArea(node.value)
        .then(res => {
          if (res.code === 20000) {
            resolve(res.data)
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
    checkSettle() {
      api.getAgentDetail(this.userId)
      .then(res => {
        if (res.code === 20000) {
          let parent = res.data
          console.log(parent)
          if (parent.settleMode === 0 || parent.settleMode === 2) {
            this.settleModeArr = status.settleModeArr
            this.settleDisabled = true
            this.agentObj.settleMode = parent.settleMode
          }
        } else {
          this.$message({
            message: this.$t('agent.addAgent.checkSettleFail'),
            type: 'error',
            duration: 1500
          })
          this.$router.back(-1)
        }
      })
      .catch(() => {
        this.$message({
          message: this.$t('agent.addAgent.checkSettleFail'),
          type: 'error',
          duration: 1500
        })
        this.$router.back(-1)
      })
    },
    // 合作模式下拉框值改变事件
    settleModeChange(e) {
      if (typeof e === 'number') {
        this.$message({
          message: this.$t('agent.addAgent.settleModeWarn'),
          type: 'warning',
          duration: 2000
        })
      }
    },
    // 区域列表选中值改变事件
    areaChange(arr) {
      if (arr.length > 0) {
        areaApi.searchSingleArea(arr[arr.length - 1])
          .then(res => {
            if (res.code === 20000) {
              this.agentObj.area = res.data
            }
          })
          .catch(err => {
            this.$message({
              message: err,
              type: 'error',
              duration: 1500
            })
          })
      } else {
        this.agentObj.area = Object.assign({}, defaultArea)
      }
    },
    // 重置按钮点击事件
    cancelAdd() {
      this.$router.back(-1)
    },
    // 添加代理商按钮点击事件
    handleAdd() {
      if (this.addFlag) {
        return
      }
      if (this.agentObj.password != this.agentObj.repeatPassword) {
        this.$message({
          message: this.$t('repeatFail'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.addFlag = true
      this.$refs.agentForm.validate(valid => {
        if (valid) {
          this.loading = true
          console.log(this.agentObj)
          api.addAgent(this.agentObj)
            .then(res => {
              if (res.code === 20000) {
                this.addFlag = false
                this.$message({
                  type: 'success',
                  message: this.$t('agent.addAgent.addSucMes'),
                  duration: 1500
                })
                this.loading = false
                this.$router.back(-1)
              }
            })
            .catch(err => {
              this.loading = false
              this.addFlag = false
              this.$message({
                type: 'error',
                message: err,
                duration: 1500
              })
            })
        } else {
          this.addFlag = false
          this.$message({
            type: 'warning',
            message: this.$t('validFailMes'),
            duration: 1500
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
ul li {
  list-style: none;
}
.form-container {
  border: 1px solid #e6ebf5;
  border-radius: 5px;
  padding: 30px 20px;
  width: 50%;
  margin: 20px auto;
}
.input-width {
  width: 70%;
}
.add-agent {
  padding: 30px;
}
.agent-messsage {
  margin-top: 10px;
}
.pay-style-label {
  font-size: 14px;
  margin: 0 5px 0 40px;
  vertical-align: top;
  font-weight: 600;
}
.el-radio-group {
  margin-left: 10px;
}
.pay-style-form {
  margin-top: 15px;
}
.set-price {
  margin-left: -100px;
  margin-top: 50px;
  width: 100%;
}
.set-price li {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
}
.set-price li .el-input-number {
  flex: 1;
  margin-left: -30px;
}
.set-price li .count-label {
  flex: 1;
  margin-left: 10px;
}
.add-price {
  font-size: 14px;
}
.add-price-contain {
  float: right;
  margin-right: 50px;
}
.control-price {
  float: right;
}
</style>
