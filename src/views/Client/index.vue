<template>
  <div id="client">
    <!--筛选代理商模块-->
    <el-card class="filter-container">
      <div class="filter-box" style="margin-top: 20px">
        <el-form :inline="true" size="small">
          <el-form-item class="filter-item" :label="$t('nameFilter') + '：'">
            <el-input
              v-model="nameCondition"
              class="filter-input"
              type="primary"
              size="small"
              :placeholder="$t('clientName')"
            />
          </el-form-item>
          <el-form-item :label="$t('typeFilter') + '：'">
            <el-select v-model="filterValue" class="filter-select" clearable :placeholder="$t('typeSelectPlace')">
              <el-option
                v-for="item in filterArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <!--功能列表-->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('client.index.operateTitle')}}</span>
      <el-button style="float: right; margin: 0px 5px;" type="danger" size="small">{{$t('delBtn')}}</el-button>
      <router-link to="/aaa/addclient">
        <el-button style="float: right; margin: 0px 5px" size="small">{{$t('addBtn')}}</el-button>
      </router-link>
    </el-card>
    <!--主列表-->
    <el-row class="table-container">
      <el-col :span="24">
        <el-table :data="clientArr" style="width: 100%" border>
          <el-table-column align="center" type="selection" />
          <el-table-column align="center" prop="name" :label="$t('name')">
            <template slot-scope="scope">
              <el-button type="text" @click="showClientDetail(scope.$index)">
                {{ scope.row.name }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="type" :label="$t('type')">
            <template slot-scope="scope">
              {{ scope.row.type }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="icon" :label="$t('icon')">
            <template slot-scope="scope">
              <img :src="scope.row.icon" width="100%" height="100%" alt="">
            </template>
          </el-table-column>
          <el-table-column align="center" prop="style" :label="$t('style')">
            <template slot-scope="scope">
              <el-button type="text" @click="showSetStyle(scope.$index)">{{$t('playStyle')}}</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="config" :label="$t('options')">
            <template slot-scope="scope">
              <el-button type="text" @click="showSetConfig(scope.$index)">{{$t('clientOption')}}</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="config" :label="$t('contactApp')">
            <template slot-scope="scope">
              <el-button type="text" @click="showSetPlugins(scope.$index)">{{$t('contactApp')}}</el-button>
            </template>
          </el-table-column>

          <el-table-column v-if="true" align="center" fixed="right" width="200" :label="$t('action')">
            <template slot-scope="scope">
              <el-button size="mini" type="primary">{{$t('publish')}}</el-button>
              <el-button size="mini" type="primary">{{$t('arrange')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          background
          :page-sizes="[5,10,15]"
          :total="totalSize"
        /> -->
        <el-pagination
          layout="prev, pager, next"
          background
          :page-sizes="[5,10,15]"
          :total="totalSize"
        />
      </el-col>
    </el-row>
    <!--客户端详情弹框-->
    <el-dialog :title="$t('clientDetail')" :visible.sync="showClient" width="40%">
      <el-form label-position="right" label-width="80px">
        <el-form-item :label="$t('name') + '：'">
          <span>{{ clientArr[clientDetailIndex].name }}</span>
        </el-form-item>
        <el-form-item :label="$t('type') + '：'">
          <span>{{ clientArr[clientDetailIndex].type }}</span>
        </el-form-item>
        <el-form-item :label="$t('style') + '：'">
          <p>
            <ul>
              <li v-for="(item,key) in clientArr[clientDetailIndex].style" :key="key">
                <span>{{ clientArr[clientDetailIndex].styleLabel[key] }} : </span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </p>
        </el-form-item>
        <el-form-item :label="$t('options') + '：'">
          <p>
            <ul>
              <li v-for="(item,key) in clientArr[clientDetailIndex].config" :key="key">
                <span>{{ clientArr[clientDetailIndex].configLabel[key] }} : </span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </p>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--设置小程序样式弹框-->
    <el-dialog :title="$t('setStyle')" :visible.sync="setStyleFlag" width="40%">
      <el-form label-position="right" label-width="100px">
        <el-form-item :label="$t('mainColor') + '：'">
          <el-input v-model="clientArr[clientDetailIndex].style.backgroundColor" class="input-width" :placeholder="$t('colorPlace')" />
        </el-form-item>
        <el-form-item :label="$t('fontColor') + '：'">
          <el-input v-model="clientArr[clientDetailIndex].style.color" class="input-width" :placeholder="$t('fontColorPlace')" />
        </el-form-item>
        <el-form-item :label="$t('fontStyle') + '：'">
          <el-input v-model="clientArr[clientDetailIndex].style.fontStyle" class="input-width" :placeholder="$t('fontStylePlace')" />
        </el-form-item>
        <el-form-item :label="$t('otherStyle') + '：'">
          <el-input v-model="clientArr[clientDetailIndex].style.other" class="input-width" :placeholder="$t('otherStylePlace')" />
        </el-form-item>
        <el-form-item class="el-form-item-btn">
          <el-button size="small" type="primary" @click="setStyleFlag = false">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="setStyleFlag = false">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--设置小程序配置弹框-->
    <el-dialog :title="$t('options')" :visible.sync="setConfigFlag" width="40%">
      <el-form :model="clientArr[clientDetailIndex].config" :rules="rules" label-position="right" label-width="100px">
        <el-form-item :label="$t('username') + '：'" prop="accountname">
          <el-input v-model="clientArr[clientDetailIndex].config.accountname" class="input-width" :placeholder="$t('client.index.appIdPlace')" />
        </el-form-item>
        <el-form-item :label="$t('client.index.password') + '：'" prop="password">
          <el-input v-model="clientArr[clientDetailIndex].config.password" class="input-width" :placeholder="$t('client.index.passwordPlace')" />
        </el-form-item>
        <el-form-item class="el-form-item-btn">
          <el-button size="small" type="primary" @click="setConfigFlag = false">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="setConfigFlag = false">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--添加小程序弹框-->
    <el-dialog :title="$t('client.index.addApp')" :visible.sync="addClientFlag" width="50%">
      <el-form :model="addClientObj" :rules="rules" label-position="left">
        <el-form-item prop="name" :label="$t('appName') + '：'">
          <el-input v-model="addClientObj.name" class="input-width" :placeholder="$t('appNamePlace')" />
        </el-form-item>
        <el-form-item :label="$t('appType') + '：'">
          <el-select v-model="addClientObj.type" class="filter-select" clearable :placeholder="$t('clientTypePlace')">
            <el-option
              v-for="item in filterArr"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('styleMainColor') + '：'">
          <el-input v-model="addClientObj.style.backgroundColor" class="input-width" :placeholder="$t('styleMainColorPlace')" />
        </el-form-item>
        <el-form-item :label="$t('styleFontColor') + '：'">
          <el-input v-model="addClientObj.style.color" class="input-width" :placeholder="$t('styleFontColorPlace')" />
        </el-form-item>
        <el-form-item :label="$t('styleFontStyle') + '：'">
          <el-input v-model="addClientObj.style.fontStyle" class="input-width" :placeholder="$t('styleFontStylePlace')" />
        </el-form-item>
        <el-form-item :label="$t('otherStyle') + '：'">
          <el-input v-model="addClientObj.style.other" class="input-width" :placeholder="$t('otherStylePlace')" />
        </el-form-item>
        <el-form-item prop="config.appId" :label="$t('setAppId') + '：'">
          <el-input v-model="addClientObj.config.appId" class="input-width" :placeholder="$t('setAppIdPlace')" />
        </el-form-item>
        <el-form-item prop="config.appSecret" :label="$t('setAppSecret') + '：'">
          <el-input v-model="addClientObj.config.appSecret" class="input-width" :placeholder="$t('setAppSecretPlace')" />
        </el-form-item>
        <el-form-item class="el-form-item-btn">
          <el-button size="small" type="primary" @click="addClientFlag = false">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="addClientFlag = false">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--配置插件弹框-->
    <el-dialog :visible.sync="setPluginsFlag" :title="$t('contactApp')">
      <el-form label-position="right" label-width="120px">
        <el-form-item :label="$t('selectPlugin') + '：'">
          <el-checkbox-group v-model="clientArr[clientDetailIndex].plugins">
            <el-checkbox :label="$t('payPlugin') + '1'" />
            <el-checkbox :label="$t('payPlugin') + '2'" />
            <el-checkbox :label="$t('appPlugin') + '1'" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item class="el-form-item-btn">
          <el-button size="small" type="primary" @click="setPluginsFlag = false">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="setPluginsFlag = false">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as rule from '@/utils/rules'

const rules = {
  accountname: rule.accountnameRules,
  password: rule.passwordRules,
  name: rule.accountnameRules,
  'config.appId': rule.accountnameRules,
  'config.appSecret': rule.passwordRules
}

export default {
  name: 'Client',
  data() {
    return {
      rules,
      setPluginsFlag: false,
      addClientFlag: false,
      setConfigFlag: false,
      setStyleFlag: false,
      showClient: false,
      clientDetailIndex: 0,
      totalSize: 0,
      nameCondition: '',
      filterValue: '',
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
      ],
      clientArr: [
        {
          name: '天天医代小程序',
          type: '微信小程序',
          icon: require('@/assets/404_images/404.png'),
          style: {
            backgroundColor: '红色',
            color: 'red',
            fontStyle: '雅风字体',
            other: '...'
          },
          styleLabel: {
            backgroundColor: '主体颜色',
            color: '字体颜色',
            fontStyle: '字体风格',
            other: '其他样式'
          },
          config: {
            accountname: 'wx10009391',
            password: '123456'
          },
          configLabel: {
            accountname: '小程序账号',
            password: '小程序密钥'
          },
          plugins: [],
          opened: false
        }
      ]
    }
  },
  methods: {
    showClientDetail(index) {
      this.showClient = true
      this.clientDetailIndex = index
    },
    showSetStyle(index) {
      this.clientDetailIndex = index
      this.setStyleFlag = true
    },
    showSetConfig(index) {
      this.setConfigFlag = true
      this.clientDetailIndex = index
    },
    showSetPlugins(index) {
      this.setPluginsFlag = true
      this.clientDetailIndex = index
    }
  }
}
</script>
<style lang="scss" scoped>
#client {
  padding: 30px;
}
ul li {
  list-style: none;
}
.operate-container {
  margin-top: 20px;
}
.table-container {
  margin-top: 20px;
}
.el-pagination {
  float: right;
  margin-top: 20px;
}
.el-form-item p {
  margin-top: 40px;
}
.input-width {
  width: 60%;
}
.el-form-item-btn {
  margin-left: 50px;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
