<template>
  <div class="add-doctor">
    <el-card class="container">
      <el-form ref="addDoctorForm" :model="addDoctorObj" :rules="rules" label-width="120px" label-position="right">
        <el-form-item prop="username" :label="$t('username') + '：'">
          <el-input v-model.trim="addDoctorObj.username" :placeholder="$t('doctor.add.usernamePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="password" :label="$t('password') + '：'">
          <el-input v-model.trim="addDoctorObj.password" :placeholder="$t('doctor.add.passwordPlace')" class="input-width" :clearable="true" show-password/>
        </el-form-item>
        <el-form-item prop="repeatPassword" :label="$t('repeatPassword') + ':'">
          <el-input v-model.trim="addDoctorObj.repeatPassword" :placeholder="$t('repeatPassPlace')"  class="input-width" :clearable="true" show-password />
        </el-form-item>
        <el-form-item prop="name" :label="$t('name') + '：'">
          <el-input v-model.trim="addDoctorObj.name" :placeholder="$t('doctor.add.namePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="phone" :label="$t('phone') + '：'">
          <el-input v-model.trim="addDoctorObj.phone" type="email" :placeholder="$t('doctor.add.phonePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="email" :label="$t('email') + '：'">
          <el-input v-model.trim="addDoctorObj.email" type="email" :placeholder="$t('doctor.add.emailPlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="age" :label="$t('age') + '：'">
          <el-input v-model.trim="addDoctorObj.age" :placeholder="$t('doctor.add.agePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="photo" :label="$t('photo') + '：'">
          <div class="photo-container">
            <div class="photo-empty" v-if="!addDoctorObj.photo">
              <i class="photo-empty-icon el-icon-upload"></i>
              <span class="photo-empty-text">{{ $t('uploadPhoto') }}</span>
            </div>
            <img ref="img" :src="getImageUrl(addDoctorObj.photo)" :class="{imageWidth: uploadStyle, imageHeight: !uploadStyle}" v-else />
          </div>
          <el-upload
            ref="photoForm"
            class="photo-upload"
            accept="image/png, image/jpg, image/jpeg"
            :limit="1"
            :action="getUploadUrl('common')"
            :headers="headers"
            :before-upload="beforeUpload"
            :on-progress="uploadProgress"
            :on-success="uploadSuc"
            :on-error="uploadFail"
            :on-remove="uploadRemove"
            :disabled="addDoctorObj.uploadDisabled"
            :show-file-list="addDoctorObj.showListFlag"
          >
            <div class="upload-group">
              <span class="upload-file-box" @click="handleUploadRemove">{{ addDoctorObj.showPhotoName }}</span>
              <button type="button" class="upload-btn" @click="handleUploadRemove">{{ getUploadBtn }}</button>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item :label="$t('goodRevenue') + '：'" prop="proportion">
          <el-input-number v-model="addDoctorObj.proportion" :precision="0" :min="0" :max="100" />
        </el-form-item>
        <el-form-item prop="departments.hospitalId" :label="$t('hospital') + '：'">
          <el-select v-model="addDoctorObj.departments.hospitalId" clearable :placeholder="$t('doctor.index.filterHospPlace')" @change="selectHospital">
            <el-option
              v-for="item in hospitalArr"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="departments.name" :label="$t('department') + '：'">
          <el-select v-model="addDoctorObj.departments.name" clearable :placeholder="$t('doctor.index.filterDepPlace')" @change="selectDepartment">
            <el-option
              v-for="(item, index) in departmentArr"
              :key="item.id"
              :label="item.name"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="reset-btn-group">
          <el-button type="primary" size="small" @click="handleAddDoctor">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelAddDoctor">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import * as rule from '@/utils/rules'
import * as api from '@/api/Doctors/doctors'
import * as fileApi from '@/api/File/file.js'
import * as agentApi from '@/api/Agent/agent'
import * as status from '@/utils/status.js'
import * as hospitalApi from '@/api/Hospital/hospital'
import store from '@/store'
import { i18n } from '@/assets/languages/i18n.js'
import { getToken, getWorker, getAgent } from '@/utils/auth.js'
const rules = {
  password: rule.passwordRules,
  repeatPassword: rule.passwordRules,
  username: rule.accountnameRules,
  name: rule.nameRules,
  email: rule.emailRequiredRules,
  phone: rule.phoneRules,
  // photo: rule.areaRules,
  age: rule.ageRules,
  'departments.hospitalId': [
    { required: true, message:  i18n.t('doctor.index.filterHospPlace'), trigger: ['blur', 'change'] }
  ],
  'departments.name': [
    { required: true, message: i18n.t('doctor.index.filterDepPlace'), trigger: ['blur', 'change'] }
  ]
}

const defaultDoctor = {
  uploadDisabled: false,
  uploadProgressFlag: false,
  showListFlag: true,
  showPhotoName: '',
  id: null,
  age: null,
  agent: null,
  email: null,
  name: '',
  password: '',
  repeatPassword: '',
  phone: '',
  photo: '',
  proportion: '',
  status: 1,
  departments: {
    id: null,
    hospitalId: null,
    name: '',
    description: ''
  }
}
export default {
  name: 'AddDoctor',
  data() {
    return {
      rules,
      headers: {},
      uploadStyle: false,
      // 添加医生到该代理商
      agentId: null,
      // 代理商详细信息
      agentObj: null,
      addFlag: false,
      // 表单绑定对象
      addDoctorObj: JSON.parse(JSON.stringify(defaultDoctor)),
      // 医院下拉选择框绑定数组
      departmentArr: [],
      // 部门下拉选择框绑定数组
      hospitalArr: []
    }
  },
  created() {
    if (getWorker() == 'worker') {
      this.agentId = JSON.parse(getAgent()).id
    } else {
      this.agentId = typeof this.$store.state.user.userId === 'number' ? this.$store.state.user.userId : getUserId()
    }
    this.getToken()
    this.initAgent()
    this.initHospitalArr()
  },
  updated() {
    const _this = this
    let img = null
    if (this.$refs.img) {
      img = this.$refs.img
      img.onload = function () {
        _this.uploadStyle = img.naturalWidth > img.naturalHeight ? true : false
      }
    }
  },
  computed: {
    getImageUrl() {
      return function (filename) {
        return status.network.baseURL + status.network.getFiles('common') + filename
      }
    },
    getUploadUrl() {
      return function (type) {
        return status.network.baseURL + status.network.fileUploadURL + type
      }
    },
    getUploadBtn() {
      return this.addDoctorObj.uploadDisabled ? i18n.t('delBtn') : i18n.t('upload')
    }
  },
  methods: {
    getToken() {
      store.getters.token && (this.headers['authorization'] = getToken())
    },
    initAgent() {
      agentApi.getAgentDetail(this.agentId)
        .then(res => {
          if (res.code === 20000) {
            this.agentObj = res.data
            this.addDoctorObj.agent = this.agentObj
            console.log(this.addDoctorObj)
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('doctor.add.initAgentFail'),
              type: 'error',
              duration: 1500
            })
            this.$router.back()
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
          this.$router.back()
        })
    },
    // 初始化医院下拉选择框数据
    initHospitalArr() {
      hospitalApi.getHospital()
        .then(res => {
          if (res.code === 20000) {
            this.hospitalArr = res.data
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('doctor.add.initHospMes'),
              type: 'warning',
              duration: 20000
            })
            this.$router.back()
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
          this.$router.back()
        })
    },
    // 医院下拉选择框值改变事件
    selectHospital(e) {
      console.log(e)
      if (typeof e === 'string') {
        this.addDoctorObj.departments.hospitalId = null
        this.addDoctorObj.departments.id = null
        this.addDoctorObj.departments.name = ''
        this.addDoctorObj.departments.description = ''
        this.departmentArr = []
        return
      }
      hospitalApi.getDepartment(e)
        .then(res => {
          if (res.code === 20000) {
            this.departmentArr = res.data
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('doctor.add.getDepartmentFail'),
              type: 'error',
              duration: 1500
            })
            this.addDoctorObj.departments.hospitalId = null
            this.departmentArr = []
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
          this.addDoctorObj.departments.hospitalId = null
          this.departmentArr = []
        })
      console.log(this.addDoctorObj)
    },
    // 部门下拉选择框值改变事件
    selectDepartment(index) {
      if (typeof index === 'string') {
        this.addDoctorObj.departments.id = null
        this.addDoctorObj.departments.name = ''
        this.addDoctorObj.departments.description = ''
        console.log(this.addDoctorObj)
        return
      }
      this.addDoctorObj.departments.id = this.departmentArr[index].id
      this.addDoctorObj.departments.name = this.departmentArr[index].name
      this.addDoctorObj.departments.description = this.departmentArr[index].description
      console.log(this.addDoctorObj)
    },
    // 上传图片前检查回调
    beforeUpload(file) {
      if (this.addDoctorObj.uploadProgressFlag) {
        this.$message({
          message: this.$t('uploadingWarn'),
          type: 'warning',
          duration: 1500
        })
        return !this.addDoctorObj.uploadProgressFlag
      }
      let extension = file.name.substring(file.name.lastIndexOf('.') + 1),
          size = file.size,
          extensionFlag = (extension === 'jpg' || extension === 'png' || extension === 'jpeg') && size <= 20 * 1024 * 1024 ? true : false
      if (!extensionFlag) {
        this.$message({
          message: this.$t('imgFileTypeWarn'),
          type: 'warning',
          duration: 1500
        })
      }
      return extensionFlag
    },
    // 上传中回调
    uploadProgress() {
      this.addDoctorObj.uploadProgressFlag = true
    },
    // 上传成功回调
    uploadSuc(e) {
      this.addDoctorObj.uploadProgressFlag = false
      if (e.code === 20000) {
        this.addDoctorObj.showPhotoName = e.data.oldFilename
        this.addDoctorObj.uploadDisabled = true
        this.addDoctorObj.showListFlag = false
        this.addDoctorObj.photo = e.data.filename
      } else {
        this.$refs.photoForm.clearFiles()
        this.$message({
          message: e.message || this.$t('uploadFail'),
          type: 'error',
          duration: 1500
        })
      }
    },
    uploadFail(e) {
      this.addDoctorObj.uploadProgressFlag = false
      this.$message({
        message: e.message || this.$t('uploadFail'),
        type: 'error',
        duration: 1500
      })
    },
    // 上传中移除文件
    uploadRemove() {
      this.addDoctorObj.uploadProgressFlag = false
    },
    handleUploadRemove() {
      if (!this.addDoctorObj.uploadDisabled) {
        return
      }
      fileApi.delFile('common', {
        filename: this.addDoctorObj.photo
      })
        .then(res => {
          console.log(res)
          if (res.code === 20000) {
            this.$message({
              message: this.$t('delPhotoSuc'),
              type: 'success',
              duration: 1500
            })
            this.$refs.photoForm.clearFiles()
            this.addDoctorObj.showListFlag = true
            this.addDoctorObj.uploadDisabled = false
            this.addDoctorObj.showPhotoName = ''
            this.addDoctorObj.photo = ''
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 点击确定事件
    handleAddDoctor() {
      if (this.addFlag) {
        return
      }
      if (this.addDoctorObj.password != this.addDoctorObj.repeatPassword) {
        this.$message({
          message: this.$t('repeatFail'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.addFlag = true
      this.$refs.addDoctorForm.validate(valid => {
        if (valid) {
          api.addDoctor(this.addDoctorObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('doctor.add.addSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.addFlag = false
                this.$router.push({
                  path: '/doctors/index'
                })
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
    },
    // 点击取消事件
    cancelAddDoctor() {
      this.$router.push({
        path: '/doctors/index'
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
.photo-container {
  width: 200px;
  height: 150px;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  .photo-empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #ccc;
    .photo-empty-icon {
      font-size: 50px;
    }
  }
  .imageWidth {
    width: 200px;
    height: auto;
    max-height: 150px;
  }
  .imageHeight {
    height: 150px;
    width: auto;
    max-width: 200px;
  }
}
.photo-upload {
  margin-top: 10px;
  .upload-group {
    width: 200px;
    position: relative;
    .upload-file-box {
      text-align: left;
      display: inline-block;
      box-sizing: border-box;
      width: 100%;
      height: 32px;
      line-height: 32px;
      padding-left: 11px;
      border: 1px solid #ccc;
      border-radius: 4px
    }
    .upload-btn {
      position: absolute;
      right: -1px;
      top: 0;
      width: 50px;
      height: 32px;
      background: #1890ff;
      color: #fff;
      border: 0;
      border-radius: 2px;
      cursor: pointer;
    }
  }
}
</style>
