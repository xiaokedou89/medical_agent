<template>
  <div class="agent-orders">
    <!-- 筛选框 -->
    <el-card class="filter-container">
      <div style="margin-top: 30px">
        <el-form :inline="true" :model="listQuery" size="small">
          <el-form-item :label="$t('agent.searchOrder.timeFilterTitle')">
            <el-date-picker
              v-model="listQuery.startTime"
              class="input-width"
              value-format="yyyy-MM-dd"
              type="date"
              :placeholder="$t('agent.searchOrder.timeFilterBegPlace')"
              @change="beginChange"
            />
            -
            <el-date-picker
              v-model="listQuery.endTime"
              class="input-width"
              value-format="yyyy-MM-dd"
              type="date"
              :placeholder="$t('agent.searchOrder.timeFilterEndPlace')"
              @change="endChange"
            />
          </el-form-item>
          <el-form-item :label="$t('agent.agentSearch.filterTitle')">
            <el-select v-model="filterValue" class="filter-select" clearable :placeholder="$t('agent.index.statusFilterPlace')" @change="statusChange">
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
    <!-- 功能列表 -->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('doctor.searchOrder.operateTitle')}}</span>
    </el-card>
    <!-- 主列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%;"
        border
      >
        <el-table-column align="center" :label="$t('orderNo')" width="180">
          <template slot-scope="scope">{{ scope.row.orderNo }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('medicalRecordNo')" width="120" fit="true">
          <template slot-scope="scope">{{ scope.row.medicalRecordNo }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('patient')" width="120" :show-overflow-tooltip="true">
          <template slot-scope="scope">{{ scope.row.patientDetail | filterPatient }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('hospital')">
          <template slot-scope="scope">{{ scope.row.doctorDetail | filterHospital }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('price')" width="120">
          <template slot-scope="scope">{{ getPrice(scope.row.price) }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('modeOfPayment')" width="120">
          <template slot-scope="scope">{{ getModeOfPayment(scope.row.modeOfPayment) }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('orderTime')" width="180">
          <template slot-scope="scope">{{ getTime(scope.row.orderTime) }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('status')" width="120" fixed="right">
          <template slot-scope="scope">{{ getStatus(scope.row.status) }}</template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div class="pagination-container">
      <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
    </div>
  </div>
</template>
<script>
import * as api from '@/api/Orders/orders.js'
import * as doctorApi from '@/api/Doctors/doctors.js'
import * as patientApi from '@/api/Patient/patient.js'
import * as status from '@/utils/status.js'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'
import { i18n } from '@/assets/languages/i18n.js'

// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  status: -1, // 默认显示已完成订单
  sortMode: 'DESC',
  timeColumn: 'orderTime'
}

export default {
  name: 'AgentSearchOrders',
  components: {
    pagination
  },
  data() {
    return {
      // 路由传递的医生id
      doctorId: null,
      // 根据传递的医生id拉取的医生对象
      doctorDetail: null,
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
      // 订单状态筛选遍历数组
      orderStatusArr: status.orderStatusArr,
      // 搜索表单绑定的对象
      listQuery: {
        startTime: '',
        endTime: ''
      },
      filterValue: ''
    }
  },
  computed: {
    getTime() {
      const that = this
      return function(time) {
        return time ? that.$moment(time).format('YYYY/MM/D  HH:mm') : ''
      }
    },
    getStatus() {
      return status.orderStatus
    },
    getModeOfPayment() {
      return status.orderModeOfPayment
    },
    // getPrice() {
    //   return function (val) {
    //     return Math.round(val / 100)
    //   }
    // },
    getPrice() {
      return function (val) {
        return typeof val == 'number' ? `￥${(Math.round(val) * Math.pow(10, -2)).toFixed(2)}` : i18n.t('noData')
      }
    }
  },
  created() {
    if (this.$route.query) {
      this.doctorId = +this.$route.query.id
    }
    this.initDoctor()
  },
  filters: {
    filterPatient(patient) {
      let name;
      if (patient !== null && patient.name) {
        name = patient.name
      } else {
        name = i18n.t('doctor.searchOrder.filterPatient')
      }
      return name
    },
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
  methods: {
    // 初始化医生对象并拉取数据
    async initDoctor() {
      if (this.doctorId !== null && !isNaN(this.doctorId) && this.doctorId) {
        let res = await doctorApi.getDoctorDetail(this.doctorId)
        this.doctorDetail = res.code === 20000 ? res.data : null
        this.initList(this.params)
      } else {
        this.$message({
          message: this.$t('doctor.searchOrder.initDoctorFailMes'),
          type: 'warning',
          duration: 1500
        })
        this.$router.replace('/doctors/order')
      }
    },
    // 初始化列表数据
    initList(params) {
      this.loading = true
      api.getDoctorOrder(this.doctorId, params)
        .then(res => {
          const list = []
          if (res.code === 20000) {
            this.beginFlag = false
            this.endFlag = false
            this.statusFlag = false
            // 根据item中的doctorId获取对应doctorDetail
            for (const [index, item] of res.data.entries()) {
              const promiseItem = new Promise((resolve, reject) => {
                // 根据item中的patientId获取对应的patientDetail
                patientApi.getSinglePatient(item.patientId)
                  .then(res => {
                    if (res.code === 20000) {
                      Vue.set(item, 'doctorDetail', this.doctorDetail)
                      Vue.set(item, 'patientDetail', res.data)
                      resolve(item)
                    } else if (res.code === 20004) {
                      Vue.set(item, 'doctorDetail', this.doctorDetail)
                      Vue.set(item, 'patientDetail', null)
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
              })
              list.push(promiseItem)
            }
            // 获取doctorDetail并发
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
    }
  }
}
</script>
<style scoped>
.agent-orders {
    padding: 30px;
}
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
