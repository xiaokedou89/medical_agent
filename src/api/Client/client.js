import request from '@/utils/request.js'

// 添加支付渠道
export function addChannel(data) {
  return request({
    url: '/pay/channel',
    headers: {
      'content-type': 'application/json'
    },
    method: 'post',
    data
  })
}

// 查询所有支付渠道
export function getAllChannels() {
  return request({
    url: '/pay/channel/list',
    method: 'get'
  })
}

// 查询代理商的支付渠道
export function getAllAgentChannels() {
  return request({
    url: '/pay/channel/agent/list',
    method: 'get'
  })
}

// 修改支付渠道信息
export function setChannel(data) {
  return request({
    url: `/pay/channel/${data.id}`,
    headers: {
      'content-type': 'application/json'
    },
    method: 'put',
    data
  })
}

// 删除单个支付渠道
export function delChannel(channelId) {
  return request({
    url: `/pay/channel/${channelId}`,
    method: 'delete'
  })
}
