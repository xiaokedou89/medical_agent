import request from '@/utils/request.js'

// 获取医生详细信息
export function getDoctorDetail(userId) {
  return request({
    url: `/doctor/${userId}`,
    method: 'get'
  })
}

// 获取所有医生
export function getAllDoctors(params) {
  return request({
    url: '/doctor/users',
    method: 'get',
    params
  })
}

// 获取代理商发展的医生
export function getDoctorsOfAgent(agentId, params) {
  return request({
    url: `/doctor/agent/${agentId}`,
    method: 'get',
    params
  })
}

// 获取医院所有医生
export function getHospitalDoctors(params) {
  return request({
    url: `/doctor/hospital/${params.hospitalId}`,
    method: 'get',
    params
  })
}

// 获取科室所有医生
export function getDepartmentDoctors(params) {
  return request({
    url: `/doctor/department/${params.departmentId}`,
    method: 'get',
    params
  })
}

// 修改医生的分成比例
export function setDoctorProportion(doctorId, proportion) {
  return request({
    url: `/doctor/${doctorId}/proportion/${proportion}`,
    method: 'put'
  })
}

// 修改医生状态
export function setDoctorStatus(doctorId, status) {
  return request({
    url: `/doctor/${doctorId}/status/${status}`,
    method: 'put'
  })
}

// 删除医生
export function delDoctor(doctorId) {
  return request({
    url: `/doctor/${doctorId}`,
    method: 'delete'
  })
}

// 获取医生对账收益
export function getDoctorRevenue(doctorId, params) {
  return request({
    url: `/doctor/${doctorId}/revenue`,
    method: 'get',
    params
  })
}

// 修改医生收益状态
export function setDoctorRevenue(data) {
  return request({
    url: `/doctor/revenue/status`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 修改医生密码
export function setDoctorPassword(doctorId, data) {
  return request({
    url: `/doctor/${doctorId}/password`,
    method: 'put',
    data
  })
}

// 添加医生
export function addDoctor(data) {
  return request({
    url: '/doctor',
    method: 'post',
    data
  })
}
