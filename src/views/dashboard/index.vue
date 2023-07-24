<template>
  <div class="dashboard-container">
    <el-card class="main">
      <div class="layout-title">{{$t('dashboard.allOrders')}}</div>
      <div class="un-handle-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">{{$t('dashboard.waitOrders')}}</span>
              <span style="float: right" class="color-danger">({{ order.making | filterOrder }})</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">{{$t('dashboard.payingOrders')}}</span>
              <span style="float: right" class="color-danger">({{ order.accomplish | filterOrder }})</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">{{$t('dashboard.finishedOrders')}}</span>
              <span style="float: right" class="color-danger">({{ order.finish | filterOrder }})</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <div class="seasion">
      <el-card class="revenue">
        <div class="out-border">
          <div class="layout-title">{{$t('dashboard.goods')}}</div>
          <div style="padding: 40px">
            <el-row>
              <el-col :span="8" class="color-danger overview-item-value">{{ goods.shelvesCount | filterGoods }}</el-col>
              <el-col :span="8" class="color-danger overview-item-value">{{ goods.saleCount | filterGoods}}</el-col>
              <el-col :span="8" class="color-danger overview-item-value">{{ goods.allCount | filterGoods }}</el-col>
            </el-row>
            <el-row class="font-medium">
              <el-col :span="8" class="overview-item-title">{{$t('dashboard.offGoods')}}</el-col>
              <el-col :span="8" class="overview-item-title">{{$t('dashboard.onGoods')}}</el-col>
              <el-col :span="8" class="overview-item-title">{{$t('dashboard.allGoods')}}</el-col>
            </el-row>
          </div>
        </div>
      </el-card>
      <el-card class="agents">
        <div class="out-border">
            <div class="layout-title">{{$t('dashboard.revenue')}}</div>
            <div style="padding: 40px">
              <el-row>
                <el-col :span="8" class="color-danger overview-item-value">
                  {{ revenue.settled | filterRevenue}}
                </el-col>
                <el-col :span="8" class="color-danger overview-item-value">
                  {{ revenue.unSettlement | filterRevenue }}
                </el-col>
                <el-col :span="8" class="color-danger overview-item-value">
                  {{ revenue.totalRevenue | filterRevenue}}
                </el-col>
              </el-row>
              <el-row class="font-medium">
                <el-col :span="8" class="overview-item-title">{{$t('dashboard.payed')}}</el-col>
                <el-col :span="8" class="overview-item-title">{{$t('dashboard.paying')}}</el-col>
                <el-col :span="8" class="overview-item-title">{{$t('dashboard.total')}}</el-col>
              </el-row>
            </div>
          </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import * as orderApi from '@/api/Orders/orders'
import * as goodsApi from '@/api/Goods/goods'
import * as agentApi from '@/api/Agent/agent'
import { getUserId, getWorker, getAgent } from '@/utils/auth'
import { i18n } from '@/assets/languages/i18n'
// 拉取公司的订单参数
const orderParams = {
  pkId: 0,
  sortMode: 'DESC',
  size: 50000,
  status: -1
}

// 拉取商品参数
const goodsParams = {
  pkId: 0,
  sortMode: 'DESC',
  size: 50000,
  status: -1
}

// 拉取首页参数
const revenueParams = {
  size: 5000,
  pkId: 0,
  sortMode: 'DESC',
  status: -1, // 收益状态 -1拉取所有 0未结算 1已结算
  timeColumn: 'updateTime'
}

export default {
  name: 'Dashboard',
  created() {
    if (getWorker() == 'worker') {
      this.userId = JSON.parse(getAgent()).id
      console.log(this.userId)
    } else {
      this.userId = typeof this.$store.state.user.userId === 'number' ? this.$store.state.user.userId : getUserId()
    }

    this.initOrder(this.userId)
    this.initGoods()
    this.initRevenue()
  },
  data() {
    return {
      userId: null,
      revenue: {
        settled: null,
        unSettlement: null,
        totalRevenue: null
      },
      order: {
        making: [],
        accomplish: [],
        finish: []
      },
      goods: {
        shelvesCount: [],
        saleCount: [],
        allCount: []
      }
    }
  },
  filters: {
    filterOrder(arr) {
      let message
      if (arr === null) {
        message = i18n.t('dashboard.messageNull')
      } else {
        message = arr.length
      }
      return message
    },
    filterGoods(arr) {
      let message
      if (arr === null) {
        message = i18n.t('dashboard.messageNull')
      } else {
        message = arr.length
      }
      return message
    },
    filterRevenue(val) {
      let revenue = '￥0'
      if (typeof val == 'number') {
        revenue = `￥${(Math.round(val) * Math.pow(10, -2)).toFixed(2)}`
      }
      return revenue
    }
  },
  methods: {
    // 初始化订单数据
    initOrder(userId) {
      orderApi.getAgentOrder(userId, orderParams)
        .then(res => {
          console.log(res)
          if (res.code === 20000) {
            for (let item of res.data) {
              switch (item.status) {
                case 20:
                  this.order.accomplish.push(item)
                  break
                case 30:
                  this.order.making.push(item)
                  break
                case 40:
                  this.order.finish.push(item)
                  break
              }
            }
          }
        })
        .catch(err => {
          let mes = this.$t('dashboard.messageOrderErr')
          this.$message({
            message: mes + err,
            type: 'error',
            duration: 1500
          })
          this.order.making = null
          this.order.accomplish = null
          this.order.finish = null
        })
    },
    // 初始化商品数据
    initGoods() {
      goodsApi.getAllGoods(goodsParams)
        .then(res => {
          if (res.code === 20000) {
            this.goods.allCount = res.data
            for (let item of res.data) {
              switch (item.status) {
                case 0:
                  this.goods.shelvesCount.push(item)
                  break
                case 1:
                  this.goods.saleCount.push(item)
                  break
              }
            }
          }
        })
        .catch(err => {
          let mes = this.$t('dashboard.messageGoodErr')
          this.$message({
            message: mes + err,
            type: 'error',
            duration: 1500
          })
          this.goods.shelvesCount = null
          this.goods.saleCount = null
          this.goods.allCount = null
        })
    },
    // 初始化收益数据
    initRevenue() {
      agentApi.getAllRevenue()
        .then(res => {
          console.log(res)
          if (res.code === 20000) {
            this.revenue = res.data
          }
        })
        .catch(err => {
          let mes = this.$t('dashboard.messageRevenueErr')
          this.$message({
            message: mes + err,
            type: 'error',
            duration: 1500
          })
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.dashboard-container {
  padding: 40px;
}
// .main {
//   margin-top: 20px;
// }
.seasion {
  margin-top: 50px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.revenue {
  width: 49%;
}
.agents {
  width: 49%;
}
.layout-title {
  color: #606266;
  padding: 15px 20px;
  // background: #F2F6FC;
  font-weight: bold;
}
.un-handle-content {
  padding: 20px 40px;
}

.un-handle-item {
  border-bottom: 1px solid #EBEEF5;
  padding: 10px;
}
.overview-layout {
  margin-top: 60px;
}

.overview-item-value {
  font-size: 24px;
  text-align: center;
}

.overview-item-title {
  margin-top: 10px;
  text-align: center;
}
</style>
