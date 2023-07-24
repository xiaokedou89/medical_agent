import request from '@/utils/request'

export function getPermissonList() {
  return request({
    url: '/permission/list',
    method: 'get'
  })
}

export function addRolePermission(data) {
  return request({
    url: '/permission/role',
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

export function delRolePermission(id) {
  return request({
    url: `/permission/role/${id}`,
    method: 'delete'
  })
}
