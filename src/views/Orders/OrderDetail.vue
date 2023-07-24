<template>
  <div class="order-detail">
    <el-card>
      <!-- 状态展示 -->
      <div class="operate-container">
        <i class="el-icon-warning color-danger" style="margin-left: 20px" />
        <span class="color-danger">{{$t('currentStatus') + '：' + getStatus(+order.status) }}</span>
      </div>
      <!-- 主表格 -->
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266" />
        <span class="font-small">{{$t('basicInfo')}}</span>
      </div>
      <!-- 基本信息 -->
      <div class="table-layout">
        <el-row>
          <el-col :span="5" class="table-cell-title">{{$t('orderNo')}}</el-col>
          <el-col :span="5" class="table-cell-title">{{$t('orderTime')}}</el-col>
          <el-col :span="7" class="table-cell-title">{{$t('payTime')}}</el-col>
          <el-col :span="4" class="table-cell-title">{{$t('modeOfPayment')}}</el-col>
          <el-col :span="3" class="table-cell-title">{{$t('type')}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="table-cell">{{ getMessage(order, 'orderNo') }}</el-col>
          <el-col :span="5" class="table-cell">{{ getTime(order.orderTime) }}</el-col>
          <el-col :span="7" class="table-cell">{{ getTime(order.payTime) }}</el-col>
          <el-col :span="4" class="table-cell">{{ getModeOfPayment(order.modeOfPayment)}}</el-col>
          <el-col :span="3" class="table-cell">{{ getType(+order.type) }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4" class="table-cell-title">{{$t('name')}}</el-col>
          <el-col :span="5" class="table-cell-title">{{$t('status')}}</el-col>
          <el-col :span="5" class="table-cell-title">{{$t('doctors')}}</el-col>
          <el-col :span="5" class="table-cell-title">{{$t('hospital')}}</el-col>
          <el-col :span="5" class="table-cell-title">{{$t('medicalRecordNo')}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4" class="table-cell">{{ getMessage(order, 'name')}}</el-col>
          <el-col :span="5" class="table-cell">{{ getStatus(+order.status) }}</el-col>
          <el-col :span="5" class="table-cell">{{ getMessage(order.doctorDetail, 'name')}}</el-col>
          <el-col :span="5" class="table-cell">{{ order.doctorDetail | filterHospital}}</el-col>
          <el-col :span="5" class="table-cell">{{ getMessage(order, 'medicalRecordNo')}}</el-col>
        </el-row>
      </div>
      <!-- 代理商信息 -->
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266" />
        <span class="font-small">{{$t('agentInfo')}}</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="5" class="table-cell-title">{{$t('username')}}</el-col>
          <el-col :span="4" class="table-cell-title">{{$t('name')}}</el-col>
          <el-col :span="6" class="table-cell-title">{{$t('phone')}}</el-col>
          <el-col :span="6" class="table-cell-title">{{$t('email')}}</el-col>
          <el-col :span="3" class="table-cell-title">{{$t('area')}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="table-cell">{{ getAgentMes(order.doctorDetail, 'username')}}</el-col>
          <el-col :span="4" class="table-cell">{{ getAgentMes(order.doctorDetail, 'name')}}</el-col>
          <el-col :span="6" class="table-cell">{{ getAgentMes(order.doctorDetail, 'phone')}}</el-col>
          <el-col :span="6" class="table-cell">{{ getAgentMes(order.doctorDetail, 'email')}}</el-col>
          <el-col :span="3" class="table-cell">{{ getMessage(getAgentMes(order.doctorDetail, 'area'), 'name')}}</el-col>
        </el-row>
      </div>
      <!-- 商品信息 -->
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266" />
        <span class="font-small">{{$t('goodInfo')}}</span>
      </div>
      <el-table
        :data="models"
        style="width: 100%;margin-top: 20px"
        border
      >
        <el-table-column align="center" :label="$t('name')">
          <template slot-scope="scope">
            <p>{{ scope.row.goodsName }}</p>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('price')">
          <template slot-scope="scope">
            <p>{{ getPrice(scope.row.price) }}</p>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('diagnoseReportNo')">
          <template slot-scope="scope">
            {{ scope.row.diagnoseReportNo }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('total')">
          <template slot-scope="scope">
            {{ getPrice(scope.row.actualAmount) }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('checkout')" width="250px">
          <template v-if="order.status > 0" slot-scope="scope" >
            <p>
              <el-button
                v-if="scope.row.status >= 40"
                size="mini"
                type="primary"
                @click="linkToModel(scope.$index, scope.row)"
              >
                {{ $t('orders.model.model') }}
              </el-button>
              <span v-else>{{ $t('orders.model.noModel') }}</span>
            </p>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
import * as status from '@/utils/status.js'
import * as api from '@/api/Orders/orders.js'
import * as doctorApi from '@/api/Doctors/doctors.js'
import Vue from 'vue'
import { i18n } from '@/assets/languages/i18n.js'
export default {
  name: 'OrderDetail',
  data() {
    return {
      orderId: null,
      order: {
        id: null,
        name: '', // 订单名称
        status: null, // 订单状态
        type: null, // 订单类型
        orderNo: '', // 订单编号
        orderTime: '', // 下单时间
        diagnoseReportNo: null, // 检查单号
        doctorId: null,
        doctorDetail: {
          agent: {
            username: '',
            name: '',
            phone: '',
            area: {
              name: ''
            }
          },
          age: null,
          email: '',
          id: null,
          name: '',
          password: '',
          phone: '',
          photo: '',
          proportion: '',
          status: '',
          username: '',
          departments:
            {
              description: '',
              id: '',
              name: '',
              hospital: {
                address: '',
                area: null,
                id: null,
                name: ''
              }
            }
        },
        goodsId: null,
        goodsName: '', // 商品名称
        actualAmount: null, // 实际付款
        medicalRecordNo: null, // 病历号
        modeOfPayment: null, // 原生支付
        modelData: null, // 模型地址
        modelTag: '', // 模型信息
        mpr: null, // ?
        patientId: null,
        payTime: '', // 支付时间
        prepayNo: null, // 支付方式单号
        price: null,
        snapshot: null // 模型原始数据
      },
      models: []
    }
  },
  computed: {
    // 转换订单类型
    getType() {
      return status.orderType
    },
    // 转换订单状态
    getStatus() {
      return status.orderStatus
    },
    // 转换时间
    getTime() {
      const that = this
      return function(time) {
        return time ? that.$moment(time).format('YYYY/MM/D  HH:mm') : ''
      }
    },
    // 过滤内容
    getMessage() {
      return function (obj, attr) {
        return obj ? obj[attr] : ''
      }
    },
    getModeOfPayment() {
      return status.orderModeOfPayment
    },
    getAgentMes() {
      return function (doctor, key) {
        let message = i18n.t('noData')
        if (doctor != null && doctor.agent) {
          message = doctor.agent[key]
        }
        return message
      }
    },
    // getPrice() {
    //   return function (val) {
    //     return Math.round(val / 100)
    //   }
    // }
    getPrice() {
      return function (val) {
        console.log(typeof val)
        return typeof val == 'number' ? `￥${(Math.round(val) * Math.pow(10, -2)).toFixed(2)}` : i18n.t('noData')
      }
    }
  },
  created() {
    if (this.$route.query.id) {
      this.orderId = +this.$route.query.id
    }
    this.initOrder(this.orderId)
  },
  filters: {
    filterHospital(doctor) {
      let hospital
      if (doctor && doctor.departments.hospital.name) {
        hospital = doctor.departments.hospital.name
      } else {
        hospital = i18n.t('doctor.searchOrder.filterHospital')
      }
      return hospital
    }
  },
  methods: {
    // 初始化订单数据
    async initOrder(orderId) {
      try {
        const orderResult = await api.getOrder(orderId)
        console.log(orderResult)
        let doctorResult = null
        if (orderResult.code === 20000) {
          // 初始化订单的医生相关数据
          doctorResult = await doctorApi.getDoctorDetail(orderResult.data.doctorId)
          console.log(doctorResult.data)
          Vue.set(orderResult.data, 'doctorDetail', doctorResult.data)
          this.order = orderResult.data
          this.models.push(this.order)
        }
      } catch (err) {
        this.$message({
          message: err,
          type: 'error',
          duration: 1500
        })
      }
    },
    linkToModel(index, item) {
      this.$router.push({
        path: '/orders/model',
        query: {
          id: item.id
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.order-detail {
  padding: 30px;
}
.detail-container {
  width: 80%;
  padding: 20px 20px 20px 20px;
  margin: 20px auto;
}

.operate-container {
  background: #F2F6FC;
  height: 80px;
  margin: -20px -20px 0;
  line-height: 80px;
}

.table-layout {
  margin-top: 20px;
  border-left: 1px solid #DCDFE6;
  border-top: 1px solid #DCDFE6;
}

.table-cell {
  height: 60px;
  line-height: 40px;
  border-right: 1px solid #DCDFE6;
  border-bottom: 1px solid #DCDFE6;
  padding: 10px;
  font-size: 14px;
  color: #606266;
  text-align: center;
  overflow: hidden;
}

.table-cell-title {
  border-right: 1px solid #DCDFE6;
  border-bottom: 1px solid #DCDFE6;
  padding: 10px;
  background: #F2F6FC;
  text-align: center;
  font-size: 14px;
  color: #303133;
}
</style>
