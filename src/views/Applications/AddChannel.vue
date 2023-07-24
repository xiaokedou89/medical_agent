<template>
  <div class="add-container">
    <el-card class="form-container">
      <el-form
        ref="channelForm"
        class="channel-form"
        :model="channelObj"
        :rules="rules"
        label-width="150px"
        size="small"
      >
        <el-form-item prop="name" :label="$t('name') + '：'">
          <el-input class="input-width" v-model.trim="channelObj.name" :placeholder="$t('client.namePlace')" />
        </el-form-item>
        <el-form-item prop="merchantId" :label="$t('client.merchantId') + '：'">
          <el-input class="input-width" v-model.trim="channelObj.merchantId" :placeholder="$t('client.merchantIdPlace')" />
        </el-form-item>
        <el-form-item prop="merchantSerialNumber" :label="$t('client.merchantSerialNumber') + '：'">
          <el-input class="input-width" v-model.trim="channelObj.merchantSerialNumber" :placeholder="$t('client.merchantSerialNumberPlace')" />
        </el-form-item>
        <el-form-item prop="apiKey" :label="$t('client.apiKey') + '：'">
          <el-input class="input-width" v-model.trim="channelObj.apiKey" :placeholder="$t('client.apiKeyPlace')" />
        </el-form-item>
        <el-form-item prop="syncUrl" :label="$t('client.syncUrl') + '：'">
          <el-input class="input-width" v-model.trim="channelObj.syncUrl" :placeholder="$t('client.syncUrlPlace')" />
        </el-form-item>
        <el-form-item prop="asyncUrl" :label="$t('client.asyncUrl') + '：'">
          <el-input class="input-width" v-model.trim="channelObj.asyncUrl" :placeholder="$t('client.asyncUrlPlace')" />
        </el-form-item>
        <el-form-item prop="channelStatus" :label="$t('client.status') + '：'">
          <el-select v-model="channelObj.channelStatus" :placeholder="$t('client.statusPlace')">
            <el-option
              v-for="item in channelStatusArr"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" :loading="loading" @click="handleAdd">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelAdd">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import * as agentApi from '@/api/Agent/agent.js'
import * as api from '@/api/Client/client.js'
import * as status from '@/utils/status.js'
import * as rule from '@/utils/rules.js'

const rules = {
  name: rule.areaRules,
  merchantId: rule.areaRules,
  merchantSerialNumber: rule.areaRules,
  apiKey: rule.areaRules,
  syncUrl: rule.areaRules,
  asyncUrl: rule.areaRules,
  channelStatus: rule.areaRules
}

const defaultChannel = {
  id: null,
  agentId: null,
  apiKey: '',
  asyncUrl: '',
  channelStatus: '',
  merchantId: null,
  merchantSerialNumber: '',
  name: '',
  privateKey: '',
  publicKey: '',
  syncUrl: '',
  type: ''
}

export default {
  name: 'add-channel',
  data() {
    return {
      rules,
      currentAgent: null,
      addFlag: false,
      loading: false,
      channelStatusArr: status.channelStatusArr,
      channelObj: Object.assign({}, defaultChannel)
    }
  },
  created() {
    this.initAgent()
  },
  methods: {
    initAgent() {
      agentApi.getCurrent()
        .then(res => {
          if (res.code === 20000) {
            this.agent = res.data
            this.channelObj.agentId = this.agent.id
            console.log(this.channelObj)
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('client.initAgentFail'),
              type: 'warning',
              duration: 1500
            })
            this.$router.back(-1)
          }
        })
        .catch(err => {
          this.$message({
            message: this.$t('client.initAgentFail'),
            type: 'error',
            duration: 1500
          })
          this.$router.back(-1)
        })
    },
    handleAdd() {
      if (this.addFlag) {
        return
      }
      this.addFlag = true
      this.$refs.channelForm.validate(valid => {
        if (valid) {
          this.loading = true
          api.addChannel(this.channelObj)
            .then(res => {
              console.log(res)
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('addSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.channelObj = Object.assign({}, defaultChannel)
                this.$router.back(-1)
              } else {

                this.$message({
                  message: this.$t('client.addFailMes'),
                  type: 'error',
                  duration: 1500
                })
              }
              this.addFlag = false
              this.loading = false
            })
            .catch(err => {
              this.loading = false
              this.addFlag = false
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
            })
        } else {
          this.addFlag = false
          this.$message({
            message: this.$t('validFailMes'),
            type: 'warning',
            duration: 1500
          })
        }
      })
    },
    cancelAdd() {
      this.$router.back(-1)
    }
  }
}
</script>
<style lang="scss" scoped>
.add-container {
  padding: 30px;
  .form-container {
    border: 1px solid #e6ebf5;
    border-radius: 5px;
    padding: 30px 20px;
    width: 50%;
    margin: 20px auto;
  }
}
.input-width {
  width: 70%;
}
</style>
