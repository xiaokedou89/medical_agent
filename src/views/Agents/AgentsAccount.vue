<template>
    <div class="agents-account">
        <!--筛选框-->
        <el-card class="filter-container">
            <div class="filter-box" style="margin-top: 20px">
                <el-form :inline="true" size="small">
                <el-form-item class="filter-item" label="账号筛选:">
                    <el-input
                    v-model="sysuserCondition"
                    class="filter-input"
                    type="primary"
                    size="small"
                    placeholder="账号"
                    />
                </el-form-item>
                <el-form-item class="filter-item" label="状态筛选:">
                    <el-select v-model="filterValue" class="filter-select" clearable placeholder="选择结算状态" @change="handleSelect">
                        <el-option
                            v-for="item in filterArr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="时间筛选：">
                    <el-date-picker
                    style="width: 170px"
                    v-model="listQuery.startTime"
                    class="input-width"
                    value-format="yyyy-MM-dd"
                    type="date"
                    placeholder="请选择开始时间"
                    />
                    -
                    <el-date-picker
                    style="width: 170px"
                    v-model="listQuery.endTime"
                    class="input-width"
                    value-format="yyyy-MM-dd"
                    type="date"
                    placeholder="请选择结束时间"
                    />
                </el-form-item>
            </el-form>
        </div>
        </el-card>
        <!--功能列表-->
        <el-card class="operate-container">
            <i class="el-icon-tickets" />
            <span>代理商对账列表</span>
        </el-card>
        <!--主列表-->
        <el-row class="table-container">
            <el-col :span="24">
                <el-table :data="dataList" style="width: 100%" show-summary border>
                    <el-table-column align="center" prop="orderId" label="订单编号">
                        <template slot-scope="scope">
                            <el-button type="text" @click="showorderDetail(scope.row.orderId)">{{ scope.row.orderId }}</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" prop="agentId" label="账号">
                        <template slot-scope="scope">
                            <span>{{ scope.row.agentId }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" prop="relation" label="关系"></el-table-column>
                    <el-table-column align="center" prop="status" label="结算状态"></el-table-column>
                    <el-table-column align="center" prop="revenue" label="金额"></el-table-column>
                    <el-table-column align="center" prop="updateTime" label="更新时间"></el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <!--订单详情弹出框-->
        <el-dialog
            title="订单详情"
            :visible.sync="orderFlag"
        >
            <el-form :model="orderObj" label-width="100px" label-position="right">
                <el-form-item label="编号：">
                    <span>{{orderObj.orderNo}}</span>
                </el-form-item>
                <el-form-item label="病历号：">
                    <span>{{orderObj.medicalRecordNumber}}</span>
                </el-form-item>
                <el-form-item label="医生：">
                    <span>{{orderObj.doctorName}}</span>
                </el-form-item>
                <el-form-item label="医院：">
                    <span>{{orderObj.hospitalName}}</span>
                </el-form-item>
                <el-form-item label="金额：">
                    <span>￥{{orderObj.totalAmount}}</span>
                </el-form-item>
                <el-form-item label="分配金额：">
                    <span>￥{{orderObj.count}}</span>
                </el-form-item>
                <el-form-item label="支付方式：">
                    <span>{{orderObj.modeOfPayment}}</span>
                </el-form-item>
                <el-form-item label="提交时间：">
                    <span>{{orderObj.orderTime}}</span>
                </el-form-item>
                <el-form-item label="状态：">
                    <span>{{orderObj.status}}</span>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
export default {
    name: 'AgentsAccount',
    methods: {
        showorderDetail(id) {
            this.orderFlag = true
            this.activeIndex = this.getIndex(id)
        },
        getIndex(id) {
            let num = 0
            for (let i = 0; i < this.list.length; i++) {
                if (this.list[i].orderId == id) {
                    num = id
                }
                return num
            }
        },
        handleSelect(e) {
            if (e == 1) {
                this.dataList = this.getSelectArr('已结算')
            } else if (e == 2) {
                this.dataList = this.getSelectArr('未结算')
            } else {
                this.dataList = this.list
            }
        },
        getSelectArr(status) {
            let arr = []
            for (let i = 0; i < this.list.length; i++) {
                if (this.list[i].status == status) {
                    arr.push(this.list[i])
                }
            }
            return arr
        }
    },
    data() {
        return {
            listQuery: {
                startTime: '',
                endTime: ''
            },
            orderObj: {
                orderNo: 1456912,
                username: '小李代理商',
                medicalRecordNumber: 210217018027,
                doctorName: '测试数据',
                hospitalName: '三维云医院',
                totalAmount: 3500,
                count: 500,
                modeOfPayment: '微信支付',
                orderTime: '2021-08-13',
                status: '正在制作'
            },
            orderFlag: false,
            activeIndex: 0,
            filterValue: '',
            filterArr: [
                {
                    value: 1,
                    label: '已结算'
                },
                {
                    value: 2,
                    label: '未结算'
                }
            ],
            sysuserCondition: '',
            dataList: [],
            list: [
                {
                    agentId: '小李代理商',
                    orderId: '1456911',
                    relation: '下级',
                    status: '已结算',
                    revenue: 500,
                    updateTime: '2021-7-30'
                },
                {
                    agentId: '小李代理商',
                    orderId: '1456912',
                    relation: '下级',
                    status: '未结算',
                    revenue: 100,
                    updateTime: '2021-7-15'
                }
            ]
        }
    },
    created() {
        this.dataList = this.list
    }
}
</script>
<style lang="scss" scoped>
.filter-input {
  position: relative;
  width: 200px;
}
.filter-select {
  position: relative;
  width: 150px;
  margin-left: 10px;
}
.agents-account {
    padding: 30px;
}
.operate-container {
  margin-top: 30px;
}
.table-container {
    margin-top: 30px;
}
.el-table {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
