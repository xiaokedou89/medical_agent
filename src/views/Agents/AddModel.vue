<template>
  <div class="add-model">
    <!-- 信息框 -->
    <el-card class="form-container">
      <ul class="agent-message">
        <li>
          <span>{{$t('agent.index.dialogDetailUsername')}}</span>
          <span>{{ agentObj.username }}</span>
        </li>
        <li>
          <span>{{$t('agent.index.dialogDetailName')}}</span>
          <span>{{ agentObj.name }}</span>
        </li>
      </ul>
    </el-card>
    <!-- 合作模式编辑框 -->
    <el-card class="form-container">
      <span>{{$t('agentModel')}}</span>
      <el-form
        class="pay-style-form"
        label-width="150px"
        size="small"
      >
        <el-form-item :label="$t('agent.agentModel.dialogDetailType')">
          <span>{{ getSettleMode(agentObj.settleMode) }}</span>
          <!-- <el-radio-group v-model="agentObj.settleMode">
            <el-radio :disabled="radioFlag" :label="0">{{$t('focus')}}</el-radio>
            <el-radio :disabled="radioFlag" :label="1">{{$t('count')}}</el-radio>
            <el-radio :disabled="radioFlag" :label="2">{{$t('prepay')}}</el-radio>
            <el-radio :disabled="radioFlag" :label="3">{{$t('postpay')}}</el-radio>
          </el-radio-group> -->
        </el-form-item>
        <!-- 实时 -->
        <el-form-item v-if="isCount" :label="$t('agent.addModel.countSet')">
          <ul class="set-count">
            <li>
              <span class="count-label">{{$t('agent.agentModel.dialogDetailCountDetail')}}</span>
              <el-input-number
                v-model="agentObj.settleDetail.discount"
                :min="0"
                :max="100"
                controls-position="right"
                size="small"
                class="el-count-input"
              />
            </li>
          </ul>
        </el-form-item>
        <!-- 预收款 -->
        <el-form-item v-if="isPrePay" :label="$t('global.add')">
          <ul class="set-price">
            <li>
              <span class="count-label">{{$t('agent.agentModel.dialogDetailRemain')}}</span>
              <el-input-number
                v-model="agentObj.settleDetail.number"
                controls-position="right"
                :min="1"
                size="small"
              />
            </li>
            <li>
              <span class="count-label">价格：</span>
              <el-input-number
                v-model="agentObj.settleDetail.price"
                controls-position="right"
                :precision="2"
                :step="1"
                :min="0"
                size="small"
              />
            </li>
          </ul>
        </el-form-item>
        <!-- 后收款 -->
        <el-form-item v-if="isPostPay" :label="$t('agent.agentModel.dialogDetailNumBottom')">
          <ul class="set-post">
            <li v-for="(item, index) in agentObj.settleDetail" :key="index">
              <div class="post-header">{{$t('agent.agentModel.dialogDetailNum') + (index + 1) + $t('agent.agentModel.dialogDetailNumBottom')}}</div>
              <div class="post-item">
                <span>{{$t('agent.agentModel.dialogDetailNums')}}</span>
                <i>{{ item.amount | filterAmount }}</i>
              </div>
              <div class="post-item">
                <span>{{$t('agent.addModel.discount')}}</span>
                <i>{{ item.discount | filterDiscount }}</i>
              </div>
              <div class="control-price">
                <el-button class="add-price" v-show="index === agentObj.settleDetail.length - 1" type="info" size="mini" @click="showAddLadder(item, index)">+</el-button>
                <el-button class="add-price" type="info" size="mini" @click="handleDelPostSettle(item, index)">-</el-button>
                <el-button class="add-price" type="info" size="mini" @click="showSetLadder(item, index)">{{$t('setBtn')}}</el-button>
              </div>
            </li>
          </ul>
        </el-form-item>

        <el-form-item>
          <el-button size="small" type="primary" @click="handleSet">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelSet">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 添加/修改单个阶梯弹框 -->
    <el-dialog :title="ladderTitle" :before-close="addLadderClosing" :visible.sync="addLadderFlag" v-if="addLadderFlag" width="40%">
      <el-form ref="addLadderForm" :rules="rules" :model="addLadderObj" label-width="150px" size="small">
        <el-form-item prop="amount" :label="$t('agent.agentModel.dialogDetailNums')">
          <el-input-number
            v-model="addLadderObj.amount"
            controls-position="right"
            :precision="0"
            size="small"
            :min="addLadderObj.minAmount"
            :max="addLadderObj.maxAmount"
          />
        </el-form-item>
        <el-form-item prop="discount" :label="$t('agent.addModel.discounts')">
          <el-input-number
            v-model="addLadderObj.discount"
            controls-position="right"
            size="small"
            :min="addLadderObj.minDiscount"
            :max="addLadderObj.maxDiscount"
          />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleAddLadder">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelAddLadder">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as api from '@/api/Agent/agent.js'
import * as settleModeApi from '@/api/SettleMode/settleMode.js'
import * as rule from '@/utils/rules.js'
import * as status from '@/utils/status.js'
import Vue from 'vue'

let noData

const rules = {
  discount: rule.ladderRules,
  amount: rule.ladderRules
}
// 主列表数据详情默认对象
const defaultDetail = {
  address: '',
  contact: '',
  contactPhone: '',
  email: '',
  id: null,
  leader: '',
  leaderPhone: '',
  name: '',
  parentId: null,
  password: '',
  phone: '',
  photo: '',
  settleMode: '',
  status: '',
  username: '',
  area: {
    id: null,
    name: '',
    parentId: null
  },
  settleDetail: {
    agentId: null,
    id: null,
    discount: null,
    number: null,
    price: null,
    type: null,
    amount: null
  }
}

const defaultSettleDetail = {
  agentId: null,
  id: null,
  discount: null,
  number: null,
  price: null,
  type: null,
  amount: null
}

// 添加阶梯对象默认值
const defaultAddLadder = {
  id: null,
  isSet: false, // 判断是添加/修改阶梯 false/true
  setFlag: false, // 编辑阶梯防抖开关
  addFlag: false, // 添加阶梯防抖开关
  agentId: null,
  discount: null,
  amount: null,
  index: null,
  minAmount: 0,
  maxAmount: 0,
  minDiscount: 0,
  maxDiscount: 0
}

export default {
  name: 'AddModel',
  data() {
    return {
      rules,
      // 编辑/添加单个阶梯弹框绑定标题
      ladderTitle: '',
      // 路由传递的代理商id
      agentId: null,
      // 实时支付开关
      isCount: false,
      // 预支付开关
      isPrePay: false,
      // 后支付开关
      isPostPay: false,
      // 绑定对象
      agentObj: JSON.parse(JSON.stringify(defaultDetail)),
      // 单选框disable开关
      radioFlag: false,
      // 点击确定防抖开关
      addFlag: false,
      // 添加阶梯弹框开关
      addLadderFlag: false,
      // 修改阶梯保存节点
      saveLadderNode: null,
      // 添加/修改阶梯绑定对象
      addLadderObj: Object.assign({}, defaultAddLadder)
    }
  },
  created() {
    noData = this.$t('noData')
    if (this.$route.query.id !== undefined && this.$route.query.id !== null) {
      this.agentId = this.$route.query.id
      defaultSettleDetail.agentId = this.$route.query.id
      defaultAddLadder.agentId = this.$route.query.id
    }
    if (this.$route.query.settleMode) {
      this.settleMode = this.$route.query.settleMode
    }
    this.init(this.agentId)
  },
  computed: {
    getSettleMode() {
      return status.settleMode
    }
  },
  filters: {
    filterAmount(amount) {
      return amount === null ? noData : amount
    },
    filterDiscount(discount) {
      return discount === null ? noData : discount
    }
  },
  methods: {
    // 根据路由传递的代理商id拉取代理商信息
    init(agentId) {
      api.getAgentDetail(agentId)
        .then(res => {
          if (res.code === 20000) {
            this.agentObj = res.data
            let settleModeFn = () => {}
            switch (this.agentObj.settleMode) {
              case 1:
                this.radioFlag = true
                settleModeFn = settleModeApi.getCountMode
                break
              case 2:
                this.radioFlag = true
                settleModeFn = settleModeApi.getPrePayMode
                break
              case 3:
                this.radioFlag = true
                settleModeFn = settleModeApi.getPostPayMode
                break
              default:
                this.radioFlag = true
                Vue.set(this.agentObj, 'settleDetail', {
                  agentId: agentId,
                  id: null,
                  discount: null,
                  number: null,
                  price: null,
                  type: null,
                  amount: null
                })
                return
            }
            settleModeFn(this.agentObj.id)
              .then(result => {
                let detailObj
                if (result.code === 20000 || result.code === 20004) {
                  switch (this.agentObj.settleMode) {
                    case 1:
                      this.isCount = true
                      this.isPrePay = false
                      this.isPostPay = false
                      detailObj = result.data === null ? defaultSettleDetail : result.data
                      Vue.set(this.agentObj, 'settleDetail', detailObj)
                      break
                    case 2:
                      this.isCount = false
                      this.isPrePay = true
                      this.isPostPay = false
                      // detailObj = result.data === null ? defaultSettleDetail : result.data
                      detailObj = Object.assign({}, defaultSettleDetail)
                      Vue.set(this.agentObj, 'settleDetail', detailObj)
                      break
                    case 3:
                      this.isCount = false
                      this.isPrePay = false
                      this.isPostPay = true
                      detailObj = result.data === null ? [ defaultSettleDetail ] : result.data
                      Vue.set(this.agentObj, 'settleDetail', detailObj)
                      for (const item of this.agentObj.settleDetail) {
                        Vue.set(item, 'delFlag', false)
                      }
                      break
                    default:
                      detailObj = null
                      Vue.set(this.agentObj, 'settleDetail', detailObj)
                      break
                  }
                } else {
                  this.$message({
                    message: this.$t('agent.addModel.initModelFail'),
                    type: 'error',
                    duration: 1500
                  })
                  this.$router.back(-1)
                }
              })
              .catch(err => {
                this.$message({
                  message: this.$t('agent.addModel.initModelFailMes') + err,
                  type: 'error',
                  duration: 1500
                })
                this.$router.back(-1)
              })
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('agent.addModel.initFailMes'),
              type: 'error',
              duration: 1500
            })
            this.$router.back(-1)
          }
        })
        .catch(err => {
          this.$message({
            message: this.$t('agent.addModel.initFailMes') +": " +err,
            type: 'error',
            duration: 1500
          })
          this.$router.back(-1)
        })
    },
    // 合作模式单选框值改变事件
    // changeSettleMode(e) {
    //   this.agentObj.settleMode = e
    //   switch (this.agentObj.settleMode) {
    //     case 1:
    //       this.isCount = true
    //       this.isPrePay = false
    //       this.isPostPay = false
    //       Vue.set(this.agentObj, 'settleDetail', {
    //         id: null,
    //         agentId: this.agentObj.id,
    //         discount: null
    //       })
    //       break
    //     case 2:
    //       this.isCount = false
    //       this.isPrePay = true
    //       this.isPostPay = false
    //       Vue.set(this.agentObj, 'settleDetail', {
    //         id: null,
    //         agentId: this.agentObj.id,
    //         remain: null,
    //         type: null
    //       })
    //       break
    //     case 3:
    //       this.isCount = false
    //       this.isPrePay = false
    //       this.isPostPay = true
    //       Vue.set(this.agentObj, 'settleDetail', [{
    //         id: null,
    //         agentId: this.agentObj.id,
    //         discount: null,
    //         amount: null
    //       }])
    //       break
    //   }
    // },
    // 计算修改阶梯amount最小值Min
    setAmountMin(index) {
      let min = 0
      min = index === 0 ? 0 : this.agentObj.settleDetail[index - 1].amount + 1
      return min
    },
    // 计算修改阶梯amount最大值Max
    setAmountMax(index) {
      let max = Infinity
      max = index === this.agentObj.settleDetail.length - 1 ? Infinity : this.agentObj.settleDetail[index + 1].amount - 1
      return max
    },
    // 计算修改阶梯discount最大值Max
    setDiscountMax(index) {
      let max = 100
      max = index === 0 ? 100 : this.agentObj.settleDetail[index - 1].discount - 1
      return max
    },
    // 计算修改阶梯discount最小值
    setDiscountMin(index) {
      let min = 0
      min = index === this.agentObj.settleDetail.length - 1 ? 0 : this.agentObj.settleDetail[index + 1].discount + 1
      return min
    },
    // 计算添加阶梯amount最小值min
    addAmountMin(index) {
      let min = 0
      min = this.agentObj.settleDetail[index].amount + 1
      return min
    },
    // 计算添加阶梯amount最大值max
    addAmountMax(index) {
      let max = Infinity
      max = index === this.agentObj.settleDetail.length - 1 ? Infinity : this.agentObj.settleDetail[index + 1].amount - 1
      return max
    },
    // 计算添加阶梯discount最大值
    addDiscountMax(index) {
      let max = this.agentObj.settleDetail[index].discount - 1
      return max
    },
    // 计算添加阶梯discount最小值
    addDiscountMin(index) {
      let min = 0
      min = index === this.agentObj.settleDetail.length - 1 ? 0 : this.agentObj.settleDetail[index + 1].discount + 1
      return min
    },
    // 点击添加/编辑阶梯弹框确定按钮
    handleAddLadder() {
      console.log(this.addLadderObj)
      if (this.addLadderObj.setFlag) {
        return
      }
      if (this.addLadderObj.addFlag) {
        return
      }
      if (this.addLadderObj.isSet) {
        this.addLadderObj.setFlag = true
        let settleFn = this.addLadderObj.id === null ? settleModeApi.addPostPayMode : settleModeApi.setPostPayMode
        this.$refs.addLadderForm.validate(valid => {
            if (valid) {
              console.log(this.addLadderObj)
              settleFn(this.addLadderObj)
                .then(res => {
                  if (res.code === 20000) {
                    this.addLadderObj.setFlag = false
                    this.$message({
                      message: this.$t('agent.addModel.setLadderSucMes'),
                      type: 'success',
                      duration: 1500
                    })
                    if (this.addLadderObj.id === null) {
                      this.saveLadderNode.id = res.data
                    }
                    this.saveLadderNode.discount = this.addLadderObj.discount
                    this.saveLadderNode.amount = this.addLadderObj.amount
                    this.saveLadderNode = null
                    this.addLadderObj = Object.assign({}, defaultAddLadder)
                    this.addLadderFlag = false
                  }
                })
                .catch(err => {
                  console.log('1')
                  this.$message({
                    message: err,
                    type: 'error',
                    duration: 1500
                  })
                  this.addLadderObj.setFlag = false
                })
            } else {
              this.addLadderObj.setFlag = false
              this.$message({
                message: this.$t('validFailMes'),
                type: 'warning',
                duration: 1500
              })
            }
          })
      } else {
        this.addLadderObj.addFlag = true
        this.$refs.addLadderForm.validate(valid => {
          if (valid) {
            settleModeApi.addPostPayMode(this.addLadderObj)
              .then(res => {
                if (res.code === 20000) {
                  this.addLadderObj.addFlag = false
                  this.$message({
                    message: this.$t('agent.addModel.addLadderSucMes'),
                    type: 'success',
                    duration: 1500
                  })
                  this.addLadderObj.id = res.data
                  this.agentObj.settleDetail.splice(this.addLadderObj.index + 1, 0, Object.assign({}, this.addLadderObj))
                  this.addLadderObj = Object.assign({}, defaultAddLadder)
                  this.addLadderFlag = false

                }
              })
              .catch(err => {
                console.log('2')
                this.$message({
                  message: err,
                  type: 'error',
                  duration: 1500
                })
                this.addLadderObj.addFlag = false
              })
          } else {
            this.$message({
              message: this.$t('validFailMes'),
              type: 'warning',
              duration: 1500
            })
            this.addLadderObj.addFlag = false
          }
        })
      }
    },
    // 点击添加/编辑阶梯弹框取消按钮
    cancelAddLadder() {
      this.saveLadderNode = null
      this.addLadderObj = Object.assign({}, defaultAddLadder)
      this.addLadderFlag = false
    },
    // 点击阶梯模式添加按钮
    showAddLadder(item, index) {
      if (item.id === null) {
        this.$message({
           message: this.$t('agent.addModel.addBtnMes'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.addLadderObj = Object.assign({}, defaultAddLadder)
      this.addLadderObj.agentId = this.agentId
      this.addLadderObj.index = index
      this.addLadderObj.minAmount = this.addAmountMin(index)
      this.addLadderObj.maxAmount = this.addAmountMax(index)
      this.addLadderObj.minDiscount = this.addDiscountMin(index)
      this.addLadderObj.maxDiscount = this.addDiscountMax(index)
      this.addLadderFlag = true
      console.log(this.addLadderObj.isSet)
    },
    // 点击阶梯模式修改按钮
    showSetLadder(item, index) {
      this.saveLadderNode = item
      item.agentId = +this.agentId
      let ladderObj = Object.assign({}, defaultAddLadder)
      this.addLadderObj = Object.assign(ladderObj, item)

      this.addLadderObj.isSet = true
      this.addLadderObj.index = index
      this.addLadderObj.minAmount = this.setAmountMin(index)
      this.addLadderObj.maxAmount = this.setAmountMax(index)
      this.addLadderObj.minDiscount = this.setDiscountMin(index)
      this.addLadderObj.maxDiscount = this.setDiscountMax(index)
      this.addLadderFlag = true
    },
    // 点击阶梯模式删除按钮
    handleDelPostSettle(item, index) {
      if (this.agentObj.settleDetail.length <= 1) {
        this.$message({
          message: this.$t('agent.addModel.delPostSettleMes'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.$confirm(this.$t('agent.addModel.delLadderWarning'), this.$t('warning'),{
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
      })
      .then(() => {
        if (item.delFlag) {
          return
        }
        item.delFlag = true
        settleModeApi.delPostPayMode(item.id)
        .then(res => {
          if (res.code === 20000) {
            item.delFlag = false
            this.$message({
              message: this.$t('agent.addModel.delLadderSucMes'),
              type: 'success',
              duration: 1500
            })
            this.agentObj.settleDetail.splice(index, 1)
          }
        })
        .catch(err => {
          item.delFlag = false
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
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
    // 处理实时分账请求并跳转回合作模式列表页面
    setCountMode() {
      if (this.agentObj.settleDetail.id === null) {
        settleModeApi.addCountMode(this.agentObj.settleDetail)
        .then(res => {
          if (res.code === 20000) {
            this.addFlag = false
            this.$message({
              message: this.$t('agent.addModel.setCountSucMes'),
              type: 'success',
              duration: 1500
            })
            this.$router.back(-1)
          } else {
            this.addFlag = false
            this.$message({
              message: this.$t('agent.addModel.setCountFail'),
              type: 'error',
              duration: 1500
            })
          }
        })
        .catch(err => {
          this.addFlag = false
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
      } else {
        settleModeApi.setCountMode(this.agentObj.settleDetail.id, this.agentObj.settleDetail)
          .then(res => {
            if (res.code === 20000) {
              this.addFlag = false
              this.$message({
                message: this.$t('agent.addModel.setCountSucMes'),
                type: 'success',
                duration: 1500
              })
              this.$router.back(-1)
            } else {
              this.addFlag = false
              this.$message({
                message: this.$t('agent.addModel.setCountFail'),
                type: 'error',
                duration: 1500
              })
            }
          })
          .catch(err => {
            this.addFlag = false
            this.$message({
              message: err,
              type: 'error',
              duration: 1500
            })
        })
      }
    },
    // 处理预付模式
    setPrePayMode() {
      let settleDetail = Object.assign({}, this.agentObj.settleDetail)
      settleDetail.price = settleDetail.price * 100
      settleModeApi.addPrePayMode(settleDetail)
        .then(res => {
          console.log(res)
          if (res.code === 20000) {
            this.addFlag = false
            this.$message({
              message: this.$t('agent.addModel.setPrepaySucMes'),
              type: 'success',
              duration: 1500
            })
            this.$router.back(-1)
          }
        })
        .catch(err => {
          this.addFlag = false
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 点击确定按钮
    handleSet() {
      if (this.agentObj.settleMode === 0) {
        this.$message({
          message: this.$t('agent.addModel.confirmBtnWarning'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.$confirm(this.$t('agent.addModel.handleSetWarning'), this.$t('warning'), {
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warning'
      })
        .then(() => {
          if (this.addFlag) {
            return
          }
          this.addFlag = true
          if (this.agentObj.settleMode === 1) {
            this.setCountMode()
          } else if (this.agentObj.settleMode === 2) {
            this.setPrePayMode()
          } else {
            this.$message({
              message: this.$t('agent.addModel.setSuc'),
              type: 'success',
              duration: 1500
            })
            this.$router.back(-1)
          }
        })
        .catch(() => {
          this.$message({
            message: this.$t('agent.addModel.setCancel'),
            type: 'warning',
            duration: 1500
          })
        })

    },
    // 点击取消按钮
    cancelSet() {
      this.$router.back(-1)
    },
    addLadderClosing(done) {
      this.$refs.addLadderForm.clearValidate()
      done()
    }
  }
}
</script>
<style lang="scss" scoped>
ul li {
  list-style: none;
}
.form-container {
  margin: 10px auto;
  width: 80%;
}
.input-width {
  width: 40%;
}

.pay-style-label {
  font-size: 14px;
  margin: 0 5px 0 40px;
  vertical-align: top;
  font-weight: 600;
}
.el-radio-group {
  margin-left: 10px;
}
.pay-style-form {
  margin-top: 15px;
}
.set-price,
.set-post,
.set-count {
  margin-left: -100px;
  margin-top: 50px;
  width: 100%;
}
.set-count .el-input-number {
  width: 100px!important;
  margin-left: 20px;
}
.set-price li {
  margin-top: 10px;
}
.set-price li .el-input-number {
  margin-left: 20px;
}

// 阶梯模式
.set-post li {
  display: flex;
  .post-header {
    text-overflow: hidden;
    white-space: nowrap;
  }
  .post-item {
    margin: 0 30px;
    display: flex;
    span {
      text-overflow: hidden;
      white-space: nowrap;
    }
    i {
      text-overflow: hidden;
      white-space: nowrap;
      font-size: 16px;
      font-weight: 600;
    }
  }
  .control-price {
    margin-left: 20px;
    display: flex;
    flex-basis: 200px;
    width: 200px;
    justify-content: flex-end;
    align-items: center;

  }
}


.add-price {
  font-size: 14px;
}
.add-price-contain {
  float: right;
  margin-right: 50px;
}

.agent-message li {
  width: 30%;
  display: flex;
  justify-content: space-around;
  font-size: 16px;
  margin-top: 20px;
}
.agent-message li span {
  flex: 1;
}
.el-count-input {
  width: 50px!important;
}
.count-label {
    margin-left: 10px;
}
</style>
