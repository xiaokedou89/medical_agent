<template>
  <div class="add-role">
    <el-card class="container">
      <el-form ref="roleForm" :model="addRole" label-position="right" :rules="rules" size="small" class="sysuserFormRef" label-width="100px">
        <el-form-item :label="$t('name') + '：'" prop="name">
          <el-input v-model.trim="addRole.name" style="width: 70%" />
        </el-form-item>
        <el-form-item :label="$t('description') + '：'" prop="notes">
          <el-input v-model.trim="addRole.notes" style="width: 70%" />
        </el-form-item>
        <el-form-item class="reset-btn-group">
          <el-button type="primary" size="small" @click="deal">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancel">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import * as rule from '@/utils/rules'
import * as api from '@/api/Roles/roles'
import * as status from '@/utils/status'
import { getUserId } from '@/utils/auth'
const rules = {
  name: rule.rolenameRules,
  notes: rule.rolenameRules
}
const defaultRole = {
  id: null,
  name: '',
  notes: '',
  userType: 6
}
export default {
  name: 'AddRole',
  data() {
    return {
      userId: null,
      rules,
      // 点击确定添加防抖开关
      addFlag: false,
      addRole: Object.assign({}, defaultRole)
    }
  },
  created() {
    this.userId = typeof this.$store.state.user.userId === 'number' ? this.$store.state.user.userId : getUserId();
    this.addRole.agentId = this.userId;
  },
  methods: {
    cancel() {
      this.$router.push('/manage/roles')
    },
    deal() {
      console.log(this.addRole)
      if (this.addFlag) {
        return
      }
      this.addFlag = true
      this.$refs.roleForm.validate(valid => {
        if (valid) {
          api.addRoles(this.addRole)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('addSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.addFlag = false
                this.$router.push('/manage/roles')
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.addFlag = false
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.addFlag = false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  border: 1px solid #e6ebf5;
  border-radius: 5px;
  padding: 30px 20px;
  width: 50%;
  margin: 20px auto;
}
.input-width {
  width: 60%;
}
</style>
