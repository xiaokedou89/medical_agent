import request from '@/utils/request.js'

// 查询所有医院
export function getHospital(params) {
  return request({
    url: '/hospital/list',
    method: 'get',
    params
  })
}

// 查询单个医院
export function getSingleHospital(hospitalId) {
  return request({
    url: `/hospital/${hospitalId}`,
    method: 'get'
  })
}

// 根据医院id获取医院所属部门
export function getDepartment(hospitalId) {
  return request({
    url: `/hospital/${hospitalId}/department/list`,
    method: 'get'
  })
}

// 添加医院
export function addHospital(data) {
  return request({
    url: '/hospital',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 添加部门
export function addDepartment(hospitalId, data) {
  return request({
    url: `/hospital/${hospitalId}/department`,
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 删除医院
export function delHospital(hospitalId) {
  return request({
    url: `/hospital/${hospitalId}`,
    method: 'delete'
  })
}

// 删除部门
export function delDepartment(hospitalId, departmentId) {
  return request({
    url: `/hospital/${hospitalId}/department/${departmentId}`,
    method: 'delete'
  })
}

// 编辑医院
export function setHospital(hospitalId, data) {
  return request({
    url: `/hospital/${hospitalId}`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 编辑部门
export function setDepartment(hospitalId, departmentId, data) {
  return request({
    url: `/hospital/${hospitalId}/department/${departmentId}`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}
