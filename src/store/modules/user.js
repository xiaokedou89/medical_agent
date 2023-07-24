import { login, workerLogin, logout, getInfo, getWorkerInfo } from '@/api/user'
import { getToken, setToken, removeToken, setUserId, removeUserId, getWorker, setWorker, removeWorker, getAgent, setAgent, removeAgent} from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { ROLES } from '@/utils/status'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  userId: '',
  worker: getWorker(),
  agent: null
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_USERID: (state, id) => {
    state.userId = id
  },
  SET_WORKER: (state, worker) => {
    state.worker = worker
  },
  SET_AGENT: (state, agent) => {
    state.agent = agent
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', 'Bearer ' + data)
        commit('SET_WORKER', 'agent')
        setToken('Bearer ' + data)
        setWorker('agent')
        console.log(getWorker())
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        let { roles, name, avatar, introduction, id } = data
        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          // 如果登录的用户没有roles，赋值一个空匹配没有分配角色的路由
          roles = [ {name: ROLES.normal} ]
          // reject('getInfo: roles must be a non-null array!')
        }
        commit('SET_USERID', id)
        setUserId(id)
        // commit('SET_ROLES', roles)
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // worker login
  workerLogin({ commit }, userInfo) {
    console.log('workerLogin')
    let { username, password } = userInfo
    return new Promise((resolve, reject) => {
      workerLogin({ username: username.trim(), password: password }).then(response => {
        let { data } = response
        commit('SET_TOKEN', 'Bearer ' + data)
        commit('SET_WORKER', 'worker')
        setWorker('worker')
        setToken('Bearer ' + data)
        resolve()
      }).catch(error => {
        console.log('workerlogin is fail')
        reject(error)
      })
    })
  },
  // get agentWorker info
  getWorkerInfo({ commit, state}) {
    console.log('getWorkerInfo')
    return new Promise((resolve, reject) => {
      getWorkerInfo(state.token).then(response => {
        const { data } = response
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        console.log(data);
        let { roles, name, avatar, introduction, id, agent } = data
        console.log(agent)
        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          console.log('没有角色，拉到userInfo赋予角色')
          // 如果登录的用户没有roles，赋值一个空匹配没有分配角色的路由
          roles = [ {name: ROLES.admin} ]
          // reject('getInfo: roles must be a non-null array!')
        }
        if (agent && typeof agent == 'object') {
          commit('SET_AGENT', agent)
          setAgent(JSON.stringify(agent))
        } else {
          setAgent(null)
        }
        commit('SET_USERID', id)
        setUserId(id)
        // commit('SET_ROLES', roles)
        commit('SET_ROLES', roles)
        setAgent(JSON.stringify(agent))
        commit('SET_AGENT', agent)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        resolve(data)
      }).catch(error => {
        console.log('getWorkerInfo err')
        reject(error)
      })
    })
  },
  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()

        // reset visited views and cached views
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_USERID', '')
      commit('SET_AGENT', null)
      removeToken()
      removeUserId()
      removeAgent()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    let { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    let accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
