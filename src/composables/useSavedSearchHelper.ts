import { ref } from "vue";
type ModalState = "initial" | "show" | "hide" | "loading";
type ModalActions = "create" | "edit";

export type ModalType = {
  state: ModalState;
  action: ModalActions;
};

const createModalState = ref<ModalType>({
  state: "hide",
  action: "create",
});

const isDisplayingContextMenu = ref<Boolean>(false);
const savedSearches = ref<any>([]);
const pickedSavedSearch = ref<any>();

export type PickEntityModalType = {
  state: ModalState;
  pickedEntity: any;
  acceptedEntityTypes?: any;
};

const SearchSavedSearchesModalState = ref<PickEntityModalType>({
  state: "hide",
  pickedEntity: undefined,
  acceptedEntityTypes: [],
});

export const useSavedSearchHelper = () => {
  const toggleContextMenu = () => {
    isDisplayingContextMenu.value = !isDisplayingContextMenu.value;
  };

  const updateCreateModal = (CreateModalInput: ModalType) => {
    createModalState.value = CreateModalInput;
  };

  const closeCreateModal = () => {
    updateCreateModal({
      state: "hide",
      action: "create",
    });
  };

  const openCreateModal = () => {
    updateCreateModal({
      state: "show",
      action: "create",
    });
  };

  const openEditModal = () => {
    updateCreateModal({
      state: "show",
      action: "edit",
    });
  };

  const updateSearchSavedSearchesModal = (
    SearchSavedSearchesModalInput: PickEntityModalType
  ) => {
    SearchSavedSearchesModalState.value = SearchSavedSearchesModalInput;
  };

  const closeSearchSavedSearchesModal = () => {
    updateSearchSavedSearchesModal({
      state: "hide",
      pickedEntity: undefined,
    });
  };

  const openSearchSavedSearchesModal = (acceptedEntityTypes: any) => {
    updateSearchSavedSearchesModal({
      state: "show",
      pickedEntity: undefined,
      acceptedEntityTypes: acceptedEntityTypes,
    });
  };

  function clearTypename(o) {
    Object.keys(o).forEach(function (k) {
      if (o[k] !== null && typeof o[k] === "object") {
        clearTypename(o[k]);
        return;
      }
      if (typeof o[k] === "string") {
        if (k === "__typename") {
          o[k] = undefined;
        }
      }
    });
  }

  return {
    createModalState,
    closeCreateModal,
    openCreateModal,
    openEditModal,
    isDisplayingContextMenu,
    toggleContextMenu,
    savedSearches,
    pickedSavedSearch,
    closeSearchSavedSearchesModal,
    openSearchSavedSearchesModal,
    SearchSavedSearchesModalState,
    clearTypename
  };
};
