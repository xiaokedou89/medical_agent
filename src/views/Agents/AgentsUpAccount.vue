<template>
  <div class="agents-up-account">
    <!--筛选框-->
    <el-card class="filter-container">
      <div class="filter-box" style="margin-top: 20px">
        <el-form :inline="true" size="small">
          <el-form-item :label="$t('agent.searchOrder.timeFilterTitle')">
            <el-date-picker
              v-model="listQuery.startTime"
              style="width: 170px"
              class="input-width"
              value-format="yyyy-MM-dd"
              type="date"
              :placeholder="$t('agent.searchOrder.timeFilterBegPlace')"
              @change="beginChange"
            />
            -
            <el-date-picker
              v-model="listQuery.endTime"
              style="width: 170px"
              class="input-width"
              value-format="yyyy-MM-dd"
              type="date"
              :placeholder="$t('agent.searchOrder.timeFilterEndPlace')"
              @change="endChange"
            />
          </el-form-item>
          <el-form-item class="filter-item" :label="$t('agent.agentSearch.filterTitle')">
            <el-select v-model="filterValue" class="filter-select" clearable :placeholder="$t('global.all')" @change="statusChange">
              <el-option
                v-for="item in filterArr"
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
      <span>{{$t('agent.upAccount.operateTitle')}}</span>
    </el-card>
    <!--主列表-->
    <el-row class="table-container">
      <el-col :span="24">
        <el-table v-loading="loading" :data="list" style="width: 100%" border>
          <el-table-column align="center" prop="orderId" :label="$t('orderNo')">
            <template slot-scope="scope">
              <el-button type="text" @click="showDetail(scope.row)">{{ getMessage(scope.row.orderDetail, 'orderNo') }}</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="agentId" :label="$t('username')">
            <template slot-scope="scope">
              <span>{{ getMessage(scope.row.parentDetail, 'username') }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="status" :label="$t('status')">
            <template slot-scope="scope">
              {{ getStatus(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="revenue" :label="$t('price')+ $t('yuan')">
            <template slot-scope="scope">
              {{  getPrice(scope.row.revenue) }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="updateTime" :label="$t('updateTime')">
            <template slot-scope="scope">
              {{ getTime(scope.row.updateTime) }}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!--分页-->
    <div class="pagination-container">
      <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
    </div>
    <!--订单详情弹出框-->
    <el-dialog
      :title="$t('routerTitle.ordersDetail')"
      :visible.sync="detailFlag"
      v-if="detailFlag"
    >
      <el-form :model="detailObj" label-width="100px" label-position="right">
        <el-form-item :label="$t('agent.downAccount.orderNo')">
          <span>{{ getMessage(detailObj.orderDetail, 'orderNo') }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.medicalRecordNo')">
          <span>{{ getMessage(detailObj.orderDetail, 'medicalRecordNo') }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.doctor')">
          <span>{{ getMessage(detailObj.doctorDetail, 'name') }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.hospital')">
          <!-- <span>{{ detailObj.doctorDetail.departments.hospital.name }}</span> -->
          <span>{{ detailObj.doctorDetail | filterHospital }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.price')">
          <span>{{ getPrice(detailObj.orderDetail.price) }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.revenue')">
          <span>{{ getPrice(detailObj.revenue) }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.modeOfPayment')">
          <span>{{ getOrderModeOfPayment(getMessage(detailObj.orderDetail, 'modeOfPayment')) }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.orderTime')">
          <span>{{ getTime(getMessage(detailObj.orderDetail, 'orderTime')) }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.status')">
          <span>{{ getOrderStatus(getMessage(detailObj.orderDetail, 'status')) }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as api from '@/api/Agent/agent.js'
import * as orderApi from '@/api/Orders/orders.js'
import * as doctorApi from '@/api/Doctors/doctors.js'
import * as status from '@/utils/status.js'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'
import { i18n } from '@/assets/languages/i18n.js'
import { getUserId, getWorker, getAgent } from '@/utils/auth'

// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC',
  status: -1,
  timeColumn: 'updateTime'
}

export default {
  name: 'AgentsUpAccount',
  components: {
    pagination
  },
  data() {
    return {
      // 登录的代理商id
      userId: null,
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
      // 筛选框起始时间开关
      beginFlag: false,
      // 筛选框结束时间开关
      endFlag: false,
      // 筛选框状态开关
      statusFlag: false,
      // 详情弹框开关
      detailFlag: false,
      // 拉取主列表数据参数
      params: Object.assign({}, defaultParams),
      // 主列表数据
      list: [],
      // 详情弹框绑定对象
      detailObj: {},
      listQuery: {
        startTime: '',
        endTime: ''
      },
      filterValue: '',
      filterArr: status.accountStatusArr
    }
  },
  computed: {
    getStatus() {
      return status.accountStatus
    },
    getTime() {
      const that = this
      return function(time) {
        return that.$moment(time).format('YYYY/MM/D HH:mm')
      }
    },
    getOrderModeOfPayment() {
      return status.orderModeOfPayment
    },
    getOrderStatus() {
      return status.orderStatus
    },
    // getPrice() {
    //   return function (val) {
    //     return Math.round(val / 100)
    //   }
    // }
    getPrice() {
      return function (val) {
        console.log(val)
        return typeof val == 'number' ? `￥${(Math.round(val) * Math.pow(10, -2)).toFixed(2)}` : i18n.t('noData')
      }
    },
    getMessage() {
      return function (obj, key) {
        return obj ? obj[key] : i18n.t('noData')
      }
    }
  },
  filters: {
    filterHospital(doctor) {
      let hospital
      if (doctor != null && doctor.departments.hospital.name) {
        hospital = doctor.departments.hospital.name
      } else {
        hospital = i18n.t('doctor.searchOrder.filterHospital')
      }
      return hospital
    }
    // filterPrice(val) {
    //   return typeof val == 'number' ? `￥${(Math.round(val) * Math.pow(10, -2)).toFixed}`
    // }
  },
  created() {
    if (getWorker() == 'worker') {
      this.userId = JSON.parse(getAgent()).id
    } else {
      this.userId = typeof this.$store.state.user.userId === 'number' ? this.$store.state.user.userId : getUserId()
    }
    this.initList(this.params)
  },
  // filters: {
  //   filterRevenue(val) {
  //     console.log(val)
  //     return Math.round(val / 100)
  //   }
  // },
  methods: {
    // 初始化主列表数据
    initList(params) {
      this.loading = true
      api.getUpRevenueByChild(this.userId, params)
        .then(res => {
          const list = []
          if (res.code === 20000) {
            console.log(res.data)
            for (const [index, item] of res.data.entries()) {
              const promiseItem = new Promise((resolve, reject) => {
                orderApi.getOrder(item.orderId)
                  .then(orderRes => {
                    if (orderRes.code === 20000) {
                      Vue.set(item, 'orderDetail', orderRes.data)
                    } else if (orderRes.code === 20004) {
                      Vue.set(item, 'orderDetail', null)
                    }
                  })
                  .then(() => {
                    api.getAgentDetail(item.agentId)
                      .then(agentRes => {
                        if (agentRes.code === 20000) {
                          Vue.set(item, 'parentDetail', agentRes.data)
                        } else if (agentRes.code === 20004) {
                          Vue.set(item, 'parentDetail', null)
                        }
                      })
                  })
                  .then(() => {
                    doctorApi.getDoctorDetail(item.orderDetail.doctorId)
                      .then(doctorRes => {
                        if (doctorRes.code === 20000) {
                          Vue.set(item, 'doctorDetail', doctorRes.data)
                          resolve(item)
                        } else if (doctorRes.code === 20004) {
                          Vue.set(item, 'doctorDetail', null)
                          resolve(item)
                        }
                      })
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
                this.sortList()
                this.loading = false
                this.flag = false
                this.beginFlag = false
                this.endFlag = false
                this.statusFlag = false
              })
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            this.flag = false
            this.loading = false
            if (this.beginFlag || this.endFlag || this.statusFlag) {
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
          this.beginFlag = false
          this.endFlag = false
          this.statusFlag = false
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
      this.params.pkId = 0
      this.params.sortMode = 'DESC'
      this.params.size = e
      this.pageCount = 1
      this.initList(this.params)
    },
    beginChange(value) {
      this.beginFlag = true
      if (value !== null) {
        Vue.set(this.params, 'begin', value)
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.pageCount = 1
        this.initList(this.params)
      } else {
        Vue.delete(this.params, 'begin')
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.pageCount = 1
        this.initList(this.params)
      }
    },
    // 筛选框结束时间改变
    endChange(value) {
      this.endFlag = true
      if (value !== null) {
        Vue.set(this.params, 'end', value)
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.pageCount = 1
        this.initList(this.params)
      } else {
        Vue.delete(this.params, 'end')
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.pageCount = 1
        this.initList(this.params)
      }
    },
    // 状态筛选框值改变
    statusChange(e) {
      this.statusFlag = true
      if (this.flag) {
        return
      }
      this.flag = true
      if (typeof e !== 'string') {
        Vue.set(this.params, 'status', e)
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.initList(this.params)
      } else {
        Vue.set(this.params, 'status', -1)
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.initList(this.params)
      }
    },
    showDetail(item) {
      this.detailObj = Object.assign({}, item)
      console.log(this.detailObj)
      this.detailFlag = true
    }
  }
}
</script>
<style lang="scss" scoped>
.pagination-container {
  float: right;
  margin-top: 10px;
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
.agents-up-account {
    padding: 30px;
}
.operate-container {
  margin-top: 30px;
}
.table-container {
    margin-top: 30px;
}
.el-table {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
