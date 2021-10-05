import { createStore } from 'vuex';

export const store = createStore({
  state: {
    pagination: { limit: 20, skip: 0 },
    editMode: false,
  },
  mutations: {
    updatePagination(state, pagination) {
      state.pagination = pagination;
    },
    updateEditMode(state, isEditing) {
      state.editMode = isEditing;
    },
  },
  actions: {},
  modules: {},
});
