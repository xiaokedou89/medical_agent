import request from '@/utils/request.js'

// 查询所有订单
export function getAllOrders(params) {
  return request({
    url: '/order/list',
    method: 'get',
    params
  })
}

// 查询单个订单
export function getOrder(orderId) {
  return request({
    url: `/order/${orderId}`,
    method: 'get'
  })
}

// 查询病人订单
export function getPatientOrder(patientId, params) {
  return request({
    url: `/order/patient/${patientId}`,
    method: 'get',
    params
  })
}

// 查询医生订单
export function getDoctorOrder(doctorId, params) {
  return request({
    url: `/order/doctor/${doctorId}`,
    method: 'get',
    params
  })
}

// 查询代理商订单
export function getAgentOrder(agentId, params) {
  return request({
    url: `/order/agent/${agentId}`,
    method: 'get',
    params
  })
}

// 更改订单模型标注
export function changeModelTag(orderId, data) {
  return request({
    url: `/order/${orderId}/model/tag`,
    method: 'put',
    data
  })
}
