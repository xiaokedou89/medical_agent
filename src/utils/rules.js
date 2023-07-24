/*
 * @Author: your name
 * @Date: 2021-08-20 15:40:15
 * @LastEditTime: 2021-08-20 19:49:03
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /medical-agents/src/utils/rules.js
 */

const passwordReg = /^[^\u4e00-\u9fa5]/
const min = 6
const max = 15
import { i18n } from '@/assets/languages/i18n'

// 自定义验证规则
export const verifyObj = {
  // 不许中文的正则匹配
  passwordReg: /^[^\u4e00-\u9fa5]/,
  min: 6,
  max: 15,
  // 手机号验证规则
  phone(rule, value, callback) {
    const mobile = /^[1][3,4,5,7,8][0-9]{9}$/
    if (!mobile.test(value)) {
      return callback(new Error(i18n.t('rules.regPhone')))
    } else {
      return callback()
    }
  },
  unphone(rule, value, callback) {
    const mobile = /^[1][3,4,5,7,8][0-9]{9}$/
    if (value == '' || value == null) {
      return callback()
    } else if (!mobile.test(value)) {
      return callback(new Error(i18n.t('rules.regPhone')))
    } else {
      return callback()
    }
  },
  // 密码验证规则
  password(rule, value, callback) {
    if (value == undefined || value == null || value == '') {
      return callback(new Error(i18n.t('rules.regPasswordnull')))
    } else if (!passwordReg.test(value)) {
      return callback(new Error(i18n.t('rules.regPasswordcn')))
    } else if (value.length < min || value.length > max) {
      return callback(new Error(i18n.t('rules.regPasswordtype')))
    } else {
      callback()
    }
  },
  // unPassword(rule, value, callback) {
  //   console.log(value)
  //   if (value.length < 5) {
  //     callback(new Error(i18n.t('rules.regPasswordlongth')))
  //   } else {
  //     callback()
  //   }
  // }
  unPassword(rule, value, callback) {
    if (value == undefined || value == null || value == '') {
      return callback(new Error(i18n.t('rules.regPasswordnull')))
    } else if (value.length < 5) {
      return callback(new Error(i18n.t('rules.regPasswordlongth')))
    } else {
      callback()
    }
  }
}


export const accountnameRules = [
  { required: true, message: i18n.t('rules.accountname'), trigger: ['blur', 'change'] },
  { min: 4, max: 20, message: i18n.t('rules.accountnamelongth'), trigger: ['blur', 'change'] }
]

export const unaccountnameRules = [
  { min: 6, max: 15, message: i18n.t('rules.unaccountname'), trigger: ['blur', 'change'] }
]

export const nameRules = [
  { required: true, message: i18n.t('rules.name'), trigger: 'blur' },
  { min: 2, max: 15, message: i18n.t('rules.namelongth'), trigger: 'blur' }
]

export const unnameRules = [
  { min: 2, max: 15, message: i18n.t('rules.unname'), trigger: ['blur', 'change'] }
]

export const phoneRules = [
  { required: true, message: i18n.t('rules.phone'), trigger: ['blur', 'change'] },
  { validator: verifyObj.phone, trigger: ['blur', 'change'] }
]

export const unphoneRules = [
  { validator: verifyObj.phone, trigger: ['blur', 'change'] }
]

export const freephoneRules = [
  { validator: verifyObj.unphone, trigger: ['blur', 'change']}
]

export const phoneEasyRules = [
  { validator: verifyObj.phone, trigger: 'change' }
]

export const emailRules = [
  { type: 'email', message: i18n.t('rules.email'), trigger: ['blur', 'change'] }
]

export const emailRequiredRules = [
  { required: true, message: i18n.t('rules.area'), trigger: ['blur', 'change']},
  { type: 'email', message: i18n.t('rules.email'), trigger: ['blur', 'change'] }
]

export const addressRules = [
  { required: true, message: i18n.t('rules.address'), trigger: 'blur' }
]

export const passwordRules = [
  { required: true, validator: verifyObj.password, trigger: 'blur' },
  { pattern: /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{6,15}$/, message: i18n.t('rules.regPasswordmessage'), trigger: ['blur', 'change'] }
]

export const unpasswordRules = [
  { required: true, validator: verifyObj.unPassword, trigger: 'blur'}
]

export const goodnameRules = [
  { required: true, message: i18n.t('rules.goodnamerequire'), trigger: ['blur', 'change'] },
  { min: 2, max: 140, message: i18n.t('rules.goodnamelongth'), trigger: 'blur' }
]

export const descriptionRules = [
  { required: true, message: i18n.t('rules.description'), trigger: 'blur' }
]

export const rolenameRules = [
  { required: true, message: i18n.t('rules.rolenamerequire'), trigger: 'blur' },
  { min: 2, max: 15, message: i18n.t('rules.rolenamelongth'), trigger: ['blur', 'change'] }
]

export const areaRules = [
  { required: true, message: i18n.t('rules.area'), trigger: ['blur', 'change'] }
]

export const ladderRules = [
  { required: true, message: i18n.t('rules.ladder'), trigger: ['blur', 'change'] }
]
