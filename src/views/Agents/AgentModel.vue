<template>
  <div id="agents-model">
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
          <el-table-column align="center" :label="$t('name')">
            <template slot-scope="scope">{{ scope.row.name }}</template>
          </el-table-column>
          <el-table-column align="center" :label="$t('agentModel')">
            <template slot-scope="scope">
              <el-button type="text" @click="showSettleModeDetail(scope.row)">{{$t('checkout')}}</el-button>
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
    <!--合作模式详情弹出框-->
    <el-dialog :title="$t('agent.agentModel.dialogDetailTitle')" :visible.sync="settleModeFlag" v-if="settleModeFlag" width="40%">
      <el-form :model="settleModeObj" label-width="150px" label-position="right">
        <el-form-item :label="$t('agent.agentModel.dialogDetailType')">
          <span>{{ getSettleMode(settleModeObj.settleMode) }}</span>
        </el-form-item>

        <el-form-item v-if="isCount && settleModeObj.settleDetail !== null" class="model-style-detail" :label="$t('agent.agentModel.dialogDetailCount')">
          <br>
          <p>
            <span>{{$t('agent.agentModel.dialogDetailCountDetail') + settleModeObj.settleDetail.discount }}</span>
          </p>
        </el-form-item>

        <el-form-item v-if="isPrePay && settleModeObj.settleDetail !== null" :label="$t('agent.agentModel.dialogDetailPrepay')" class="model-style-detail">
          <br>
          <ul>
            <li>
              <span>{{$t('agent.agentModel.dialogDetailRemain') +  settleModeObj.settleDetail.remain }}</span>
            </li>
          </ul>
        </el-form-item>
        <el-form-item v-if="isPostPay && settleModeObj.settleDetail !== null" :label="$t('agent.agentModel.dialogDetailPostpay')" class="model-style-detail">
          <br>
          <ul>
            <li v-for="(item,index) in settleModeObj.settleDetail" :key="index">
              <b>{{$t('agent.agentModel.dialogDetailNum') + (index + 1) + $t('agent.agentModel.dialogDetailNumBottom') }}</b>
              <span>{{$t('agent.agentModel.dialogDetailNums') +  item.amount }}</span>
              <span>{{ $t('agent.agentModel.dialogDetailDiscounts') +  item.discount }}</span>
            </li>
          </ul>
        </el-form-item>

      </el-form>
    </el-dialog>
    <!--代理商详细信息弹出框-->
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
  </div>
</template>
<script>
import * as api from '@/api/Agent/agent.js'
import * as status from '@/utils/status.js'
import * as settleModeApi from '@/api/SettleMode/settleMode.js'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'
// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  status: -1,
  sortMode: 'DESC'
}

export default {
  name: 'Agents',
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
      // 实时分账渲染开关
      isCount: false,
      // 预付款渲染开关
      isPrePay: false,
      // 后付款渲染开关
      isPostPay: false,
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
    // 初始化列表数据
    initList(params) {
      this.loading = true
      api.getAllSubAgents(params)
        .then(res => {
          const list = []
          if (res.code === 20000) {
            this.statusQueryFlag = false
            for (const [index, item] of res.data.entries()) {
              let settleModeRequest = null
              switch (item.settleMode) {
                case 1:
                  settleModeRequest = settleModeApi.getCountMode
                  break
                case 2:
                  settleModeRequest = settleModeApi.getPrePayMode
                  break
                case 3:
                  settleModeRequest = settleModeApi.getPostPayMode
                  break
              }
              const promiseItem = new Promise((resolve, reject) => {
                if (settleModeRequest !== null) {
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
                        duration: 1500
                      })
                      reject(err)
                    })
                } else {
                  Vue.set(item, 'settleDetail', null)
                  resolve(item)
                }
              })
              list.push(promiseItem)
            }
            Promise.all(list)
              .then(result => {
                this.list = result
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
      this.params.sortMode = 'DESC'
      this.params.pkId = 0
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
    // 点击代理商账号显示代理商详情弹框
    showAgentDetail(item) {
      this.detailFlag = true
      this.detailObj = Object.assign({}, item)
    },
    showSettleModeDetail(item) {
      console.log(item)
      this.settleModeObj = Object.assign({}, item)
      switch (this.settleModeObj.settleMode) {
        case 1:
          this.isCount = true
          this.isPrePay = false
          this.isPostPay = false
          break
        case 2:
          this.isCount = false
          this.isPrePay = true
          this.isPostPay = false
          break
        case 3:
          this.isCount = false
          this.isPrePay = false
          this.isPostPay = true
          break
      }
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
ul li {
  list-style: none;
}
#agents-model {
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
.model-style-detail ul {
  padding: 0;
}
.model-style-detail span {
  margin-right: 15px;
}
.model-style-detail b {
  margin-right: 2px;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
