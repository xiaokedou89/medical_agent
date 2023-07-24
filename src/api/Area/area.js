import request from '@/utils/request.js'

export function searchAllArea(data) {
  return request({
    url: '/area/list',
    method: 'get'
  })
}

// 查询单个区域
export function searchSingleArea(areaId) {
  return request({
    url: `/area/${areaId}`,
    method: 'get'
  })
}

// 查询所有子区域
export function searchAllSonArea(parentId) {
  return request({
    url: `/area/${parentId}/list`,
    method: 'get'
  })
}

// 添加区域
export function addArea(data) {
  return request({
    url: '/area',
    headers: {
      'content-type': 'application/json'
    },
    method: 'post',
    data
  })
}

// 删除区域
export function delArea(id) {
  return request({
    url: `/area/${id}`,
    method: 'delete'
  })
}

// 编辑区域
export function setArea(id, name) {
  return request({
    url: `/area/${id}/name/${name}`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    }
  })
}
