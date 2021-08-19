import { createStore } from 'vuex';

export const store = createStore({
  state: {
    pagination: { limit: 20, skip: 0 },
  },
  mutations: {
    updatePagination(state, pagination) {
      state.pagination = pagination;
    },
  },
  actions: {},
  modules: {},
});
