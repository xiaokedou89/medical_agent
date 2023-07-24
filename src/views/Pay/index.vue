<template>
  <div class="app-container">
    <div class="table-container">
      <el-card class="operate-container" shadow="never">
        <i class="el-icon-tickets" />
        <span>功能列表</span>
        <el-button
          style="float: right; margin: 0px 5px"
          size="small"
          @click="dialogFormVisible = true"
        >
          添加
        </el-button>
      </el-card>

      <el-dialog title="添加支付" :visible.sync="dialogFormVisible">
        <el-form :model="form">
          <el-form-item label="渠道名称" :label-width="formLabelWidth">
            <el-input v-model="form.name" autocomplete="off" />
          </el-form-item>
          <el-form-item label="商户编号" :label-width="formLabelWidth">
            <el-input v-model="form.name" autocomplete="off" />
          </el-form-item>
          <el-form-item label="渠道编码" :label-width="formLabelWidth">
            <el-input v-model="form.name" autocomplete="off" />
          </el-form-item>
          <el-form-item label="同步回调URL" :label-width="formLabelWidth">
            <el-input v-model="form.name" autocomplete="off" />
          </el-form-item>
          <el-form-item label="异步回调URL" :label-width="formLabelWidth">
            <el-input v-model="form.name" autocomplete="off" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
        </div>
      </el-dialog>

      <el-table
        ref="channelTable"
        :data="list"
        style="width: 100%"
        empty-text="暂无数据"
        border
      >
        <el-table-column align="center" label="渠道状态">
          <template slot-scope="scope">
            <p>
              <el-switch
                v-model="scope.row.channelStatus"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-value="1"
                :inactive-value="0"
                @change="handleChannelStatusChange(scope.$index, scope.row)"
              />
            </p>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="id"
          label="编号"
          width="80"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="channelName"
          label="渠道名称"
          width="100"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.channelName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="merchantId"
          label="商户编号"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.merchantId }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="channelId"
          label="渠道编码"
          width="100"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.channelId }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="syncUrl"
          label="同步回调URL"
          width="300"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.syncUrl }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="asyncUrl"
          label="异步回调URL"
          width="320"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.asyncUrl }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="classAddress"
          label="渠道实现类"
          width="200"
          fixed="right"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.classAddress }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Pay',
  data() {
    return {
      list: [
        {
          channelStatus: false,
          id: 1,
          channelName: '微信支付',
          merchantId: 'A00305710000067',
          channelId: 'weixin',
          syncUrl: 'http://medical.ll3d.com',
          asyncUrl: 'https://medical.ll3d.com/prod-api/pay/callback/weixin',
          classAddress: 'weixinPayServiceImpl'
        }
      ],
      dialogFormVisible: false,
      form: {

      },
      formLabelWidth: '150px'
    }
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  padding-top: 100px;
}

.operate-container {
  margin-bottom: 50px;
}

.btn-add {
  background-color: red;
  float: right;
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: #fff;
}
</style>
