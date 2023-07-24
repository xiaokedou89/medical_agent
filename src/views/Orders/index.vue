<template>
  <div class="app-container">
    <!--筛选框-->
    <el-card class="filter-container">
      <div style="margin-top: 30px">
        <el-form :inline="true" :rules="rules" :model="listQuery" size="small">
          <el-form-item :label="$t('timeFilter') + '：'">
            <el-date-picker
              v-model="listQuery.startTime"
              class="input-width"
              value-format="yyyy-MM-dd"
              type="date"
              :placeholder="$t('timeBegPlace') + '：'"
              @change="beginChange"
            />
            -
            <el-date-picker
              v-model="listQuery.endTime"
              class="input-width"
              value-format="yyyy-MM-dd"
              type="date"
              :placeholder="$t('timeEndPlace') + '：'"
              @change="endChange"
            />
          </el-form-item>
          <el-form-item :label="$t('statusFilter') + '：'">
            <el-select v-model="listQuery.status" class="input-width" :placeholder="$t('all')" clearable @change="statusChange">
              <el-option
                v-for="item in orderStatusArr"
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
      <span>{{$t('orders.index.operateTitle')}}</span>
    </el-card>
    <!--主列表-->
    <div class="table-container">
      <el-table
        ref="orderTable"
        v-loading="loading"
        :data="list"
        style="width: 100%;"
        :empty-text="$t('noData')"
        border
      >
        <el-table-column align="center" prop="orderNo" :label="$t('orderNo')">
          <template slot-scope="scope">
            <el-link type="primary" @click="toOrderDetail(scope.$index,scope.row)">{{ scope.row.orderNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="orderTime" :label="$t('orderTime')">
          <template slot-scope="scope">{{ getTime(scope.row.orderTime) }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('doctors')">
          <template slot-scope="scope">{{ scope.row.doctorDetail | filterDoctor }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('hospital')">
          <template slot-scope="scope">{{ scope.row.doctorDetail | filterHospital }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('price')" prop="totalAmount">
          <template slot-scope="scope">{{ getPrice(scope.row.price) }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('modeOfPayment')">
          <template slot-scope="scope">{{ getModeOfPayment(scope.row.modeOfPayment) }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('status')" prop="status">
          <template slot-scope="scope">{{ getOrderStatus(scope.row.status) }}</template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
    </div>
  </div>
</template>
<script>
import * as api from '@/api/Orders/orders.js'
import * as doctorApi from '@/api/Doctors/doctors.js'
import * as status from '@/utils/status.js'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'
import { getUserId, getWorker, getAgent } from '@/utils/auth'
import { i18n } from '@/assets/languages/i18n'

// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC',
  status: -1, // 默认显示全部订单
  timeColumn: 'orderTime'
}

export default {
  name: 'Orders',
  components: {
    pagination
  },
  data() {
    return {
      rules: {},
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 分页组件传入的显示页数
      pageCount: 1,
      // 分页防抖开关
      flag: false,
      // 筛选框起始时间开关
      beginFlag: false,
      // 筛选框结束时间开关
      endFlag: false,
      // 筛选框状态开关
      statusFlag: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 列表加载开关
      loading: false,
      // 主列表数据
      list: [],
      listQuery: {
        startTime: '',
        endTime: '',
        status: ''
      },
      orderStatusArr: status.orderStatusArr
    }
  },
  computed: {
    getTime() {
      const that = this
      return function(time) {
        return that.$moment(time).format('YYYY/MM/D  HH:mm')
      }
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
        return typeof val == 'number' ? `￥${(Math.round(val) * Math.pow(10, -2)).toFixed(2)}` : i18n.t('noData')
      }
    },
    getModeOfPayment() {
      return status.orderModeOfPayment
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
    filterDoctor(doctor) {
      let name = doctor === null ? i18n.t('order.index.filterDoctor') : doctor.name;
      return name;
    },
    filterHospital(doctor) {
      let hospital = doctor === null ? i18n.t('order.index.filterHospital') : doctor.departments.hospital.name;
      return hospital;
    }
  },
  methods: {
    // 初始化主列表数据
    initList(params) {
      this.loading = true
      // 拉取订单列表
      api.getAgentOrder(this.userId, params)
        .then(res => {
          const list = []
          // 获取订单列表
          if (res.code === 20000) {
            this.beginFlag = false
            this.endFlag = false
            this.statusFlag = false
            // 根据doctorId请求医生详情
            for (const [index, item] of res.data.entries()) {
              // 封装请求医生详情的操作
              const promiseItem = new Promise((resolve, reject) => {
                doctorApi.getDoctorDetail(item.doctorId)
                  .then(res => {
                    if (res.code === 20000) {
                      Vue.set(item, 'doctorDetail', res.data)
                      resolve(item)
                    } else if (res.code === 20004) {
                      Vue.set(item, 'doctorDetail', null)
                      resolve(item)
                    }
                  })
                  .catch(err => {
                    reject(err)
                  })
              })
              // 将请求医生详情推到PromiseAll数组中
              list.push(promiseItem)
            }
            // 并发所有请求医生详情,待全部完成后初始化列表
            Promise.all(list)
              .then(result => {
                this.list = result
                this.loading = false
                this.sortList()
                this.flag = false
              })
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            if (this.beginFlag || this.endFlag || this.statusFlag) {
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
          this.loading = false
          this.flag = false
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
      this.params.sortMode = 'DESC'
      this.params.size = e
      this.params.pkId = 0
      this.pageCount = 1
      this.initList(this.params)
    },
    // 筛选框起始时间改变
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
    // 筛选框状态改变
    statusChange(value) {
      this.statusFlag = true
      if (typeof value === 'number') {
        Vue.set(this.params, 'status', value)
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
    toOrderDetail(index, obj) {
      this.$router.push({
        path: '/orders/orderDetail',
        query: {
          id: obj.id
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.operate-container {
  margin-top: 20px;
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
