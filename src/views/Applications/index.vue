<template>
  <div class="channel-container">
    <!-- 功能列表 -->
    <el-card class="operate-container">
      <i class="el-icon-tickets"></i>
      <span>{{ $t('client.indexOperate')}}</span>
      <el-button style="float: right; margin: 0px 5px;" type="danger" size="small" @click="remove">{{$t('delBtn')}}</el-button>
      <el-button style="float: right; margin: 0px 5px" size="small" @click="linkToAdd">{{$t('addBtn')}}</el-button>
    </el-card>
    <!-- 主列表 -->
    <div class="table-container">
      <el-table
        ref="channelTable"
        v-loading="loading"
        :data="list"
        style="width: 100%"
        border
        @selection-change="tableSelect"
      >
        <el-table-column align="center" type="selection" />
        <el-table-column align="center" :label="$t('name')">
          <template slot-scope="scope">
            <el-button type="text" @click="showSet(scope.row)">
              {{ scope.row.name }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="merchantId" :label="$t('client.merchantId')" />
        <el-table-column align="center" :label="$t('client.status')">
          <template slot-scope="scope">
            {{ channelStatus(scope.row.channelStatus) }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('action')" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="danger" size="small" @click="delChannel(scope.row)">{{ $t('delBtn') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 编辑弹框 -->
    <el-dialog :title="$t('set')" v-if="setFlag" :visible.sync="setFlag" width="40%">
      <el-form
        ref="setForm"
        :model="setObj"
        :rules="rules"
        size="small"
        label-width="150px"
        label-position="right"
      >
        <el-form-item prop="name" :label="$t('name') + '：'">
          <el-input class="input-width" v-model="setObj.name" :placeholder="$t('client.namePlace')" />
        </el-form-item>
        <el-form-item prop="merchantId" :label="$t('client.merchantId') + '：'">
          <el-input class="input-width" v-model="setObj.merchantId" :placeholder="$t('client.merchantIdPlace')" />
        </el-form-item>
        <el-form-item prop="merchantSerialNumber" :label="$t('client.merchantSerialNumber') + '：'">
          <el-input class="input-width" v-model.trim="setObj.merchantSerialNumber" :placeholder="$t('client.merchantSerialNumberPlace')" />
        </el-form-item>
        <el-form-item prop="apiKey" :label="$t('client.apiKey') + '：'">
          <el-input class="input-width" v-model.trim="setObj.apiKey" :placeholder="$t('client.apiKeyPlace')" />
        </el-form-item>
        <el-form-item prop="syncUrl" :label="$t('client.syncUrl') + '：'">
          <el-input class="input-width" v-model.trim="setObj.syncUrl" :placeholder="$t('client.syncUrlPlace')" />
        </el-form-item>
        <el-form-item prop="asyncUrl" :label="$t('client.asyncUrl') + '：'">
          <el-input class="input-width" v-model.trim="setObj.asyncUrl" :placeholder="$t('client.asyncUrlPlace')" />
        </el-form-item>
        <el-form-item prop="channelStatus" :label="$t('client.status') + '：'">
          <el-tooltip :content="channelStatus(setObj.channelStatus)" placement="top">
            <el-switch
              v-model="setObj.channelStatus"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="1"
              :inactive-value="0" />
          </el-tooltip>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleSet">{{ $t('confirmBtn') }}</el-button>
          <el-button size="small" @click="cancelSet">{{ $t('cancelBtn') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as agentApi from '@/api/Agent/agent.js'
import * as api from '@/api/Client/client.js'
import * as rule from '@/utils/rules'
import { i18n } from '@/assets/languages/i18n.js'
import * as status from '@/utils/status.js'
import Vue from 'vue'
const rules = {
  name: rule.areaRules,
  merchantId: rule.areaRules,
  merchantSerialNumber: rule.areaRules,
  apiKey: rule.areaRules,
  syncUrl: rule.areaRules,
  asyncUrl: rule.areaRules
}
export default {
  name: 'pay-channel',
  data() {
    return {
      rules,
      loading: false,
      // 编辑弹框开关
      setFlag: false,
      setObj: {},
      saveSetNode: null,
      // 主列表数据
      list: [],
      // 列表勾选项的数组
      tableSelections: []
    }
  },
  created() {
    this.initList()
  },
  computed: {
    channelStatus() {
      return status.channelStatus
    }
  },
  methods: {
    initAgent() {

    },
    initList() {
      this.loading = true
      api.getAllAgentChannels()
        .then(res => {
          if (res.code === 20000) {
            this.list = res.data
            this.sortList()
            for (const item of this.list) {
              Vue.set(item, 'setFlag', false)
              Vue.set(item, 'removeFlag', false)
              agentApi.getAgentDetail(item.agentId)
                .then(result => {
                  if (result.code === 20000) {
                    Vue.set(item, 'agent', result.data)
                  } else {
                    Vue.set(item, 'agent', null)
                  }
                })
                .catch(() => {
                  Vue.set(item, 'agent', null)
                })
            }
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
          }
          this.loading = false
        })
        .catch(err => {
          this.loading = false
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
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
    },
    tableSelect(e) {
      this.tableSelections = e
    },
    showSet(item) {
      this.saveSetNode = item
      this.setObj = Object.assign({}, item)
      console.log(this.setObj)
      this.setFlag = true
    },
    handleSet() {
      if (this.saveSetNode.setFlag) {
        return
      }
      this.saveSetNode.setFlag = true
      this.$refs.setForm.validate(valid => {
        if (valid) {
          api.setChannel(this.setObj)
            .then(res => {
              console.log(res)
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('setSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.saveSetNode.setFlag = false
                this.setFlag = false
                this.initList()
              } else {
                this.$message({
                  message: this.$t('client.setFail'),
                  type: 'error',
                  duration: 1500
                })
                this.saveSetNode.setFlag = false
              }
            })
            .catch(err => {
              console.log(err)
              this.$message({
                message: this.$t('client.setFail'),
                type: 'error',
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
    cancelSet() {
      this.setFlag = false
    },
    delChannel(item) {
      this.$confirm(this.$t('client.delChannelMes'), this.$t('warning'), {
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warning'
      })
        .then(() => {
          if (item.removeFlag) {
            return
          }
          item.removeFlag = true
          api.delChannel(item.id)
            .then(res => {
              console.log(res)
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('delSucMes'),
                  type: 'success',
                  duration: 1500
                })
                item.removeFlag = false
                this.initList()
              } else {
                this.$message({
                  message: this.$t('client.delChannelFail'),
                  type: 'error',
                  duration: 1500
                })
                item.removeFlag = false
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              item.removeFlag = false
            })
        })
        .catch(() => {
          this.$message({
            message: this.$t('delCancelMes'),
            type: 'warning',
            duration: 1500
          })
        })
    },
    // 点击功能列表删除事件
    remove() {
      if (this.tableSelections.length === 0) {
        this.$message({
          message: this.$t('client.removeChannelWarn'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.$confirm(this.$t('client.removeChannelTitle'),  this.$t('warning'), {
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warning'
      })
        .then(() => {
          const list = []
          for (const item of this.tableSelections) {
            if (item.removeFlag) {
              continue
            }
            item.removeFlag = true
            const promiseItem = new Promise((resolve,reject) => {
              api.delChannel(item.id)
                .then(res => {
                  if (res.code === 20000) {
                    this.$message({
                      message: this.$t('delSucMes'),
                      type: 'success',
                      duration: 1500
                    })
                    item.removeFlag = false
                    resolve(item)
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
              this.initList()
            })
        })
        .catch(() => {
          this.$message({
            message: this.$t('delCancelMes'),
            type: 'warning',
            duration: 1500
          })
        })
    },
    linkToAdd() {
      this.$router.push({
        path: '/aaa/addChannel'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.channel-container {
  padding: 30px;
}
.table-container {
  margin-top: 30px;
  width: 100%;
}
.input-width {
  width: 70%;
}
.pagination-container {
  float: right;
  margin-top: 10px;
}
</style>
