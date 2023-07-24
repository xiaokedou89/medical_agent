<template>
  <div class="agents-search">
    <!-- 筛选框 -->
    <el-card class="filter-container">
      <div class="filter-box" style="margin-top: 20px">
        <el-form :inline="true" size="small">
          <el-form-item :label="$t('agent.agentSearch.filterTitle')">
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
      <span>{{$t('agent.agentSearch.operateTitle')}}</span>
    </el-card>

    <!-- 主列表 -->
    <el-row class="table-container">
      <el-col :span="24">
        <el-table v-loading="loading" :data="list" style="width: 100%" border>
          <el-table-column align="center" prop="username" :label="$t('username')">
            <template slot-scope="scope">
              <el-button type="text" @click="showAgentDetail(scope.row)">
                {{ scope.row.username }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="name" :label="$t('name')">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="leader" :label="$t('leader')">
            <template slot-scope="scope">
              {{ scope.row.leader }}
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('order')">
            <template slot-scope="scope">
              <el-button type="text" @click="linkToOrders(scope.row.id)">{{$t('checkOrder')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--分页-->
        <div class="pagination-container">
          <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
        </div>
      </el-col>
    </el-row>
    <!--代理商详细信息弹出框-->
    <el-dialog :title="$t('agent.agentModel.agentDetailTitle')" v-if="detailFlag" :visible.sync="detailFlag" width="40%">
      <el-form :model="detailObj" label-width="150px" label-position="right">
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
  </div>
</template>
<script>
import * as api from '@/api/Agent/agent.js'
import * as status from '@/utils/status.js'
import { i18n } from '@/assets/languages/i18n.js'
import pagination from '@/components/common/pagination/pagination.vue'

// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC',
  status: -1
}

export default {
  name: 'AgentSearch',
  components: {
    pagination
  },
  data() {
    return {
      listQuery: {
        status: -1
      },
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 分页组件传入的显示页数
      pageCount: 1,
      // 列表加载开关
      loading: false,
      // 状态筛选框开关
      statusFlag: false,
      // 代理商详情弹框开关
      detailFlag: false,
      // 分页防抖开关
      flag: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 主列表数据
      list: [],
      // 状态筛选框绑定数组
      patientStatusArr: status.patientStatusArr,
      // 详情弹框绑定对象
      detailObj: {}
    }
  },
  computed: {
    getStatus() {
      return status.agentStatus
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
    // 初始化主列表数据
    initList(params) {
      this.loading = true
      api.getAllSubAgents(params)
        .then(res => {
          console.log(res)
          if (res.code === 20000) {
            this.list = res.data
            this.statusFlag = false
            this.sortList()
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })

            if (this.statusFlag) {
              this.list = []
            }
            if (this.params.sortMode === 'DESC') {
              this.pageCount !== 1 && this.pageCount--;
            } else {
              this.pageCount !== 1 && this.pageCount++;
            }
          }
          this.loading = false
          this.flag = false
        })
        .catch(err => {
          this.loading = false
          this.flag = false
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
      this.params.size = e
      this.params.pkId = 0
      this.params.sortMode = 'DESC'
      this.pageCount = 1
      this.initList(this.params)
    },
    // 状态筛选框值改变事件
    statusQueryChange(e) {
      this.statusFlag = true
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
    // 点击代理商账号显示弹框事件
    showAgentDetail(item) {
      this.detailObj = Object.assign({}, item)
      this.detailFlag = true
    },
    // 点击拥有订单跳转代理商订单页面
    linkToOrders(agentId) {
      this.$router.push({
        path: '/agents/searchOrders',
        query: {
          id: agentId
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.agents-search {
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
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
