<!--
 * @Author: your name
 * @Date: 2021-08-20 15:40:15
 * @LastEditTime: 2021-08-20 19:50:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /medical-agents/src/views/Manage/Permission.vue
-->
<template>
  <div id="permission-list">
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>说明列表</span>
    </el-card>
    <el-row class="table-container">
      <el-col :span="24">
        <el-table :data="permissionsList" style="width: 100%" border>
          <el-table-column align="left" label="名称" width="150">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column align="left" label="描述">
            <template slot-scope="scope">
              {{ scope.row.notes }}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import * as api from '@/api/Permisson/permisson'
export default {
  name: 'Permission',
  data() {
    return {
      permissionsList: []
    }
  },
  created() {
    this.initList()
  },
  methods: {
    initList() {
      api.getPermissonList()
        .then(res => {
          this.permissionsList = res.data
        })
    }
  }
}
</script>
<style lang="scss" scoped>
#permission-list {
  padding: 30px;
}
.operate-container span {
  margin-left: 5px;
}
.table-container {
  margin-top: 20px;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
