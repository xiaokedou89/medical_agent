<template>
  <div class="app-detail">
    <el-card>
      <div class="operate-container">
        <i class="el-icon-warning color-danger" style="margin-left: 20px" />
        <span class="color-danger">{{ appObj.name }}</span>
      </div>
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266" />
        <span class="font-small">基本信息</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="5" class="table-cell-title">名称</el-col>
          <el-col :span="5" class="table-cell-title">描述</el-col>
          <el-col :span="7" class="table-cell-title">路径</el-col>
          <el-col :span="4" class="table-cell-title">版本号</el-col>
          <el-col :span="3" class="table-cell-title">价格</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="table-cell">{{ appObj.name }}</el-col>
          <el-col :span="5" class="table-cell">{{ appObj.description }}</el-col>
          <el-col :span="7" class="table-cell">{{ appObj.path }}</el-col>
          <el-col :span="4" class="table-cell">{{ appObj.version }}</el-col>
          <el-col :span="3" class="table-cell">￥{{ appObj.price }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4" class="table-cell-title">适用客户端</el-col>
          <el-col :span="5" class="table-cell-title">分类</el-col>
          <el-col :span="5" class="table-cell-title">开发商姓名</el-col>
          <el-col :span="5" class="table-cell-title">开发商电话</el-col>
          <el-col :span="5" class="table-cell-title">开发商邮箱</el-col>
        </el-row>
        <el-row>
          <el-col :span="4" class="table-cell">{{ appObj.client_type }}</el-col>
          <el-col :span="5" class="table-cell">{{ appObj.category }}</el-col>
          <el-col :span="5" class="table-cell">{{ appObj.developer.name }}</el-col>
          <el-col :span="5" class="table-cell">{{ appObj.developer.phone }}</el-col>
          <el-col :span="5" class="table-cell">{{ appObj.developer.email }}</el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'AppDetail',
  data() {
    return {
      pluginsArr: [
        {
          name: '支付插件模拟',
          description: '支付宝提供快捷支付插件',
          path: 'https://www.paypluginsmarket.com/xiaolipay',
          version: '1.0.1版本',
          price: 2000000,
          client_type: '微信小程序',
          category: '支付插件',
          developer: {
            username: '',
            name: '',
            email: '',
            phone: ''
          }
        }
      ],
      appObj: null
    }
  },
  mounted() {
    this.appObj = this.$route.query
  }
}
</script>
<style lang="scss" scoped>
.app-detail {
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
