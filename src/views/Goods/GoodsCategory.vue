<template>
  <div class="app-container">
    <!--功能选项卡片-->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('goods.category.operateTitle')}}</span>
      <el-button
        class="btn-add"
        style="margin-left: 4px"
        size="small"
        type="danger"
        @click="remove"
      >
        {{$t('delBtn')}}
      </el-button>
      <el-button
        class="btn-add"
        size="small"
        @click="addGoods()"
      >
        {{$t('addBtn')}}
      </el-button>
    </el-card>
    <!--主列表-->
    <div class="table-container">
      <el-table
        v-loading="loading"
        ref="brandTable"
        :data="list"
        style="width: 100%"
        @selection-change="tableSelect"
        border
      >
        <el-table-column align="center" type="selection" />
        <el-table-column prop="id" align="center" :label="$t('orderNo')">
          <template slot-scope="scope">
            <el-button
              type="text"
              class="table-btn-font table-btn-color"
              @click="showSortDialog(scope.row)"
            >
              {{ scope.row.id }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          align="center"
          :label="$t('name')"
        >
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          align="center"
          :label="$t('description')"
        >
          <template slot-scope="scope">
            {{ scope.row.description }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="sort" :label="$t('sort')">
          <template slot-scope="scope">
            {{ scope.row.sort }}
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
      </div>
    </div>
    <!--编辑商品分类弹框-->
    <el-dialog :title="$t('set')" :visible.sync="showSet" width="30%">
      <el-form ref="setForm" :model="setObj" :rules="rules" size="small" label-width="60px">
        <el-form-item :label="$t('name') + '：'" prop="name">
          <el-input v-model.trim="setObj.name" autocomplete="off" :placeholder="$t('rules.goodnamelongth')" />
        </el-form-item>
        <el-form-item :label="$t('description') + '：'" prop="description">
          <el-input v-model.trim="setObj.description" type="textarea" />
        </el-form-item>
        <el-form-item :label="$t('sort') + '：'" prop="sort">
          <el-tooltip class="item" effect="dark" :content="$t('goods.category.sortTip')" placement="top">
            <el-input-number
              v-model.trim="setObj.sort"
              size="small"
              :step="1"
              :min="0"
              :max="10000"
              :label="$t('sort')"
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleSet">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelSet">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import pagination from '@/components/common/pagination/pagination.vue'
import Vue from 'vue'
import * as api from '@/api/Goods/goods.js'
import * as status from '@/utils/status'

// 默认编辑弹框绑定对象初始化值
const defaultSetObj = {
  name: '',
  description: '',
  sort: 0,
  deletedFlag: false
}
// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC'
}
export default {
  name: 'GoodsCategory',
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
      // 删除后拉取数据判单开关
      removeFlag: false,
      // 编辑弹框开关
      showSet: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 列表加载开关
      loading: false,
      // 主列表数据
      list: [],
      // 列表选择项数组
      tableSelections: [],
      // 编辑弹框保存节点
      saveSetNode: null,
      // 编辑弹框绑定对象
      setObj: Object.assign({}, defaultSetObj),
      rules: {
        name: [
          { required: true, message: this.$t('rules.goodsName'), trigger: 'blur' },
          { min: 2, max: 30, message: this.$t('rules.goodnamelongth'), trigger: 'blur' }
        ],
        description: [{ required: true, message: this.$t('rules.categoryDes'), trigger: 'blur' }]
      }
    }
  },
  components: {
    pagination
  },
  created() {
    // 初始化主列表数据
    this.initList(this.params)
  },
  methods: {
    // 初始化主列表数据
    initList(params) {
      this.loading = true
      api.getAllGoodsCategory(params)
        .then(res => {
          if (res.code === 20000) {
              this.list = res.data
              for (const item of this.list) {
                Vue.set(item, 'setFlag', false)
                Vue.set(item, 'removeFlag', false)
              }
              this.loading = false
              this.removeFlag = false
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
              if (this.removeFlag) {
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
          this.removeFlag = false
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
      this.params = Object.assign({}, defaultParams)
      this.params.size = e
      this.pageCount = 1
      this.initList(this.params)
    },
    // 表格选择框选择事件
    tableSelect(e) {
      this.tableSelections = e
    },
    // 点击编号事件--打开编辑弹框
    showSortDialog(item) {
      this.saveSetNode = item
      this.setObj = Object.assign({}, this.saveSetNode)
      this.showSet = true
    },
    // 编辑弹框确认事件
    handleSet() {
      if (this.saveSetNode.setFlag) {
        return
      }
      this.saveSetNode.setFlag = true
      this.$refs.setForm.validate(valid => {
        if (valid) {
          api.setGoodsCategory(this.setObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('setSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.saveSetNode.setFlag = false
                this.saveSetNode.name = this.setObj.name
                this.saveSetNode.description = this.setObj.description
                this.saveSetNode.sort = this.setObj.sort
                this.saveSetNode = null
                this.setObj = Object({}, defaultSetObj)
                this.showSet = false
              }
            })
            .catch(err => {
              this.saveSetNode.setFlag = false
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.saveSetNode.setFlag = false
        }
      })
    },
    // 编辑弹框取消事件
    cancelSet() {
      this.saveSetNode = null
      this.setObj = Object({}, defaultSetObj)
      this.showSet = false
    },
    // 点击删除事件
    remove() {
      if (this.tableSelections.length === 0) {
        this.$message({
          message: this.$t('goods.category.delCategoryWarn'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.$confirm(this.$t('goods.category.delCategorysWarn'), this.$t('warning'), {
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warning'
      })
        .then(() => {
          this.removeFlag = true
          const list = []
          for (const item of this.tableSelections) {
            if (item.removeFlag) {
              continue
            }
            item.removeFlag = true
            const promiseItem = new Promise((resolve, reject) => {
              api.delGoodsCategory(item.id)
                .then(res => {
                  if (res.code === 20000) {
                    this.$message({
                      message: this.$t('delSucMes'),
                      type: 'success',
                      duration: 1500
                    })
                    item.removeFlag = false
                    resolve(res.data)
                  }
                })
                .catch(err => {
                  this.$message({
                    message: err,
                    type: 'error',
                    duration: 1500
                  })
                  item.removeFlag = false
                  reject(err)
                })
            })
            list.push(promiseItem)
          }
          Promise.allSettled(list)
            .then(() => {
              this.params.pkId = this.maxId + 1
              this.params.sortMode = 'DESC'
              this.initList(this.params)
            })
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 点击添加跳转
    addGoods() {
      this.$router.push('/goods/addcategory')
    }
  }
}
</script>
<style lang="scss" scoped>
.pagination-container {
  float: right;
  margin-top: 10px;
}

.operate-container {
  margin-top: 30px;
}

.btn-add {
  float: right;
}

.table-container {
  margin-top: 30px;
}

.el-pagination {
  margin-top: 20px;
  float: right;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
