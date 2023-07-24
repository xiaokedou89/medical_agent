<template>
  <div class="agents-account">
    <!--筛选框-->
    <el-card class="filter-container">
      <div class="filter-box" style="margin-top: 20px">
        <el-form :inline="true" size="small">
          <el-form-item class="filter-item" :label="$t('agent.searchOrder.timeFilterTitle')">
            <el-date-picker
              v-model="listQuery.startTime"
              style="width: 170px"
              class="input-width"
              value-format="yyyy-MM-dd"
              type="date"
              :placeholder="$t('timeBegPlace')"
              @change="beginChange"
            />
            -
            <el-date-picker
              v-model="listQuery.endTime"
              style="width: 170px"
              class="input-width"
              value-format="yyyy-MM-dd"
              type="date"
              :placeholder="$t('timeEndPlace')"
              @change="endChange"
            />
          </el-form-item>
          <el-form-item class="filter-item" :label="$t('statusFilter') + '：'">
            <el-select v-model="filterValue" class="filter-select" clearable :placeholder="$t('accountStatusPlace')" @change="statusChange">
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
      <span>{{ $t('doctor.accountList.operateTitle') }}</span>
    </el-card>
    <!--主列表-->
    <el-row class="table-container">
      <el-col :span="24">
        <el-table v-loading="loading" :data="list" style="width: 100%" border>
          <el-table-column align="center" prop="orderId" :label="$t('orderNumber')">
            <template slot-scope="scope">
              <el-button type="text" @click="showorderDetail(scope.row)">{{ getMessage(scope.row, 'orderId') }}</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="username" :label="$t('username')">
            <template slot-scope="scope">
              <span>{{ getMessage(scope.row.doctorDetail, 'username') }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('accountStatus')">
            <template slot-scope="scope">
              {{ getAccountStatus(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="amount" :label="$t('price')">
            <template slot-scope="scope">
              {{ getMessage(scope.row, 'amount') }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="updateTime" :label="$t('updateTime')">
            <template slot-scope="scope">
              {{ getTime(scope.row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column align="center" fixed="right" :label="$t('action')">
            <template slot-scope="scope">
              <el-button :disabled="scope.row.status != 0" size="small" type="primary" @click="handleAccount(scope.row)">{{ $t('accounted') }}</el-button>
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
      v-if="detailFlag"
      :visible.sync="detailFlag"
    >
      <el-form :model="detailObj" label-width="120px" label-position="right">
        <el-form-item :label="$t('orderNo') + '：'">
          <span>{{ getMessage(detailObj.orderDetail, 'orderNo') }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.medicalRecordNo')">
          <span>{{ getMessage(detailObj.orderDetail, 'medicalRecordNo')}}</span>
        </el-form-item>
        <el-form-item :label="$t('doctors') + '：'">
          <span>{{ getMessage(detailObj.doctorDetail, 'name')}}</span>
        </el-form-item>
        <el-form-item :label="$t('hospital') + '：'">
          <span>{{ detailObj.doctorDetail | filterHospital}}</span>
        </el-form-item>
        <el-form-item :label="$t('price') + '：'">
          <span>￥{{ getMessage(detailObj, 'amount')}}</span>
        </el-form-item>
        <el-form-item :label="$t('doctorAccount') + '：'">
          <span>{{ getMessage(detailObj, 'proportion')}}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.modeOfPayment')">
          <span>{{ getModeOfPayment(getMessage(detailObj.orderDetail, 'modeOfPayment')) }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.orderTime')">
          <span>{{ getTime(detailObj.orderTime) }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.downAccount.status')">
          <span>{{ getOrderStatus(getMessage(detailObj.orderDetail, 'status')) }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as api from '@/api/Doctors/doctors.js'
import * as orderApi from '@/api/Orders/orders.js'
import * as status from '@/utils/status.js'
import { i18n } from '@/assets/languages/i18n.js'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'

const defaultParams = {
  sortMode: 'DESC',
  pkId: 0,
  size: 500,
  status: -1, // 收益状态 -1拉取所有 0未结算 1已结算
  timeColumn: 'updateTime'
}

export default {
  name: 'DoctorsAccount',
  components: {
    pagination
  },
  data() {
    return {
      // 路由传过来的doctorId保存
      doctorId: null,
      // 医生详情
      doctorDetail: null,
      minId: 0,
      maxId: 0,
      beginFlag: false,
      endFlag: false,
      statusFlag: false,
      pageCount: 1,
      // 拉取主列表数据参数
      params: Object.assign({}, defaultParams),
      // 拉取数据防抖
      flag: false,
      // 主列表加载开关
      loading: false,
      // 详情弹框开关
      detailFlag: false,
      // 详情弹框绑定对象
      detailObj: {},
      // 对账状态筛选框数组
      accountStatusArr: status.accountStatusArr,
      // 主列表数据
      list: [],
      listQuery: {
        startTime: '',
        endTime: ''
      },
      filterValue: '',
      filterArr: status.accountStatusArr
    }
  },
  computed: {
    // 转换时间
    getTime() {
      const that = this
      return function(time) {
        return that.$moment(time).format('YYYY/MM/D HH:mm')
      }
    },
    // 转换状态
    getAccountStatus() {
      return status.accountStatus
    },
    // 支付方式转换
    getModeOfPayment() {
      return status.orderModeOfPayment
    },
    // 转换订单状态
    getOrderStatus() {
      return status.orderStatus
    },
    // 过滤数据
    getMessage() {
      return function (obj, attr) {
        return obj ? obj[attr] : ''
      }
    },
    getPrice() {
      return function (val) {
        return typeof val == 'number' ? (Math.round(val) * Math.pow(10, -2)).toFixed(2) : i18n.t('noData')
      }
    }
  },
  filters: {
    filterHospital(doctor) {
      let hospital
      if (doctor !== null && doctor.departments.hospital.name) {
        hospital = doctor.departments.hospital.name
      } else {
        hospital = i18n.t('doctor.searchOrder.filterHospital')
      }
      return hospital
    }
  },
  created() {
    if (this.$route.query.id !== undefined) {
      this.doctorId = +this.$route.query.id
    }
    this.initList(this.params)
  },
  methods: {
    // 初始化主列表数据
    initList(params) {
      this.loading = true
      // 判断路由是否获取到doctorId
      if (this.doctorId === null) {
        this.$message({
          message: this.$t('doctor.account.initDoctorFail'),
          type: 'error',
          duration: 1500
        })
        this.$router.back()
        return
      }
      if (this.doctorDetail === null) {
        api.getDoctorDetail(this.doctorId)
          .then(res => {
            if (res.code === 20000) {
              this.doctorDetail = res.data
            } else if (res.code === 20004) {
              this.$message({
                message: this.$t('noMoreMes'),
                type: 'error',
                duration: 1500
              })
              this.$router.back()
            }
          })
          .then(() => {
            this.initItem(params)
          })
          .catch(err => {
            this.$message({
              message: err,
              type: 'error',
              duration: 1500
            })
            this.flag = false
            this.loading = false
          })
      } else {
        this.initItem(params)
      }
    },
    // 拉取医生收益数据，并为数组每项添加doctorDetail和orderDetail
    initItem(params) {
      api.getDoctorRevenue(this.doctorId, params)
        .then(res => {
          console.log(res.data)
          const list = []
          if (res.code === 20000) {
            this.beginFlag = false
            this.endFlag = false
            this.statusFlag = false
            for (const [index, item] of res.data.entries()) {
              Vue.set(item, 'doctorDetail', this.doctorDetail)
              Vue.set(item, 'setFlag', false)
              item.amount = this.getPrice(item.amount)
              const promiseItem = new Promise((resolve, reject) => {
                orderApi.getOrder(item.orderId)
                  .then(result => {
                    if (result.code === 20000) {
                      Vue.set(item, 'orderDetail', result.data)
                      resolve(item)
                    } else if (result.code === 20004) {
                      Vue.set(item, 'orderDetail', null)
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
          this.flag = false
          this.loading = false
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

    pageSizeChange(e) {
      this.params.pkId = 0
      this.params.sortMode = 'DESC'
      this.params.size = e
      this.pageCount = 1
      this.initList(this.params)
    },
    // 点击订单编号显示订单详情弹框
    showorderDetail(item) {
      this.detailObj = JSON.parse(JSON.stringify(item))
      this.detailFlag = true
    },
    // 开始时间筛选框值改变
    beginChange(value) {
      console.log(value)
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
    // 结束时间筛选框值改变
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
    // 点击结算按钮
    handleAccount(item) {
      if (item.setFlag) {
        return
      }
      this.$confirm(this.$t('doctor.account.setConfirm'), this.$t('warning'),{
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warning'
      })
        .then(() => {
          item.setFlag = true
          api.setDoctorRevenue([item.id])
            .then(res => {
              console.log(res)
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('doctor.account.setSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.initItem(this.params)
              } else {
                this.$message({
                  message: this.$t('doctor.account.setFailMes'),
                  type: 'error',
                  duration: 1500
                })
              }
              item.setFlag = false
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              item.setFlag = false
            })
        })
        .catch(() => {
          this.$message({
            message: this.$t('doctor.account.cancelSet'),
            type: 'warning',
            duration: 1500
          })
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.filter-input {
  position: relative;
  width: 200px;
}
.filter-select {
  position: relative;
  width: 150px;
  margin-left: 10px;
}
.pagination-container {
  float: right;
  margin-top: 10px;
}
.agents-account {
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
