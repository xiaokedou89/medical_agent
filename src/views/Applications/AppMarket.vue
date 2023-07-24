<template>
  <div class="app-market">
    <el-card class="filter-container" shadow="never">
      <div style="margin-top: 30px">
        <el-form :inline="true" size="small">
          <el-form-item label="应用名称筛选:">
            <el-input
              v-model="sysuserCondition"
              type="primary"
              size="small"
              placeholder="应用名称"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" />
      <span>应用市场列表</span>
    </el-card>

    <el-row class="table-container">
      <el-col :span="24">
        <el-table :data="pluginsArr" style="width: 100%" border>
          <el-table-column type="selection" />
          <el-table-column align="center" prop="name" label="应用名称">
            <template slot-scope="scope">
              <el-button type="text" @click="linkToDetail(scope.row)">
                {{ scope.row.name }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="description" label="应用描述">
            <template slot-scope="scope">
              {{ scope.row.description }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="url" label="应用路径">
            <template slot-scope="scope">
              {{ scope.row.path }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="版本信息">
            <template slot-scope="scope">
              {{ scope.row.version }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="价格">
            <template slot-scope="scope">
              ￥{{ scope.row.price }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="应用分类">
            <template slot-scope="scope">
              {{ scope.row.category }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="适用客户端">
            <template slot-scope="scope">
              {{ scope.row.client_type }}
            </template>
          </el-table-column>
          <el-table-column v-if="true" align="center" fixed="right" width="100" label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini">购买</el-button>
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
  name: 'AppMarket',
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
            name: '程序员老李',
            email: 'laoli@sina.com',
            phone: '13681104747'
          }
        }
      ],
      sysuserCondition: '',
      sysuserPage: {
        results: [],
        totalSize: 0
      }
    }
  },
  methods: {
    linkToDetail(obj) {
      this.$router.push({ path: '/applications/appdetail', query: obj })
    }
  }
}
</script>
<style lang="scss" scoped>
.app-market {
  padding: 30px;
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
