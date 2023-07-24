const state = {
  obj: null,
  arr: []
}

const mutations = {
  setInit(state, initObj) {
    state.obj = initObj.obj
    state.arr = initObj.arr
  }
}

export default {
  state,
  mutations
}
