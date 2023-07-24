<template>
  <div class="add-manager">
    <el-card class="container">
      <el-form ref="addAdminForm" :model="addManagerObj" :rules="rules" size="small" label-width="100px">
        <el-form-item :label="$t('username') + '：'" prop="username">
          <el-input v-model="addManagerObj.username" :placeholder="$t('usernamePlace')" style="width: 70%" />
        </el-form-item>
        <el-form-item :label="$t('password') + '：'" prop="password">
          <el-input v-model="addManagerObj.password" :placeholder="$t('passwordPlace')" show-password style="width: 70%" />
        </el-form-item>
        <el-form-item :label="$t('repeatPassword') + '：'" prop="repeatPassword">
          <el-input v-model="addManagerObj.repeatPassword" :placeholder="$t('repeatPassPlace')" show-password style="width: 70%" />
        </el-form-item>
        <el-form-item :label="$t('name') + '：'" prop="name">
          <el-input v-model="addManagerObj.name" :placeholder="$t('namePlace')" style="width: 70%" />
        </el-form-item>
        <el-form-item :label="$t('phone') + '：'" prop="phone">
          <el-input v-model="addManagerObj.phone" :placeholder="$t('phonePlace')" style="width: 70%" />
        </el-form-item>
        <el-form-item :label="$t('email') + '：'" prop="email">
          <el-input v-model="addManagerObj.email" :placeholder="$t('emailPlace')" style="width: 70%" />
        </el-form-item>
        <el-form-item :label="$t('isActive') + '：'" prop="status">
          <el-tooltip :content="getStatus(addManagerObj.status)" effect="dark" placement="top">
            <el-switch
              v-model="addManagerObj.status"
              :active-value="1"
              :inactive-value="0"
            />
          </el-tooltip>
        </el-form-item>
        <!-- <el-form-item :label="$t('role') + '：'" prop="role">
          <el-select v-model="addManagerObj.role" @change="rolesChange" clearable :placeholder="$t('roleSelectPlace')">
            <el-option
              v-for="(item, index) in rolesList"
              :key="index"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item class="price-dialog-btn">
          <el-button size="small" type="primary" @click="handleConfirm">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="backToMange">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import * as rule from '@/utils/rules'
import * as roleApi from '@/api/Roles/roles'
import * as api from '@/api/Admin/admin'
import * as status from '@/utils/status'
import { getUserId, getWorker, getAgent } from '@/utils/auth'

const rules = {
  username: rule.accountnameRules,
  name: rule.nameRules,
  password: rule.passwordRules,
  repeatPassword: rule.passwordRules,
  phone: rule.phoneRules,
  email: rule.emailRules,
  status: rule.areaRules
  // role: rule.areaRules
}
export default {
  name: 'AddManager',
  data() {
    return {
      userId: null,
      rules,
      // 点击确定添加防抖开关
      addFlag: false,
      // 角色下拉选择框绑定数组
      rolesList: [],
      addManagerObj: {
        agent: {id:null},
        id: null,
        username: '',
        password: '',
        repeatPassword: '',
        name: '',
        phone: null,
        email: '',
        photo: null,
        status: 0,
        // roles: [{id: ''}],
        roles: [],
        role: null
      }
    }
  },
  created() {
    if (getWorker() == 'worker') {
      this.userId = JSON.parse(getAgent()).id
    } else {
      this.userId = typeof this.$store.state.user.userId === 'number' ? this.$store.state.user.userId : getUserId()
    }
    this.addManagerObj.agent.id = this.userId;
    this.initRoles()
  },
  computed: {
    getStatus() {
      return function (st) {
        return status.adminStatus(st)
      }
    }
  },
  methods: {
    // 初始化角色列表
    initRoles() {
      roleApi.getRolesByUserType(6, {
        size: 1000,
        pkId: 0,
        sortMode: 'DESC',
      })
        .then(res => {
          if (res.code === 20000) {
            this.rolesList = res.data
            console.log(this.rolesList)
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('manage.addManage.initRoleFail'),
              type: 'warning',
              duration: 2000
            })
            this.$router.replace('/manage')
          }
        })
        .catch(err => {
          this.$message({
           message: this.$t('manage.addManage.getRoleFail') + err + '，' + this.$t('contactMange'),
            type: 'error',
            duration: 2000
          })
          this.$router.replace('/manage')
        })
    },
    // 角色下拉选择框值改变事件
    rolesChange(e) {
      console.log(e)
      if (typeof e === 'string') {
        this.addManagerObj.roles[0] = {id: null}
      } else {
        this.addManagerObj.roles[0] = this.rolesList[this.getIndex(e)]
      }
      console.log(this.addManagerObj.roles[0])
    },
    handleConfirm() {
      if (this.addFlag) {
        return
      }
      if (this.addManagerObj.password != this.addManagerObj.repeatPassword) {
        this.$message({
          message: this.$t('repeatFail'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.addFlag = true
      this.$refs.addAdminForm.validate(valid => {
        if (valid) {
          console.log(this.addManagerObj)
          api.addAgentWorker(this.addManagerObj)
            .then(res => {
              if (res.code === 20000) {
                this.addFlag = false
                this.$message({
                  message: this.$t('addSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.$router.replace('/manage')
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
            type: 'warning',
            duration: 1500
          })
          this.addFlag = false
        }
      })
    },
    getIndex(id) {
      for (let [index, item] of this.rolesList.entries()) {
        if (id === item.id) {
          console.log(index)
          return index

        }
      }
    },
    // 点击取消跳回管理员列表
    backToMange() {
      this.$router.push('/manage')
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
  .el-form-item {
    margin-top: 30px;
  }
}
.input-width {
  width: 60%;
}
</style>
