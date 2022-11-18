import { ref } from "vue";
type ModalState = "initial" | "show" | "hide" | "loading";
export type CreateModalType = {
  state: ModalState;
};

const createModalState = ref<CreateModalType>({
  state: "hide",
});

const isDisplayingContextMenu = ref<Boolean>(false);
const savedSearches = ref<any>([]);
const pickedSavedSearch = ref<any>();

export const useSavedSearchHelper = () => {
  const toggleContextMenu = () => {
    isDisplayingContextMenu.value = !isDisplayingContextMenu.value;
  };

  const updateCreateModal = (CreateModalInput: CreateModalType) => {
    createModalState.value = CreateModalInput;
  };

  const closeCreateModal = () => {
    updateCreateModal({
      state: "hide",
    });
  };

  const openCreateModal = () => {
    updateCreateModal({
      state: "show",
    });
  };

  return {
    createModalState,
    closeCreateModal,
    openCreateModal,
    isDisplayingContextMenu,
    toggleContextMenu,
    savedSearches,
    pickedSavedSearch,
  };
};
