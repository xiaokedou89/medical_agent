import request from '@/utils/request.js'

// 获取与下级代理商的实时分账模式
export function getCountMode(agentId) {
  return request({
    url: `/cooperative/realtimeSettle/next/${agentId}`,
    method: 'get'
  })
}

// 获取与下级代理商的预付模式
export function getPrePayMode(agentId) {
  return request({
    url: `/cooperative/preSettle/next/${agentId}`,
    method: 'get'
  })
}

// 获取与下级代理商的后付模式
export function getPostPayMode(agentId) {
  return request({
    url: `/cooperative/postSettle/next/${agentId}`,
    method: 'get'
  })
}

// 添加后结算模式单个阶梯
export function addPostPayMode(data) {
  return request({
    url: `/cooperative/postSettle/${data.agentId}`,
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 修改后结算模式单个阶梯
export function setPostPayMode(data) {
  return request({
    url: `/cooperative/postSettle/${data.id}/amount/${data.amount}/discount/${data.discount}`,
    method: 'put'
  })
}

// 删除后结算模式的单个阶梯
export function delPostPayMode(postSettleId) {
  return request({
    url: `/cooperative/postSettle/${postSettleId}`,
    method: 'delete'
  })
}

// 修改预购模式
export function setPrePayMode(data) {
  return request({
    url: '/cooperative/preSettle',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 添加实时分账模式
export function addCountMode(data) {
  return request({
    url: '/cooperative/realtimeSettle',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 修改实时分账模式
export function setCountMode(id, params) {
  return request({
    url: `/cooperative/realtimeSettle/${id}`,
    method: 'put',
    params
  })
}

// 上级代理商为下级代理商添加预付模式
export function addPrePayMode(data) {
  return request({
    url: '/backend/settle',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}
