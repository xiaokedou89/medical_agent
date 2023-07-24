<template>
  <div class="log">
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('manage.log.operateTitle')}}</span>
    </el-card>
    <div class="table-container">
      <el-table
        :data="list"
        v-loading="loading"
        style="width: 100%;"
        :empty-text="$t('noData')"
        border
      >
        <el-table-column align="center" :label="$t('name')" width="150">
          <template slot-scope="scope">
            {{ scope.row.admin | getName }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('type')" width="180">
          <template slot-scope="scope">
            {{ getOperaType(scope.row.operateType) }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('description')" width="500">
          <template slot-scope="scope">
            {{ scope.row.describe | getDescribe }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('time')">
          <template slot-scope="scope">
            {{ getTime(scope.row.createTime) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--分页-->
    <div class="pagination-container">
      <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
    </div>
  </div>
</template>
<script>
import * as api from '@/api/Admin/admin'
import * as status from '@/utils/status'
import pagination from '@/components/common/pagination/pagination.vue'
import { i18n } from '@/assets/languages/i18n';

// 默认拉取列表数据参数对象
const defaultParams = {
  size: status.size,
  sortMode: 'DESC',
  pkId: 0
}

export default {
  name: 'Log',
  created() {
    this.initList(this.params)
  },
  components: {
    pagination
  },
  data() {
    return {
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 分页防抖开关
      flag: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 列表加载开关
      loading: false,
      // 分页page显示页数
      pageCount: 1,
      list: []
    }
  },
  computed:{
    getOperaType() {
      return status.logType
    },
    getTime() {
      return function (time) {
        return time = !time ?  '' : this.$moment(time).format('YYYY/MM/D HH:mm')
      }
    }
  },
  filters: {
    // 过滤操作描述
    getDescribe(describe) {
      if (!describe) {
        describe = i18n.t('noDescription')
      }
      return describe
    },
    // 过滤管理员姓名
    getName(admin) {
      return admin ? admin.name : ''
    }
  },
  methods: {
    //初始化列表数据
    initList(params) {
      this.loading = true
      api.getLog(params)
        .then(res => {
          if (res.code === 20000) {
            this.list = res.data
            console.log(this.list)
            this.loading = false
            this.sortList()
            this.flag = false
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
          if (params.sortMode === 'DESC') {
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
    // 分页组件点击下页事件
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
    // 改变每页显示条数事件
    pageSizeChange(e) {
      this.params = Object.assign({}, defaultParams)
      this.params.size = e
      this.pageCount = 1
      this.initList(this.params)
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
    }
  }
}
</script>
<style lang="scss" scoped>
.log {
  padding: 30px;
}
.table-container {
  margin-top: 20px;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.pagination-container {
  float: right;
}
</style>
