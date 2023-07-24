<template>
  <div class="good-priced">
    <!--筛选框-->
    <el-card class="filter-container">
      <div style="margin-top: 30px">
        <el-form :inline="true" :model="queryPage" size="small">
          <el-form-item :label="$t('nameFilter') + '：'">
            <el-input v-model="queryPage.name" :placeholder="$t('goodName') + '：'" />
          </el-form-item>
          <el-form-item :label="$t('statusFilter') + '：'">
            <el-select v-model="queryPage.status" :placeholder="$t('all')" clearable>
              <el-option
                v-for="item in publishStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('categoryFilter') + '：'">
            <el-select
              v-model="queryPage.categoryId"
              :placeholder="$t('categoryFilterPlace')"
              clearable
            >
              <el-option
                v-for="item in goodsCategory"
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
      <span>{{$t('goods.priced.operateTitle')}}</span>
    </el-card>
    <!--主列表-->
    <div class="table-container">
      <el-table
        ref="brandTable"
        :data="list"
        style="width: 100%"
        v-loading="loading"
        border
      >
        <el-table-column
          align="center"
          prop="goodsNo"
          :label="$t('orderNo')"
          width="180"
        >
          <template slot-scope="scope">
            <el-button type="text" @click="showGoodsDetail(scope.row)">
              {{ scope.row.goodsNo }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="name" :label="$t('name')">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('description')">
          <template slot-scope="scope">
            {{ scope.row.introduce }}
          </template>
        </el-table-column>
       <el-table-column align="center" prop="status" :label="$t('status')" width="100">
          <template slot-scope="scope">
            <span>{{ getStatus(scope.row.status )}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="category.id" :label="$t('category')">
          <template slot-scope="scope">
            {{ scope.row.category.name }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="price" :label="$t('price')">
          <template slot-scope="scope">
            <el-button type="text" @click="showSetPrice(scope.row)">
              ￥{{ scope.row.priceObj.price }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
      </div>
    </div>
    <!--商品详情弹框-->
    <el-dialog :title="$t('goodsDetail')" :visible.sync="goodsDetailFlag" width="40%">
      <el-form
        :model="goodsDetail"
        label-width="120px"
        label-position="right"
      >
        <el-form-item :label="$t('orderNo') + '：'">
          <span>{{ goodsDetail.goodsNo }}</span>
        </el-form-item>
        <el-form-item :label="$t('name') + '：'">
          <span>{{ goodsDetail.name }}</span>
        </el-form-item>
        <el-form-item :label="$t('description') + '：'">
          <span>{{ goodsDetail.introduce }}</span>
        </el-form-item>
        <el-form-item :label="$t('category') + '：'">
          <span>{{ goodsDetail.category.name }}</span>
        </el-form-item>
        <el-form-item :label="$t('price') + '：'">
          <span>￥{{ goodsDetail.priceObj.price }}</span>
        </el-form-item>
        <el-form-item :label="$t('status') + '：'">
          <span>{{ getStatus(goodsDetail.status) }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--商品价格修改框-->
    <el-dialog
      :title="$t('priced')"
      class="el-dialog-price"
      :visible.sync="goodsPriceFlag"
      width="40%"
    >
      <el-form
        :model="setObj"
        :rules="rules"
        ref="setForm"
        size="small"
        label-position="right"
        label-width="100xp"
      >
        <el-form-item label="价格:" prop="priceObj.price">
          <el-input-number
            v-model.trim="setObj.priceObj.price"
            size="medium"
            :precision="2"
            :step="1.0"
            :min="0.0"
            :label="$t('goods.priced.inputPrice')"
          />
        </el-form-item>
        <el-form-item class="price-dialog-btn">
          <el-button
            size="small"
            type="primary"
            @click="handleSet"
            >{{$t('confirmBtn')}}</el-button
          >
          <el-button size="small" @click="cancelSet"
            >{{$t('cancelBtn')}}</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import pagination from "@/components/common/pagination/pagination.vue";
import Vue from "vue";
import * as api from "@/api/Goods/goods.js";
import * as rule from "@/utils/rules";
import * as status from '@/utils/status'
import { getUserId } from '@/utils/auth'
const rules = {
  "priceObj.price": rule.areaRules
};

// 默认详情弹框绑定数据
const defaultObj = {
  id: null,
  name: "",
  introduce: "",
  photo: "",
  status: null,
  goodsNo: "",
  category: {
    id: null,
    name: "",
    description: "",
    sort: null,
  },
  priceObj: {
    agentId: null,
    goodsId: null,
    price: 0,
  },
}

// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC',
};
export default {
  name: "GoodPriced",
  components: {
    pagination,
  },
  data() {
    return {
      rules,
      // 当前登录用户id
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
      // 详情弹框开关
      goodsDetailFlag: false,
      // 商品价格修改弹框开关
      goodsPriceFlag: false,
      // 备份数组
      goodsArr: [],
      // 主列表数据
      list: [],
      // 商品详情弹框绑定数据
      goodsDetail: Object.assign({}, defaultObj),
      // 商品价格编辑弹框保存节点
      saveSetNode: null,
      // 商品价格编辑弹框绑定数据
      setObj: Object.assign({}, defaultObj),
      totalSize: 0,
      publishStatusOptions: [],
      goodsCategory: [],
      queryPage: {
        name: "",
        status: "",
        categoryId: "",
      }
    };
  },
  computed: {
    getStatus() {
      return function (id) {
        let label = null
        switch (id) {
          case 0:
            label = this.$t('unsale')
            break
          case 1:
            label = this.$t('sale')
            break
          case 2:
            label = this.$t('delete')
            break
        }
        return label
      }
    }
  },
  created() {
    this.userId = typeof this.$store.state.user.userId === 'number' ? this.$store.state.user.userId : getUserId();
    console.log(this.userId);
    this.initList(this.params)
  },
  methods: {
    // 初始化主列表数据
    initList(params) {
      this.loading = true
      // 获取商品价格数组
      api.getAllGoodsPrice(this.userId, params)
        .then(res => {
          let list = []
          console.log(res)
          if (res.code === 20000) {
            for (const [index, item] of res.data.entries()) {
              let promiseItem = new Promise((resolve, reject) => {
                api.getGoods(item.goodsId)
                  .then(res => {
                    if (res.data !== null) {
                      Vue.set(res.data, 'priceObj', item)
                      resolve(res.data)
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
                this.flag = false
                this.sortList()
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
        return;
      } else {
        if (!this.flag) {
          this.flag = true;
          this.pageCount--;
          this.params.sortMode = 'ASC';
          this.params.pkId = this.maxId;
          this.initList(this.params);
        } else {
          return;
        }
      }
    },
    // 分页组件点击下一页事件
    nextPage() {
      if (!this.flag) {
        this.flag = true;
        this.pageCount++;
        this.params.sortMode = 'DESC';
        this.params.pkId = this.minId;
        this.initList(this.params);
      } else {
        return;
      }
    },
    // 排序列表数组保存当前数组最大最小id
    sortList() {
      this.list.sort((a, b) => {
        if (a.id > b.id) {
          return -1;
        } else if (a.id < b.id) {
          return 1;
        } else {
          return 0;
        }
      });
      this.maxId = this.list[0].id;
      this.minId = this.list[this.list.length - 1].id;
    },
    // 分页组件选择每页条数触发事件
    pageSizeChange(e) {
      this.params = Object.assign({}, defaultParams);
      this.params.size = e;
      this.pageCount = 1;
      this.initList(this.params);
    },
    // 点击商品编号打开商品详情弹框
    showGoodsDetail(item) {
      this.goodsDetailFlag = true;
      this.goodsDetail = Object.assign({}, item)
    },
    // 点击商品价格显示编辑弹框事件
    showSetPrice(item) {
      this.saveSetNode = item
      this.setObj.priceObj = Object.assign({}, item.priceObj)
      this.goodsPriceFlag = true
    },
    // 点击商品编辑弹框确认事件
    handleSet() {
      this.$refs.setForm.validate(valid => {
        if (valid) {
          api.setGoodsPrice(this.setObj.priceObj)
            .then(res => {
              if (res.data !== null) {
                this.$message({
                  message: this.$t('setSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.saveSetNode.priceObj.price = this.setObj.priceObj.price
                this.saveSetNode = null
                this.setObj = Object.assign({}, defaultObj)
                this.goodsPriceFlag = false
              }
            })
            .catch(err => {
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
        }
      })
    },
    // 点击商品价格编辑弹框取消事件
    cancelSet() {
      this.saveSetNode = null
      this.setObj = Object.assign({}, defaultObj)
      this.goodsPriceFlag = false
    }
  }
};
</script>
<style lang="scss" scoped>
.pagination-container {
  float: right;
  margin-top: 10px;
}
.good-priced {
  padding: 30px;
}
.operate-container {
  margin-top: 20px;
}
.table-container {
  margin-top: 20px;
}
.el-pagination {
  float: right;
  margin-top: 20px;
}
.price-dialog-btn {
  margin-left: 50px;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
