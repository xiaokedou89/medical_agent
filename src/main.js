import Vue from 'vue'
import moment from 'moment'
import Cookies from 'js-cookie'
// import VueI18n from 'vue-i18n'
import {i18n} from '@/assets/languages/i18n'
// import {i18n} from '@/assets/languages/i18n'
import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'
import ElementLocale from 'element-ui/lib/locale'
//import enLang from 'element-ui/lib/locale/lang/en'// 如果使用中文语言包请默认支持，无需额外引入，请删除该依赖

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log


import * as filters from './filters' // global filters

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */

function getI18nTypes(i18n) {
  const i18ntypes = []
  for (let key in i18n.messages) {
    let obj = {}
    obj.type = key
    obj.name = i18n.messages[key].langType
    i18ntypes.push(obj)
  }
  return i18ntypes
}

Vue.prototype.$i18ntypes = getI18nTypes(i18n)

if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}
// moment.locale('zh-cn')
Vue.prototype.$moment = moment
Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false


const app = new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
window.vm = app
export default app
ElementLocale.i18n((key, value) => i18n.t(key, value))
