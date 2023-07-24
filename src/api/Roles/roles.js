import request from '@/utils/request'

// 查询所有角色
export function getRoles(agentId, params) {
  return request({
    url: `/role/list/${params.userType}/${agentId}`,
    method: 'get',
    params
  })
}

// 根据用户类型拉取对应角色(代理商是4，后台管理员是0)
export function getRolesByUserType(userType, params) {
  return request({
    url: `/role/list/${userType}`,
    method: 'get',
    params
  })
}

// 添加角色
export function addRoles(data) {
  return request({
    url: '/role',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 删除角色
export function delRoles(roleId) {
  return request({
    url: `/role/${roleId}`,
    method: 'delete'
  })
}

// 编辑角色
export function setRoles(data) {
  return request({
    url: `/role/${data.id}`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 添加用户角色映射
export function addRole(data) {
  return request({
    url: '/role/user',
    method: 'put',
    data
  })
}

// 删除用户角色映射
export function delRole(data) {
  return request({
    url: `/role/${data.userType}/${data.roleId}/${data.userId}`,
    method: 'delete'
  })
}
