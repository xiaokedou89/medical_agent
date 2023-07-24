<template>
  <div class="agents-model">
    <!-- 筛选框 -->
    <el-card class="filter-container">
      <div class="filter-box" style="margin-top: 20px">
        <el-form :inline="true" size="small">
          <el-form-item :label="$t('agent.agentModel.filterStatusTitle')">
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
    <!-- 功能列表 -->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('agent.agentModel.operateTitle')}}</span>
    </el-card>
    <!--主列表-->
    <el-row class="table-container">
      <el-col :span="24">
        <el-table v-loading="loading" :data="list" style="width: 100%" border>
          <el-table-column align="center" :label="$t('username')">
            <template slot-scope="scope">
              <el-button type="text" @click="showAgentDetail(scope.row)">
                {{ scope.row.username }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="name" :label="$t('name')" />
          <el-table-column align="center" :label="$t('agentModel')">
            <template slot-scope="scope">
              <el-button v-if="scope.row.settleMode == 1" type="text" @click="showSettleModeDetail(scope.row)">{{$t('checkout')}}</el-button>
              <span v-else>{{ getSettleMode(scope.row.settleMode) }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" fixed="right" width="100" :label="$t('action')">
            <template slot-scope="scope">
              <el-button
                size="small"
                type="primary"
                @click="linkToAddModel(scope.row.id, scope.row.settleMode)"
              > {{$t('setBtn')}} </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!--分页-->
    <div class="pagination-container">
      <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
    </div>
    <!-- 详情弹框 -->
    <el-dialog :title="$t('agent.agentModel.agentDetailTitle')" :visible.sync="detailFlag" v-if="detailFlag" width="40%">
      <el-form :model="detailObj" label-width="120px" label-position="right">
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
          <span>{{ detailObj.area.name }}</span>
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
    <!-- 合作模式弹框 -->
    <el-dialog :title="$t('agent.agentModel.dialogDetailTitle')" :visible.sync="settleModeFlag" v-if="settleModeFlag" width="40%">
      <el-form :model="settleModeObj" label-width="150px" label-position="right">
        <!-- <el-form-item :label="$t('agent.agentModel.dialogDetailType')">
          <span>{{ getSettleMode(settleModeObj.settleMode) }}</span>
        </el-form-item> -->
        <el-form-item :label="$t('agent.agentModel.dialogDetailCount')">
          <span v-if="settleModeObj.settleDetail == null">{{ $t('agent.agentModel.noModel')}}</span>
          <span v-else>{{$t('agent.agentModel.dialogDetailCountDetail') + settleModeObj.settleDetail.discount }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as api from '@/api/Agent/agent.js'
import * as status from '@/utils/status.js'
import * as settleModeApi from '@/api/SettleMode/settleMode.js'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'

const defaultParams = {
  size: status.size,
  pkId: 0,
  status: -1,
  sortMode: 'DESC'
}

export default {
  name: 'AgentModel',
  components: {
    pagination
  },
  data() {
    return {
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
      // 代理商信息弹框开关
      detailFlag: false,
      // 合作模式详情开关
      settleModeFlag: false,
      statusQueryFlag: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 主列表数据
      list: [],
      detailObj: {},
      settleModeObj: {},
      // 筛选功能绑定对象
      listQuery: {
        status: -1
      },
      // 状态筛选框绑定数组
      patientStatusArr: status.patientStatusArr
    }
  },
  computed: {
    getStatus() {
      return status.agentStatus
    },
    getSettleMode() {
      return status.settleMode
    }
  },
  created() {
    this.initList(this.params)
  },
  methods: {
    initList(params) {
      this.loading = true
      api.getAllSubAgents(params)
        .then(res => {
          console.log(res)
          const list = []
          if (res.code === 20000) {
            this.statusQueryFlag = false
            for (const [index, item] of res.data.entries()) {
              let settleModeRequest = null
              if (item.settleMode == 1) {
                settleModeRequest = settleModeApi.getCountMode
              }
              const promiseItem = new Promise((resolve, reject) => {
                if (settleModeRequest !== null ) {
                  settleModeRequest(item.id)
                    .then(settleModeRes => {
                      if (settleModeRes.code === 20000) {
                        Vue.set(item, 'settleDetail', settleModeRes.data)
                        resolve(item)
                      } else if (settleModeRes.code === 20004) {
                        Vue.set(item, 'settleDetail', null)
                        resolve(item)
                      }
                    })
                    .catch(err => {
                      this.$message({
                        message: err,
                        type: 'error',
                        duration
                      })
                      reject(item)
                    })
                } else {
                  Vue.set(item, 'settleDetail', item.settleMode)
                  resolve(item)
                }
              })
              list.push(promiseItem)
            }
            Promise.all(list)
              .then(result => {
                this.list = result
                console.log(this.list)
                this.loading = false
                this.flag = false
                this.sortList()
              })
              .catch(err => {
                this.$message({
                  message: err,
                  type: 'error',
                  duration: 1500
                })
                this.loading = false
                this.flag = false
                // ???
              })
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            this.flag = false
            this.loading = false
            if (this.statusQueryFlag) {
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
    // 上一页
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
    // 下一页
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
    pageSizeChange(e) {
      this.params.sortMode = 'DESC'
      this.params.pkId = 0
      this.params.size = e
      this.pageCount = 1
      this.initList(this.params)
    },
    // 筛选状态改变事件
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
    // 点击代理商账号显示代理商详情弹框
    showAgentDetail(item) {
      this.detailFlag = true
      this.detailObj = Object.assign({}, item)
    },
    showSettleModeDetail(item) {
      console.log(item)
      this.settleModeObj = Object.assign({}, item)
      this.settleModeFlag = true
    },
    linkToAddModel(agentId, settleMode) {
      this.$router.push({
        path: '/agents/addModel',
        query: {
          id: agentId,
          settleMode: settleMode
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.agents-model {
  padding: 20px;
  .filter-container {
    height: 100px;
  }
  .operate-container {
    margin-top: 30px;
  }
  .table-container {
    margin-top: 30px;
  }
  .pagination-container {
    float: right;
    margin-top: 10px;
  }
}
</style>
