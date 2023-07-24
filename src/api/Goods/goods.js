import request from '@/utils/request'

// 查询所有商品
export function getAllGoods(params) {
  return request({
    url: '/goods/list',
    method: 'get',
    params
  })
}

// 按照分类查询商
export function getAllGoodsByCategory(params) {
  return request({
    url: `/goods/category/${params.categoryId}`,
    method: 'get',
    params
  })
}

// 查询单个商品
export function getGoods(goodsId) {
  return request({
    url: `/goods/${goodsId}`,
    method: 'get'
  })
}

// 查询所有商品分类
export function getAllGoodsCategory(params) {
  return request({
    url: '/goods/category/list',
    method: 'get',
    params
  })
}

// 添加商品
export function addGoods(data) {
  return request({
    url: '/goods',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 编辑商品
export function setGoods(data) {
  return request({
    url: `/goods/${data.id}/info`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 删除商品
export function delGoods(goodsId) {
  return request({
    url: `/goods/${goodsId}`,
    method: 'delete'
  })
}

// 编辑商品分类
export function setGoodsCategory(data) {
  return request({
    url: `/goods/category/${data.id}`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 删除商品分类
export function delGoodsCategory(goodsCategoryId) {
  return request({
    url: `/goods/category/${goodsCategoryId}`,
    method: 'delete'
  })
}

// 添加商品分类
export function addGoodsCategory(data) {
  return request({
    url: '/goods/category',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 查询所有商品价格
export function getAllGoodsPrice(userId, params) {
  return request({
    url: `/goods/price/agent/${userId}/list`,
    method: 'get',
    params
  })
}

// 查询单个商品价格
export function getSingleGoodsPrice(userId, goodId) {
  return request({
    url: `/goods/price/${goodId}/agent/${userId}`,
    method: 'get'
  })
}

// 修改商品价格
export function setGoodsPrice(data) {
  return request({
    url: `/goods/price/${data.goodsId}/agent/${data.agentId}/price/${data.price}`,
    method: 'put'
  })
}

