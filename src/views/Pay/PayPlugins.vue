<template>
  <div class="pay-plugins">
    <el-card class="filter-container" shadow="never">
      <div style="margin-top: 30px">
        <el-form :inline="true" size="small">
          <el-form-item label="插件名称筛选:">
            <el-input
              v-model="sysuserCondition"
              type="primary"
              size="small"
              placeholder="插件名称"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" />
      <span>功能列表</span>
      <el-button style="float: right; margin: 0px 5px" size="small">添加</el-button>
      <el-button style="float: right; margin: 0px 5px" size="small" type="danger">删除</el-button>
    </el-card>

    <el-row class="table-container">
      <el-col :span="24">
        <el-table :data="pluginsArr" style="width: 100%" border>
          <el-table-column type="selection" />
          <el-table-column align="center" prop="name" label="插件名称">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="description" label="插件描述">
            <template slot-scope="scope">
              {{ scope.row.description }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="url" label="插件路径">
            <template slot-scope="scope">
              {{ scope.row.url }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="版本信息">
            <template slot-scope="scope">
              {{ scope.row.edition }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="价格">
            <template slot-scope="scope">
              ￥{{ scope.row.price }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="插件分类">
            <template slot-scope="scope">
              {{ scope.row.classify }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="是否激活">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.switchFlag"
                active-color="#13ce66"
                inactive-color="#ff4949"
              />
            </template>
          </el-table-column>
          <el-table-column v-if="false" fixed="right" width="210" label="操作">
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="small"
              >分成
              </el-button>
              <el-button
                v-if="false"
                size="small"
              >
                修改
              </el-button>
              <el-button
                v-if="false"
                type="danger"
                size="small"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          background
          :page-sizes="[5,10,15]"
          :total="sysuserPage.totalSize"
        />
      </el-col>
    </el-row>

  </div>
</template>
<script>
export default {
  name: 'PayPlugins',
  data() {
    return {
      pluginsArr: [
        {
          name: '支付插件模拟',
          description: '支付宝提供快捷支付插件',
          url: 'https://www.paypluginsmarket.com/xiaolipay',
          edition: '1.0.1版本',
          price: 2000000,
          classify: '',
          switchFlag: false
        }
      ],
      sysuserCondition: '',
      sysuserPage: {
        results: [],
        totalSize: 0
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.pay-plugins {
  padding: 20px;
}
.operate-container {
  margin-top: 30px;
}

.table-container {
  margin-top: 30px;
}

.el-pagination {
  float: right;
  margin-top: 20px;
}
</style>
