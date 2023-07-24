<template>
  <div id="patient">
    <!--筛选-->
    <!--<el-card class="filter-container">
      <div style="margin-top: 30px">
        <el-form :inline="true" size="small">
          <el-form-item :label="$t('statusFilter')">
            <el-select v-model="listQuery.status" :placeholder="$t('all')" @change="statusQueryChange" clearable>
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
    </el-card>-->
    <!--功能列表-->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('patients.index.operateTitle')}}</span>
    </el-card>
    <!--主列表-->
    <el-row class="table-container">
      <el-col :span="24">
        <el-table :data="list" v-loading="loading" style="width: 100%" border>
          <el-table-column align="center" :label="$t('username')">
            <template slot-scope="scope">
              <el-button type="text" @click="showPatientDetail(scope.row)">{{ scope.row.username }}</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('name')">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('sex')">
            <template slot-scope="scope">
              {{ getSex(scope.row.sex) }}
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('age')">
            <template slot-scope="scope">
              {{ scope.row.age }}
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('phone')">
            <template slot-scope="scope">
              {{ scope.row.phone }}
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('order')">
            <template slot-scope="scope">
              <el-button type="text" @click="linkToOrders(scope.row.id)">{{$t('checkOrder')}}</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" fixed="right" width="100" :label="$t('status')">
            <template slot-scope="scope">
              <el-tooltip effeck="dark" placement="top" :open-delay="400" :content="getStatus(scope.row.status)">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  :inactive-value="0"
                  :disabled="scope.row.statusFlag"
                  @change="statusChange($event, scope.row)"
                />
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!--详情弹出框-->
    <el-dialog :title="$t('patients.index.patientDetail')" :visible.sync="detailFlag" v-if="detailFlag" width="30%">
      <el-form
        :model="detailObj"
        label-width="100px"
        label-position="right"
      >
        <el-form-item :label="$t('username') + '：'">
          <span>
            {{ detailObj.username }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('name') + '：'">
          <span>
            {{ detailObj.name }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('nickName') + '：'">
          <span>
            {{ detailObj.nickName }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('age') + '：'">
          <span>
            {{ detailObj.age }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('sex') + '：'">
          <span>
            {{ getSex(detailObj.sex) }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('status') + '：'">
          <span>
            {{ getStatus(detailObj.status) }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('email') + '：'">
          <span>
            {{ detailObj.email }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('phone') + '：'">
          <span>
            {{ detailObj.phone }}
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--分页-->
    <div class="pagination-container">
      <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
    </div>
  </div>
</template>
<script>
import pagination from '@/components/common/pagination/pagination.vue'
import Vue from 'vue'
import * as status from '@/utils/status.js'
import * as api from '@/api/Patient/patient.js'

// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC'
}

export default {
  name: 'Patient',
  data() {
    return {
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
      // 状态筛选框开关
      statusFlag: false,
      // 列表加载开关
      loading: false,
      // 详情弹框开关
      detailFlag: false,
      // 详情弹框绑定对象
      detailObj: {},
      list: []
      // 筛选功能绑定对象
      // listQuery: {
      //   status: -1
      // },
      // 状态筛选框绑定数组
      //patientStatusArr: status.patientStatusArr
    }
  },
  components: {
    pagination
  },
  created() {
    this.initList(this.params);
  },
  computed: {
    getSex() {
      return status.sex
    },
    getStatus() {
      return status.patientStatus
    }
  },
  methods: {
    initList(params) {
      this.loading = true;
      api.getAgentPatient(params)
        .then(res => {
          if (res.code === 20000) {
            this.list = res.data;
            for (let item of res.data) {
              Vue.set(item, 'statusFlag', false);
            }
            this.loading = false;
            //this.statusFlag = false;
            this.flag = false;
            this.sortList();
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            this.loading = false;
            this.flag = false;
            if (this.params.sortMode === 'DESC') {
              this.pageCount !== 1 && this.pageCount--;
            } else {
              this.pageCount !== 1 && this.pageCount++;
            }
          }
        })
        .catch(err => {
          this.loading = false;
          this.flag = false;
          this.statusFlag = false;
          if (this.params.sortMode === 'DESC') {
            this.pageCount !== 1 && this.pageCount--;
          } else {
            this.pageCount !== 1 && this.pageCount++;
          }
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          });
        });
    },
    // 初始化列表数据
    // initList(params) {
    //   this.loading = true
    //   api.getAllPatient(params)
    //     .then(res => {
    //       if (res.code === 20000) {
    //         this.list = res.data
    //         for (let item of res.data) {
    //           Vue.set(item, 'statusFlag', false)
    //         }
    //         this.loading = false
    //         this.statusFlag = false
    //         this.flag = false
    //         this.sortList()
    //       } else if (res.code === 20004) {
    //         this.$message({
    //           message: this.$t('noMoreMes'),
    //           type: 'warning',
    //           duration: 1500
    //         })
    //         this.flag = false
    //         this.loading = false
    //         if (this.statusFlag) {
    //           this.list = []
    //         }
    //         if (this.params.sortMode === 'DESC') {
    //           if (this.pageCount !== 1) {
    //             this.pageCount--
    //           }
    //         } else {
    //           if (this.pageCount !== 1) {
    //             this.pageCount++
    //           }
    //         }
    //       }
    //     })
    //     .catch(err => {
    //       this.loading = false
    //       this.flag = false
    //       this.statusFlag = false
    //       if (this.params.sortMode === 'DESC') {
    //         if (this.pageCount !== 1) {
    //           this.pageCount--
    //         }
    //       } else {
    //         if (this.pageCount !== 1) {
    //           this.pageCount++
    //         }
    //       }
    //       this.$message({
    //         message: err,
    //         type: 'error',
    //         duration: 1500
    //       })
    //     })
    // },
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
    // 病人状态筛选框值改变事件
    // statusQueryChange(e) {
    //   this.statusFlag = true
    //   if (typeof e === 'number') {
    //     this.params.status = e
    //     this.params.pkId = 0
    //     this.params.sortMode = 'DESC'
    //     this.pageCount = 1
    //     this.initList(this.params)
    //   } else {
    //     this.params.status = -1
    //     this.params.pkId = 0
    //     this.params.sortMode = 'DESC'
    //     this.pageCount = 1
    //     this.initList(this.params)
    //   }
    // },
    // 点击账号显示详情弹框
    showPatientDetail(item) {
      this.detailObj = Object.assign({}, item)
      this.detailFlag = true
    },
    linkToOrders(patientId) {
      this.$router.push({
        path: '/zzz/searchOrders',
        query: {
          id: patientId
        }
      })
    },
    // 病人状态改变事件
    statusChange(value, item) {
      if (item.statusFlag) {
        return
      }
      item.statusFlag = true
      api.changeStatus(item.id, value)
        .then(res => {
          if (res.code === 20000) {
            item.statusFlag = false
            this.$message({
              message: this.$t('patients.index.statusChangeMes'),
              type: 'success',
              duration: 1500
            })
          }
        })
        .catch(err => {
          item.statusFlag = false
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
          item.status = value == 0 ? 1 : 0
        })
    }
  }
}
</script>
<style lang="scss" scoped>
#patient {
  padding: 30px;
}
.operate-container {
  margin-top: 20px;
}
.operate-container span {
  margin-left: 5px;
}
.pagination-container {
  float: right;
  margin-top: 10px;
}
.table-container {
  margin-top: 20px;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
