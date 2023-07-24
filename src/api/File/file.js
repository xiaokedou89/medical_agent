import request from '@/utils/request.js'

// 删除文件
export function delFile(type, params) {
  return request({
    url: `/backend/file/${type}`,
    method: 'delete',
    params
  })
}
