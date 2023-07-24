import request from '@/utils/request'

// 代理商登录
export function login(data) {
  return request({
    url: '/agent/login',
    method: 'post',
    data
  })
}


// 代理商子账号登录
export function workerLogin(data) {
  return request({
    url: '/agentWorker/login',
    method: 'post',
    data
  })
}

// 获取当前登录代理商的详细信息
export function getInfo() {
  return request({
    url: '/agent/current',
    method: 'get'
  })
}

// 获取当前登录子账号的详细信息
export function getWorkerInfo() {
  return request({
    url: '/agentWorker/current',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/admin',
    method: 'put'
  })
}
