<!--
 * @Author: your name
 * @Date: 2021-08-20 18:29:22
 * @LastEditTime: 2021-08-20 18:48:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /medical-agents/src/views/Client/AddClient.vue
-->
<template>
  <div class="add-client">
    <el-card class="container">
      <el-form :model="addClientObj" :rules="rules" label-width="120px" label-position="right">
        <el-form-item prop="name" :label="$t('name') + '：'">
          <el-input v-model="addClientObj.name" class="input-width" :placeholder="$t('clientNamePlace')" />
        </el-form-item>
        <el-form-item :label="$t('type') + '：'" prop="type">
          <el-select v-model="addClientObj.type" class="filter-select" clearable :placeholder="$t('clientTypePlace')">
            <el-option
              v-for="item in filterArr"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('mainColor') + '：'">
          <el-input v-model="addClientObj.style.backgroundColor" class="input-width" :placeholder="$t('colorPlace')" />
        </el-form-item>
        <el-form-item :label="$t('fontColor') + '：'">
          <el-input v-model="addClientObj.style.color" class="input-width" :placeholder="$t('fontColorPlace')" />
        </el-form-item>
        <el-form-item :label="$t('fontStyle') + '：'">
          <el-input v-model="addClientObj.style.fontStyle" class="input-width" :placeholder="$t('fontStylePlace')"  />
        </el-form-item>
        <el-form-item :label="$t('otherStyle') + '：'">
          <el-input v-model="addClientObj.style.other" class="input-width" :placeholder="$t('otherStylePlace')" />
        </el-form-item>
        <el-form-item prop="config.appId" :label="$t('username') + '：'">
          <el-input v-model="addClientObj.config.appId" class="input-width" :placeholder="$t('clientNamePlace')" />
        </el-form-item>
        <el-form-item prop="config.appSecret" :label="$t('password') + '：'">
          <el-input v-model="addClientObj.config.appSecret" class="input-width" :placeholder="$t('setAppSecretPlace')" />
        </el-form-item>
        <el-form-item class="el-form-item-btn">
          <el-button size="small" type="primary" @click="doneToClient">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="doneToClient">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

  </div>
</template>
<script>
import * as rule from '@/utils/rules'
const rules = {
  accountname: rule.accountnameRules,
  password: rule.passwordRules,
  name: rule.rolenameRules,
  type: rule.areaRules,
  'config.appId': rule.accountnameRules,
  'config.appSecret': rule.passwordRules
}
export default {
  name: 'AddClient',
  data() {
    return {
      rules,
      addClientObj: {
        name: '',
        type: '',
        style: {
          backgroundColor: '',
          color: '',
          fontStyle: '',
          other: ''
        },
        config: {
          appId: '',
          appSecret: ''
        }
      },
      filterArr: [
        {
          value: 1,
          label: '微信小程序'
        },
        {
          value: 2,
          label: '支付宝小程序'
        },
        {
          value: 3,
          label: '淘宝小程序'
        },
        {
          value: 4,
          label: '百度小程序'
        }
      ]
    }
  },
  methods: {
    doneToClient() {
      this.$router.push('/aaa/client')
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
