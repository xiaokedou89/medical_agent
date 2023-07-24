import request from '@/utils/request'

// 获取所有代理商
export function getAllAgents(params) {
  return request({
    url: '/agent/users',
    method: 'get',
    params
  })
}

// 获取代理商用户详细信息
export function getAgentDetail(agentId) {
  return request({
    url: `/agent/${agentId}`,
    method: 'get'
  })
}

// 修改代理商密码
export function setAgentPassword(agentId, data) {
  return request({
    url: `/agent/${agentId}/password`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 修改代理商状态
export function setAgentStatus(agentId, status) {
  return request({
    url: `/agent/${agentId}/status/${status}`,
    method: 'put'
  })
}

// 更换代理商
export function changeAgent(agentId, data) {
  return request({
    url: `/agent/${agentId}/info`,
    method: 'put',
    data
  })
}

// 删除代理商
export function delAgent(agentId) {
  return request({
    url: `/agent/${agentId}`,
    method: 'delete'
  })
}

// 添加代理商
export function addAgent(data) {
  return request({
    url: '/agent',
    method: 'post',
    data
  })
}

// 查询本人与上级代理商的分成记录
export function getUpRevenue(params) {
  return request({
    url: '/revenue/profit/list',
    method: 'get',
    params
  })
}

// 根据下级代理商id查询分成记录
export function getUpRevenueByChild(childId, params) {
  return request({
    url: `/revenue/list/${childId}`,
    method: 'get',
    params
  })
}

// 根据上级代理商id查询分成记录
export function getDownRevenueByParent(parentId, params) {
  return request({
    url: `/revenue/profit/list/${parentId}`,
    method: 'get',
    params
  })
}

// 查询本人与下级代理商的分成记录
export function getDownRevenue(params) {
  return request({
    url: '/revenue/list',
    method: 'get',
    params
  })
}

// 查询管理员代理商与下级的分成收益
export function getAdminDownRevenue(params) {
  return request({
    url: '/revenue/admin/list',
    method: 'get',
    params
  })
}

// 获取所有下级代理商
export function getAllSubAgents(params) {
  return request({
    url: '/agent/subordinate/users',
    method: 'get',
    params
  })
}

// 获取当前登录用户详细信息
export function getCurrent() {
  return request({
    url: '/agent/current',
    method: 'get'
  })
}

// 对账-修改与下级代理商的分成记录状态
export function setDownRevenue(data) {
  return request({
    url: `/revenue/${data.agentId}/${data.status}`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 代理商结账(向下对账结算功能)
export function settleMent(data) {
  return request({
    url: `/revenue/settlement/${data.id}`,
    method: 'put',
    data
  })
}

// 代理商收益统计
export function getAllRevenue() {
  return request({
    url: '/revenue/agent/statistics',
    method: 'get'
  })
}
