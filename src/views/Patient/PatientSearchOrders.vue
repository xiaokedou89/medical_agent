<template>
  <div class="agent-orders">
    <!-- 筛选框 -->
    <el-card class="filter-container">
      <div style="margin-top: 30px">
        <el-form :inline="true" :model="listQuery" size="small">
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
            <el-select v-model="listQuery.status" @change="statusChange" class="filter-select" clearable :placeholder="$t('allOrders')">
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
      <span>{{$t('patients.searchOrder.operateTitle')}}</span>
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
        <el-table-column align="center" :label="$t('doctors')" :width="120" fit="true">
          <template slot-scope="scope">{{ scope.row.doctorDetail | filterDoctorName }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('hospital')">
          <template slot-scope="scope">{{ scope.row.doctorDetail | filterDoctorHospital }}</template>
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
import { i18n } from '@/assets/languages/i18n'

// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC',
  status: -1,
  timeColumn: 'orderTime'
}


export default {
  name: 'PatientSearchOrders',
  data() {
    return {
      // 路由传递的病人id
      patientId: null,
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
      list: [],
      // 订单状态筛选遍历数组
      orderStatusArr: status.orderStatusSelectArr,
      // 搜索表单绑定的对象
      listQuery: {
        startTime: '',
        endTime: '',
        status: -1
      }
    }
  },
  components: {
    pagination
  },
  computed: {
    getTime() {
      const that = this
      return function (time) {
        return this.$moment(time).format('YYYY/MM/D  HH:mm')
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
    // }
    getPrice() {
      return function (val) {
        return typeof val == 'number' ? `￥${(Math.round(val) * Math.pow(10, -2)).toFixed(2)}` : i18n.t('noData')
      }
    }
  },
  created() {
    if (this.$route.query && (typeof this.$route.query.id !== 'undefined')) {
      this.patientId = +this.$route.query.id
    } else {
      this.$message({
        message: this.$t('patients.searchOrder.initPatientFail'),
        type: 'error',
        duration: 1500
      })
      this.$router.back();
    }
    this.initList(this.params)
  },
  filters: {
    filterDoctorName(doctor) {
      let name;
      if (doctor !== null && doctor.name) {
        name = doctor.name;
      } else {
        name = i18n.t('patients.searchOrder.filterDoctor');
      }
      return name;
    },
    filterDoctorHospital(doctor) {
      let hospital;
      if (doctor !== null && doctor.departments.hospital.name) {
        hospital = doctor.departments.hospital.name;
      } else {
        hospital = i18n.t('doctor.searchOrder.filterHospital');
      }
      return hospital;
    }
  },
  methods: {
    // 初始化列表数据
    initList(params) {
      this.loading = true
      // 根据病人id拉取病人订单列表
      api.getPatientOrder(this.patientId, params)
        .then(res => {
          console.log(res)
          let list = []
          if (res.code === 20000) {
            this.beginFlag = false
            this.endFlag = false
            this.statusFlag = false
            // 根据item中的doctorId获取对应doctorDetail
            for (const [index, item] of res.data.entries()) {
              let promiseItem = new Promise((resolve, reject) => {
                doctorApi.getDoctorDetail(item.doctorId)
                  .then(res => {
                    if (res.code === 20000) {
                      Vue.set(item, 'doctorDetail', res.data)
                      resolve(item)
                    } else if (res.code === 20004) {
                      Vue.set(item, 'doctorDetail', null);
                      resolve(item);
                    }
                  })
                  .catch(err => {
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
      this.params.sortMode = 'DESC'
      this.params.pkId = 0
      this.params.size = e
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
  margin-top: 10px;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
