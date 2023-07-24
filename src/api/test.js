import request from '@/utils/request'

export function test(option) {
  return request({
    url: '/agent/list',
    method: 'get'
  })
}
