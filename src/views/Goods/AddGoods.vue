<template>
  <div class="add-goods">
    <!--筛选框-->
    <el-card class="filter-container">
      <div style="margin-top: 30px">
        <el-form :inline="true" :model="queryPage" size="small">
          <el-form-item :label="$t('categoryFilter')">
            <el-select v-model="queryPage.categoryId" :placeholder="$t('categoryFilterPlace')" @change="categorySelect" clearable>
              <el-option
                v-for="item in categoryList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <!--功能列表-->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('goods.addGoods.operateTitle')}}</span>
      <el-button style="float: right; margin: 0px 5px;" type="danger" size="small" @click="remove">{{$t('delBtn')}}</el-button>
      <router-link to="/goods/newgood">
        <el-button style="float: right; margin: 0px 5px" size="small">{{$t('addBtn')}}</el-button>
      </router-link>
    </el-card>
    <!--主列表-->
    <div class="table-container">
      <el-table
        ref="brandTable"
        v-loading="loading"
        :data="list"
        style="width: 100%"
        border
        @selection-change="tableSelect"
      >
        <el-table-column align="center" type="selection" />
        <el-table-column align="center" prop="goodsNo" :label="$t('orderNo')" width="180">
          <template slot-scope="scope">
            <el-button type="text" @click="showSetGoods(scope.row)">
              {{ scope.row.id }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="name"
          :label="$t('name')"
        >
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('description')">
          <template slot-scope="scope">
            {{ scope.row.introduce | filterIntroduce }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="status" :label="$t('status')" width="100">
          <template slot-scope="scope">
            <el-tooltip effeck="dark" placement="top" :open-delay="400" :content="getStatus(scope.row.status)">
              <el-switch
                v-model="scope.row.status"
                v-if="list.length > 0"
                :active-value="1"
                :inactive-value="0"
                :disabled="scope.row.statusFlag"
                @change="changeStatus(scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="category"
          :label="$t('category')"
        >
          <template slot-scope="scope">
            {{ scope.row.category | filterCategory }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('action')" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button
              :disabled="scope.row.status === 1"
              size="small"
              type="danger"
              @click="delGood(scope.row)"
            >{{$t('delBtn')}}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
      </div>
    </div>
    <!--商品编辑修改框-->
    <el-dialog :title="$t('set')" :visible.sync="setFlag" width="40%">
      <el-form ref="setForm" :model="setObj" :rules="rules" size="small" label-width="100px" label-position="right">
        <el-form-item :label="$t('name') + '：'" prop="name">
          <el-input v-model.trim="setObj.name" style="width: 60%" />
        </el-form-item>
        <el-form-item :label="$t('description') + '：'" prop="introduce">
          <el-input
            v-model.trim="setObj.introduce"
            maxlength="100"
            rows="5"
            show-word-limit
            type="textarea"
            style="width: 60%"
          />
        </el-form-item>
        <el-form-item :label="$t('imageUrl') + '：'" prop="photo">
          <el-input v-model.trim="setObj.photo" type="url" style="width: 60%" />
        </el-form-item>
        <el-form-item :label="$t('category') + '：'" prop="category.id">
          <el-select v-model="setObj.category.id" :placeholder="$t('categoryFilterPlace')" size="small" @change="categoryChange">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
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
import * as api from '@/api/Goods/goods.js'
import * as status from '@/utils/status'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'
// 默认查询条件
const defaultListQuery = {
  categoryId: null
}

// 默认编辑弹框绑定对象
const defaultSetObj = {
  id: null,
  name: '',
  introduce: '',
  photo: '',
  status: 0,
  category: {
    id: null,
    description: '',
    name: '',
    sort: 0
  }
}

// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  categoryId: null,
  sortMode: 'DESC'
}

export default {
  name: 'AddGoods',
  components: {
    pagination
  },
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
      // 删除商品后拉取数据开关
      removeFlag: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 列表加载开关
      loading: false,
      // 增加的分类筛选框拉取数据的开关
      categoryFlag: false,
      // 编辑弹框开关
      setFlag: false,
      // 列表选择项数组
      tableSelections: [],
      // 商品分类列表数据
      categoryList: [],
      // 主列表数据
      list: [],
      // 编辑商品弹框保存节点
      saveSetNode: null,
      // 编辑商品弹框绑定对象
      setObj: Object.assign({}, defaultSetObj),
      // 查询条件
      queryPage: Object.assign({}, defaultListQuery),
      rules: {
        name: [
          { required: true, message: this.$t('rules.goodsName'), trigger: 'blur' },
          { min: 2, max: 140, message: this.$t('rules.goodnamelongth'), trigger: 'blur' }
        ],
        photo: [{ required: true, message: this.$t('rules.photo'), trigger: 'blur' }],
        'category.id': [{ required: true, message: this.$t('rules.goodsCategory'), trigger: 'blur' }],
        introduce: [{ required: true, message: this.$t('rules.goodsDescription'), trigger: 'blur' }]
      }
    }
  },
  computed: {
    getStatus() {
      return status.goodStatus
    }
  },
  filters: {
    // 过滤商品分类
    filterCategory(category) {
      return category ? category.name : this.$t('noCategory')
    },
    // 过滤描述
    filterIntroduce(introduce) {
      return introduce ? introduce : this.$t('noDescription')
    }
  },
  created() {
    this.initCategoryList()
    this.initList(this.params)
  },
  methods: {
    // 初始化商品分类列表数据
    initCategoryList() {
      api.getAllGoodsCategory()
        .then(res => {
          if (res.code === 20000 && res.data !== null) {
            this.categoryList = res.data
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('goods.index.initCateFail'),
              type: 'warning',
              duration: 1500
            })
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 初始化主列表数据
    initList(params) {
      this.loading = true
      let apiFn = null
      if (params.categoryId) {
        apiFn = api.getAllGoodsByCategory
      } else {
        apiFn = api.getAllGoods
      }
      apiFn(params)
        .then(res => {
          if (res.code === 20000) {
            this.list = res.data
            console.log(this.list)
            // 如果拉到数据关闭分类筛选框的开关，以此分辨20004是由点击下一页出现的还是分类筛选出现的
            this.categoryFlag = false
            this.removeFlag = false
            this.loading = false
            this.sortList()
            this.flag = false
            for (const item of this.list) {
              Vue.set(item, 'setFlag', false)
              Vue.set(item, 'statusFlag', false)
              Vue.set(item, 'removeFlag', false)
            }
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            this.flag = false
            this.loading = false
            // 如果开关为 true说明此20004是分类筛选框拉数据出现的
            if (this.categoryFlag || this.removeFlag) {
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
          this.categoryFlag = false
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
    // 分页组件选择每页条数触发事件
    pageSizeChange(e) {
      this.params.sortMode = 'DESC'
      this.params.pkId = 0
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
    },
    // 筛选分类下拉选择框值改变事件
    categorySelect(e) {
      // 当分类筛选框值改变时打开开关,只有拉到数据时才关闭，借此判断20004的情况给list赋值空数组
      this.categoryFlag = true
      this.params.sortMode = 'DESC'
      this.params.pkId = 0
      this.params.categoryId = e
      this.pageCount = 1
      this.initList(this.params)
    },
    // 分类下拉选择框改变值事件
    categoryChange(e) {
      let ind = 0
      for (const [index, item] of this.categoryList.entries()) {
        if (item.id === e) {
          ind = index
        }
      }
      this.setObj.category = Object.assign({}, this.categoryList[ind])
    },
    // 点击状态滑块改变商品状态
    changeStatus(item) {
      if (item.statusFlag) {
        return
      }
      item.statusFlag = true
      const data = {
        id: item.id,
        status: item.status
      }
      api.setGoods(data)
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('goods.addGoods.setGoodStatusSuc'),
              type: 'success',
              duration: 1500
            })
            item.statusFlag = false
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
          item.status = item.status === 0 ? 1 : 0
          item.statusFlag = false
        })
    },
    // 点击商品编号打开编辑商品弹框
    showSetGoods(item) {
      this.saveSetNode = item
      this.setObj = JSON.parse(JSON.stringify(item))
      this.setFlag = true
    },
    // 编辑商品弹框确认事件
    handleSet() {
      if (this.saveSetNode.setFlag) {
        return
      }
      this.saveSetNode.setFlag = true
      this.$refs.setForm.validate(valid => {
        if (valid) {
          api.setGoods(this.setObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('setSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.saveSetNode.setFlag = false
                this.saveSetNode.name = this.setObj.name
                this.saveSetNode.introduce = this.setObj.introduce
                this.saveSetNode.photo = this.setObj.photo
                this.saveSetNode.category = Object.assign({}, this.setObj.category)
                this.saveSetNode = null
                this.setObj = JSON.parse(JSON.stringify(defaultSetObj))
                this.setFlag = false
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.saveSetNode.setFlag = false
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
    // 编辑弹框点击取消事件
    cancelSet() {
      this.saveSetNode = null
      this.setObj = JSON.parse(JSON.stringify(defaultSetObj))
      this.setFlag = false
    },
    // 点击操作中的删除，删除单个商品
    delGood(item) {
      this.$confirm(this.$t('goods.addGoods.delGoodWarn'), this.$t('warning'), {
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warning'
      })
        .then(() => {
          if (item.removeFlag) {
            resolve()
          }
          this.removeFlag = true
          item.removeFlag = true
          api.delGoods(item.id)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('delSucMes'),
                  type: 'success',
                  duration: 1500
                })
                item.removeFlag = false
                this.params.pkId = this.maxId + 1
                this.params.sortMode = 'DESC'
                this.initList(this.params)
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              item.removeFlag = false
            })
        })
        .catch(() => {
          this.$message({
            message: this.$t('delCancelMes'),
            type: 'warning',
            duration: 1500
          })
        })
    },
    // 点击功能列表删除按钮事件
    remove() {
      if (this.tableSelections.length === 0) {
        this.$message({
          message: this.$t('goods.addGoods.delSelectWarn'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      for (const item of this.tableSelections) {
        if (item.status === 1) {
          this.$message({
            message: this.$t('goods.addGoods.delReturnWarn'),
            type: 'warning',
            duration: 1500
          })
          return
        }
      }
      this.$confirm(this.$t('goods.addGoods.delGoodsWarn'), this.$t('warning'), {
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
              api.delGoods(item.id)
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
        .catch(() => {
          this.$message({
            message: this.$t('delCancelMes'),
            type: 'warning',
            duration: 1500
          })
        })
    },
    // 表格选择事件
    tableSelect(e) {
      this.tableSelections = e
    }
  }
}
</script>
<style lang="scss" scoped>
.pagination-container {
  float: right;
  margin-top: 10px;
}

.add-goods {
  padding: 30px;
}

.table-container {
  margin-top: 30px;
  width: 100%;
}

.filter-container {
  height: 90%;
}

.el-pagination {
  float: right;
  margin-top: 20px;
}

.operate-container {
  margin-top: 20px;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
