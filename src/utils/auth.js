import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

const UserId = 'userId'

const Worker = 'worker'

const Agent = 'agent'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getWorker() {
  return Cookies.get(Worker)
}

export function setWorker(worker) {
  return Cookies.set(Worker, worker)
}

export function removeWorker() {
  return Cookies.remove(Worker)
}

export function getAgent() {
  return Cookies.get(Agent)
}

export function setAgent(agent) {
  return Cookies.set(Agent, agent)
}

export function removeAgent() {
  return Cookies.remove(Agent)
}

export function getUserId() {
  return Cookies.get(UserId)
}

export function setUserId(id) {
  return Cookies.set(UserId, id)
}

export function removeUserId() {
  return Cookies.remove(UserId)
}
