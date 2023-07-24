<template>
  <div id="doctor-order">
    <!-- 筛选框 -->
    <!-- <el-card class="filter-container">
      <div style="margin-top: 30px">
        <el-form :inline="true" size="small">
          <el-form-item :label="$t('doctor.index.filterHospTitle')">
            <el-select v-model="hospitalSelectValue" clearable :placeholder="$t('doctor.index.filterHospPlace')" @change="hospitalSelect">
              <el-option
                v-for="item in hospitalOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('doctor.index.filterDepTitle')">
            <el-select v-model="departmentSelectValue" clearable :placeholder="$t('doctor.index.filterDepPlace')" @change="departmentSelect" :disabled="departmentDisFlag">
              <el-option
                v-for="item in departmentOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card> -->
    <!-- 功能列表 -->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('doctor.order.operateTitle')}}</span>
    </el-card>
    <!-- 主列表 -->
    <el-row class="table-container">
      <el-col :span="24">
        <el-table v-loading="loading" :data="list" style="width: 100%" border>
          <el-table-column align="center" :label="$t('username')">
            <template slot-scope="scope">
              <el-button type="text" @click="showDoctorDetail(scope.row)">
                {{ scope.row.username }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('name')">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('order')">
            <template slot-scope="scope">
              <el-button type="text" @click="linkToOrders(scope.row.id)">{{$t('checkOrder')}}</el-button>
            </template>
          </el-table-column>
          <el-table-column v-if="false" align="center" fixed="right" width="210" :label="$t('action')" />
        </el-table>
        <div class="pagination-container">
          <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
        </div>
      </el-col>
    </el-row>
     <!--医生详细信息弹框-->
    <el-dialog :title="$t('agent.agentModel.agentDetailTitle')" :visible.sync="detailFlag" v-if="detailFlag" width="40%">
      <el-form :model="detailObj" label-width="120px" label-position="right">
        <el-form-item :label="$t('agent.index.dialogDetailUsername')">
          <span>{{ detailObj.username }}</span>
        </el-form-item>
        <el-form-item :label="$t('agent.index.dialogDetailName')">
          <span>{{ detailObj.name }}</span>
        </el-form-item>
        <el-form-item :label="$t('doctor.index.age')">
          <span>{{ detailObj.age }}</span>
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
        <el-form-item :label="$t('agent.downAccount.hospital')">
          <span>{{ detailObj.hospitalDetail | filterHospital}}</span>
        </el-form-item>
        <el-form-item :label="$t('doctor.index.department')">
          <span>{{ getMessage(detailObj.departments, 'name') }}</span>
        </el-form-item>
        <el-form-item :label="$t('doctor.index.proportion')">
          <span>{{ detailObj.proportion }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as api from '@/api/Doctors/doctors.js'
import * as hospitalApi from '@/api/Hospital/hospital.js'
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
  status: -1
}

export default {
  name: 'DoctorOrder',
  data() {
    return {
      userId: null,
       // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 分页组件传入的显示页数
      pageCount: 1,
      // 分页防抖开关
      flag: false,
       // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 列表加载开关
      loading: false,
      // 医生详情弹框开关
      detailFlag: false,
       // 主列表数据
      list: [],
      // 详情弹框绑定对象
      detailObj: {}
    }
  },
  components: {
    pagination
  },
  created() {
    if (getWorker() == 'worker') {
      this.userId = JSON.parse(getAgent()).id
    } else {
      this.userId = typeof this.$store.state.user.userId === 'number' ? this.$store.state.user.userId : getUserId()
    }
    this.initList(this.params)
  },
  computed: {
    getStatus() {
      return status.doctorStatus
    },
    getMessage() {
      return function (obj, key) {
        return obj ? obj[key] : i18n.t('noData')
      }
    }
  },
  filters: {
    filterHospital(hospital) {
      let name
      if (hospital !== null && hospital.name) {
        name = hospital.name
      } else {
        name = i18n.t('doctor.searchOrder.filterHospital')
      }
      return name
    }
  },
  methods: {
    initList(params) {
      this.loading = true
      api.getDoctorsOfAgent(this.userId, params)
        .then(res => {
          const list = []
          if (res.code === 20000) {
            for (const [index, item] of res.data.entries()) {
              const promiseItem = new Promise((resolve, reject) => {
                hospitalApi.getSingleHospital(item.departments.hospital.id)
                  .then(res => {
                    if (res.code === 20000) {
                      Vue.set(item, 'hospitalDetail', res.data)
                      resolve(item)
                    } else if (res.code === 20004) {
                      Vue.set(item, 'hospitalDetail', null)
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
                this.loading = false
                this.sortList()
                this.flag = false
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
    // 点击医生账号显示弹框事件
    showDoctorDetail(item) {
      this.detailFlag = true
      this.detailObj = Object.assign({}, item)
    },
    linkToOrders(doctorId) {
      this.$router.push({
        path: '/doctors/searchOrders',
        query: {
          id: doctorId
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
#doctor-order {
  padding: 20px;
}

.pagination-container {
  float: right;
  margin-top: 10px;
}

.operate-container {
  margin-top: 30px;
}

.table-container {
  margin-top: 30px;
}

.filter-container .el-form-item {
  margin-right: 30px;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
